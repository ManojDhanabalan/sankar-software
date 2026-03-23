"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDailyEntries, getSites } from "@/lib/firestore";
import type { DailyEntry, Site } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Calendar, Building2, User, IndianRupee, Clock, Briefcase, DollarSign } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function WorkerReportPage() {
  const params = useParams();
  const router = useRouter();
  const workerNameRaw = params.id as string;
  const workerName = decodeURIComponent(workerNameRaw);

  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterSite, setFilterSite] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());

  useEffect(() => {
    async function load() {
      try {
        const [eData, sData] = await Promise.all([getDailyEntries(), getSites()]);
        const workerEntries = eData.filter(e => 
          e.workers?.some(w => w.personName.toLowerCase() === workerName.toLowerCase())
        );
        setEntries(workerEntries);
        setSites(sData);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }
    if (workerName) load();
  }, [workerName]);

  const availableYears = Array.from(new Set(entries.map(e => e.date.split("-")[0]))).sort().reverse();
  if (!availableYears.includes(new Date().getFullYear().toString())) {
    availableYears.push(new Date().getFullYear().toString());
  }

  const filteredHistory = entries.filter(e => {
    if (filterSite !== "all" && e.siteId !== filterSite) return false;
    const [y, m] = e.date.split("-");
    if (filterYear !== "all" && y !== filterYear) return false;
    if (filterMonth !== "all" && m !== filterMonth) return false;
    return true;
  });

  let totalEarned = 0;
  let totalPaid = 0;
  let totalPending = 0;

  const historyRows = filteredHistory.map(entry => {
    const w = entry.workers.find(wk => wk.personName.toLowerCase() === workerName.toLowerCase())!;
    const siteName = sites.find(s => s.id === entry.siteId)?.siteName || "Unknown Site";
    
    totalEarned += w.amount || 0;
    totalPaid += w.paidAmount || 0;
    totalPending += w.pendingAmount || 0;

    return {
      date: entry.date,
      time: entry.time,
      siteName,
      type: w.type,
      shift: w.shift,
      amount: w.amount,
      paidAmount: w.paidAmount,
      pendingAmount: w.pendingAmount,
      status: w.paymentStatus,
      entryId: entry.id
    };
  });

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-14 w-14 rounded-2xl bg-white border border-slate-100 shadow-sm hover:bg-slate-50 transition-all active:scale-90">
            <ArrowLeft className="w-6 h-6 text-slate-400" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tightest uppercase">
              Operative <span className="text-blue-600">History</span>
            </h1>
            <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">
              Financial ledger for: {workerName}
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-1 border-0 shadow-2xl rounded-[2.5rem] bg-slate-900 text-white p-8 space-y-8 h-fit">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/40">
              <User className="w-8 h-8" />
           </div>
           <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Filter Site</label>
                <Select value={filterSite} onValueChange={(val) => setFilterSite(val || "all")}>
                  <SelectTrigger className="bg-white/5 border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest">
                    <SelectValue placeholder="All Sites" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl uppercase text-[10px] font-black">
                    <SelectItem value="all">ANY PROJECT</SelectItem>
                    {sites.map(s => <SelectItem key={s.id} value={s.id}>{s.siteName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Filter Year</label>
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
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Filter Month</label>
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
        </Card>

        <div className="lg:col-span-3 space-y-10">
           <div className="grid sm:grid-cols-3 gap-6">
              <Card className="border-0 shadow-xl rounded-[2rem] bg-white p-6 border-b-4 border-indigo-500">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Gross Revenue</p>
                 <div className="flex items-center justify-between">
                    <p className="text-2xl font-black text-slate-900 tracking-tightest">₹{totalEarned.toLocaleString()}</p>
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500"><IndianRupee className="w-5 h-5" /></div>
                 </div>
              </Card>
              <Card className="border-0 shadow-xl rounded-[2rem] bg-white p-6 border-b-4 border-emerald-500">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Credited Val</p>
                 <div className="flex items-center justify-between">
                    <p className="text-2xl font-black text-emerald-600 tracking-tightest">₹{totalPaid.toLocaleString()}</p>
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500"><Clock className="w-5 h-5" /></div>
                 </div>
              </Card>
              <Card className="border-0 shadow-xl rounded-[2rem] bg-white p-6 border-b-4 border-red-500">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Debit Balance</p>
                 <div className="flex items-center justify-between">
                    <p className="text-2xl font-black text-red-600 tracking-tightest">₹{totalPending.toLocaleString()}</p>
                    <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500"><DollarSign className="w-5 h-5" /></div>
                 </div>
              </Card>
           </div>

           <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 border-b border-white/5 text-[9px] uppercase text-slate-400 font-extrabold tracking-[0.2em]">
                    <tr>
                      <th className="px-8 py-6">Date Node</th>
                      <th className="px-8 py-6">Project Archive</th>
                      <th className="px-8 py-6">Designation</th>
                      <th className="px-8 py-6 text-center">Units</th>
                      <th className="px-8 py-6 text-right">Debit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 bg-white font-medium">
                    {historyRows.map((row) => (
                      <tr key={row.entryId} className="hover:bg-slate-50/50 transition-all duration-300 group">
                        <td className="px-8 py-6">
                           <div className="font-black text-slate-900 uppercase tracking-tightest">{format(parseISO(row.date), "dd MMM yy")}</div>
                           <div className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1">{row.time}</div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-2 font-black text-blue-600 uppercase tracking-tightest group-hover:-translate-y-0.5 transition-transform">
                              <Building2 className="w-3.5 h-3.5 text-slate-300" /> {row.siteName}
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="px-3 py-1 bg-slate-100 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest">{row.type}</span>
                        </td>
                        <td className="px-8 py-6 text-center font-black text-slate-900 text-xs">{row.shift} <span className="text-[9px] text-slate-300">SHIFTS</span></td>
                        <td className="px-8 py-6 text-right">
                           <div className="font-black text-slate-900 text-base tracking-tightest">₹{row.amount}</div>
                           <div className={cn("text-[9px] font-black uppercase tracking-widest mt-1", row.pendingAmount > 0 ? "text-red-500" : "text-emerald-500")}>
                              {row.pendingAmount > 0 ? `₹${row.pendingAmount} OWE` : 'SETTLED ✓'}
                           </div>
                        </td>
                      </tr>
                    ))}
                    {historyRows.length === 0 && (
                      <tr><td colSpan={5} className="p-32 text-center text-slate-300 font-black uppercase tracking-widest italic">Nil History Recorded.</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
