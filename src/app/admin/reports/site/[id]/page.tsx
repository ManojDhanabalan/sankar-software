"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDailyEntries, getSite } from "@/lib/firestore";
import type { DailyEntry, Site } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Calendar, Building2, PackageSearch, DollarSign, Users, IndianRupee, PieChart, TrendingUp, BarChart3, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SiteReportPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id as string;

  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());

  useEffect(() => {
    async function load() {
      try {
        const [eData, sData] = await Promise.all([getDailyEntries(siteId), getSite(siteId)]);
        setEntries(eData);
        setSite(sData);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }
    if (siteId) load();
  }, [siteId]);

  const availableYears = Array.from(new Set(entries.map(e => e.date.split("-")[0]))).sort().reverse();
  if (!availableYears.includes(new Date().getFullYear().toString())) {
    availableYears.push(new Date().getFullYear().toString());
  }

  const filteredHistory = entries.filter(e => {
    const [y, m] = e.date.split("-");
    if (filterYear !== "all" && y !== filterYear) return false;
    if (filterMonth !== "all" && m !== filterMonth) return false;
    return true;
  });

  let totalWorkersEarned = 0;
  let totalMaterials = 0;
  let totalExpenses = 0;
  let totalSiteGenerated = 0;
  let totalPending = 0;

  filteredHistory.forEach(entry => {
    totalSiteGenerated += entry.totalAmount || 0;
    entry.workers?.forEach(w => {
      totalWorkersEarned += w.amount || 0;
      totalPending += w.pendingAmount || 0;
    });
    entry.materials?.forEach(m => totalMaterials += m.amount || 0);
    entry.expenses?.forEach(e => totalExpenses += e.amount || 0);
  });

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;
  if (!site) return <div className="p-32 text-center text-slate-300 font-black uppercase tracking-[0.2em]">Site Entity Not Resolved.</div>;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-14 w-14 rounded-2xl bg-white border border-slate-100 shadow-sm hover:bg-slate-50 transition-all active:scale-90">
            <ArrowLeft className="w-6 h-6 text-slate-400" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tightest uppercase">
              Project <span className="text-blue-600">Audit</span>
            </h1>
            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">
              Infrastructure ledger: {site.siteName}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-1 border-0 shadow-2xl rounded-[2.5rem] bg-slate-900 text-white p-8 space-y-10 h-fit">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40 transform rotate-3">
              <Building2 className="w-8 h-8" />
           </div>
           
           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Audit Year</label>
                <Select value={filterYear} onValueChange={(val) => setFilterYear(val || "all")}>
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl font-black text-[10px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl font-black text-[10px]">
                    <SelectItem value="all">ANY YEAR</SelectItem>
                    {availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Audit Month</label>
                <Select value={filterMonth} onValueChange={(val) => setFilterMonth(val || "all")}>
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl uppercase text-[10px] font-black">
                    <SelectItem value="all">ANY MONTH</SelectItem>
                    {Array.from({length: 12}).map((_, i) => (
                      <SelectItem key={i+1} value={(i+1).toString().padStart(2, "0")}>
                        {format(new Date(2000, i, 1), "MMMM")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
           </div>

           <div className="pt-10 border-t border-white/5">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status: {site.status || 'Ongoing'}</p>
              </div>
           </div>
        </Card>

        <div className="lg:col-span-3 space-y-10">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="border-0 shadow-lg rounded-[2rem] bg-indigo-600 text-white p-6 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                    <TrendingUp className="w-16 h-16" />
                 </div>
                 <p className="text-[9px] font-black text-indigo-200 uppercase tracking-widest mb-1.5">Asset Utilization</p>
                 <p className="text-xl font-black tracking-tightest">₹{totalSiteGenerated.toLocaleString()}</p>
              </Card>
              <Card className="border-0 shadow-lg rounded-[2rem] bg-white p-6 border-b-4 border-blue-500">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Labour Capital</p>
                 <p className="text-xl font-black text-slate-900 tracking-tightest">₹{totalWorkersEarned.toLocaleString()}</p>
                 <p className="text-[8px] font-black text-red-500 mt-1 uppercase tracking-widest">₹{totalPending.toLocaleString()} Pend.</p>
              </Card>
              <Card className="border-0 shadow-lg rounded-[2rem] bg-white p-6 border-b-4 border-emerald-500">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Material Stock</p>
                 <p className="text-xl font-black text-slate-900 tracking-tightest">₹{totalMaterials.toLocaleString()}</p>
              </Card>
              <Card className="border-0 shadow-lg rounded-[2rem] bg-white p-6 border-b-4 border-amber-500">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Misc Impact</p>
                 <p className="text-xl font-black text-slate-900 tracking-tightest">₹{totalExpenses.toLocaleString()}</p>
              </Card>
           </div>

           <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                 <BarChart3 className="w-5 h-5 text-slate-400" />
                 <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Daily Ledger Sequence</h3>
              </div>

              {filteredHistory.length === 0 ? (
                <div className="p-32 text-center text-slate-300 font-black uppercase tracking-widest italic border-2 border-dashed border-slate-100 rounded-[3rem]">Nil Archive Nodes Registered.</div>
              ) : (
                <div className="grid gap-4">
                  {filteredHistory.map(entry => (
                    <Card key={entry.id} className="border-0 shadow-xl rounded-[2rem] bg-white overflow-hidden group hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.005]">
                      <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                             <Calendar className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Entry Timestamp</p>
                             <h4 className="font-black text-lg uppercase tracking-tightest">{format(parseISO(entry.date), "dd MMMM yyyy")} <span className="text-blue-500 ml-2">{entry.time}</span></h4>
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Exposure Aggregate</p>
                           <p className="text-2xl font-black tracking-tightest text-blue-400">₹{entry.totalAmount?.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="p-8 grid md:grid-cols-3 gap-10">
                        <div className="space-y-4">
                           <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                             <Users className="w-3.5 h-3.5 text-indigo-500" />
                             <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Labour Force</h5>
                           </div>
                           {entry.workers?.length > 0 ? (
                             <div className="space-y-3">
                               {entry.workers.map((w, i) => (
                                 <div key={i} className="flex justify-between items-center group/row">
                                   <div className="flex flex-col">
                                      <span className="text-xs font-black text-slate-800 uppercase tracking-tightest">{w.personName}</span>
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{w.type} • {w.shift} SHIFTS</span>
                                   </div>
                                   <span className="text-xs font-black text-slate-900">₹{w.amount}</span>
                                 </div>
                               ))}
                             </div>
                           ) : <p className="text-[10px] italic text-slate-300 font-black uppercase">Nil Record</p>}
                        </div>

                        <div className="space-y-4">
                           <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                             <PackageSearch className="w-3.5 h-3.5 text-emerald-500" />
                             <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inventory Log</h5>
                           </div>
                           {entry.materials?.length > 0 ? (
                             <div className="space-y-3">
                               {entry.materials.map((m, i) => (
                                 <div key={i} className="flex justify-between items-center">
                                   <div className="flex flex-col">
                                      <span className="text-xs font-black text-slate-800 uppercase tracking-tightest">{m.materialName}</span>
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">VAL {m.qty} • {m.company}</span>
                                   </div>
                                   <span className="text-xs font-black text-slate-900">₹{m.amount}</span>
                                 </div>
                               ))}
                             </div>
                           ) : <p className="text-[10px] italic text-slate-300 font-black uppercase">Nil Record</p>}
                        </div>

                        <div className="space-y-4">
                           <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
                             <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                             <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Audit Incidentals</h5>
                           </div>
                           {entry.expenses?.length > 0 ? (
                             <div className="space-y-3">
                               {entry.expenses.map((ex, i) => (
                                 <div key={i} className="flex justify-between items-center">
                                   <span className="text-xs font-black text-slate-800 uppercase tracking-tightest">{ex.title}</span>
                                   <span className="text-xs font-black text-slate-900">₹{ex.amount}</span>
                                 </div>
                               ))}
                             </div>
                           ) : <p className="text-[10px] italic text-slate-300 font-black uppercase">Nil Record</p>}
                        </div>
                      </div>
                      <div className="bg-slate-50 p-4 px-8 border-t border-slate-100 flex justify-end">
                         <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                            Operational Insight <ChevronRight className="w-3 h-3" />
                         </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
