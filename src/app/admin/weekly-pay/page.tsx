"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { getDailyEntries, getSites, updateDailyEntry } from "@/lib/firestore";
import type { DailyEntry, Site, DailyWorker, DailyMaterial, DailyMachinery, DailyExpense } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Package,
  Cog,
  Receipt,
  TrendingUp,
  ArrowRightLeft,
} from "lucide-react";
import {
  format,
  parseISO,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  getDay,
  isSameDay,
  isValid,
} from "date-fns";
import { cn, fmtINR, getWeekSunday, getWeekDates, formatWeekRange } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DAY_HEADERS = ["S", "M", "T", "W", "T", "F", "S"];

type WorkerRow = {
  personName: string;
  types: string[];
  shiftText: string;
  labourCount: number;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: "Paid" | "Not Paid" | "Partial";
  date: string;
  dayLabel: string; // SUN, MON…
  entryId: string;
  siteId: string;
  siteName: string;
};

type WorkerWeekData = {
  name: string;
  activeDays: WorkerRow[];    // only days with entries
  weekEarned: number;
  weekPaid: number;
  weekPending: number;
  carryForward: number;
  carryEntries: { entryId: string; worker: DailyWorker; date: string }[];
  totalPayable: number;
};

type VendorRow = {
  materialName: string;
  company: string;
  qty: number;
  marketCost: number;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: string;
  siteName: string;
  date: string;
  dayLabel: string;
  entryId: string;
};

type VendorWeekData = {
  companyName: string;
  activeItems: VendorRow[];
  weekEarned: number;
  weekPaid: number;
  weekPending: number;
  carryForward: number;
  carryEntries: { entryId: string; material: DailyMaterial; date: string }[];
  totalPayable: number;
};

type OperatorRow = {
  machineryName: string;
  operator: string;
  qty: number;
  cost: number;
  bata: number;
  amount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: string;
  siteName: string;
  date: string;
  dayLabel: string;
  entryId: string;
};

