"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDailyEntries, getSites } from "@/lib/firestore";
import type { DailyEntry, Site } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Building2, User, IndianRupee, Clock, DollarSign, Search } from "lucide-react";
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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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
  if (availableYears.length === 0) availableYears.push(new Date().getFullYear().toString());

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

  filteredHistory.forEach(entry => {
    const w = entry.workers.find(wk => wk.personName.toLowerCase() === workerName.toLowerCase())!;
    totalEarned += w.amount || 0;
    totalPaid += w.paidAmount || 0;
    totalPending += w.pendingAmount || 0;
  });

  const historyRows = filteredHistory.map(entry => {
    const w = entry.workers.find(wk => wk.personName.toLowerCase() === workerName.toLowerCase())!;
    const siteName = sites.find(s => s.id === entry.siteId)?.siteName || "Unknown Site";
    
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

  const totalPages = Math.ceil(historyRows.length / pageSize);
  const paginatedRows = historyRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4 pb-12 animate-in fade-in duration-500 px-1 sm:px-4">
      <div className="flex items-center gap-6 border-b border-border/40 pb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 rounded-sm bg-card border border-border/60 shadow-sm hover:bg-muted transition-all px-3">
            <ArrowLeft className="w-4 h-4 text-muted-foreground mr-2" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Go Back</span>
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-foreground tracking-tight uppercase">
              Worker <span className="text-primary">Record</span>
            </h1>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">
              Name: {workerName}
            </p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
           {/* Stats Summary */}
           <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
              <Card className="border border-border/40 shadow-sm rounded-sm bg-primary text-white p-5 relative overflow-hidden">
                 <div className="relative z-10">
                    <p className="text-[9px] font-black text-white/60 uppercase tracking-widest mb-1">Total Earned</p>
                    <div className="flex items-center justify-between">
                       <p className="text-lg font-black tracking-tight">₹{totalEarned.toLocaleString('en-IN')}</p>
                       <IndianRupee className="w-4 h-4 text-white/30" />
                    </div>
                 </div>
              </Card>
              <Card className="border border-border/40 shadow-sm rounded-sm bg-card p-5 border-l-4 border-l-emerald-500">
                 <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Paid</p>
                 <div className="flex items-center justify-between">
                    <p className="text-lg font-black text-emerald-600 tracking-tight">₹{totalPaid.toLocaleString('en-IN')}</p>
                    <Clock className="w-4 h-4 text-emerald-500/20" />
                 </div>
              </Card>
              <Card className="border border-border/40 shadow-sm rounded-sm bg-card p-5 border-l-4 border-l-red-500">
                 <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Balance Due</p>
                 <div className="flex items-center justify-between">
                    <p className="text-lg font-black text-red-600 tracking-tight">₹{totalPending.toLocaleString('en-IN')}</p>
                    <DollarSign className="w-4 h-4 text-red-500/20" />
                 </div>
              </Card>
           </div>

           {/* Quick Filters */}
           <Card className="border border-border/40 shadow-sm rounded-sm p-5 space-y-4 bg-card">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Filters</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest ml-1">Site Name</label>
                  <Select value={filterSite} onValueChange={(val) => { setFilterSite(val || "all"); setCurrentPage(1); }}>
                    <SelectTrigger className="h-9 rounded-sm border-border bg-muted/5 text-[10px] font-black uppercase tracking-widest px-3">
                      <SelectValue placeholder="All Sites" />
                    </SelectTrigger>
                    <SelectContent className="rounded-sm">
                      <SelectItem value="all">ALL SITES</SelectItem>
                      {sites.map(s => <SelectItem key={s.id} value={s.id}>{s.siteName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest ml-1">Year</label>
                    <Select value={filterYear} onValueChange={(val) => { setFilterYear(val || "all"); setCurrentPage(1); }}>
                      <SelectTrigger className="h-9 rounded-sm border-border bg-muted/5 text-[10px] font-black px-3">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent className="rounded-sm">
                        <SelectItem value="all">ANY</SelectItem>
                        {availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest ml-1">Month</label>
                    <Select value={filterMonth} onValueChange={(val) => { setFilterMonth(val || "all"); setCurrentPage(1); }}>
                      <SelectTrigger className="h-9 rounded-sm border-border bg-muted/5 text-[10px] font-black px-3">
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent className="rounded-sm">
                        <SelectItem value="all">ANY</SelectItem>
                        {Array.from({length: 12}).map((_, i) => (
                          <SelectItem key={i+1} value={(i+1).toString().padStart(2, "0")}>
                            {format(new Date(2000, i, 1), "MMM").toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-4">
           <Card className="border border-border/40 shadow-sm rounded-sm bg-card overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-muted/10 border-b border-border/40 text-[9px] uppercase text-muted-foreground font-black tracking-widest">
                      <tr>
                        <th className="px-5 py-4">Date</th>
                        <th className="px-5 py-4">Site Name</th>
                        <th className="px-5 py-4">Task / Shift</th>
                        <th className="px-5 py-4 text-center">Earned</th>
                        <th className="px-5 py-4 text-right pr-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {paginatedRows.map((row) => (
                        <tr key={row.entryId} className="hover:bg-muted/5 transition-colors">
                          <td className="px-5 py-3">
                             <div className="font-black text-foreground text-xs uppercase tracking-tight">{format(parseISO(row.date), "dd MMM, yy")}</div>
                             <div className="text-[8px] text-muted-foreground font-bold uppercase mt-0.5">{row.time}</div>
                          </td>
                          <td className="px-5 py-3">
                             <div className="font-black text-primary text-xs uppercase tracking-tight">{row.siteName}</div>
                          </td>
                          <td className="px-5 py-3">
                             <div className="text-[10px] font-black text-foreground uppercase tracking-wider">{row.type}</div>
                             <div className="text-[8px] font-bold text-muted-foreground uppercase">{row.shift} SHIFTS</div>
                          </td>
                          <td className="px-5 py-3 text-center font-black text-foreground text-xs">₹{row.amount.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-3 text-right">
                             <div className={cn("text-[9px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-sm inline-block", 
                               row.pendingAmount > 0 ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100")}>
                                {row.pendingAmount > 0 ? `₹${row.pendingAmount.toLocaleString('en-IN')} DUE` : 'PAID ✓'}
                             </div>
                          </td>
                        </tr>
                      ))}
                      {paginatedRows.length === 0 && (
                        <tr><td colSpan={5} className="py-24 text-center text-muted-foreground font-black uppercase text-[10px] tracking-[0.2em] italic opacity-40">No records found.</td></tr>
                      )}
                    </tbody>
                 </table>
              </div>
           </Card>

           {/* Pagination */}
           {totalPages > 1 && (
             <div className="flex justify-center items-center gap-4 py-4">
               <Button variant="outline" size="sm" className="h-8 rounded-sm text-[10px] font-black uppercase" disabled={currentPage === 1} onClick={() => setCurrentPage(v => v - 1)}>Prev</Button>
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{currentPage} of {totalPages}</span>
               <Button variant="outline" size="sm" className="h-8 rounded-sm text-[10px] font-black uppercase" disabled={currentPage === totalPages} onClick={() => setCurrentPage(v => v + 1)}>Next</Button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
