"use client";

import { useState, useEffect } from "react";
import { getDailyEntries, getSites } from "@/lib/firestore";
import type { DailyEntry, Site } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Calendar, FileText, Users, Building2, ChevronRight, X, DollarSign, PackageSearch, IndianRupee } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState<"entries" | "workers" | "sites">("entries");

  // Filters for Entries
  const [filterSite, setFilterSite] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [searchName, setSearchName] = useState<string>("");
  const [searchWorker, setSearchWorker] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Dialog State
  const [modalType, setModalType] = useState<"workers" | "materials" | "expenses" | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DailyEntry | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [eData, sData] = await Promise.all([getDailyEntries(), getSites()]);
        setEntries(eData);
        setSites(sData);
      } catch (error) {
        console.error("Error loading records", error);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Compute unique years
  const availableYears = Array.from(new Set(entries.map(e => e.date.split("-")[0]))).sort().reverse();
  if (!availableYears.includes(new Date().getFullYear().toString())) {
    availableYears.push(new Date().getFullYear().toString());
  }

  // Derived Data: Workers filtered by search
  const workersMap = new Map<string, { name: string, earned: number, paid: number, pending: number }>();
  entries.forEach(entry => {
    entry.workers?.forEach(w => {
      if (!w.personName) return;
      const key = w.personName.trim().toLowerCase();
      if (!workersMap.has(key)) workersMap.set(key, { name: w.personName.trim(), earned: 0, paid: 0, pending: 0 });
      const current = workersMap.get(key)!;
      current.earned += (w.amount || 0);
      current.paid += (w.paidAmount || 0);
      current.pending += (w.pendingAmount || 0);
    });
  });
  const workersList = Array.from(workersMap.values())
    .filter(w => w.name.toLowerCase().includes(searchWorker.toLowerCase()))
    .sort((a,b) => a.name.localeCompare(b.name));

  // Filtered Entries
  const filteredEntries = entries.filter(e => {
    if (filterSite !== "all" && e.siteId !== filterSite) return false;
    const [y, m] = e.date.split("-");
    if (filterYear !== "all" && y !== filterYear) return false;
    if (filterMonth !== "all" && m !== filterMonth) return false;

    if (searchName.trim() !== "") {
      const q = searchName.toLowerCase().trim();
      const hasWorker = e.workers?.some(w => w.personName.toLowerCase().includes(q));
      if (!hasWorker) return false;
    }
    return true;
  });

  const paginatedEntries = filteredEntries.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredEntries.length / pageSize);

  const openModal = (entry: DailyEntry, type: "workers" | "materials" | "expenses") => {
    setSelectedEntry(entry);
    setModalType(type);
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-12 h-12 animate-spin text-maroon-600" /></div>;
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tightest uppercase">
            Data <span className="text-maroon-600">Analytics</span>
          </h1>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">
            Infrastructure logs & financial history
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-[2rem] w-fit">
        <button 
          className={cn("px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300", 
            activeTab === "entries" ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-500 hover:text-slate-900 hover:bg-white")} 
          onClick={() => setActiveTab("entries")}
        >
          Daily Logs
        </button>
        <button 
          className={cn("px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300", 
            activeTab === "workers" ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-500 hover:text-slate-900 hover:bg-white")} 
          onClick={() => setActiveTab("workers")}
        >
          Worker Directory
        </button>
        <button 
          className={cn("px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300", 
            activeTab === "sites" ? "bg-slate-900 text-white shadow-xl shadow-slate-200" : "text-slate-500 hover:text-slate-900 hover:bg-white")} 
          onClick={() => setActiveTab("sites")}
        >
          Site Archives
        </button>
      </div>

      {activeTab === "entries" && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
            <CardContent className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-2.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Site</label>
                <Select value={filterSite} onValueChange={(v) => { setFilterSite(v || "all"); setCurrentPage(1); }}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-50 bg-slate-50/50 font-black uppercase text-[10px] tracking-widest">
                    <SelectValue placeholder="All Sites" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100">
                    <SelectItem value="all" className="font-black text-[10px] uppercase py-3">Any Location</SelectItem>
                    {sites.map(s => <SelectItem key={s.id} value={s.id} className="font-black text-[10px] uppercase py-3">{s.siteName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Calendar Year</label>
                <Select value={filterYear} onValueChange={(v) => { setFilterYear(v || "all"); setCurrentPage(1); }}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-50 bg-slate-50/50 font-black text-[10px]">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100">
                    <SelectItem value="all" className="font-black text-[10px] py-3">Any Year</SelectItem>
                    {availableYears.map(y => <SelectItem key={y} value={y} className="font-black text-[10px] py-3">{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Fiscal Month</label>
                <Select value={filterMonth} onValueChange={(v) => { setFilterMonth(v || "all"); setCurrentPage(1); }}>
                  <SelectTrigger className="h-12 rounded-2xl border-slate-50 bg-slate-50/50 font-black uppercase text-[10px] tracking-widest">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-slate-100">
                    <SelectItem value="all" className="font-black text-[10px] uppercase py-3">Any Month</SelectItem>
                    {Array.from({length: 12}).map((_, i) => (
                      <SelectItem key={i+1} value={(i+1).toString().padStart(2, "0")} className="font-black text-[10px] uppercase py-3">
                        {format(new Date(2000, i, 1), "MMMM")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Resource Search</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input placeholder="WORKER NAME..." className="h-12 pl-11 rounded-2xl border-slate-50 bg-slate-50/50 font-black uppercase text-[10px] tracking-widest" value={searchName} onChange={(e) => { setSearchName(e.target.value); setCurrentPage(1); }} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 border-b border-white/5 text-[9px] uppercase text-slate-400 font-extrabold tracking-[0.2em]">
                    <tr>
                      <th className="px-8 py-6">Timestamp</th>
                      <th className="px-8 py-6">Project Archive</th>
                      <th className="px-8 py-6 text-center">Labour</th>
                      <th className="px-8 py-6 text-center">Material</th>
                      <th className="px-8 py-6 text-center">Expense</th>
                      <th className="px-8 py-6 text-right">Settlement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginatedEntries.map(entry => {
                      const sName = sites.find(s => s.id === entry.siteId)?.siteName || "Unknown";
                      return (
                        <tr key={entry.id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                          <td className="px-8 py-6">
                            <div className="font-black text-slate-900 uppercase tracking-tightest">{format(parseISO(entry.date), "dd MMM yyyy")}</div>
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{entry.time}</div>
                          </td>
                          <td className="px-8 py-6 font-black text-maroon-600 uppercase tracking-tightest group-hover:translate-x-1 transition-transform">{sName}</td>
                          <td className="px-8 py-6 text-center">
                            <Button size="sm" variant="outline" className="h-9 px-5 text-[9px] font-black uppercase tracking-widest rounded-2xl bg-maroon-50/50 border-maroon-100 text-maroon-800 hover:bg-maroon-800 hover:text-white hover:shadow-lg hover:shadow-maroon-200 transition-all active:scale-95" onClick={() => openModal(entry, "workers")}>
                              {entry.workers?.length || 0} Records
                            </Button>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <Button size="sm" variant="outline" className="h-9 px-5 text-[9px] font-black uppercase tracking-widest rounded-2xl bg-emerald-50/50 border-emerald-100 text-emerald-700 hover:bg-emerald-600 hover:text-white hover:shadow-lg hover:shadow-emerald-200 transition-all active:scale-95" onClick={() => openModal(entry, "materials")}>
                              {entry.materials?.length || 0} Items
                            </Button>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <Button size="sm" variant="outline" className="h-9 px-5 text-[9px] font-black uppercase tracking-widest rounded-2xl bg-amber-50/50 border-amber-100 text-amber-700 hover:bg-amber-600 hover:text-white hover:shadow-lg hover:shadow-amber-200 transition-all active:scale-95" onClick={() => openModal(entry, "expenses")}>
                              {entry.expenses?.length || 0} Logs
                            </Button>
                          </td>
                          <td className="px-8 py-6 text-right font-black text-slate-900 text-lg tracking-tightest">₹{entry.totalAmount?.toLocaleString('en-IN')}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
             </div>
             {filteredEntries.length === 0 && (
               <div className="p-32 text-center text-slate-300 font-black uppercase tracking-[0.2em] italic">Database empty for criteria.</div>
             )}
          </Card>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-6 pt-4">
              <Button variant="ghost" className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-slate-100" disabled={currentPage === 1} onClick={() => setCurrentPage(v => v - 1)}>Prev Archive</Button>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Node {currentPage} / {totalPages}</div>
              <Button variant="ghost" className="h-12 px-8 rounded-2xl font-black uppercase text-[10px] tracking-widest border border-slate-100" disabled={currentPage === totalPages} onClick={() => setCurrentPage(v => v + 1)}>Next Archive</Button>
            </div>
          )}
        </div>
      )}

      {activeTab === "workers" && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-8">
           <Card className="border-0 shadow-2xl bg-white p-8 rounded-[2.5rem]">
             <div className="relative max-w-md">
                <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                <Input placeholder="SEARCH OPERATIVE NAME..." className="pl-14 bg-slate-50/50 border-slate-50 font-black h-14 rounded-2xl uppercase text-xs tracking-widest" value={searchWorker} onChange={e => setSearchWorker(e.target.value)} />
             </div>
           </Card>
           
           <Card className="border-0 shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
             <div className="p-0 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 border-b border-white/5 text-[9px] uppercase text-slate-400 font-extrabold tracking-[0.2em]">
                    <tr>
                      <th className="px-8 py-6">Resource Name</th>
                      <th className="px-8 py-6 text-right">Gross Earned</th>
                      <th className="px-8 py-6 text-right">Settled</th>
                      <th className="px-8 py-6 text-right">Exposure</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 bg-white">
                    {workersList.map((worker) => (
                      <tr key={worker.name} className="hover:bg-maroon-50/30 transition-all duration-300 cursor-pointer group" onClick={() => router.push(`/admin/reports/worker/${encodeURIComponent(worker.name)}`)}>
                        <td className="px-8 py-6 font-black text-slate-900 flex items-center gap-4 group-hover:text-maroon-600 uppercase tracking-tightest">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-maroon-600 group-hover:text-white transition-all">
                             <Users className="w-5 h-5" />
                          </div>
                          {worker.name}
                        </td>
                        <td className="px-8 py-6 text-right text-slate-500 font-black tracking-tightest">₹{worker.earned.toLocaleString('en-IN')}</td>
                        <td className="px-8 py-6 text-right text-emerald-600 font-black tracking-tightest">₹{worker.paid.toLocaleString('en-IN')}</td>
                        <td className="px-8 py-6 text-right">
                           <span className={cn("px-4 py-1.5 rounded-full font-black text-xs tracking-tightest shadow-sm", 
                             worker.pending > 0 ? 'bg-red-50 text-red-600 ring-1 ring-red-100' : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100')}>
                             ₹{worker.pending.toLocaleString('en-IN')}
                           </span>
                        </td>
                      </tr>
                    ))}
                    {workersList.length === 0 && (
                      <tr><td colSpan={4} className="p-32 text-center text-slate-300 font-black uppercase text-xs tracking-widest italic bg-white">Resource not found.</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
           </Card>
        </div>
      )}

      {activeTab === "sites" && (
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
             {sites.map(site => (
                <Link key={site.id} href={`/admin/reports/site/${site.id}`}>
                  <Card className="hover:shadow-2xl transition-all duration-500 cursor-pointer border-0 shadow-sm rounded-[2.5rem] group relative overflow-hidden bg-white h-full transform hover:-translate-y-2">
                    <div className={cn("absolute top-6 right-6 px-3 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-white rounded-full shadow-lg", 
                      site.status === "Completed" ? "bg-emerald-500 shadow-emerald-200" : "bg-maroon-600 shadow-maroon-200")}>
                       {site.status || "Ongoing"}
                    </div>
                    <CardContent className="p-10 text-center space-y-6">
                      <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mx-auto group-hover:bg-maroon-600 group-hover:text-white group-hover:shadow-2xl group-hover:shadow-maroon-200 transition-all duration-500 transform group-hover:-rotate-6">
                        <Building2 className="w-10 h-10" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-xl uppercase leading-tight tracking-tightest">{site.siteName}</h3>
                        <p className="text-[9px] font-black text-slate-300 mt-4 tracking-[0.2em] uppercase">Investigate Archive</p>
                      </div>
                    </CardContent>
                    <div className={cn("h-2 w-full mt-auto", site.status === "Completed" ? "bg-emerald-500" : "bg-blue-600")} />
                  </Card>
                </Link>
             ))}
           </div>
        </div>
      )}

      {/* Detail Dialogs */}
      <Dialog open={!!modalType} onOpenChange={() => setModalType(null)}>
        <DialogContent className="max-w-3xl bg-white shadow-2xl border-0 rounded-[3rem] overflow-hidden p-0">
          <DialogHeader className="bg-slate-900 p-10 text-white relative">
            <div className="space-y-2">
              <DialogTitle className="text-3xl font-black uppercase tracking-tightest flex items-center gap-5">
                {modalType === "workers" && <><div className="w-12 h-12 bg-maroon-800 rounded-2xl flex items-center justify-center"><Users className="w-7 h-7" /></div> Labour Audit</>}
                {modalType === "materials" && <><div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center"><PackageSearch className="w-7 h-7" /></div> Stock Ledger</>}
                {modalType === "expenses" && <><div className="w-12 h-12 bg-amber-600 rounded-2xl flex items-center justify-center"><IndianRupee className="w-7 h-7" /></div> Incidentals</>}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-black uppercase tracking-[0.1em] text-xs pt-4 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                Archive Node: {selectedEntry && format(parseISO(selectedEntry.date), "dd MMMM yyyy")} | {selectedEntry?.time}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setModalType(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white hover:bg-white/10 rounded-2xl h-12 w-12">
               <X className="w-6 h-6" />
            </Button>
          </DialogHeader>
          <div className="p-10 max-h-[60vh] overflow-y-auto">
             {modalType === "workers" && (
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                       <tr>
                         <th className="px-6 py-4">Resource</th>
                         <th className="px-6 py-4">Designation</th>
                         <th className="px-6 py-4 text-center">Utilization</th>
                         <th className="px-6 py-4 text-right">Value</th>
                         <th className="px-6 py-4 text-right">Accounting</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {selectedEntry?.workers.map((w, idx) => (
                          <tr key={idx} className="group hover:bg-slate-50/50 transition-all">
                            <td className="px-6 py-4 font-black text-slate-900 uppercase tracking-tightest">{w.personName}</td>
                            <td className="px-6 py-4"><span className="bg-slate-100 px-3 py-1 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest">{w.type}</span></td>
                            <td className="px-6 py-4 text-center font-black text-xs">{w.shift} <span className="text-[9px] text-slate-300">UNITS</span></td>
                            <td className="px-6 py-4 text-right font-black text-slate-900">₹{w.amount}</td>
                            <td className="px-6 py-4 text-right">
                              <span className={cn("text-[9px] px-3 py-1 rounded-full font-black tracking-widest", 
                                w.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 
                                w.paymentStatus === 'Not Paid' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600')}>
                                {w.paymentStatus.toUpperCase()}
                              </span>
                            </td>
                          </tr>
                        ))}
                     </tbody>
                   </table>
                </div>
             )}

             {modalType === "materials" && (
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                       <tr>
                         <th className="px-6 py-4">Material Identity</th>
                         <th className="px-6 py-4">Source</th>
                         <th className="px-6 py-4 text-center">Volume</th>
                         <th className="px-6 py-4 text-right">Valuation</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {selectedEntry?.materials.map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                            <td className="px-6 py-4 font-black text-slate-900 uppercase tracking-tightest">{m.materialName}</td>
                            <td className="px-6 py-4 font-black text-slate-400 uppercase text-[10px] tracking-widest">{m.company}</td>
                            <td className="px-6 py-4 text-center font-black text-xs bg-slate-50 rounded-2xl mx-6 flex items-center justify-center h-10 mt-2">{m.qty}</td>
                            <td className="px-6 py-4 text-right font-black text-slate-900 text-base">₹{m.amount}</td>
                          </tr>
                        ))}
                        {selectedEntry?.materials.length === 0 && <tr><td colSpan={4} className="p-32 text-center text-slate-300 font-black uppercase tracking-widest italic">Nil Audit.</td></tr>}
                     </tbody>
                   </table>
                </div>
             )}

             {modalType === "expenses" && (
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                     <thead className="bg-slate-50 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                       <tr>
                         <th className="px-6 py-4">Financial Narrative</th>
                         <th className="px-6 py-4 text-right">Impact</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {selectedEntry?.expenses.map((ex, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                            <td className="px-6 py-4 font-black text-slate-900 uppercase tracking-tightest">{ex.title}</td>
                            <td className="px-6 py-4 text-right font-black text-slate-900 text-lg">₹{ex.amount}</td>
                          </tr>
                        ))}
                        {selectedEntry?.expenses.length === 0 && <tr><td colSpan={2} className="p-32 text-center text-slate-300 font-black uppercase tracking-widest italic">Nil Audit.</td></tr>}
                     </tbody>
                   </table>
                </div>
             )}
          </div>
          <div className="p-10 bg-slate-50 flex justify-between items-center border-t border-slate-100">
             <div className="flex gap-10">
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entry Date</p>
                   <p className="text-sm font-black text-slate-900 uppercase">{selectedEntry && format(parseISO(selectedEntry.date), "dd MMM yyyy")}</p>
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Project Index</p>
                   <p className="text-sm font-black text-maroon-600 uppercase">{sites.find(s => s.id === selectedEntry?.siteId)?.siteName}</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Aggregate Settlement</p>
                <p className="text-2xl font-black text-slate-900 tracking-tightest">₹{selectedEntry?.totalAmount?.toLocaleString()}</p>
             </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
