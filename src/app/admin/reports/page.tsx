"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getDailyEntries, getSites, deleteDailyEntry } from "@/lib/firestore";
import type { DailyEntry, Site } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Loader2, Search, Calendar, Users, Building2, ChevronRight, X, 
  DollarSign, Package, IndianRupee, Plus, Cog, CheckCircle2, 
  AlertCircle, Clock, Trash2, MoreVertical, Pencil
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ReportsPage() {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();

  // Tabs — read initial tab from URL query param (e.g. ?tab=workers)
  const [activeTab, setActiveTab] = useState<"entries" | "workers" | "sites">(() => {
    const t = searchParams.get("tab");
    if (t === "workers" || t === "sites") return t;
    return "entries";
  });

  // Filters
  const [filterSite, setFilterSite] = useState<string>("all");
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>(new Date().getFullYear().toString());
  const [searchName, setSearchName] = useState<string>("");
  const [searchWorker, setSearchWorker] = useState<string>("");
  const [searchSite, setSearchSite] = useState<string>("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Dialog State
  const [modalType, setModalType] = useState<"workers" | "materials" | "machinery" | "expenses" | "full" | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<DailyEntry | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [eData, sData] = await Promise.all([getDailyEntries(), getSites()]);
      setEntries(eData || []);
      setSites(sData || []);
    } catch (error) {
      console.error("Error loading records", error);
    }
    setLoading(false);
  }

  const handleDeleteEntry = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteDailyEntry(deleteConfirmId);
      toast.success("ENTRY REMOVED FROM RECORDS");
      setDeleteConfirmId(null);
      loadData();
    } catch (error) {
      console.error(error);
      toast.error("FAILED TO DELETE ENTRY");
    }
  };

  const safeDateSplit = (dateStr: string) => {
    if (!dateStr || typeof dateStr !== 'string') return [null, null, null];
    return dateStr.split("-");
  };

  const availableYears = Array.from(new Set(entries.map(e => safeDateSplit(e.date)[0]).filter(Boolean))).sort().reverse() as string[];
  if (availableYears.length === 0) availableYears.push(new Date().getFullYear().toString());

  // Filtered Entries
  const filteredEntries = entries.filter(e => {
    if (filterSite !== "all" && e.siteId !== filterSite) return false;
    const [y, m] = safeDateSplit(e.date);
    if (filterYear !== "all" && y !== filterYear) return false;
    if (filterMonth !== "all" && m !== filterMonth) return false;
    if (searchName.trim() !== "") {
      const q = searchName.toLowerCase().trim();
      return e.workers?.some(w => w.personName.toLowerCase().includes(q));
    }
    return true;
  });

  const workersMap = new Map<string, { name: string, earned: number, paid: number, pending: number, roles: Set<string> }>();
  entries.forEach(entry => {
    entry.workers?.forEach(w => {
      if (!w.personName) return;
      const key = w.personName.trim().toLowerCase();
      if (!workersMap.has(key)) workersMap.set(key, { name: w.personName.trim(), earned: 0, paid: 0, pending: 0, roles: new Set() });
      const current = workersMap.get(key)!;
      current.earned += (Number(w.amount) || 0);
      current.paid += (Number(w.paidAmount) || 0);
      current.pending += (Number(w.pendingAmount) || 0);
      if (w.type && w.type !== '—') current.roles.add(w.type);
    });
  });
  const workersList = Array.from(workersMap.values())
    .map(w => ({ ...w, rolesList: Array.from(w.roles) }))
    .filter(w => w.name.toLowerCase().includes(searchWorker.toLowerCase()))
    .sort((a,b) => a.name.localeCompare(b.name));

  const filteredSites = sites.filter(s => 
    s.siteName.toLowerCase().includes(searchSite.toLowerCase())
  );

  const totalEntriesPages = Math.ceil(filteredEntries.length / pageSize);
  const totalWorkersPages = Math.ceil(workersList.length / pageSize);
  
  const paginatedEntries = filteredEntries.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const paginatedWorkers = workersList.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const paginatedSites = filteredSites.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const openModal = (entry: DailyEntry, type: "workers" | "materials" | "machinery" | "expenses" | "full") => {
    setSelectedEntry(entry);
    setModalType(type);
  };

  const safeFormatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, "dd MMM, yyyy").toUpperCase() : "N/A";
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-7xl mx-auto py-2 px-1 sm:px-4 space-y-4 animate-in fade-in duration-500">

      {/* Primary Action Mobile */}
      <div className="lg:hidden flex justify-end px-1 pt-2">
        <Link href="/admin/daily-entry" className="w-full sm:w-auto">
          <Button size="sm" className="w-full h-11 rounded-sm bg-primary text-[11px] font-black uppercase tracking-[0.15em] hover:opacity-90 shadow-lg shadow-primary/20 gap-2">
            <Plus className="w-4 h-4" /> GIVE ENTRY
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-border/40 pb-0 flex items-center h-12 overflow-x-auto">
        <div className="flex items-center gap-6 sm:gap-8 px-4 sm:px-1 h-full min-w-max">
          {["entries", "workers", "sites"].map((tab) => (
            <button 
              key={tab}
              className={cn("h-full flex items-center text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all relative border-b-2", 
                activeTab === tab ? "text-primary border-primary" : "text-muted-foreground/60 hover:text-blue-950 border-transparent")}
              onClick={() => { setActiveTab(tab as any); setCurrentPage(1); }}
            >
              {tab === "entries" ? "RECORDS" : tab.toUpperCase()}
            </button>
          ))}
        </div>
        <Link href="/admin/daily-entry" className="hidden lg:block ml-auto">
          <Button size="sm" className="mb-2 h-9 rounded-sm bg-primary text-[10px] font-black uppercase tracking-widest hover:opacity-90 shadow-sm gap-2 px-6 shadow-primary/10">
            <Plus className="w-4 h-4" /> GIVE ENTRY
          </Button>
        </Link>
      </div>

      {activeTab === "entries" && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-1 duration-400">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 items-center">
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
              <Input 
                placeholder="SEARCH WORKER NAME..." 
                className="h-10 pl-9 rounded-sm border-border bg-card shadow-sm text-xs font-black text-blue-950 uppercase"
                value={searchName}
                onChange={e => { setSearchName(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 lg:col-span-2">
               <Select value={filterSite} onValueChange={v => { setFilterSite(v || "all"); setCurrentPage(1); }}>
                <SelectTrigger className="h-10 rounded-sm border-border bg-card shadow-sm text-[10px] font-black uppercase text-blue-950">
                  <SelectValue placeholder="ALL SITES" />
                </SelectTrigger>
                <SelectContent className="rounded-sm">
                  <SelectItem value="all">ALL SITES</SelectItem>
                  {sites.map(s => <SelectItem key={s.id} value={s.id} className="uppercase font-black text-[10px]">{s.siteName}</SelectItem>)}
                </SelectContent>
              </Select>

              <div className="flex gap-1.5">
                <Select value={filterYear} onValueChange={v => { setFilterYear(v || "all"); setCurrentPage(1); }}>
                  <SelectTrigger className="h-10 rounded-sm border-border bg-card shadow-sm text-[10px] font-black uppercase flex-1 text-blue-950">
                    <SelectValue placeholder="YEAR" />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm">
                    <SelectItem value="all">YR</SelectItem>
                    {availableYears.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={filterMonth} onValueChange={v => { setFilterMonth(v || "all"); setCurrentPage(1); }}>
                  <SelectTrigger className="h-10 rounded-sm border-border bg-card shadow-sm text-[10px] font-black uppercase flex-1 text-blue-950">
                    <SelectValue placeholder="MONTH" />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm">
                    <SelectItem value="all">MO</SelectItem>
                    {["01","02","03","04","05","06","07","08","09","10","11","12"].map(m => <SelectItem key={m} value={m} className="uppercase font-black">{format(new Date(2000, parseInt(m)-1), "MMM")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Card className="border border-border/40 shadow-sm rounded-sm overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/10 border-b border-border/60 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                    <th className="px-5 py-4 text-center whitespace-nowrap">DATE</th>
                    <th className="px-5 py-4 text-center">SITE NAME</th>
                    <th className="px-5 py-4 text-center">SUMMARY</th>
                    <th className="px-5 py-4 text-center">TOTAL AMT</th>
                    <th className="px-5 py-4 text-center">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {paginatedEntries.map(e => (
                    <tr key={e.id} className="hover:bg-muted/5 transition-colors group cursor-pointer" onClick={() => openModal(e, "full")}>
                      <td className="px-5 py-4 text-xs font-black text-blue-950 tracking-tight text-center whitespace-nowrap">
                        {safeFormatDate(e.date)}
                      </td>
                      <td className="px-5 py-4 text-xs font-black text-blue-950/80 tracking-tight uppercase text-center">
                        {sites.find(s => s.id === e.siteId)?.siteName || "N/A"}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {(() => {
                            const l = (e.workers || []).reduce((s, w) => s + (Number(w.amount) || 0), 0);
                            const m = (e.materials || []).reduce((s, x) => s + (Number(x.amount) || 0), 0);
                            const eq = (e.machinery || []).reduce((s, x) => s + (Number(x.amount) || 0), 0);
                            const ex = (e.expenses || []).reduce((s, x) => s + (Number(x.amount) || 0), 0);
                            const gt = l + m + eq + ex;

                            return (
                              <>
                                <div className="flex flex-col items-center gap-0.5 min-w-[45px]">
                                  <span className="text-[8px] font-bold text-muted-foreground uppercase">LABOUR</span>
                                  <span className="text-[10px] font-black text-indigo-700">₹{l.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="h-6 w-px bg-border/40 mx-1" />
                                <div className="flex flex-col items-center gap-0.5 min-w-[45px]">
                                  <span className="text-[8px] font-bold text-muted-foreground uppercase">MAT</span>
                                  <span className="text-[10px] font-black text-emerald-700">₹{m.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="h-6 w-px bg-border/40 mx-1" />
                                <div className="flex flex-col items-center gap-0.5 min-w-[45px]">
                                  <span className="text-[8px] font-bold text-muted-foreground uppercase">EQUIP</span>
                                  <span className="text-[10px] font-black text-amber-700">₹{eq.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="h-6 w-px bg-border/40 mx-1" />
                                <div className="flex flex-col items-center gap-0.5 min-w-[45px]">
                                  <span className="text-[8px] font-bold text-muted-foreground uppercase">EXP</span>
                                  <span className="text-[10px] font-black text-rose-700">₹{ex.toLocaleString('en-IN')}</span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center font-black text-xs tracking-tight text-blue-950">
                        {(() => {
                           const l = (e.workers || []).reduce((s, w) => s + (Number(w.amount) || 0), 0);
                           const m = (e.materials || []).reduce((s, x) => s + (Number(x.amount) || 0), 0);
                           const eq = (e.machinery || []).reduce((s, x) => s + (Number(x.amount) || 0), 0);
                           const ex = (e.expenses || []).reduce((s, x) => s + (Number(x.amount) || 0), 0);
                           return `₹${(l + m + eq + ex).toLocaleString('en-IN')}`;
                        })()}
                      </td>
                      <td className="px-5 py-4 text-center" onClick={(ev) => ev.stopPropagation()}>
                         <div className="flex justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger className="h-6 w-6 rounded-sm text-blue-950/30 hover:text-destructive hover:bg-destructive/5 flex items-center justify-center outline-none cursor-pointer">
                                <MoreVertical className="w-3 h-3" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="center" className="rounded-[sm] border-border p-1">
                               <DropdownMenuItem className="p-0 rounded-sm cursor-pointer">
                                 <Link href={`/admin/daily-entry?edit=${e.id}`} className="text-[10px] font-black uppercase tracking-widest py-2 px-3 flex items-center gap-2 w-full">
                                   <Pencil className="w-3.5 h-3.5" /> EDIT RECORD
                                 </Link>
                               </DropdownMenuItem>
                               <DropdownMenuItem onClick={() => setDeleteConfirmId(e.id)} className="text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-sm cursor-pointer hover:bg-destructive/5 focus:bg-destructive/5 text-destructive flex items-center gap-2">
                                  <Trash2 className="w-3.5 h-3.5" /> DELETE RECORD
                               </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {totalEntriesPages > 1 && (
            <div className="flex justify-center items-center gap-4 py-4">
              <Button variant="outline" size="sm" className="h-8 rounded-sm text-[10px] font-black uppercase text-blue-950" disabled={currentPage === 1} onClick={() => setCurrentPage(v => v - 1)}>PREV</Button>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">PAGE {currentPage} OF {totalEntriesPages}</span>
              <Button variant="outline" size="sm" className="h-8 rounded-sm text-[10px] font-black uppercase text-blue-950" disabled={currentPage === totalEntriesPages} onClick={() => setCurrentPage(v => v + 1)}>NEXT</Button>
            </div>
          )}
        </div>
      )}

      {/* WORKERS TAB */}
      {activeTab === "workers" && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-1 duration-400">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="SEARCH WORKER NAME..."
              className="h-10 pl-9 rounded-sm border-border bg-card shadow-sm text-xs font-black text-blue-950 uppercase"
              value={searchWorker}
              onChange={e => { setSearchWorker(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <Card className="border border-border/40 shadow-sm rounded-sm overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/10 border-b border-border/60 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                    <th className="px-5 py-4">#</th>
                    <th className="px-5 py-4">WORKER NAME</th>
                    <th className="px-5 py-4">ROLES</th>
                    <th className="px-5 py-4 text-right">TOTAL EARNED</th>
                    <th className="px-5 py-4 text-right">PAID</th>
                    <th className="px-5 py-4 text-right">PENDING</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {paginatedWorkers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-10 text-center text-xs font-black text-muted-foreground uppercase tracking-widest">
                        No workers found
                      </td>
                    </tr>
                  ) : paginatedWorkers.map((w, i) => (
                    <tr key={w.name} className="hover:bg-muted/5 transition-colors">
                      <td className="px-5 py-4 text-xs font-black text-muted-foreground/60">
                        {(currentPage - 1) * pageSize + i + 1}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/workers/${encodeURIComponent(w.name)}`}
                          className="text-xs font-black text-primary uppercase tracking-tight underline underline-offset-2 flex items-center gap-1 hover:opacity-70 transition-opacity"
                        >
                          {w.name} <ChevronRight className="w-3 h-3 opacity-50 shrink-0" />
                        </Link>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1">
                          {w.rolesList.map(r => (
                            <span key={r} className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-full uppercase">
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs font-black text-blue-950 text-right">
                        ₹{w.earned.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-4 text-xs font-black text-emerald-700 text-right">
                        ₹{w.paid.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-4 text-xs font-black text-rose-600 text-right">
                        ₹{w.pending.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {totalWorkersPages > 1 && (
            <div className="flex justify-center items-center gap-4 py-4">
              <Button variant="outline" size="sm" className="h-8 rounded-sm text-[10px] font-black uppercase text-blue-950" disabled={currentPage === 1} onClick={() => setCurrentPage(v => v - 1)}>PREV</Button>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">PAGE {currentPage} OF {totalWorkersPages}</span>
              <Button variant="outline" size="sm" className="h-8 rounded-sm text-[10px] font-black uppercase text-blue-950" disabled={currentPage === totalWorkersPages} onClick={() => setCurrentPage(v => v + 1)}>NEXT</Button>
            </div>
          )}
        </div>
      )}

      {/* SITES TAB */}
      {activeTab === "sites" && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-1 duration-400">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              placeholder="SEARCH SITE NAME..."
              className="h-10 pl-9 rounded-sm border-border bg-card shadow-sm text-xs font-black text-blue-950 uppercase"
              value={searchSite}
              onChange={e => { setSearchSite(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <Card className="border border-border/40 shadow-sm rounded-sm overflow-hidden bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/10 border-b border-border/60 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                    <th className="px-5 py-4">#</th>
                    <th className="px-5 py-4">SITE NAME</th>
                    <th className="px-5 py-4 text-right">LABOUR</th>
                    <th className="px-5 py-4 text-right">MATERIAL</th>
                    <th className="px-5 py-4 text-right">MACHINERY</th>
                    <th className="px-5 py-4 text-right">EXPENSES</th>
                    <th className="px-5 py-4 text-right">GRAND TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {paginatedSites.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-xs font-black text-muted-foreground uppercase tracking-widest">
                        No sites found
                      </td>
                    </tr>
                  ) : paginatedSites.map((s, i) => {
                    const siteEntries = entries.filter(e => e.siteId === s.id);
                    const labour    = siteEntries.flatMap(e => e.workers   || []).reduce((t, w) => t + (Number(w.amount) || 0), 0);
                    const lCount    = siteEntries.flatMap(e => e.workers   || []).reduce((t, w) => t + (Number(w.labourCount) || (w.type === 'RW' ? 1 : 0)), 0);
                    const material  = siteEntries.flatMap(e => e.materials || []).reduce((t, m) => t + (Number(m.amount) || 0), 0);
                    const machinery = siteEntries.flatMap(e => e.machinery || []).reduce((t, m) => t + (Number(m.amount) || 0), 0);
                    const expenses  = siteEntries.flatMap(e => e.expenses  || []).reduce((t, x) => t + (Number(x.amount) || 0), 0);
                    const grand     = labour + material + machinery + expenses;
                    return (
                      <tr key={s.id} className="hover:bg-muted/5 transition-colors">
                        <td className="px-5 py-4 text-xs font-black text-muted-foreground/60">
                          {(currentPage - 1) * pageSize + i + 1}
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            href={`/admin/sites/${s.id}`}
                            className="text-xs font-black text-primary uppercase tracking-tight underline underline-offset-2 flex items-center gap-1 hover:opacity-70 transition-opacity"
                          >
                            {s.siteName} <ChevronRight className="w-3 h-3 opacity-50 shrink-0" />
                          </Link>
                          <div className="flex flex-col mt-0.5">
                            {s.location && <span className="text-[10px] text-muted-foreground/50">{s.location}</span>}
                            {lCount > 0 && (
                              <span className="text-[9px] font-black text-indigo-600 bg-indigo-50/50 px-1 w-fit rounded mt-0.5">
                                {lCount} TOTAL LABOUR
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-right text-xs font-bold text-indigo-700">
                          ₹{labour.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-4 text-right text-xs font-bold text-amber-600">
                          ₹{material.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-4 text-right text-xs font-bold text-sky-600">
                          ₹{machinery.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-4 text-right text-xs font-bold text-violet-600">
                          ₹{expenses.toLocaleString('en-IN')}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <span className="text-xs font-black text-[#1A1A1A]">₹{grand.toLocaleString('en-IN')}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {Math.ceil(filteredSites.length / pageSize) > 1 && (
            <div className="flex justify-center items-center gap-4 py-4">
              <Button variant="outline" size="sm" className="h-8 rounded-sm text-[10px] font-black uppercase text-blue-950" disabled={currentPage === 1} onClick={() => setCurrentPage(v => v - 1)}>PREV</Button>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">PAGE {currentPage} OF {Math.ceil(filteredSites.length / pageSize)}</span>
              <Button variant="outline" size="sm" className="h-8 rounded-sm text-[10px] font-black uppercase text-blue-950" disabled={currentPage === Math.ceil(filteredSites.length / pageSize)} onClick={() => setCurrentPage(v => v + 1)}>NEXT</Button>
            </div>
          )}
        </div>
      )}


      <Dialog open={!!selectedEntry && modalType === "full"} onOpenChange={(o) => (!o ? setSelectedEntry(null) : null)}>

        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[#F1F2F4] p-0 border-0 rounded-xl" style={{ borderRadius: '12px' }}>
          {selectedEntry && (
             <div className="p-6 space-y-4 font-sans text-[#1A1A1A]">
               <div className="flex flex-col mb-4 bg-white p-4 rounded-xl shadow-sm border border-[#E5E5E5]">
                 <h2 className="text-[16px] font-bold text-[#1A1A1A] mb-1">Entry Summary</h2>
                 <p className="text-[13px] text-[#666] font-medium">
                    {safeFormatDate(selectedEntry.date)} • {selectedEntry.time} <br/> 
                    Site: {sites.find(s => s.id === selectedEntry.siteId)?.siteName || 'N/A'}
                 </p>
               </div>

               {/* Labour */}
               {selectedEntry.workers && selectedEntry.workers.length > 0 && (() => {
                 const aggW = Array.from(selectedEntry.workers!.reduce((m, w) => {
                   const key = w.personName.trim().toLowerCase();
                   if (!m.has(key)) m.set(key, { ...w, types: [w.type || "—"], totalAmount: Number(w.amount) || 0, totalLabour: Number(w.labourCount) || 0 });
                   else {
                     const item = m.get(key)!;
                     if (w.type && w.type !== "—") item.types.push(w.type);
                     item.totalAmount += Number(w.amount) || 0;
                     item.totalLabour += Number(w.labourCount) || 0;
                   }
                   return m;
                 }, new Map<string, any>()).values());

                 return (
                 <Card className="rounded-xl border-[#E5E5E5] bg-white overflow-hidden shadow-sm">
                   <div className="px-4 py-3 bg-[#FAFAFA] border-b border-[#E5E5E5]">
                     <h3 className="text-[13px] font-semibold text-[#1A1A1A]">Labour ({aggW.length})</h3>
                   </div>
                   <div className="divide-y divide-[#E5E5E5]">
                     {aggW.map((w: any, i: number) => (
                       <div key={i} className="p-3 px-4 flex justify-between text-[13px] items-center">
                         <div>
                            <span className="font-medium text-[#1A1A1A]">{w.personName}</span>
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 ml-2 uppercase">
                              {Array.from(new Set(w.types)).join(", ")}
                              {w.totalLabour > 0 && <span className="ml-1 opacity-70">({w.totalLabour})</span>}
                            </span>
                         </div>
                         <div className="font-medium font-bold text-indigo-700">₹{w.totalAmount.toLocaleString('en-IN')}</div>
                       </div>
                     ))}
                   </div>
                 </Card>
                 );
               })()}

               {/* Materials */}
               {selectedEntry.materials && selectedEntry.materials.length > 0 && (
                 <Card className="rounded-xl border-[#E5E5E5] bg-white overflow-hidden shadow-sm">
                   <div className="px-4 py-3 bg-[#FAFAFA] border-b border-[#E5E5E5]">
                     <h3 className="text-[13px] font-semibold text-[#1A1A1A]">Materials ({selectedEntry.materials.length})</h3>
                   </div>
                   <div className="divide-y divide-[#E5E5E5]">
                     {selectedEntry.materials.map((m, i) => (
                       <div key={i} className="p-3 px-4 flex justify-between text-[13px]">
                         <div>
                            <span className="font-medium text-[#1A1A1A]">{m.materialName}</span>
                            <span className="text-[#666] ml-2">{m.qty} qty {m.company ? `• ${m.company}` : ''}</span>
                         </div>
                         <div className="font-medium">₹{Number(m.amount || 0).toLocaleString('en-IN')}</div>
                       </div>
                     ))}
                   </div>
                 </Card>
               )}

               {/* Machinery */}
               {selectedEntry.machinery && selectedEntry.machinery.length > 0 && (
                 <Card className="rounded-xl border-[#E5E5E5] bg-white overflow-hidden shadow-sm">
                   <div className="px-4 py-3 bg-[#FAFAFA] border-b border-[#E5E5E5]">
                     <h3 className="text-[13px] font-semibold text-[#1A1A1A]">Machinery ({selectedEntry.machinery.length})</h3>
                   </div>
                   <div className="divide-y divide-[#E5E5E5]">
                     {selectedEntry.machinery.map((m, i) => (
                       <div key={i} className="p-3 px-4 flex justify-between text-[13px]">
                         <div>
                            <span className="font-medium text-[#1A1A1A]">{m.machineryName}</span>
                            <span className="text-[#666] ml-2">{m.qty} units {m.personName ? `• ${m.personName}` : ''}</span>
                         </div>
                         <div className="font-medium">₹{Number(m.amount || 0).toLocaleString('en-IN')}</div>
                       </div>
                     ))}
                   </div>
                 </Card>
               )}

               {/* Expenses */}
               {selectedEntry.expenses && selectedEntry.expenses.length > 0 && (
                 <Card className="rounded-xl border-[#E5E5E5] bg-white overflow-hidden shadow-sm">
                   <div className="px-4 py-3 bg-[#FAFAFA] border-b border-[#E5E5E5]">
                     <h3 className="text-[13px] font-semibold text-[#1A1A1A]">Expenses ({selectedEntry.expenses.length})</h3>
                   </div>
                   <div className="divide-y divide-[#E5E5E5]">
                     {selectedEntry.expenses.map((e, i) => (
                       <div key={i} className="p-3 px-4 flex justify-between text-[13px]">
                         <span className="font-medium text-[#1A1A1A]">{e.title}</span>
                          <div className="font-medium">₹{Number(e.amount || 0).toLocaleString('en-IN')}</div>
                       </div>
                     ))}
                   </div>
                 </Card>
               )}

                <div className="pt-4 flex justify-between items-center text-[16px] font-bold text-[#1A1A1A] bg-white p-4 rounded-xl shadow-sm border border-[#E5E5E5]">
                  <span>FINAL TOTAL</span>
                  <span>
                    {(() => {
                      const l = (selectedEntry.workers || []).reduce((s, w) => s + (Number(w.amount) || 0), 0);
                      const m = (selectedEntry.materials || []).reduce((s, x) => s + (Number(x.amount) || 0), 0);
                      const eq = (selectedEntry.machinery || []).reduce((s, x) => s + (Number(x.amount) || 0), 0);
                      const ex = (selectedEntry.expenses || []).reduce((s, x) => s + (Number(x.amount) || 0), 0);
                      return `₹${(l + m + eq + ex).toLocaleString('en-IN')}`;
                    })()}
                  </span>
                </div>
             </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* DELETE CONFIRMATION */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(o) => !o && setDeleteConfirmId(null)}>
        <AlertDialogContent className="rounded-sm bg-card border-border/40">
           <AlertDialogHeader>
              <AlertDialogTitle className="text-blue-950 uppercase font-black text-lg tracking-tight">ERASE RECORD PERMANENTLY?</AlertDialogTitle>
              <AlertDialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                 THIS WILL REMOVE THE DAILY LOG ENTRY FROM THE SYSTEM FOREVER. THIS ACTION CANNOT BE UNDONE.
              </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
              <AlertDialogCancel className="h-10 rounded-sm text-[10px] font-black uppercase tracking-widest text-blue-950">KEEP RECORD</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteEntry} className="h-10 rounded-sm bg-destructive text-white text-[10px] font-black uppercase tracking-widest">DELETE ENTRY</AlertDialogAction>
           </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
