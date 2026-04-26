"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getDailyEntries, getSite } from "@/lib/firestore";
import type { DailyEntry, Site } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Building2, PackageSearch, DollarSign, Users, IndianRupee, PieChart, TrendingUp, BarChart3, ChevronRight, Search, Cog } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function SiteReportPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id as string;

  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    async function load() {
      try {
        const [eData, sData] = await Promise.all([getDailyEntries(siteId), getSite(siteId)]);
        setEntries(eData || []);
        setSite(sData);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    }
    if (siteId) load();
  }, [siteId]);

  const availableYears = Array.from(new Set(entries.map(e => e.date?.split("-")[0]).filter(Boolean))).sort().reverse() as string[];
  if (availableYears.length === 0) availableYears.push(new Date().getFullYear().toString());

  const filteredHistory = entries.filter(e => {
    const parts = e.date?.split("-");
    if (!parts || parts.length < 2) return false;
    const [y, m] = parts;
    if (filterYear !== "all" && y !== filterYear) return false;
    if (filterMonth !== "all" && m !== filterMonth) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredHistory.length / pageSize);
  const paginatedHistory = filteredHistory.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  let totalWorkersEarned = 0;
  let totalMaterials = 0;
  let totalMachinery = 0;
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
    entry.machinery?.forEach(m => totalMachinery += m.amount || 0);
    entry.expenses?.forEach(e => totalExpenses += e.amount || 0);
  });

  if (loading) return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
  if (!site) return <div className="p-32 text-center text-muted-foreground font-black uppercase tracking-[0.2em] italic">SITE TEMPLATE NOT FOUND.</div>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-4 pb-20 animate-in fade-in duration-500 px-1 sm:px-4">
      
      {/* Header Row */}
      <div className="flex items-center gap-6 border-b border-border/40 pb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-8 rounded-sm bg-card border border-border/60 shadow-sm hover:bg-muted transition-all px-3">
            <ArrowLeft className="w-4 h-4 text-muted-foreground mr-2" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">GO BACK</span>
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-blue-950 tracking-tight uppercase">
              PROJECT <span className="text-primary">MASTER REPORT</span>
            </h1>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mt-1">
              ACTIVE SITE: <span className="text-blue-950/80">{site.siteName.toUpperCase()}</span>
            </p>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
           {/* Stats Panel */}
           <Card className="border border-border/40 shadow-sm rounded-sm bg-primary text-white p-6 space-y-6 relative overflow-hidden h-fit">
              <div className="relative z-10 space-y-6">
                <div className="w-10 h-10 bg-white/20 rounded-sm flex items-center justify-center border border-white/20 shadow-inner">
                   <Building2 className="w-5 h-5 text-white" />
                </div>
                
                <div className="space-y-5 border-t border-white/10 pt-6">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">TOTAL COST AMT</p>
                      <p className="text-2xl font-black text-white tracking-tighter leading-none">₹{totalSiteGenerated.toLocaleString('en-IN')}</p>
                   </div>
                   <div className="grid grid-cols-1 gap-3">
                      <div className="bg-white/5 p-3 rounded-sm border border-white/10">
                         <p className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none mb-1.5">WORKER WAGES</p>
                         <div className="flex justify-between items-baseline">
                            <span className="text-sm font-black">₹{totalWorkersEarned.toLocaleString('en-IN')}</span>
                            <span className="text-[8px] font-black text-white/60">₹{totalPending.toLocaleString('en-IN')} {totalPending > 0 ? "DUE" : "PAID"}</span>
                         </div>
                      </div>
                      <div className="bg-white/5 p-3 rounded-sm border border-white/10">
                         <p className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none mb-1.5">MATERIAL LOG</p>
                         <p className="text-sm font-black">₹{totalMaterials.toLocaleString('en-IN')}</p>
                      </div>
                   </div>
                </div>

                <div className="pt-2">
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-sm w-fit border border-white/20 shadow-md">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-white">{site.status?.toUpperCase() || 'ONGOING'}</p>
                   </div>
                </div>
              </div>
           </Card>

           {/* Filters */}
           <Card className="border border-border/40 shadow-sm rounded-sm p-5 space-y-4 bg-card">
              <div className="flex items-center gap-2 border-b border-border/40 pb-2">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">REPORTS BROWSER</p>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                <Select value={filterYear} onValueChange={(val) => { setFilterYear(val || "all"); setCurrentPage(1); }}>
                  <SelectTrigger className="h-9 rounded-sm border-border bg-muted/5 text-[10px] font-black px-3 text-blue-950 uppercase">
                    <SelectValue placeholder="YEAR" />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm">
                    <SelectItem value="all">ANY YEAR</SelectItem>
                    {availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterMonth} onValueChange={(val) => { setFilterMonth(val || "all"); setCurrentPage(1); }}>
                  <SelectTrigger className="h-9 rounded-sm border-border bg-muted/5 text-[10px] font-black px-3 text-blue-950 uppercase">
                    <SelectValue placeholder="MONTH" />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm">
                    <SelectItem value="all">ANY MONTH</SelectItem>
                    {Array.from({length: 12}).map((_, i) => (
                      <SelectItem key={i+1} value={(i+1).toString().padStart(2, "0")}>
                        {format(new Date(2000, i, 1), "MMMM").toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
           </Card>
        </div>

        <div className="lg:col-span-3 space-y-4">
           {/* Detailed Table */}
           <Card className="border border-border/40 shadow-sm rounded-sm bg-card overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead className="bg-muted/10 border-b border-border/40 text-[9px] uppercase text-muted-foreground font-black tracking-widest">
                      <tr>
                        <th className="px-5 py-4 text-left">ENTRY DATE</th>
                        <th className="px-5 py-4 text-center">WORKFORCE</th>
                        <th className="px-5 py-4 text-center">MATERIALS</th>
                        <th className="px-5 py-4 text-center">EQUIPMENT</th>
                        <th className="px-5 py-4 text-right pr-10">DAILY NET</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {paginatedHistory.map((entry) => (
                        <tr key={entry.id} className="hover:bg-muted/5 transition-colors group">
                          <td className="px-5 py-4 text-left">
                             <div className="font-black text-blue-950 text-xs uppercase tracking-tight">{entry.date ? format(parseISO(entry.date), "dd MMM, yyyy").toUpperCase() : "N/A"}</div>
                             <div className="text-[8px] text-muted-foreground/50 font-black uppercase mt-0.5 tracking-widest">{entry.time?.toUpperCase()}</div>
                          </td>
                          <td className="px-5 py-4 text-center">
                             <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-indigo-50 text-indigo-700 font-black text-[10px] border border-indigo-100/50 uppercase">
                                {entry.workers?.length || 0} PERS
                             </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                             <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 font-black text-[10px] border border-emerald-100/50 uppercase">
                                {entry.materials?.length || 0} ITEM
                             </div>
                          </td>
                          <td className="px-5 py-4 text-center">
                             <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-violet-50 text-violet-700 font-black text-[10px] border border-violet-100/50 uppercase">
                                {entry.machinery?.length || 0} UNIT
                             </div>
                          </td>
                          <td className="px-5 py-4 text-right pr-10 font-black text-blue-950 text-sm tracking-tight">
                             ₹{entry.totalAmount?.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>
           </Card>

           {/* Pagination */}
           {totalPages > 1 && (
             <div className="flex justify-center items-center gap-4 py-4">
               <Button variant="outline" size="sm" className="h-8 rounded-sm text-[10px] uppercase font-black text-blue-950" disabled={currentPage === 1} onClick={() => setCurrentPage(v => v - 1)}>PREV</Button>
               <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{currentPage} / {totalPages}</span>
               <Button variant="outline" size="sm" className="h-8 rounded-sm text-[10px] uppercase font-black text-blue-950" disabled={currentPage === totalPages} onClick={() => setCurrentPage(v => v + 1)}>NEXT</Button>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
