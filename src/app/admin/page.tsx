"use client";

import { useState, useEffect } from "react";
import { getDailyEntries, getSites } from "@/lib/firestore";
import type { DailyEntry, Site } from "@/lib/types";
import Link from "next/link";
import {
  Users, Package, Cog, Receipt, Building2,
  TrendingUp, Clock, ChevronRight,
  Activity, CheckCircle2, Loader2, Plus, FileText
} from "lucide-react";
import { format, parseISO, isValid, isAfter, isToday } from "date-fns";
import { cn, fmtINR } from "@/lib/utils";

const safeFormatDate = (d: string) => {
  if (!d) return "—";
  const p = parseISO(d);
  return isValid(p) ? format(p, "dd MMM yyyy") : "—";
};

export default function AdminDashboard() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [eData, sData] = await Promise.all([getDailyEntries(), getSites()]);
        setEntries(eData || []);
        setSites(sData || []);
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, []);

  const allWorkers   = entries.flatMap(e => e.workers   || []);
  const allMaterials = entries.flatMap(e => e.materials || []);
  const allMachinery = entries.flatMap(e => e.machinery || []);
  const allExpenses  = entries.flatMap(e => e.expenses  || []);

  const totalLabour    = allWorkers.reduce((s, w) => s + (Number(w.amount) || 0), 0);
  const totalMaterials = allMaterials.reduce((s, m) => s + (Number(m.amount) || 0), 0);
  const totalMachinery = allMachinery.reduce((s, m) => s + (Number(m.amount) || 0), 0);
  const totalExpenses  = allExpenses.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const grandTotal     = totalLabour + totalMaterials + totalMachinery + totalExpenses;
  const totalPending   = allWorkers.reduce((s, w) => s + (Number(w.pendingAmount) || 0), 0);
  const totalPaid      = allWorkers.reduce((s, w) => s + (Number(w.paidAmount) || 0), 0);

  const todayEntries   = entries.filter(e => { try { return isToday(parseISO(e.date)); } catch { return false; } });
  const todayTotal     = todayEntries.reduce((s, e) => s + (Number(e.totalAmount) || 0), 0);
  const todayLabour    = todayEntries.flatMap(e => e.workers   || []).reduce((s, w) => s + (Number(w.amount) || 0), 0);
  const todayMaterials = todayEntries.flatMap(e => e.materials || []).reduce((s, m) => s + (Number(m.amount) || 0), 0);

  const activeSites    = sites.filter(s => !isAfter(new Date(), new Date(s.endDate)));
  const recentEntries  = [...entries].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F2F4] pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-6 animate-in fade-in duration-400">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">Overview</p>
            <h1 className="text-[22px] font-bold text-[#1A1A1A]">Dashboard</h1>
          </div>
          <Link
            href="/admin/daily-entry"
            className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white text-[12px] font-black uppercase tracking-wider px-4 py-2.5 rounded-xl hover:bg-[#333] transition-colors"
          >
            <Plus className="w-4 h-4" /> New Entry
          </Link>
        </div>

        {/* TODAY banner */}
        {todayEntries.length > 0 && (
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl p-5 flex items-center justify-between shadow-md">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Today's Activity</p>
              <p className="text-[26px] font-bold text-white">{fmtINR(todayTotal)}</p>
              <p className="text-[11px] text-white/70 mt-1">
                {todayEntries.length} entr{todayEntries.length > 1 ? 'ies' : 'y'} · Labour {fmtINR(todayLabour)} · Materials {fmtINR(todayMaterials)}
              </p>
            </div>
            <Activity className="w-10 h-10 text-white/30" />
          </div>
        )}

        {/* 4 Cost Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Labour Cost",    value: totalLabour,    icon: Users,   color: "text-indigo-600", bg: "bg-indigo-50",  border: "border-indigo-100" },
            { label: "Material Cost",  value: totalMaterials, icon: Package, color: "text-amber-600",  bg: "bg-amber-50",   border: "border-amber-100"  },
            { label: "Machinery Cost", value: totalMachinery, icon: Cog,     color: "text-sky-600",    bg: "bg-sky-50",     border: "border-sky-100"    },
            { label: "Other Expenses", value: totalExpenses,  icon: Receipt, color: "text-violet-600", bg: "bg-violet-50",  border: "border-violet-100" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-[#E5E5E5] p-4 shadow-sm">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", s.bg, `border ${s.border}`)}>
                <s.icon className={cn("w-4 h-4", s.color)} />
              </div>
              <p className="text-[9px] font-black uppercase tracking-widest text-[#999] mb-1">{s.label}</p>
              <p className="text-[20px] font-bold text-[#1A1A1A]">{fmtINR(s.value)}</p>
              <p className="text-[10px] text-[#999] mt-0.5">₹{s.value.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>

        {/* Grand Total + Payment */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border-2 border-[#1A1A1A]/10 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[#1A1A1A]" />
              <p className="text-[9px] font-black uppercase tracking-widest text-[#999]">Grand Total</p>
            </div>
            <p className="text-[26px] font-bold text-[#1A1A1A]">{fmtINR(grandTotal)}</p>
            <p className="text-[10px] text-[#999] mt-0.5">₹{grandTotal.toLocaleString('en-IN')} · {entries.length} entries</p>
          </div>
          <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/60">Paid</p>
            </div>
            <p className="text-[22px] font-bold text-emerald-600">{fmtINR(totalPaid)}</p>
            <p className="text-[10px] text-emerald-600/40 mt-0.5">
              ₹{totalPaid.toLocaleString('en-IN')} · {allWorkers.filter(w => w.paymentStatus === "Paid").length} workers
            </p>
          </div>
          <div className="bg-white rounded-xl border border-rose-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-rose-500" />
              <p className="text-[9px] font-black uppercase tracking-widest text-rose-500/60">Pending</p>
            </div>
            <p className="text-[22px] font-bold text-rose-500">{fmtINR(totalPending)}</p>
            <p className="text-[10px] text-rose-500/40 mt-0.5">
              ₹{totalPending.toLocaleString('en-IN')} · {allWorkers.filter(w => w.paymentStatus !== "Paid").length} workers
            </p>
          </div>
        </div>

        {/* Bottom two columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Active Sites */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#666]" />
                <h2 className="text-[13px] font-semibold text-[#1A1A1A]">Active Sites</h2>
              </div>
              <Link href="/admin/reports?tab=sites" className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline">View All</Link>
            </div>
            {activeSites.length === 0 ? (
              <div className="p-8 text-center text-[12px] text-[#999]">No active sites</div>
            ) : (
              <div className="divide-y divide-[#F5F5F5]">
                {activeSites.slice(0, 5).map(s => {
                  const siteEntries = entries.filter(e => e.siteId === s.id);
                  const siteCost = siteEntries.flatMap(e => [...(e.workers||[]), ...(e.materials||[]), ...(e.machinery||[]), ...(e.expenses||[])]).reduce((t, x) => t + (x.amount || 0), 0);
                  return (
                    <Link key={s.id} href={`/admin/sites/${s.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-[#FAFAFA] transition-colors">
                      <div>
                        <p className="text-[12px] font-bold text-[#1A1A1A] uppercase">{s.siteName}</p>
                        {s.location && <p className="text-[10px] text-[#999]">{s.location}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <p className="text-[13px] font-bold text-[#1A1A1A]">{fmtINR(siteCost)}</p>
                          <p className="text-[10px] text-[#999]">{siteEntries.length} entries</p>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-[#CCC]" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Entries */}
          <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#666]" />
                <h2 className="text-[13px] font-semibold text-[#1A1A1A]">Recent Entries</h2>
              </div>
              <Link href="/admin/reports" className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline">View All</Link>
            </div>
            {recentEntries.length === 0 ? (
              <div className="p-8 text-center text-[12px] text-[#999]">No entries yet</div>
            ) : (
              <div className="divide-y divide-[#F5F5F5]">
                {recentEntries.map(e => {
                  const siteName = sites.find(s => s.id === e.siteId)?.siteName || "Unknown";
                  const workerCount = (e.workers || []).length;
                  return (
                    <div key={e.id} className="flex items-center justify-between px-5 py-3 hover:bg-[#FAFAFA] transition-colors">
                      <div>
                        <p className="text-[12px] font-bold text-[#1A1A1A] uppercase">{siteName}</p>
                        <p className="text-[10px] text-[#999]">{safeFormatDate(e.date)} · {workerCount} worker{workerCount !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[13px] font-bold text-[#1A1A1A]">{fmtINR(e.totalAmount || 0)}</p>
                        <p className="text-[10px] text-[#999]">{e.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
