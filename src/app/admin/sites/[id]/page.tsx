"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getDailyEntries, getSites } from "@/lib/firestore";
import type { DailyEntry, Site } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Loader2, Users, Package, Cog, Receipt,
  IndianRupee, MapPin, Calendar, CheckCircle2, Activity
} from "lucide-react";
import { format, parseISO, isValid, isAfter } from "date-fns";
import { cn, fmtINR } from "@/lib/utils";
import Link from "next/link";

const safeFormatDate = (d: string) => {
  if (!d) return "N/A";
  const p = parseISO(d);
  return isValid(p) ? format(p, "dd MMM, yyyy").toUpperCase() : "N/A";
};

export default function SiteDetailsPage() {
  const { id } = useParams() as { id: string };

  const [site, setSite] = useState<Site | null>(null);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"labour" | "materials" | "machinery" | "expenses">("labour");

  useEffect(() => {
    async function load() {
      try {
        const [eData, sData] = await Promise.all([getDailyEntries(), getSites()]);
        const found = (sData || []).find(s => s.id === id) || null;
        setSite(found);
        setEntries((eData || []).filter(e => e.siteId === id).sort((a, b) => b.date.localeCompare(a.date)));
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    load();
  }, [id]);

  // ── Aggregate data ──────────────────────────────────────────────────────────
  type AggregatedWorker = {
    personName: string;
    types: string[];
    shiftTexts: string[];
    date: string;
    entryId: string;
    amount: number;
    paymentStatus: string;
    paidAmount: number;
    pendingAmount: number;
    labourCount: number;
  };

  const allWorkers: AggregatedWorker[] = [];
  entries.forEach(e => {
    const workerMap = new Map<string, AggregatedWorker>();
    (e.workers || []).forEach(w => {
      if (!w.personName) return;
      const key = w.personName.trim().toLowerCase();
      if (!workerMap.has(key)) {
        workerMap.set(key, {
          personName: w.personName,
          types: [],
          shiftTexts: [],
          date: e.date,
          entryId: e.id,
          amount: 0,
          paymentStatus: "Not Paid",
          paidAmount: 0,
          pendingAmount: 0,
          labourCount: 0
        });
      }
      const agg = workerMap.get(key)!;
      if (w.type && w.type !== '—') agg.types.push(w.type);
      if (w.type === "RW") agg.shiftTexts.push(`${w.qty} × ₹${w.rate}`);
      else if (Number(w.shift) > 0) agg.shiftTexts.push(`${w.shift} shift`);
      
      agg.amount += Number(w.amount) || 0;
      agg.paidAmount += Number(w.paidAmount) || 0;
      agg.pendingAmount += Number(w.pendingAmount) || 0;
      agg.labourCount += (Number(w.labourCount) || (w.type === 'RW' ? 1 : 0));
    });
    
    for (const agg of workerMap.values()) {
      agg.types = Array.from(new Set(agg.types));
      if (agg.types.length === 0) agg.types.push("—");
      agg.paymentStatus = agg.pendingAmount <= 0 ? "Paid" : agg.paidAmount > 0 ? "Partial" : "Not Paid";
      allWorkers.push(agg);
    }
  });
  const allMaterials = entries.flatMap(e => (e.materials || []).map(m => ({ ...m, date: e.date })));
  const allMachinery = entries.flatMap(e => (e.machinery || []).map(m => ({ ...m, date: e.date })));
  const allExpenses  = entries.flatMap(e => (e.expenses  || []).map(x => ({ ...x, date: e.date })));

  const totalLabour    = allWorkers.reduce((s, w) => s + (Number(w.amount) || 0), 0);
  const totalMaterials = allMaterials.reduce((s, m) => s + (Number(m.amount) || 0), 0);
  const totalMachinery = allMachinery.reduce((s, m) => s + (Number(m.amount) || 0), 0);
  const totalExpenses  = allExpenses.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const grandTotal     = totalLabour + totalMaterials + totalMachinery + totalExpenses;

  const totalPaid    = allWorkers.reduce((s, w) => s + (Number(w.paidAmount) || 0), 0);
  const totalPending = allWorkers.reduce((s, w) => s + (Number(w.pendingAmount) || 0), 0);

  const siteStatus = site ? (isAfter(new Date(), new Date(site.endDate)) ? "Completed" : "Ongoing") : null;

  const sections = [
    { key: "labour",    label: "Labour",    count: allWorkers.length,   icon: Users },
    { key: "materials", label: "Materials", count: allMaterials.length, icon: Package },
    { key: "machinery", label: "Machinery", count: allMachinery.length, icon: Cog },
    { key: "expenses",  label: "Expenses",  count: allExpenses.length,  icon: Receipt },
  ] as const;

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="w-10 h-10 animate-spin text-primary" />
    </div>
  );

  if (!site) return (
    <div className="flex h-screen items-center justify-center flex-col gap-3">
      <p className="text-[14px] text-[#999]">Site not found.</p>
      <Link href="/admin/reports?tab=sites" className="text-primary text-sm underline">← Back to Sites</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F2F4] pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-5 animate-in fade-in duration-400">

        {/* Header */}
        <div className="flex items-start gap-3">
          <Link href="/admin/reports?tab=sites" className="p-1.5 hover:bg-black/5 rounded-md text-[#4D4D4D] transition-colors mt-1 -ml-1.5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">Site Details</p>
            <h1 className="text-[22px] font-bold text-[#1A1A1A] uppercase leading-tight">{site.siteName}</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {site.location && (
                <span className="flex items-center gap-1 text-[11px] text-[#666]">
                  <MapPin className="w-3 h-3" /> {site.location}
                </span>
              )}
              <span className="flex items-center gap-1 text-[11px] text-[#999]">
                <Calendar className="w-3 h-3" />
                {safeFormatDate(site.startDate)} → {safeFormatDate(site.endDate)}
              </span>
              <span className={cn(
                "inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border",
                siteStatus === "Completed"
                  ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                  : "text-blue-700 bg-blue-50 border-blue-100"
              )}>
                {siteStatus === "Completed" ? <CheckCircle2 className="w-3 h-3" /> : <Activity className="w-3 h-3 animate-pulse" />}
                {siteStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Summary Cards row 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#999] mb-1.5">Labour Cost</p>
            <p className="text-[20px] font-bold text-[#1A1A1A]">{fmtINR(totalLabour)}</p>
            <p className="text-[10px] text-[#999] mt-0.5">₹{totalLabour.toLocaleString('en-IN')} · {allWorkers.length} entries</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#999] mb-1.5">Material Cost</p>
            <p className="text-[20px] font-bold text-[#1A1A1A]">{fmtINR(totalMaterials)}</p>
            <p className="text-[10px] text-[#999] mt-0.5">₹{totalMaterials.toLocaleString('en-IN')} · {allMaterials.length} items</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#999] mb-1.5">Machinery Cost</p>
            <p className="text-[20px] font-bold text-[#1A1A1A]">{fmtINR(totalMachinery)}</p>
            <p className="text-[10px] text-[#999] mt-0.5">₹{totalMachinery.toLocaleString('en-IN')} · {allMachinery.length} entries</p>
          </div>
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#999] mb-1.5">Other Expenses</p>
            <p className="text-[20px] font-bold text-[#1A1A1A]">{fmtINR(totalExpenses)}</p>
            <p className="text-[10px] text-[#999] mt-0.5">₹{totalExpenses.toLocaleString('en-IN')} · {allExpenses.length} items</p>
          </div>
        </div>

        {/* Summary Cards row 2 — financials */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border-2 border-[#1A1A1A]/10 p-4 shadow-sm col-span-1">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#999] mb-1.5">Grand Total Spent</p>
            <p className="text-[24px] font-bold text-[#1A1A1A]">{fmtINR(grandTotal)}</p>
            <p className="text-[10px] text-[#999] mt-0.5">₹{grandTotal.toLocaleString('en-IN')} · {entries.length} entries</p>
          </div>
          <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/60 mb-1.5">Labour Paid</p>
            <p className="text-[20px] font-bold text-emerald-600">{fmtINR(totalPaid)}</p>
            <p className="text-[10px] text-emerald-600/40 mt-0.5">₹{totalPaid.toLocaleString('en-IN')}</p>
          </div>
          <div className="bg-white rounded-xl border border-rose-100 p-4 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-rose-500/60 mb-1.5">Labour Pending</p>
            <p className="text-[20px] font-bold text-rose-500">{fmtINR(totalPending)}</p>
            <p className="text-[10px] text-rose-500/40 mt-0.5">₹{totalPending.toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sections.map(s => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-wider whitespace-nowrap transition-all border",
                activeSection === s.key
                  ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                  : "bg-white text-[#666] border-[#E5E5E5] hover:border-[#999]"
              )}
            >
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                activeSection === s.key ? "bg-white/20 text-white" : "bg-[#F1F2F4] text-[#999]"
              )}>{s.count}</span>
            </button>
          ))}
        </div>

        {/* Section Content */}
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden shadow-sm">

          {/* LABOUR */}
          {activeSection === "labour" && (
            <>
              <div className="px-5 py-4 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-[#1A1A1A]">Labour Records</h2>
                <span className="text-[10px] font-black uppercase text-[#999]">{allWorkers.length} entries</span>
              </div>
              {allWorkers.length === 0 ? (
                <div className="p-10 text-center text-[13px] text-[#999]">No labour records found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[9px] font-black text-[#999] uppercase tracking-widest">
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Worker</th>
                        <th className="px-5 py-3">Role</th>
                        <th className="px-5 py-3 text-center">Labour</th>
                        <th className="px-5 py-3 text-center">Shift/Qty</th>
                        <th className="px-5 py-3 text-right">Amount</th>
                        <th className="px-5 py-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F5F5]">
                      {allWorkers.map((w, i) => (
                        <tr key={i} className="hover:bg-[#FAFAFA] transition-colors">
                          <td className="px-5 py-3 text-[11px] text-[#666] whitespace-nowrap">{safeFormatDate(w.date)}</td>
                          <td className="px-5 py-3 text-[12px] font-bold text-[#1A1A1A]">{w.personName}</td>
                          <td className="px-5 py-3">
                            <div className="flex gap-1 flex-wrap">
                              {w.types.map((t, idx) => (
                                <span key={idx} className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/60">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-center text-[12px] font-bold text-[#1A1A1A]">
                            {w.labourCount > 0 ? (
                              <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                                {w.labourCount}
                              </span>
                            ) : "—"}
                          </td>
                          <td className="px-5 py-3 text-center text-[12px] text-[#666]">
                            {w.shiftTexts.join(" · ") || "0 shift"}
                          </td>
                          <td className="px-5 py-3 text-right text-[12px] font-bold text-[#1A1A1A]">₹{(w.amount || 0).toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3 text-center">
                            <span className={cn(
                              "text-[10px] font-black uppercase px-2 py-0.5 rounded-full border",
                              w.paymentStatus === "Paid" ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                              : w.paymentStatus === "Partial" ? "text-amber-700 bg-amber-50 border-amber-100"
                              : "text-rose-600 bg-rose-50 border-rose-100"
                            )}>{w.paymentStatus || "Not Paid"}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="px-5 py-3 border-t border-[#E5E5E5] bg-[#FAFAFA] flex justify-between items-center">
                <span className="text-[12px] font-bold text-[#1A1A1A]">Total Labour Cost</span>
                <span className="text-[14px] font-bold text-[#1A1A1A]">₹{totalLabour.toLocaleString('en-IN')}</span>
              </div>
            </>
          )}

          {/* MATERIALS */}
          {activeSection === "materials" && (
            <>
              <div className="px-5 py-4 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-[#1A1A1A]">Material Records</h2>
                <span className="text-[10px] font-black uppercase text-[#999]">{allMaterials.length} items</span>
              </div>
              {allMaterials.length === 0 ? (
                <div className="p-10 text-center text-[13px] text-[#999]">No material records found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[9px] font-black text-[#999] uppercase tracking-widest">
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Material</th>
                        <th className="px-5 py-3">Company</th>
                        <th className="px-5 py-3 text-center">Qty</th>
                        <th className="px-5 py-3 text-right">Market Cost</th>
                        <th className="px-5 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F5F5]">
                      {allMaterials.map((m, i) => (
                        <tr key={i} className="hover:bg-[#FAFAFA] transition-colors">
                          <td className="px-5 py-3 text-[11px] text-[#666] whitespace-nowrap">{safeFormatDate(m.date)}</td>
                          <td className="px-5 py-3 text-[12px] font-bold text-[#1A1A1A]">{m.materialName}</td>
                          <td className="px-5 py-3 text-[12px] text-[#666]">{m.company || "—"}</td>
                          <td className="px-5 py-3 text-center text-[12px] text-[#666]">{m.qty}</td>
                          <td className="px-5 py-3 text-right text-[12px] text-[#666]">₹{(m.marketCost || 0).toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3 text-right text-[12px] font-bold text-[#1A1A1A]">₹{(m.amount || 0).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="px-5 py-3 border-t border-[#E5E5E5] bg-[#FAFAFA] flex justify-between items-center">
                <span className="text-[12px] font-bold text-[#1A1A1A]">Total Material Cost</span>
                <span className="text-[14px] font-bold text-[#1A1A1A]">₹{totalMaterials.toLocaleString('en-IN')}</span>
              </div>
            </>
          )}

          {/* MACHINERY */}
          {activeSection === "machinery" && (
            <>
              <div className="px-5 py-4 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-[#1A1A1A]">Machinery Records</h2>
                <span className="text-[10px] font-black uppercase text-[#999]">{allMachinery.length} entries</span>
              </div>
              {allMachinery.length === 0 ? (
                <div className="p-10 text-center text-[13px] text-[#999]">No machinery records found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[9px] font-black text-[#999] uppercase tracking-widest">
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Operator</th>
                        <th className="px-5 py-3">Machinery</th>
                        <th className="px-5 py-3 text-center">Qty</th>
                        <th className="px-5 py-3 text-right">Cost/Unit</th>
                        <th className="px-5 py-3 text-right">Bata</th>
                        <th className="px-5 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F5F5]">
                      {allMachinery.map((m, i) => (
                        <tr key={i} className="hover:bg-[#FAFAFA] transition-colors">
                          <td className="px-5 py-3 text-[11px] text-[#666] whitespace-nowrap">{safeFormatDate(m.date)}</td>
                          <td className="px-5 py-3 text-[12px] font-bold text-[#1A1A1A]">{m.personName || "—"}</td>
                          <td className="px-5 py-3 text-[12px] text-[#666]">{m.machineryName}</td>
                          <td className="px-5 py-3 text-center text-[12px] text-[#666]">{m.qty}</td>
                          <td className="px-5 py-3 text-right text-[12px] text-[#666]">₹{(m.cost || 0).toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3 text-right text-[12px] text-[#666]">₹{(m.bata || 0).toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3 text-right text-[12px] font-bold text-[#1A1A1A]">₹{(m.amount || 0).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="px-5 py-3 border-t border-[#E5E5E5] bg-[#FAFAFA] flex justify-between items-center">
                <span className="text-[12px] font-bold text-[#1A1A1A]">Total Machinery Cost</span>
                <span className="text-[14px] font-bold text-[#1A1A1A]">₹{totalMachinery.toLocaleString('en-IN')}</span>
              </div>
            </>
          )}

          {/* EXPENSES */}
          {activeSection === "expenses" && (
            <>
              <div className="px-5 py-4 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-[#1A1A1A]">Expense Records</h2>
                <span className="text-[10px] font-black uppercase text-[#999]">{allExpenses.length} items</span>
              </div>
              {allExpenses.length === 0 ? (
                <div className="p-10 text-center text-[13px] text-[#999]">No expense records found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAFAFA] border-b border-[#E5E5E5] text-[9px] font-black text-[#999] uppercase tracking-widest">
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Description</th>
                        <th className="px-5 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F5F5]">
                      {allExpenses.map((x, i) => (
                        <tr key={i} className="hover:bg-[#FAFAFA] transition-colors">
                          <td className="px-5 py-3 text-[11px] text-[#666] whitespace-nowrap">{safeFormatDate(x.date)}</td>
                          <td className="px-5 py-3 text-[12px] font-bold text-[#1A1A1A]">{x.title}</td>
                          <td className="px-5 py-3 text-right text-[12px] font-bold text-[#1A1A1A]">₹{(x.amount || 0).toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="px-5 py-3 border-t border-[#E5E5E5] bg-[#FAFAFA] flex justify-between items-center">
                <span className="text-[12px] font-bold text-[#1A1A1A]">Total Expenses</span>
                <span className="text-[14px] font-bold text-[#1A1A1A]">₹{totalExpenses.toLocaleString('en-IN')}</span>
              </div>
            </>
          )}

        </div>


      </div>
    </div>
  );
}