type OperatorWeekData = {
  operatorName: string;
  activeItems: OperatorRow[];
  weekEarned: number;
  weekPaid: number;
  weekPending: number;
  carryForward: number;
  carryEntries: { entryId: string; machinery: DailyMachinery; date: string }[];
  totalPayable: number;
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function WeeklyPayPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Calendar month + selected week
  const [calMonth, setCalMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(() => getWeekSunday(new Date()));

  // Active tab within the week view
  const [weekTab, setWeekTab] = useState<"overview" | "salary">("overview");

  // Pay dialog
  const [payWorker, setPayWorker] = useState<WorkerWeekData | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payVendor, setPayVendor] = useState<VendorWeekData | null>(null);
  const [payVendorAmount, setPayVendorAmount] = useState("");
  const [payOperator, setPayOperator] = useState<OperatorWeekData | null>(null);
  const [payOperatorAmount, setPayOperatorAmount] = useState("");
  const [payExpense, setPayExpense] = useState<ExpRow | null>(null);
  const [payExpenseAmount, setPayExpenseAmount] = useState("");

  // ── Load data ──────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [eData, sData] = await Promise.all([getDailyEntries(), getSites()]);
      setEntries(eData || []);
      setSites(sData || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Calendar grid ─────────────────────────────────────────────────────────

  const calendarWeeks = useMemo(() => {
    const monthStart = startOfMonth(calMonth);
    const monthEnd = endOfMonth(calMonth);
    // Start from the Sunday of the week containing the 1st
    let cursor = getWeekSunday(monthStart);
    const weeks: Date[][] = [];

    while (cursor <= monthEnd || weeks.length < 5) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(cursor));
        cursor = addDays(cursor, 1);
      }
      weeks.push(week);
      if (cursor > monthEnd && weeks.length >= 4) break;
    }
    return weeks;
  }, [calMonth]);

  // Which Saturdays in this month have entries?
  const saturdaysWithEntries = useMemo(() => {
    const sats = new Set<string>();
    calendarWeeks.forEach(week => {
      const sat = week[6]; // Saturday
      const sunday = week[0];
      const weekDateStrs = getWeekDates(sunday);
      const hasData = entries.some(e => weekDateStrs.includes(e.date));
      if (hasData) sats.add(format(sat, "yyyy-MM-dd"));
    });
    return sats;
  }, [calendarWeeks, entries]);

  // ── Selected week data ────────────────────────────────────────────────────

  const weekDates = useMemo(() => getWeekDates(selectedWeekStart), [selectedWeekStart]);

  const weekEntries = useMemo(
    () => entries.filter(e => weekDates.includes(e.date)),
    [entries, weekDates]
  );

  // Summary: all costs for the week
  const weekSummary = useMemo(() => {
    let labour = 0, material = 0, machinery = 0, expenses = 0;
    weekEntries.forEach(e => {
      (e.workers || []).forEach(w => labour += (Number(w.amount) || 0));
      (e.materials || []).forEach(m => material += (Number(m.amount) || 0));
      (e.machinery || []).forEach(m => machinery += (Number(m.amount) || 0));
      (e.expenses || []).forEach(x => expenses += (Number(x.amount) || 0));
    });
    return { labour, material, machinery, expenses, total: labour + material + machinery + expenses };
  }, [weekEntries]);

  // Day-by-day breakdown of entries for overview
  const dayBreakdown = useMemo(() => {
    return weekDates.map((dateStr, i) => {
      const dayEntries = weekEntries.filter(e => e.date === dateStr);
      let labour = 0, material = 0, machinery = 0, expenses = 0;
      let workerCount = 0, materialCount = 0, machineryCount = 0, expenseCount = 0;
      dayEntries.forEach(e => {
        (e.workers || []).forEach(w => { labour += (Number(w.amount) || 0); workerCount++; });
        (e.materials || []).forEach(m => { material += (Number(m.amount) || 0); materialCount++; });
        (e.machinery || []).forEach(m => { machinery += (Number(m.amount) || 0); machineryCount++; });
        (e.expenses || []).forEach(x => { expenses += (Number(x.amount) || 0); expenseCount++; });
      });
      return {
        date: dateStr,
        dayLabel: DAY_LABELS[i],
        dayNum: dateStr.split("-")[2],
        hasEntry: dayEntries.length > 0,
        labour, material, machinery, expenses,
        total: labour + material + machinery + expenses,
        workerCount, materialCount, machineryCount, expenseCount,
        sites: dayEntries.map(de => sites.find(s => s.id === de.siteId)?.siteName || "Unknown").filter((v, i, a) => a.indexOf(v) === i),
      };
    });
  }, [weekDates, weekEntries, sites]);

  // Worker salary data
  const workerWeeks: WorkerWeekData[] = useMemo(() => {
    const workerMap = new Map<string, string>(); // key → display name
    entries.forEach(e => {
      (e.workers || []).forEach(w => {
        if (w.personName?.trim()) workerMap.set(w.personName.trim().toLowerCase(), w.personName.trim());
      });
    });

    const weekStartStr = weekDates[0];
    const result: WorkerWeekData[] = [];

    workerMap.forEach((displayName, key) => {
      const activeDays: WorkerRow[] = [];
      
      weekDates.forEach((dateStr, di) => {
        entries.filter(e => e.date === dateStr).forEach(dayEntry => {
          const sameGuyWorkers = dayEntry.workers?.filter(w => w.personName?.trim().toLowerCase() === key) || [];
          if (sameGuyWorkers.length > 0) {
            const siteName = sites.find(s => s.id === dayEntry.siteId)?.siteName || "Unknown Site";
            
            const totalAmount = sameGuyWorkers.reduce((s, w) => s + (Number(w.amount) || 0), 0);
            const totalPaid = sameGuyWorkers.reduce((s, w) => s + (Number(w.paidAmount) || 0), 0);
            const totalPending = sameGuyWorkers.reduce((s, w) => s + (Number(w.pendingAmount) || 0), 0);
            
            const types = Array.from(new Set(sameGuyWorkers.map(w => w.type || "—")));
            if (types.length === 0) types.push("—");
            
            const shiftText = sameGuyWorkers.map(w => {
              if (w.type === "RW") return `${w.qty} × ₹${w.rate}`;
              if (Number(w.shift) > 0) return `${w.shift} shift`;
              return null;
            }).filter(Boolean).join(" · ") || "0 shift";

            const paymentStatus = totalPending <= 0 ? "Paid" : totalPaid > 0 ? "Partial" : "Not Paid";

            const totalLabourCount = sameGuyWorkers.reduce((s, w) => s + (Number(w.labourCount) || (w.type === 'RW' ? 1 : 0)), 0);

            activeDays.push({
              personName: sameGuyWorkers[0].personName,
              types,
              shiftText,
              labourCount: totalLabourCount,
              amount: totalAmount,
              paidAmount: totalPaid,
              pendingAmount: totalPending,
              paymentStatus,
              date: dateStr,
              dayLabel: DAY_LABELS[di],
              entryId: dayEntry.id,
              siteId: dayEntry.siteId,
              siteName,
            });
          }
        });
      });
      const weekEarned = activeDays.reduce((s, d) => s + d.amount, 0);
      const weekPaid = activeDays.reduce((s, d) => s + d.paidAmount, 0);
      const weekPending = activeDays.reduce((s, d) => s + d.pendingAmount, 0);

      // Carry forward
      const carryEntries: { entryId: string; worker: DailyWorker; date: string }[] = [];
      let carryForward = 0;
      entries
        .filter(e => e.date < weekStartStr)
        .sort((a, b) => a.date.localeCompare(b.date))
        .forEach(e => {
          (e.workers || []).forEach(w => {
            if (w.personName.trim().toLowerCase() === key && (Number(w.pendingAmount) || 0) > 0) {
              carryForward += Number(w.pendingAmount) || 0;
              carryEntries.push({ entryId: e.id, worker: w, date: e.date });
            }
          });
        });

      if (weekEarned > 0 || carryForward > 0) {
        result.push({
          name: displayName, activeDays, weekEarned, weekPaid, weekPending,
          carryForward, carryEntries, totalPayable: weekPending + carryForward,
        });
      }
    });

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [entries, weekDates, sites]);

  // Vendor salary data
  const vendorWeeks: VendorWeekData[] = useMemo(() => {
    const vendorMap = new Map<string, string>(); // key → display name
    entries.forEach(e => {
      (e.materials || []).forEach(m => {
        if (m.company?.trim()) vendorMap.set(m.company.trim().toLowerCase(), m.company.trim());
      });
    });

    const weekStartStr = weekDates[0];
    const result: VendorWeekData[] = [];

    vendorMap.forEach((displayName, key) => {
      const activeItems: VendorRow[] = [];
      
      weekDates.forEach((dateStr, di) => {
        entries.filter(e => e.date === dateStr).forEach(dayEntry => {
          dayEntry.materials?.forEach(m => {
            if (m.company?.trim().toLowerCase() === key) {
              const siteName = sites.find(s => s.id === dayEntry.siteId)?.siteName || "Unknown Site";
              activeItems.push({
                materialName: m.materialName,
                company: m.company,
                qty: Number(m.qty) || 0,
                marketCost: Number(m.marketCost) || 0,
                amount: Number(m.amount) || 0,
                paidAmount: Number(m.paidAmount) || 0,
                pendingAmount: Number(m.pendingAmount) || 0,
                paymentStatus: m.paymentStatus || "Not Paid",
                date: dateStr,
                dayLabel: DAY_LABELS[di],
                entryId: dayEntry.id,
                siteName,
              });
            }
          });
        });
      });
      
      const weekEarned = activeItems.reduce((s, d) => s + d.amount, 0);
      const weekPaid = activeItems.reduce((s, d) => s + d.paidAmount, 0);
      const weekPending = activeItems.reduce((s, d) => s + d.pendingAmount, 0);

      // Carry forward
      const carryEntries: { entryId: string; material: DailyMaterial; date: string }[] = [];
      let carryForward = 0;
      entries
        .filter(e => e.date < weekStartStr)
        .sort((a, b) => a.date.localeCompare(b.date))
        .forEach(e => {
          (e.materials || []).forEach(m => {
            if (m.company?.trim().toLowerCase() === key && (Number(m.pendingAmount) || 0) > 0) {
              carryForward += Number(m.pendingAmount) || 0;
              carryEntries.push({ entryId: e.id, material: m, date: e.date });
            }
          });
        });

      if (weekEarned > 0 || carryForward > 0) {
        result.push({
          companyName: displayName,
          activeItems,
          weekEarned,
          weekPaid,
          weekPending,
          carryForward,
          carryEntries,
          totalPayable: weekPending + carryForward,
        });
      }
    });

    return result.sort((a, b) => a.companyName.localeCompare(b.companyName));
  }, [entries, weekDates, sites]);

  // Operator machinery data
  const operatorWeeks: OperatorWeekData[] = useMemo(() => {
    const operatorMap = new Map<string, string>(); // key → display name
    entries.forEach(e => {
      (e.machinery || []).forEach(m => {
        if (m.personName?.trim()) operatorMap.set(m.personName.trim().toLowerCase(), m.personName.trim());
      });
    });

    const weekStartStr = weekDates[0];
    const result: OperatorWeekData[] = [];

    operatorMap.forEach((displayName, key) => {
      const activeItems: OperatorRow[] = [];
      
      weekDates.forEach((dateStr, di) => {
        entries.filter(e => e.date === dateStr).forEach(dayEntry => {
          dayEntry.machinery?.forEach(m => {
            if (m.personName?.trim().toLowerCase() === key) {
              const siteName = sites.find(s => s.id === dayEntry.siteId)?.siteName || "Unknown Site";
              activeItems.push({
                machineryName: m.machineryName,
                operator: m.personName,
                qty: Number(m.qty) || 0,
                cost: Number(m.cost) || 0,
                bata: Number(m.bata) || 0,
                amount: Number(m.amount) || 0,
                paidAmount: Number(m.paidAmount) || 0,
                pendingAmount: Number(m.pendingAmount) || 0,
                paymentStatus: m.paymentStatus || "Not Paid",
                date: dateStr,
                dayLabel: DAY_LABELS[di],
                entryId: dayEntry.id,
                siteName,
              });
            }
          });
        });
      });
      
      const weekEarned = activeItems.reduce((s, d) => s + d.amount, 0);
      const weekPaid = activeItems.reduce((s, d) => s + d.paidAmount, 0);
      const weekPending = activeItems.reduce((s, d) => s + d.pendingAmount, 0);

      // Carry forward
      const carryEntries: { entryId: string; machinery: DailyMachinery; date: string }[] = [];
      let carryForward = 0;
      entries
        .filter(e => e.date < weekStartStr)
        .sort((a, b) => a.date.localeCompare(b.date))
        .forEach(e => {
          (e.machinery || []).forEach(m => {
            if (m.personName?.trim().toLowerCase() === key && (Number(m.pendingAmount) || 0) > 0) {
              carryForward += Number(m.pendingAmount) || 0;
              carryEntries.push({ entryId: e.id, machinery: m, date: e.date });
            }
          });
        });

      if (weekEarned > 0 || carryForward > 0) {
        result.push({
          operatorName: displayName,
          activeItems,
          weekEarned,
          weekPaid,
          weekPending,
          carryForward,
          carryEntries,
          totalPayable: weekPending + carryForward,
        });
      }
    });

    return result.sort((a, b) => a.operatorName.localeCompare(b.operatorName));
  }, [entries, weekDates, sites]);

  // ── Week machinery / expense aggregates ──────────────────────────
  type ExpRow = { 
    entryId: string; 
    title: string; 
    amount: number; 
    paidAmount: number;
    pendingAmount: number;
    paymentStatus: string;
    site: string; 
    date: string; 
    dayLabel: string; 
  };

  const weekExpenses = useMemo((): ExpRow[] => {
    const rows: ExpRow[] = [];
    weekEntries.forEach(e => {
      const siteName = sites.find(s => s.id === e.siteId)?.siteName || "Unknown";
      (e.expenses || []).forEach(x => {
        const di = weekDates.indexOf(e.date);
        rows.push({
          entryId: e.id,
          title: x.title || "—",
          amount: Number(x.amount) || 0,
          paidAmount: Number(x.paidAmount) || 0,
          pendingAmount: Number(x.pendingAmount) || 0,
          paymentStatus: x.paymentStatus || "Not Paid",
          site: siteName,
          date: e.date,
          dayLabel: di >= 0 ? DAY_LABELS[di] : "—",
        });
      });
    });
    return rows;
  }, [weekEntries, sites, weekDates]);

  const totalMaterialsWeek = vendorWeeks.reduce((s, vw) => s + vw.weekEarned, 0);
  const totalMachineryWeek = operatorWeeks.reduce((s, ow) => s + ow.weekEarned, 0);
  const totalExpensesWeek = weekExpenses.reduce((s, x) => s + x.amount, 0);

  // Salary summary
  const salaryTotal = workerWeeks.reduce((s, w) => s + w.weekEarned, 0);
  const salaryPaid = workerWeeks.reduce((s, w) => s + w.weekPaid, 0);
  const salaryPending = workerWeeks.reduce((s, w) => s + w.weekPending, 0);
  const salaryCarry = workerWeeks.reduce((s, w) => s + w.carryForward, 0);

  // ── All Paid handler ──────────────────────────────────────────────────────

  const handleAllPaid = async (ww: WorkerWeekData, markPaid: boolean) => {
    setSaving(true);
    try {
      const workerKey = ww.name.trim().toLowerCase();
      for (const day of ww.activeDays) {
        if (!day || !day.entryId) continue;
        const entry = entries.find(e => e.id === day.entryId);
        if (!entry) continue;
        const updatedWorkers = entry.workers.map(w => {
          if (w.personName.trim().toLowerCase() !== workerKey) return w;
          if (markPaid) {
            return { ...w, paidAmount: Number(w.amount) || 0, pendingAmount: 0, paymentStatus: "Paid" as const };
          } else {
            return { ...w, paidAmount: 0, pendingAmount: Number(w.amount) || 0, paymentStatus: "Not Paid" as const };
          }
        });
        await updateDailyEntry(day.entryId, { workers: updatedWorkers });
      }
      if (markPaid) {
        for (const ce of ww.carryEntries) {
          const entry = entries.find(e => e.id === ce.entryId);
          if (!entry) continue;
          const updatedWorkers = entry.workers.map(w => {
            if (w.personName.trim().toLowerCase() !== workerKey) return w;
            return { ...w, paidAmount: Number(w.amount) || 0, pendingAmount: 0, paymentStatus: "Paid" as const };
          });
          await updateDailyEntry(ce.entryId, { workers: updatedWorkers });
        }
      }
      toast.success(markPaid ? `${ww.name} — ALL MARKED PAID` : `${ww.name} — RESET TO UNPAID`);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update payment status");
    }
    setSaving(false);
  };

  const handleVendorAllPaid = async (vw: VendorWeekData, markPaid: boolean) => {
    setSaving(true);
    try {
      const companyKey = vw.companyName.trim().toLowerCase();
      // Current week entries
      for (const item of vw.activeItems) {
        if (!item.entryId) continue;
        const entry = entries.find(e => e.id === item.entryId);
        if (!entry) continue;
        const updatedMaterials = entry.materials?.map(m => {
          if (m.company.trim().toLowerCase() !== companyKey) return m;
          if (markPaid) return { ...m, paidAmount: Number(m.amount) || 0, pendingAmount: 0, paymentStatus: "Paid" as const };
          else return { ...m, paidAmount: 0, pendingAmount: Number(m.amount) || 0, paymentStatus: "Not Paid" as const };
        });
        await updateDailyEntry(item.entryId, { materials: updatedMaterials });
      }
      // Carry forward entries
      if (markPaid) {
        for (const ce of vw.carryEntries) {
          const entry = entries.find(e => e.id === ce.entryId);
          if (!entry) continue;
          const updatedMaterials = entry.materials?.map(m => {
            if (m.company.trim().toLowerCase() !== companyKey) return m;
            return { ...m, paidAmount: Number(m.amount) || 0, pendingAmount: 0, paymentStatus: "Paid" as const };
          });
          await updateDailyEntry(ce.entryId, { materials: updatedMaterials });
        }
      }
      toast.success(markPaid ? `${vw.companyName} — ALL SETTLED` : `${vw.companyName} — RESET TO UNPAID`);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update vendor payment");
    }
    setSaving(false);
  };

  const handleOperatorAllPaid = async (ow: OperatorWeekData, markPaid: boolean) => {
    setSaving(true);
    try {
      const operatorKey = ow.operatorName.trim().toLowerCase();
      for (const item of ow.activeItems) {
        if (!item.entryId) continue;
        const entry = entries.find(e => e.id === item.entryId);
        if (!entry) continue;
        const updatedMachinery = entry.machinery?.map(m => {
          if (m.personName.trim().toLowerCase() !== operatorKey) return m;
          if (markPaid) return { ...m, paidAmount: Number(m.amount) || 0, pendingAmount: 0, paymentStatus: "Paid" as const };
          else return { ...m, paidAmount: 0, pendingAmount: Number(m.amount) || 0, paymentStatus: "Not Paid" as const };
        });
        await updateDailyEntry(item.entryId, { machinery: updatedMachinery });
      }
      if (markPaid) {
        for (const ce of ow.carryEntries) {
          const entry = entries.find(e => e.id === ce.entryId);
          if (!entry) continue;
          const updatedMachinery = entry.machinery?.map(m => {
            if (m.personName.trim().toLowerCase() !== operatorKey) return m;
            return { ...m, paidAmount: Number(m.amount) || 0, pendingAmount: 0, paymentStatus: "Paid" as const };
          });
          await updateDailyEntry(ce.entryId, { machinery: updatedMachinery });
        }
      }
      toast.success(markPaid ? `${ow.operatorName} — ALL SETTLED` : `${ow.operatorName} — RESET TO UNPAID`);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update operator payment");
    }
    setSaving(false);
  };

  // ── Bulk FIFO pay ─────────────────────────────────────────────────────────

  const handleBulkPay = async () => {
    if (!payWorker) return;
    const amount = Number(payAmount) || 0;
    if (amount <= 0) return toast.error("Enter a valid amount");
    if (amount > payWorker.totalPayable) return toast.error("Amount exceeds total pending");

    setSaving(true);
    try {
      const workerKey = payWorker.name.trim().toLowerCase();
      let remaining = amount;

      const allUnpaid = [
        ...payWorker.carryEntries.map(ce => ({ entryId: ce.entryId, date: ce.date })),
        ...payWorker.activeDays
          .filter((d): d is WorkerRow => d !== null && (d.pendingAmount || 0) > 0)
          .map(d => ({ entryId: d.entryId, date: d.date })),
      ].sort((a, b) => a.date.localeCompare(b.date));

      const seen = new Set<string>();
      for (const ue of allUnpaid) {
        if (remaining <= 0) break;
        if (seen.has(ue.entryId)) continue;
        seen.add(ue.entryId);

        const entry = entries.find(e => e.id === ue.entryId);
        if (!entry) continue;

        const updatedWorkers = entry.workers.map(w => {
          if (w.personName.trim().toLowerCase() !== workerKey) return w;
          const pending = Number(w.pendingAmount) || 0;
          if (pending <= 0 || remaining <= 0) return w;
          const allocate = Math.min(remaining, pending);
          remaining -= allocate;
          const newPaid = (Number(w.paidAmount) || 0) + allocate;
          const newPending = (Number(w.amount) || 0) - newPaid;
          const newStatus: "Paid" | "Not Paid" | "Partial" =
            newPending <= 0 ? "Paid" : newPaid > 0 ? "Partial" : "Not Paid";
          return { ...w, paidAmount: newPaid, pendingAmount: Math.max(0, newPending), paymentStatus: newStatus };
        });
        await updateDailyEntry(ue.entryId, { workers: updatedWorkers });
      }

      toast.success(`₹${amount.toLocaleString("en-IN")} paid to ${payWorker.name}`);
      setPayWorker(null);
      setPayAmount("");
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Payment failed");
    }
    setSaving(false);
  };

  const handleVendorPay = async () => {
    if (!payVendor) return;
    const amount = Number(payVendorAmount) || 0;
    if (amount <= 0) return toast.error("Enter valid amount");

    setSaving(true);
    try {
      const vendorKey = payVendor.companyName.trim().toLowerCase();
      let remaining = amount;

      const allUnpaid = [
        ...payVendor.carryEntries.map(ce => ({ entryId: ce.entryId, date: ce.date })),
        ...payVendor.activeItems
          .filter(d => (d.pendingAmount || 0) > 0)
          .map(d => ({ entryId: d.entryId, date: d.date })),
      ].sort((a, b) => a.date.localeCompare(b.date));

      const seen = new Set<string>();
      for (const ue of allUnpaid) {
        if (remaining <= 0) break;
        if (seen.has(ue.entryId)) continue;
        seen.add(ue.entryId);

        const entry = entries.find(e => e.id === ue.entryId);
        if (!entry) continue;

        const updatedMaterials = (entry.materials || []).map(m => {
          if (m.company?.trim().toLowerCase() !== vendorKey) return m;
          const pending = Number(m.pendingAmount) || 0;
          if (pending <= 0 || remaining <= 0) return m;
          const allocate = Math.min(remaining, pending);
          remaining -= allocate;
          const newPaid = (Number(m.paidAmount) || 0) + allocate;
          const newPending = (Number(m.amount) || 0) - newPaid;
          const newStatus: "Paid" | "Not Paid" | "Partial" =
            newPending <= 0 ? "Paid" : newPaid > 0 ? "Partial" : "Not Paid";
          return { ...m, paidAmount: newPaid, pendingAmount: Math.max(0, newPending), paymentStatus: newStatus };
        });
        await updateDailyEntry(ue.entryId, { materials: updatedMaterials });
      }

      toast.success(`₹${amount.toLocaleString("en-IN")} paid to ${payVendor.companyName}`);
      setPayVendor(null);
      setPayVendorAmount("");
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Vendor payment failed");
    }
    setSaving(false);
  };

  const handleOperatorPay = async () => {
    if (!payOperator) return;
    const amount = Number(payOperatorAmount) || 0;
    if (amount <= 0) return toast.error("Enter valid amount");

    setSaving(true);
    try {
      const opKey = payOperator.operatorName.trim().toLowerCase();
      let remaining = amount;

      const allUnpaid = [
        ...payOperator.carryEntries.map(ce => ({ entryId: ce.entryId, date: ce.date })),
        ...payOperator.activeItems
          .filter(d => (d.pendingAmount || 0) > 0)
          .map(d => ({ entryId: d.entryId, date: d.date })),
      ].sort((a, b) => a.date.localeCompare(b.date));

      const seen = new Set<string>();
      for (const ue of allUnpaid) {
        if (remaining <= 0) break;
        if (seen.has(ue.entryId)) continue;
        seen.add(ue.entryId);

        const entry = entries.find(e => e.id === ue.entryId);
        if (!entry) continue;

        const updatedMachinery = (entry.machinery || []).map(m => {
          if (m.personName?.trim().toLowerCase() !== opKey) return m;
          const pending = Number(m.pendingAmount) || 0;
          if (pending <= 0 || remaining <= 0) return m;
          const allocate = Math.min(remaining, pending);
          remaining -= allocate;
          const newPaid = (Number(m.paidAmount) || 0) + allocate;
          const newPending = (Number(m.amount) || 0) - newPaid;
          const newStatus: "Paid" | "Not Paid" | "Partial" =
            newPending <= 0 ? "Paid" : newPaid > 0 ? "Partial" : "Not Paid";
          return { ...m, paidAmount: newPaid, pendingAmount: Math.max(0, newPending), paymentStatus: newStatus };
        });
        await updateDailyEntry(ue.entryId, { machinery: updatedMachinery });
      }

      toast.success(`₹${amount.toLocaleString("en-IN")} paid to ${payOperator.operatorName}`);
      setPayOperator(null);
      setPayOperatorAmount("");
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Operator payment failed");
    }
    setSaving(false);
  };

  const handleExpensePayAll = async () => {
    if (totalExpensesWeek <= 0) return;
    const confirmPay = confirm(`Mark all ₹${totalExpensesWeek.toLocaleString("en-IN")} expenses for this week as Paid?`);
    if (!confirmPay) return;

    setSaving(true);
    try {
      for (const e of weekEntries) {
        if (!e.expenses || e.expenses.length === 0) continue;
        const updatedExpenses = e.expenses.map(x => ({
          ...x,
          paidAmount: Number(x.amount) || 0,
          pendingAmount: 0,
          paymentStatus: "Paid" as const
        }));
        await updateDailyEntry(e.id, { expenses: updatedExpenses });
      }
      toast.success("All expenses marked as paid");
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update expenses");
    }
    setSaving(false);
  };

  const handleExpenseSingleMarkPaid = async (x: ExpRow, markPaid: boolean) => {
    setSaving(true);
    try {
      const entry = entries.find(e => e.id === x.entryId);
      if (!entry) return;
      const updatedExpenses = entry.expenses?.map(exp => {
        if (exp.title.trim().toLowerCase() !== x.title.trim().toLowerCase()) return exp;
        if (markPaid) return { ...exp, paidAmount: Number(exp.amount) || 0, pendingAmount: 0, paymentStatus: "Paid" as const };
        else return { ...exp, paidAmount: 0, pendingAmount: Number(exp.amount) || 0, paymentStatus: "Not Paid" as const };
      });
      await updateDailyEntry(x.entryId, { expenses: updatedExpenses });
      toast.success(markPaid ? "Expense marked paid" : "Expense reset to unpaid");
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update expense");
    }
    setSaving(false);
  };

  const handleExpenseSinglePay = async () => {
    if (!payExpense) return;
    const amountToPay = Number(payExpenseAmount) || 0;
    if (amountToPay < 0) return;
    setSaving(true);
    try {
      const entry = entries.find(e => e.id === payExpense.entryId);
      if (entry) {
        const updatedExpenses = entry.expenses?.map(exp => {
          if (exp.title.trim().toLowerCase() !== payExpense.title.trim().toLowerCase()) return exp;
          // Add the new payment to the existing paidAmount
          const newPaid = (Number(exp.paidAmount) || 0) + amountToPay;
          const totalAmount = Number(exp.amount) || 0;
          const newPending = Math.max(0, totalAmount - newPaid);
          const newStatus = (newPending <= 0 ? "Paid" : newPaid > 0 ? "Partial" : "Not Paid") as "Paid" | "Not Paid" | "Partial";
          return { ...exp, paidAmount: Math.min(totalAmount, newPaid), pendingAmount: newPending, paymentStatus: newStatus };
        });
        await updateDailyEntry(payExpense.entryId, { expenses: updatedExpenses });
        toast.success("Payment recorded");
        setPayExpense(null);
        setPayExpenseAmount("");
        await loadData();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update payment");
    }
    setSaving(false);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const isAllPaid = (ww: WorkerWeekData) => ww.totalPayable === 0 && ww.weekEarned > 0;

  const selectWeek = (sunday: Date) => {
    setSelectedWeekStart(sunday);
    setWeekTab("overview");
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#F1F2F4]">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F2F4] pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-5 animate-in fade-in duration-400">

        {/* Header */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">Salary Management</p>
          <h1 className="text-[22px] font-bold text-[#1A1A1A]">Weekly Pay</h1>
        </div>

        {/* Calendar + Week Detail side by side on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">

          {/* ── LEFT: Calendar ────────────────────────────────────────────── */}
          <div className="space-y-3">
            <Card className="rounded-xl border-[#E5E5E5] bg-white shadow-sm overflow-hidden">
              {/* Month Nav */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0F0F0]">
                <button onClick={() => setCalMonth(prev => subMonths(prev, 1))} className="p-1.5 hover:bg-[#F5F5F5] rounded-lg transition-colors">
                  <ChevronLeft className="w-4 h-4 text-[#666]" />
                </button>
                <span className="text-[13px] font-black text-[#1A1A1A] uppercase tracking-wider">
                  {format(calMonth, "MMMM yyyy")}
                </span>
                <button onClick={() => setCalMonth(prev => addMonths(prev, 1))} className="p-1.5 hover:bg-[#F5F5F5] rounded-lg transition-colors">
                  <ChevronRight className="w-4 h-4 text-[#666]" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 px-3 pt-3">
                {DAY_HEADERS.map((d, i) => (
                  <div key={i} className="text-center text-[9px] font-black uppercase tracking-widest text-[#BBB] py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="px-3 pb-3">
                {calendarWeeks.map((week, wi) => {
                  const sunday = week[0];
                  const isSelected = isSameDay(sunday, selectedWeekStart);
                  const saturday = week[6];
                  const satStr = format(saturday, "yyyy-MM-dd");
                  const hasData = saturdaysWithEntries.has(satStr);
                  const isCurrentMonth = sunday.getMonth() === calMonth.getMonth() || saturday.getMonth() === calMonth.getMonth();

                  return (
                    <div
                      key={wi}
                      onClick={() => selectWeek(sunday)}
                      className={cn(
                        "grid grid-cols-7 cursor-pointer rounded-lg transition-all mb-1",
                        isSelected ? "bg-indigo-50 ring-2 ring-indigo-400" : "hover:bg-[#F8F8F8]",
                        !isCurrentMonth && "opacity-40"
                      )}
                    >
                      {week.map((day, di) => {
                        const isToday = isSameDay(day, new Date());
                        const isSat = di === 6;
                        const dayMonth = day.getMonth();
                        const isInMonth = dayMonth === calMonth.getMonth();

                        return (
                          <div key={di} className="text-center py-2 relative">
                            <span className={cn(
                              "text-[11px] font-bold inline-flex items-center justify-center w-7 h-7 rounded-full transition-all",
                              isToday ? "bg-[#1A1A1A] text-white" :
                              isSat && hasData && isSelected ? "bg-indigo-600 text-white" :
                              isSat && hasData ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                              isInMonth ? "text-[#1A1A1A]" : "text-[#CCC]"
                            )}>
                              {format(day, "d")}
                            </span>
                            {isSat && hasData && !isSelected && (
                              <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="px-4 py-2.5 border-t border-[#F0F0F0] flex items-center gap-4 text-[9px] font-bold text-[#999] uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Pay Day (Sat)
                </span>
                <span className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Selected
                </span>
              </div>
            </Card>

            {/* Quick week stats on left */}
            <Card className="rounded-xl border-[#E5E5E5] bg-white shadow-sm p-4 space-y-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#999]">Selected Week</p>
              <p className="text-[12px] font-black text-[#1A1A1A] tracking-tight">{formatWeekRange(selectedWeekStart)}</p>
              <div className="space-y-2 pt-1">
                {[
                  { label: "Labour", value: weekSummary.labour, color: "text-indigo-600" },
                  { label: "Material", value: weekSummary.material, color: "text-emerald-600" },
                  { label: "Machinery", value: weekSummary.machinery, color: "text-amber-600" },
                  { label: "Expenses", value: weekSummary.expenses, color: "text-rose-500" },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#999] uppercase">{r.label}</span>
                    <span className={cn("text-[12px] font-black", r.color)}>₹{r.value.toLocaleString("en-IN")}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t border-[#F0F0F0]">
                  <span className="text-[10px] font-black text-[#666] uppercase">Total</span>
                  <span className="text-[14px] font-black text-[#1A1A1A]">₹{weekSummary.total.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* ── RIGHT: Week Detail ────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Tabs: Overview | Salary */}
            <div className="flex gap-1 bg-white rounded-xl border border-[#E5E5E5] p-1 shadow-sm">
              {(["overview", "salary"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setWeekTab(tab)}
                  className={cn(
                    "flex-1 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all",
                    weekTab === tab ? "bg-[#1A1A1A] text-white shadow-sm" : "text-[#999] hover:text-[#666] hover:bg-[#F5F5F5]"
                  )}
                >
                  {tab === "overview" ? "📊 WEEK OVERVIEW" : "💰 SALARY & PAYMENT"}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW TAB ──────────────────────────────────────────── */}
            {weekTab === "overview" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                {/* Week Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { label: "Labour", value: weekSummary.labour, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
                    { label: "Material", value: weekSummary.material, icon: Package, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                    { label: "Machinery", value: weekSummary.machinery, icon: Cog, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
                    { label: "Expenses", value: weekSummary.expenses, icon: Receipt, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100" },
                    { label: "Grand Total", value: weekSummary.total, icon: TrendingUp, color: "text-[#1A1A1A]", bg: "bg-[#F5F5F5]", border: "border-[#E0E0E0]" },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-[#E5E5E5] p-3 shadow-sm">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center mb-2", s.bg, `border ${s.border}`)}>
                        <s.icon className={cn("w-3.5 h-3.5", s.color)} />
                      </div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-[#999] mb-0.5">{s.label}</p>
                      <p className={cn("text-[16px] font-bold", s.color)}>{fmtINR(s.value)}</p>
                    </div>
                  ))}
                </div>

                {/* 7 Day Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
                  {dayBreakdown.map((d, i) => (
                    <Card key={d.date} className={cn(
                      "rounded-xl border p-3 text-center transition-all",
                      d.hasEntry ? "border-[#E5E5E5] bg-white shadow-sm" : "border-dashed border-[#E5E5E5] bg-[#FAFAFA]"
                    )}>
                      <p className="text-[9px] font-black uppercase tracking-widest text-[#BBB]">{d.dayLabel}</p>
                      <p className="text-[12px] font-bold text-[#666] mb-2">{d.dayNum}</p>
                      {d.hasEntry ? (
                        <div className="space-y-1.5">
                          <p className="text-[14px] font-black text-[#1A1A1A]">₹{d.total.toLocaleString("en-IN")}</p>
                          <div className="space-y-0.5 text-[8px] font-bold">
                            {d.labour > 0 && <p className="text-indigo-600">L: ₹{d.labour.toLocaleString("en-IN")}</p>}
                            {d.material > 0 && <p className="text-emerald-600">M: ₹{d.material.toLocaleString("en-IN")}</p>}
                            {d.machinery > 0 && <p className="text-amber-600">E: ₹{d.machinery.toLocaleString("en-IN")}</p>}
                            {d.expenses > 0 && <p className="text-rose-500">X: ₹{d.expenses.toLocaleString("en-IN")}</p>}
                          </div>
                          {d.sites.length > 0 && (
                            <p className="text-[7px] font-bold text-[#BBB] uppercase truncate pt-1 border-t border-[#F0F0F0]">
                              {d.sites.join(", ")}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[12px] text-[#CCC] font-bold pt-2">—</p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* ── SALARY TAB ────────────────────────────────────────────── */}
            {weekTab === "salary" && (
              <div className="space-y-5 animate-in fade-in duration-300">

                {/* ── Top Summary Cards ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: "Labour", value: salaryTotal, icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
                    { label: "Paid", value: salaryPaid, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
                    { label: "Pending", value: salaryPending + salaryCarry, icon: Clock, color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-100" },
                    { label: "Carry Forward", value: salaryCarry, icon: ArrowRightLeft, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
                  ].map(s => (
                    <div key={s.label} className="bg-white rounded-xl border border-[#E5E5E5] p-3 shadow-sm">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center mb-2", s.bg, `border ${s.border}`)}>
                        <s.icon className={cn("w-3.5 h-3.5", s.color)} />
                      </div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-[#999] mb-0.5">{s.label}</p>
                      <p className={cn("text-[16px] font-bold", s.color)}>{fmtINR(s.value)}</p>
                    </div>
                  ))}
                </div>

                {/* ── SECTION 1: WORKER SALARY ── */}
                <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <h2 className="text-[13px] font-black text-[#1A1A1A] uppercase tracking-wide">Labour / Salary</h2>
                    </div>
                    <span className="text-[12px] font-black text-indigo-600">₹{salaryTotal.toLocaleString("en-IN")}</span>
                  </div>

                  {workerWeeks.length === 0 ? (
                    <div className="p-10 text-center text-[13px] text-[#999]">No workers this week</div>
                  ) : (
                    <div className="divide-y divide-[#F0F0F0]">
                      {workerWeeks.map(ww => {
                        const allPaid = isAllPaid(ww);
                        return (
                          <div key={ww.name} className={cn(
                            "p-4 transition-all",
                            allPaid ? "bg-emerald-50/30" : "bg-white"
                          )}>
                            {/* Worker name row */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2.5">
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-black shrink-0",
                                  allPaid ? "bg-emerald-100 text-emerald-700" : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                )}>
                                  {ww.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[13px] font-black text-[#1A1A1A] uppercase">{ww.name}</span>
                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                      {ww.activeDays.length} day{ww.activeDays.length !== 1 ? "s" : ""}
                                    </span>
                                  </div>
                                  {ww.carryForward > 0 && (
                                    <p className="text-[9px] text-amber-600 font-bold mt-0.5">⚠ Carry Forward: ₹{ww.carryForward.toLocaleString("en-IN")}</p>
                                  )}
                                </div>
                              </div>
                              <label className={cn(
                                "flex items-center gap-1.5 cursor-pointer select-none px-2.5 py-1.5 rounded-lg transition-all text-[9px] font-black uppercase tracking-widest shrink-0",
                                allPaid ? "bg-emerald-100 text-emerald-700" : "bg-[#F5F5F5] text-[#999] hover:bg-[#EEE]"
                              )}>
                                <input
                                  type="checkbox"
                                  checked={allPaid}
                                  disabled={saving || ww.weekEarned === 0}
                                  onChange={(e) => handleAllPaid(ww, e.target.checked)}
                                  className="w-3 h-3 rounded accent-emerald-600"
                                />
                                {allPaid ? "PAID ✓" : "ALL PAID"}
                              </label>
                            </div>

                            {/* Day-by-day detail table */}
                            <div className="rounded-lg border border-[#E5E5E5] overflow-hidden mb-3">
                              <table className="w-full text-left">
                                <thead>
                                  <tr className="bg-[#FAFAFA] border-b border-[#F0F0F0] text-[8px] font-black text-[#999] uppercase tracking-widest">
                                    <th className="px-3 py-2">Day</th>
                                    <th className="px-3 py-2">Site</th>
                                    <th className="px-3 py-2">Type</th>
                                    <th className="px-3 py-2 text-center">Labour</th>
                                    <th className="px-3 py-2 text-center">Shift/Qty</th>
                                    <th className="px-3 py-2 text-right">Earned</th>
                                    <th className="px-3 py-2 text-right">Paid</th>
                                    <th className="px-3 py-2 text-center">Status</th>
                                    <th className="px-3 py-2 text-right">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F5F5F5]">
                                  {ww.activeDays.map((day, idx) => {
                                    const isPaid = day.paymentStatus === "Paid";
                                    const isPartial = day.paymentStatus === "Partial";
                                    return (
                                      <tr key={idx} className={cn(
                                        "text-[11px] transition-colors",
                                        isPaid ? "bg-emerald-50/30" : isPartial ? "bg-amber-50/20" : "hover:bg-[#FAFAFA]"
                                      )}>
                                        <td className="px-3 py-2.5">
                                          <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">{day.dayLabel}</span>
                                        </td>
                                        <td className="px-3 py-2.5 text-[11px] text-[#555] max-w-[120px] truncate">{day.siteName}</td>
                                        <td className="px-3 py-2.5">
                                          <div className="flex gap-1 flex-wrap">
                                            {day.types.map((t, tidx) => (
                                              <span key={tidx} className="text-[10px] font-black text-[#666] bg-[#F5F5F5] px-1.5 py-0.5 rounded">{t}</span>
                                            ))}
                                          </div>
                                        </td>
                                        <td className="px-3 py-2.5 text-center text-[11px] font-bold text-[#1A1A1A]">
                                          {day.labourCount > 0 ? (
                                            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                                              {day.labourCount}
                                            </span>
                                          ) : "—"}
                                        </td>
                                        <td className="px-3 py-2.5 text-center text-[11px] text-[#666]">
                                          {day.shiftText}
                                        </td>
                                        <td className="px-3 py-2.5 text-right font-bold text-[#1A1A1A]">₹{day.amount.toLocaleString("en-IN")}</td>
                                        <td className="px-3 py-2.5 text-right font-bold text-emerald-600">₹{day.paidAmount.toLocaleString("en-IN")}</td>
                                        <td className="px-3 py-2.5 text-center">
                                          <span className={cn(
                                            "text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border",
                                            isPaid ? "text-emerald-700 bg-emerald-50 border-emerald-100" :
                                            isPartial ? "text-amber-700 bg-amber-50 border-amber-100" :
                                            "text-rose-600 bg-rose-50 border-rose-100"
                                          )}>
                                            {day.paymentStatus || "Not Paid"}
                                          </span>
                                        </td>
                                        <td className="px-3 py-2.5 text-right">
                                          <Link 
                                            href={`/admin/daily-entry?edit=${day.entryId}`}
                                            className="text-[#2C6ECB] hover:text-[#1A4B8C] font-black uppercase text-[9px] tracking-tight transition-colors"
                                          >
                                            Edit
                                          </Link>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            {/* Worker totals + Pay button */}
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex flex-wrap gap-3 text-[11px]">
                                <span className="text-[#666]">Total: <span className="font-black text-[#1A1A1A]">₹{ww.weekEarned.toLocaleString("en-IN")}</span></span>
                                {ww.carryForward > 0 && <span className="text-amber-600 font-bold">+Carry: ₹{ww.carryForward.toLocaleString("en-IN")}</span>}
                                <span className="text-emerald-600 font-bold">Paid: ₹{ww.weekPaid.toLocaleString("en-IN")}</span>
                                <span className="text-rose-500 font-bold">Due: ₹{ww.totalPayable.toLocaleString("en-IN")}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {allPaid && (
                                  <div className="flex items-center gap-1.5 mr-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase">Settled</span>
                                  </div>
                                )}
                                <Button
                                  onClick={() => { setPayWorker(ww); setPayAmount(String(ww.totalPayable)); }}
                                  disabled={saving}
                                  size="sm"
                                  className={cn(
                                    "h-9 rounded-lg text-[10px] font-black uppercase tracking-wider px-4 transition-all",
                                    allPaid ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200" : "bg-[#1A1A1A] hover:bg-[#333] text-white"
                                  )}
                                >
                                  <IndianRupee className="w-3 h-3 mr-1" /> {allPaid ? "Update Payment" : "Settle Weekly / Pay"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── SECTION 2: MATERIALS (VENDOR BASED) ── */}
                {vendorWeeks.length > 0 && (
                  <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center">
                          <Package className="w-3.5 h-3.5 text-emerald-600" />
                        </div>
                        <h2 className="text-[13px] font-black text-[#1A1A1A] uppercase tracking-wide">Vendors / Materials</h2>
                      </div>
                      <span className="text-[12px] font-black text-emerald-600">₹{totalMaterialsWeek.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="divide-y divide-[#F5F5F5]">
                      {vendorWeeks.map((vw, vi) => (
                        <div key={vi} className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-black shrink-0",
                                vw.totalPayable <= 0 ? "bg-emerald-100 text-emerald-700" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              )}>
                                {vw.companyName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[13px] font-black text-[#1A1A1A] uppercase">{vw.companyName}</span>
                                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                    {vw.activeItems.length} items
                                  </span>
                                </div>
                                {vw.carryForward > 0 && (
                                  <p className="text-[9px] text-amber-600 font-bold mt-0.5">⚠ Old Due: ₹{vw.carryForward.toLocaleString("en-IN")}</p>
                                )}
                              </div>
                            </div>
                            <label className={cn(
                              "flex items-center gap-1.5 cursor-pointer select-none px-2.5 py-1.5 rounded-lg transition-all text-[9px] font-black uppercase tracking-widest shrink-0",
                              vw.totalPayable <= 0 ? "bg-emerald-100 text-emerald-700" : "bg-[#F5F5F5] text-[#999] hover:bg-[#EEE]"
                            )}>
                              <input
                                type="checkbox"
                                checked={vw.totalPayable <= 0}
                                disabled={saving || vw.weekEarned === 0}
                                onChange={(e) => handleVendorAllPaid(vw, e.target.checked)}
                                className="w-3 h-3 rounded accent-emerald-600"
                              />
                              {vw.totalPayable <= 0 ? "PAID ✓" : "MARK PAID"}
                            </label>
                          </div>
                          
                          <div className="rounded-lg border border-[#F0F0F0] overflow-hidden mb-3">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="bg-[#FAFAFA] border-b border-[#F0F0F0] text-[8px] font-black text-[#999] uppercase tracking-widest">
                                  <th className="px-3 py-2">Day</th>
                                  <th className="px-3 py-2">Item</th>
                                  <th className="px-3 py-2">Site</th>
                                  <th className="px-3 py-2 text-center">Qty / Rate</th>
                                  <th className="px-3 py-2 text-right">Amount</th>
                                  <th className="px-3 py-2 text-right">Paid</th>
                                  <th className="px-3 py-2 text-center">Status</th>
                                  <th className="px-3 py-2 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#F5F5F5]">
                                {vw.activeItems.map((item, idx) => {
                                  const isPaid = item.paymentStatus === "Paid";
                                  const isPartial = item.paymentStatus === "Partial";
                                  return (
                                    <tr key={idx} className={cn(
                                      "text-[11px] transition-colors",
                                      isPaid ? "bg-emerald-50/30" : isPartial ? "bg-amber-50/20" : "hover:bg-[#FAFAFA]"
                                    )}>
                                      <td className="px-3 py-2">
                                        <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{item.dayLabel}</span>
                                      </td>
                                      <td className="px-3 py-2 font-black text-[#1A1A1A]">{item.materialName}</td>
                                      <td className="px-3 py-2 text-[#666] truncate max-w-[100px]">{item.siteName}</td>
                                      <td className="px-3 py-2 text-center text-[#666]">
                                        {item.qty} × ₹{item.marketCost.toLocaleString("en-IN")}
                                      </td>
                                      <td className="px-3 py-2 text-right font-bold text-[#1A1A1A]">₹{item.amount.toLocaleString("en-IN")}</td>
                                      <td className="px-3 py-2 text-right font-bold text-emerald-600">₹{item.paidAmount.toLocaleString("en-IN")}</td>
                                      <td className="px-3 py-2 text-center">
                                        <span className={cn(
                                          "text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border",
                                          isPaid ? "text-emerald-700 bg-emerald-50 border-emerald-100" :
                                          isPartial ? "text-amber-700 bg-amber-50 border-amber-100" :
                                          "text-rose-600 bg-rose-50 border-rose-100"
                                        )}>
                                          {item.paymentStatus}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-right">
                                        <Link 
                                          href={`/admin/daily-entry?edit=${item.entryId}`}
                                          className="inline-flex items-center gap-1 text-[#2C6ECB] hover:text-[#1A4B8C] font-black uppercase text-[9px] tracking-tight transition-colors"
                                        >
                                          Edit <ArrowRightLeft className="w-2.5 h-2.5" />
                                        </Link>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-3 text-[11px]">
                              <span className="text-[#666]">Weekly: <span className="font-black text-[#1A1A1A]">₹{vw.weekEarned.toLocaleString("en-IN")}</span></span>
                              {vw.carryForward > 0 && <span className="text-amber-600 font-bold">+Old Due: ₹{vw.carryForward.toLocaleString("en-IN")}</span>}
                              <span className="text-emerald-600 font-bold">Paid: ₹{vw.weekPaid.toLocaleString("en-IN")}</span>
                              <span className="text-rose-500 font-bold">Net Due: ₹{vw.totalPayable.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {vw.totalPayable <= 0 && (
                                <div className="flex items-center gap-1.5 mr-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-[10px] font-black text-emerald-600 uppercase">Settled</span>
                                </div>
                              )}
                              <Button
                                onClick={() => { setPayVendor(vw); setPayVendorAmount(String(vw.totalPayable)); }}
                                size="sm"
                                className={cn(
                                  "h-8 rounded-lg text-[10px] font-black uppercase tracking-wider px-4 transition-all",
                                  vw.totalPayable <= 0 ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                )}
                              >
                                {vw.totalPayable <= 0 ? "Update Payment" : "Settle Vendor"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── SECTION 3: MACHINERY (OPERATOR BASED) ── */}
                {operatorWeeks.length > 0 && (
                  <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden mt-5">
                    <div className="px-4 py-3 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-amber-50 border border-amber-100 rounded-lg flex items-center justify-center">
                          <Cog className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                        <h2 className="text-[13px] font-black text-[#1A1A1A] uppercase tracking-wide">Machinery (By Operator)</h2>
                      </div>
                      <span className="text-[12px] font-black text-amber-600">Total: ₹{totalMachineryWeek.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="divide-y divide-[#F5F5F5]">
                      {operatorWeeks.map((ow, oi) => (
                        <div key={oi} className="p-4 space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center text-[12px] font-black shrink-0",
                                ow.totalPayable <= 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-50 text-amber-700 border border-amber-100"
                              )}>
                                {ow.operatorName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[12px] font-black text-[#1A1A1A] uppercase">{ow.operatorName}</span>
                                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                    {ow.activeItems.length} entries
                                  </span>
                                </div>
                                {ow.carryForward > 0 && (
                                  <p className="text-[9px] text-amber-600 font-bold mt-0.5">⚠ Old Due: ₹{ow.carryForward.toLocaleString("en-IN")}</p>
                                )}
                              </div>
                            </div>
                            <label className={cn(
                              "flex items-center gap-1.5 cursor-pointer select-none px-2.5 py-1.5 rounded-lg transition-all text-[9px] font-black uppercase tracking-widest shrink-0",
                              ow.totalPayable <= 0 ? "bg-emerald-100 text-emerald-700" : "bg-[#F5F5F5] text-[#999] hover:bg-[#EEE]"
                            )}>
                              <input
                                type="checkbox"
                                checked={ow.totalPayable <= 0}
                                disabled={saving || ow.weekEarned === 0}
                                onChange={(e) => handleOperatorAllPaid(ow, e.target.checked)}
                                className="w-3 h-3 rounded accent-emerald-600"
                              />
                              {ow.totalPayable <= 0 ? "PAID ✓" : "MARK PAID"}
                            </label>
                          </div>

                          <div className="rounded-lg border border-[#F0F0F0] overflow-hidden">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="bg-[#FAFAFA] border-b border-[#F0F0F0] text-[8px] font-black text-[#999] uppercase tracking-widest">
                                  <th className="px-3 py-2">Day</th>
                                  <th className="px-3 py-2">Machine</th>
                                  <th className="px-3 py-2">Site</th>
                                  <th className="px-3 py-2 text-center">Qty / Rate</th>
                                  <th className="px-3 py-2 text-right">Amount</th>
                                  <th className="px-3 py-2 text-center">Status</th>
                                  <th className="px-3 py-2 text-right">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#F5F5F5]">
                                {ow.activeItems.map((item, idx) => {
                                  const isPaid = item.paymentStatus === "Paid";
                                  const isPartial = item.paymentStatus === "Partial";
                                  return (
                                    <tr key={idx} className={cn(
                                      "text-[11px] transition-colors",
                                      isPaid ? "bg-emerald-50/30" : isPartial ? "bg-amber-50/20" : "hover:bg-[#FAFAFA]"
                                    )}>
                                      <td className="px-3 py-2">
                                        <span className="text-[9px] font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">{item.dayLabel}</span>
                                      </td>
                                      <td className="px-3 py-2 font-black text-[#1A1A1A]">{item.machineryName}</td>
                                      <td className="px-3 py-2 text-[#666] truncate max-w-[100px]">{item.siteName}</td>
                                      <td className="px-3 py-2 text-center text-[#666]">
                                        {item.qty} × ₹{item.cost.toLocaleString("en-IN")}
                                      </td>
                                      <td className="px-3 py-2 text-right font-bold text-[#1A1A1A]">₹{item.amount.toLocaleString("en-IN")}</td>
                                      <td className="px-3 py-2 text-center">
                                        <span className={cn(
                                          "text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border",
                                          isPaid ? "text-emerald-700 bg-emerald-50 border-emerald-100" :
                                          isPartial ? "text-amber-700 bg-amber-50 border-amber-100" :
                                          "text-rose-600 bg-rose-50 border-rose-100"
                                        )}>
                                          {item.paymentStatus}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-right">
                                        <Link href={`/admin/daily-entry?edit=${item.entryId}`} className="text-[#2C6ECB] hover:underline font-bold text-[9px] uppercase">
                                          Edit
                                        </Link>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap gap-3 text-[11px]">
                              <span className="text-[#666]">Weekly: <span className="font-black text-[#1A1A1A]">₹{ow.weekEarned.toLocaleString("en-IN")}</span></span>
                              {ow.carryForward > 0 && <span className="text-amber-600 font-bold">+Old Due: ₹{ow.carryForward.toLocaleString("en-IN")}</span>}
                              <span className="text-emerald-600 font-bold">Paid: ₹{ow.weekPaid.toLocaleString("en-IN")}</span>
                              <span className="text-rose-500 font-bold">Net Due: ₹{ow.totalPayable.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {ow.totalPayable <= 0 && (
                                <div className="flex items-center gap-1.5 mr-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                  <span className="text-[10px] font-black text-emerald-600 uppercase">Settled</span>
                                </div>
                              )}
                              <Button
                                onClick={() => { setPayOperator(ow); setPayOperatorAmount(String(ow.totalPayable)); }}
                                size="sm"
                                className={cn(
                                  "h-8 rounded-lg text-[10px] font-black uppercase tracking-wider px-4 transition-all",
                                  ow.totalPayable <= 0 ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200" : "bg-amber-600 hover:bg-amber-700 text-white"
                                )}
                              >
                                {ow.totalPayable <= 0 ? "Update Payment" : "Settle Operator"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── SECTION 4: EXPENSES ── */}
                {weekExpenses.length > 0 && (
                  <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-rose-50 border border-rose-100 rounded-lg flex items-center justify-center">
                          <Receipt className="w-3.5 h-3.5 text-rose-500" />
                        </div>
                        <h2 className="text-[13px] font-black text-[#1A1A1A] uppercase tracking-wide">Other Expenses</h2>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[12px] font-black text-rose-500">₹{totalExpensesWeek.toLocaleString("en-IN")}</span>
                        {totalExpensesWeek > 0 && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-[9px] font-black uppercase border-rose-200 text-rose-600 hover:bg-rose-50"
                            onClick={handleExpensePayAll}
                          >
                            Mark Paid
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="divide-y divide-[#F5F5F5]">
                      {weekExpenses.map((x, xi) => {
                        const isPaid = x.paymentStatus === "Paid";
                        const isPartial = x.paymentStatus === "Partial";
                        return (
                        <div key={xi} className={cn(
                          "px-4 py-4 space-y-3 hover:bg-[#FAFAFA] transition-colors",
                          isPaid ? "bg-emerald-50/20" : isPartial ? "bg-amber-50/10" : ""
                        )}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <label className="cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isPaid}
                                  onChange={(e) => handleExpenseSingleMarkPaid(x, e.target.checked)}
                                  className="w-3.5 h-3.5 rounded accent-emerald-600"
                                />
                              </label>
                              <div className="flex items-center gap-2.5">
                                <span className="text-[9px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100 uppercase">{x.dayLabel}</span>
                                <div>
                                  <p className="text-[12px] font-bold text-[#1A1A1A] uppercase tracking-tight">{x.title}</p>
                                  <p className="text-[9px] font-black text-[#999] uppercase tracking-widest">{x.site}</p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[13px] font-black text-rose-500">₹{x.amount.toLocaleString("en-IN")}</p>
                              {x.paidAmount > 0 && (
                                <p className="text-[9px] font-bold text-emerald-600">Paid: ₹{x.paidAmount.toLocaleString("en-IN")}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pl-[48px]">
                            <div className="flex items-center gap-3 text-[9px] font-black uppercase text-[#999]">
                              <span>Status: <span className={cn(isPaid ? "text-emerald-600" : isPartial ? "text-amber-600" : "text-rose-500")}>{x.paymentStatus}</span></span>
                              {isPartial && <span className="text-rose-500">Due: ₹{x.pendingAmount.toLocaleString("en-IN")}</span>}
                            </div>
                            <div className="flex items-center gap-3">
                              <Link 
                                href={`/admin/daily-entry?edit=${x.entryId}`}
                                className="text-[#2C6ECB] hover:underline font-black uppercase text-[9px] tracking-tight"
                              >
                                Edit Record
                              </Link>
                              <Button
                                onClick={() => { setPayExpense(x); setPayExpenseAmount(String(x.pendingAmount)); }}
                                size="sm"
                                className={cn(
                                  "h-7 text-[9px] font-black uppercase px-3 rounded-lg transition-all",
                                  isPaid ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-500 hover:bg-rose-600 text-white"
                                )}
                              >
                                {isPaid ? "Update Pay" : "Settle"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )})}
                    </div>
                    <div className="px-4 py-2.5 border-t border-[#E5E5E5] bg-rose-50/40 flex justify-between text-[11px] font-black">
                      <span className="text-[#666] uppercase">Total Expenses</span>
                      <span className="text-rose-500">₹{totalExpensesWeek.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                )}

                {/* ── Week Grand Total ── */}
                <div className="bg-[#1A1A1A] rounded-xl p-4 flex items-center justify-between shadow-md">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Week Grand Total</p>
                    <p className="text-[11px] text-white/60 mt-0.5">
                      Labour + Material + Machinery + Expenses
                    </p>
                  </div>
                  <p className="text-[22px] font-black text-white">
                    ₹{(salaryTotal + totalMaterialsWeek + totalMachineryWeek + totalExpensesWeek).toLocaleString("en-IN")}
                  </p>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bulk Pay Dialog ─────────────────────────────────────────────────── */}
      <Dialog open={!!payWorker} onOpenChange={(o) => { if (!o) { setPayWorker(null); setPayAmount(""); } }}>
        <DialogContent className="max-w-sm rounded-xl bg-white border-[#E5E5E5]">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-[#1A1A1A]">Pay {payWorker?.name}</DialogTitle>
          </DialogHeader>
          {payWorker && (
            <div className="space-y-4 pt-1">
              <div className="bg-[#FAFAFA] rounded-lg border border-[#E5E5E5] p-3 space-y-1.5">
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#999]">This Week Pending</span>
                  <span className="font-bold">₹{payWorker.weekPending.toLocaleString("en-IN")}</span>
                </div>
                {payWorker.carryForward > 0 && (
                  <div className="flex justify-between text-[12px]">
                    <span className="text-amber-600">Carry Forward</span>
                    <span className="font-bold text-amber-600">₹{payWorker.carryForward.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-[13px] border-t border-[#E5E5E5] pt-1.5">
                  <span className="font-bold">Total Payable</span>
                  <span className="font-black">₹{payWorker.totalPayable.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#999] block mb-1.5">Amount to Pay</label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
                  <Input type="number" min={1} max={payWorker.totalPayable} value={payAmount} onChange={e => setPayAmount(e.target.value)}
                    className="pl-9 h-11 text-[14px] font-bold border-[#D9D9D9] rounded-lg" placeholder="0" />
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <button onClick={() => setPayAmount(String(payWorker.totalPayable))}
                    className="text-[10px] font-black text-primary border border-primary/30 bg-primary/5 px-3 py-1 rounded-full hover:bg-primary/10 transition-colors">
                    Pay Full ₹{payWorker.totalPayable.toLocaleString("en-IN")}
                  </button>
                  {payWorker.carryForward > 0 && (
                    <button onClick={() => setPayAmount(String(payWorker.weekPending))}
                      className="text-[10px] font-black text-indigo-600 border border-indigo-200 bg-indigo-50 px-3 py-1 rounded-full hover:bg-indigo-100 transition-colors">
                      Week Only ₹{payWorker.weekPending.toLocaleString("en-IN")}
                    </button>
                  )}
                </div>
              </div>
              {payWorker.carryForward > 0 && (
                <div className="text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-2.5 flex items-start gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Oldest unpaid entries are paid first (carry forward → this week).</span>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="gap-2 pt-2">
            <Button variant="ghost" onClick={() => { setPayWorker(null); setPayAmount(""); }} className="h-10 text-[12px] font-black uppercase text-[#666]">Cancel</Button>
            <Button onClick={handleBulkPay} disabled={saving || !payAmount || Number(payAmount) <= 0}
              className="h-10 bg-[#1A1A1A] hover:bg-[#333] text-white text-[12px] font-black uppercase px-6 rounded-lg">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Vendor Pay Dialog ────────────────────────────────────────────────── */}
      <Dialog open={!!payVendor} onOpenChange={(o) => { if (!o) { setPayVendor(null); setPayVendorAmount(""); } }}>
        <DialogContent className="max-w-xs rounded-xl bg-white border-[#E5E5E5] p-6">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-black text-[#1A1A1A] uppercase tracking-tight">Settle Vendor</DialogTitle>
            <p className="text-[12px] text-[#666] font-medium mt-1">{payVendor?.companyName}</p>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="bg-[#F8F9FA] rounded-xl border border-[#EEE] p-4 space-y-2">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-[#999] uppercase">Old Due</span>
                <span className="text-amber-600">₹{payVendor?.carryForward.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-[#999] uppercase">This Week</span>
                <span className="text-[#1A1A1A]">₹{payVendor?.weekEarned.toLocaleString("en-IN")}</span>
              </div>
              <div className="pt-2 border-t border-[#EEE] flex justify-between text-[13px] font-black">
                <span className="text-[#1A1A1A] uppercase">Total Payable</span>
                <span className="text-rose-600">₹{payVendor?.totalPayable.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#999] block mb-1.5">Enter Payment Amount</label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
                <Input type="number" min={0} value={payVendorAmount} onChange={e => setPayVendorAmount(e.target.value)}
                  className="pl-9 h-11 text-[16px] font-bold border-[#D9D9D9] rounded-lg focus:ring-emerald-500" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-4">
            <Button variant="ghost" onClick={() => setPayVendor(null)} className="h-10 text-[12px] font-black uppercase text-[#666]">Cancel</Button>
            <Button onClick={handleVendorPay} disabled={saving || !payVendorAmount}
              className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-black uppercase px-6 rounded-lg">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Pay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ── Operator Pay Dialog ────────────────────────────────────────────────── */}
      <Dialog open={!!payOperator} onOpenChange={(o) => { if (!o) { setPayOperator(null); setPayOperatorAmount(""); } }}>
        <DialogContent className="max-w-xs rounded-xl bg-white border-[#E5E5E5] p-6">
          <DialogHeader>
            <DialogTitle className="text-[16px] font-black text-[#1A1A1A] uppercase tracking-tight">Settle Operator</DialogTitle>
            <p className="text-[12px] text-[#666] font-medium mt-1">{payOperator?.operatorName}</p>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="bg-[#F8F9FA] rounded-xl border border-[#EEE] p-4 space-y-2">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-[#999] uppercase">Old Due</span>
                <span className="text-amber-600">₹{payOperator?.carryForward.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-[#999] uppercase">This Week</span>
                <span className="text-[#1A1A1A]">₹{payOperator?.weekEarned.toLocaleString("en-IN")}</span>
              </div>
              <div className="pt-2 border-t border-[#EEE] flex justify-between text-[13px] font-black">
                <span className="text-[#1A1A1A] uppercase">Total Payable</span>
                <span className="text-rose-600">₹{payOperator?.totalPayable.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-[#999] block mb-1.5">Enter Payment Amount</label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
                <Input type="number" min={0} value={payOperatorAmount} onChange={e => setPayOperatorAmount(e.target.value)}
                  className="pl-9 h-11 text-[16px] font-bold border-[#D9D9D9] rounded-lg focus:ring-amber-500" />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-4">
            <Button variant="ghost" onClick={() => setPayOperator(null)} className="h-10 text-[12px] font-black uppercase text-[#666]">Cancel</Button>
            <Button onClick={handleOperatorPay} disabled={saving || !payOperatorAmount}
              className="h-10 bg-amber-600 hover:bg-amber-700 text-white text-[12px] font-black uppercase px-6 rounded-lg">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm & Pay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* ── Pay Expense Dialog ───────────────────────────────────────────────── */}
      <Dialog open={!!payExpense} onOpenChange={(o) => { if (!o) { setPayExpense(null); setPayExpenseAmount(""); } }}>
        <DialogContent className="max-w-sm rounded-xl bg-white border-[#E5E5E5]">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-[#1A1A1A]">Pay Expense: {payExpense?.title}</DialogTitle>
          </DialogHeader>
          {payExpense && (
            <div className="space-y-4 pt-1">
              <div className="bg-[#FAFAFA] rounded-lg border border-[#E5E5E5] p-3 space-y-1.5">
                <div className="flex justify-between text-[12px]">
                  <span className="text-[#999]">Total Amount</span>
                  <span className="font-bold">₹{payExpense.amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[12px] border-t border-[#E5E5E5] pt-1.5 font-black">
                  <span>Balance Due</span>
                  <span className="text-rose-500">₹{payExpense.pendingAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-[#999] block mb-1.5">Amount to Pay Now</label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
                  <Input type="number" value={payExpenseAmount} onChange={e => setPayExpenseAmount(e.target.value)}
                    className="pl-9 h-11 text-[14px] font-bold border-[#D9D9D9] rounded-lg" placeholder="0" />
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <button onClick={() => setPayExpenseAmount(String(payExpense.pendingAmount))}
                    className="px-2 py-1 bg-[#F5F5F5] hover:bg-[#EEE] rounded text-[10px] font-bold text-[#666] transition-colors">Pay Balance: ₹{payExpense.pendingAmount}</button>
                  <button onClick={() => setPayExpenseAmount("0")}
                    className="px-2 py-1 bg-[#F5F5F5] hover:bg-[#EEE] rounded text-[10px] font-bold text-[#666] transition-colors">RESET</button>
                </div>
              </div>
              <Button onClick={handleExpenseSinglePay} disabled={saving}
                className="w-full h-11 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest rounded-lg shadow-lg shadow-rose-200">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Payment"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
