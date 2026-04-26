"use client";

import { useState, useEffect } from "react";
import { getSites, createSite, deleteSite, updateSite } from "@/lib/firestore";
import type { Site, SiteRole } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, Building2, Plus, Trash2, 
  Pencil, X, Search, Save,
  MoreVertical, ChevronRight, MapPin, Activity,
  Calendar, ArrowRight, CheckCircle2, AlertCircle
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { format, parseISO, isValid, isAfter } from "date-fns";

export default function SiteSetupPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [siteName, setSiteName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [roles, setRoles] = useState<SiteRole[]>([ { type: "M", cost: 0 }, { type: "MM", cost: 0 }, { type: "WM", cost: 0 } ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    setLoading(true);
    try {
      const data = await getSites();
      setSites(data || []);
    } catch (error) {
      console.error("Error loading sites", error);
      toast.error("FAILED TO LOAD SITES");
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setSiteName("");
    setLocation("");
    setStartDate("");
    setEndDate("");
    setRoles([ { type: "M", cost: 0 }, { type: "MM", cost: 0 }, { type: "WM", cost: 0 } ]);
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (site: Site) => {
    setEditingId(site.id);
    setSiteName(site.siteName);
    setLocation(site.location || "");
    setStartDate(site.startDate || "");
    setEndDate(site.endDate || "");
    setRoles(site.roles?.length ? [...site.roles] : [ { type: "M", cost: 0 }, { type: "MM", cost: 0 }, { type: "WM", cost: 0 } ]);
    setIsDialogOpen(true);
  };

  const handleAddRole = () => setRoles([...roles, { type: "", cost: 0 }]);
  const handleRoleChange = (index: number, field: keyof SiteRole, value: string | number) => {
    const newRoles = [...roles];
    const finalVal = field === 'cost' ? (Number(value) || 0) : value;
    newRoles[index] = { ...newRoles[index], [field]: finalVal };
    setRoles(newRoles);
  };
  const handleRemoveRole = (index: number) => setRoles(roles.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) return toast.error("SITE NAME IS REQUIRED");
    if (!startDate) return toast.error("SELECT A START DATE");
    setIsSubmitting(true);
    
    const today = new Date();
    const calculatedStatus: "Ongoing" | "Completed" =
      endDate && isAfter(today, new Date(endDate)) ? "Completed" : "Ongoing";

    try {
      if (editingId) {
        await updateSite(editingId, { siteName, location, startDate, endDate, roles, status: calculatedStatus });
        toast.success("SITE UPDATED SUCCESSFULLY");
      } else {
        await createSite({ siteName, location, startDate, endDate, roles, status: calculatedStatus });
        toast.success("NEW SITE REGISTERED");
      }
      setIsDialogOpen(false);
      loadSites();
    } catch (error) {
      console.error(error);
      toast.error("PROCESS FAILED");
    }
    setIsSubmitting(false);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteSite(deleteConfirmId);
      toast.success("SITE REMOVED FROM SYSTEM");
      setDeleteConfirmId(null);
      loadSites();
    } catch (error) {
      console.error(error);
      toast.error("DELETION FAILED");
    }
  };

  const filteredSites = sites
    .filter(s => {
      const matchesSearch = s.siteName.toLowerCase().includes(searchTerm.toLowerCase());
      const today = new Date();
      const end = new Date(s.endDate);
      const isCompleted = isAfter(today, end);
      const currentStatus = isCompleted ? "Completed" : "Ongoing";
      
      const matchesStatus = statusFilter === "all" || currentStatus === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a,b) => (new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()));

  const totalPages = Math.ceil(filteredSites.length / pageSize);
  const paginatedSites = filteredSites.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getSiteStatus = (site: Site) => {
    const today = new Date();
    const end = new Date(site.endDate);
    return isAfter(today, end) ? "Completed" : "Ongoing";
  };

  const ongoingCount = sites.filter(s => getSiteStatus(s) === "Ongoing").length;

  const safeFormatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, "dd MMM, yy").toUpperCase() : "N/A";
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-7xl mx-auto py-2 px-1 sm:px-6 space-y-4 animate-in fade-in duration-500 pb-20">
      
      {/* Primary Action Mobile View */}
      <div className="lg:hidden flex justify-end px-1 pt-2">
        <Button onClick={handleOpenDialog} size="sm" className="w-full h-11 rounded-sm bg-primary text-[11px] font-black uppercase tracking-[0.15em] hover:opacity-90 shadow-lg shadow-primary/20 gap-2">
           <Plus className="w-4 h-4" /> ADD NEW SITE
        </Button>
      </div>

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-sm flex items-center justify-center text-primary border border-primary/20 shadow-sm">
             <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-blue-950 uppercase tracking-tight">MANAGE <span className="text-primary text-xl">SITES</span></h1>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em] leading-none mt-1">CONFIGURE YOUR WORKING LOCATIONS</p>
          </div>
        </div>
        <Button onClick={handleOpenDialog} size="sm" className="hidden lg:flex h-9 rounded-sm bg-primary text-[10px] font-black uppercase tracking-widest shadow-sm gap-2 px-6 shadow-primary/10">
           <Plus className="w-4 h-4" /> ADD NEW SITE
        </Button>
      </div>

      {/* Stats Quick Card */}
      <div className="flex flex-wrap gap-3">
        <Card className="max-w-[280px] w-full border border-border/40 shadow-sm rounded-sm bg-card overflow-hidden group transition-all hover:shadow-xl hover:shadow-primary/5 flex h-20">
          <div className="w-20 relative overflow-hidden bg-muted/5 border-r border-border/10">
             <img src="/construction_dashboard_icon.png" alt="Building" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" />
             <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/20" />
          </div>
          <div className="flex-1 px-4 flex flex-col justify-center gap-0.5">
             <p className="text-[8px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none">ONGOING SITES</p>
             <div className="flex items-baseline gap-2">
               <p className="text-xl font-black text-blue-950 tracking-tighter">{ongoingCount}</p>
               <span className="text-[9px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-1">
                 <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> LIVE
               </span>
             </div>
          </div>
        </Card>
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
          <input 
            placeholder="SEARCH SITE BY NAME..." 
            className="w-full h-10 pl-10 rounded-sm border border-border bg-card shadow-sm text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary text-blue-950 uppercase"
            value={searchTerm}
            onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v || "all"); setCurrentPage(1); }}>
          <SelectTrigger className="h-10 rounded-sm border-border bg-card shadow-sm text-[10px] font-black uppercase tracking-widest text-blue-950">
            <SelectValue placeholder="STATUS" />
          </SelectTrigger>
          <SelectContent className="rounded-sm">
            <SelectItem value="all">ANY STATUS</SelectItem>
            <SelectItem value="Ongoing">ONGOING</SelectItem>
            <SelectItem value="Completed">COMPLETED</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table Section */}
      <Card className="border border-border/40 shadow-sm rounded-sm overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/10 border-b border-border/60 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
              <tr>
                <th className="px-5 py-4 text-left min-w-[140px]">SITE NAME</th>
                <th className="px-5 py-4 text-left min-w-[120px]">LOCATION</th>
                <th className="px-5 py-4 text-center whitespace-nowrap">START DATE</th>
                <th className="px-5 py-4 text-center whitespace-nowrap">END DATE</th>
                <th className="px-5 py-4 text-center">STATUS</th>
                <th className="px-5 py-4 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {paginatedSites.map((site) => {
                const currentStatus = getSiteStatus(site);
                return (
                  <tr key={site.id} className="hover:bg-muted/5 transition-colors group">
                    <td className="px-5 py-4 text-left">
                       <div className="font-black text-blue-950 text-xs uppercase tracking-tight">{site.siteName}</div>
                    </td>
                    <td className="px-5 py-4 text-left">
                       <div className="text-xs text-blue-950/60 truncate max-w-[160px]">{site.location || <span className="text-muted-foreground/30 italic">—</span>}</div>
                    </td>
                    <td className="px-5 py-4 text-center">
                       <span className="bg-muted/30 px-2.5 py-1.5 rounded-sm text-[10px] font-black uppercase text-blue-950/80 border border-border/10 whitespace-nowrap">
                          {safeFormatDate(site.startDate)}
                       </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                       <span className={cn("px-2.5 py-1.5 rounded-sm text-[10px] font-black uppercase border border-border/10 whitespace-nowrap", 
                          currentStatus === "Completed" ? "text-emerald-700 bg-emerald-50/50" : "text-amber-700 bg-amber-50/50")}>
                          {safeFormatDate(site.endDate)}
                       </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                       <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] font-black uppercase tracking-widest border", 
                          currentStatus === "Completed" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-blue-50 text-blue-700 border-blue-100")}>
                          {currentStatus === "Completed" ? <CheckCircle2 className="w-3 h-3" /> : <Activity className="w-3 h-3 animate-pulse" />}
                          {currentStatus.toUpperCase()}
                       </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                       <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-6 w-6 rounded-sm text-blue-950/40 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center border border-transparent hover:border-border/50">
                              <MoreVertical className="w-3 h-3" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="center" className="rounded-[sm] border-border p-1">
                             <DropdownMenuItem onClick={() => handleEdit(site)} className="text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-sm cursor-pointer hover:bg-muted focus:bg-muted text-blue-950 flex items-center gap-2">
                                <Pencil className="w-3 h-3" /> EDIT
                             </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => setDeleteConfirmId(site.id)} className="text-[10px] font-black uppercase tracking-widest py-2 px-3 rounded-sm cursor-pointer hover:bg-destructive/5 focus:bg-destructive/5 text-destructive flex items-center gap-2">
                                <Trash2 className="w-3 h-3" /> DELETE
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                       </div>
                    </td>
                  </tr>
                );
              })}
              {paginatedSites.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center text-muted-foreground/40 font-black uppercase text-[10px] tracking-[0.2em] italic">NO SITES FOUND.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 py-4">
          <Button variant="outline" size="sm" className="h-8 rounded-sm text-[10px] uppercase font-black" disabled={currentPage === 1} onClick={() => setCurrentPage(v => v - 1)}>PREV</Button>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{currentPage}/{totalPages}</span>
          <Button variant="outline" size="sm" className="h-8 rounded-sm text-[10px] uppercase font-black" disabled={currentPage === totalPages} onClick={() => setCurrentPage(v => v + 1)}>NEXT</Button>
        </div>
      )}

      {/* Dialog for Add/Edit */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl bg-card border border-border rounded-sm shadow-2xl p-0 overflow-hidden border-primary/20">
          <DialogHeader className="p-5 sm:p-6 border-b border-border/40 bg-muted/5">
            <DialogTitle className="text-lg font-black uppercase tracking-tight text-blue-950">
               {editingId ? "UPDATE SITE PROFILE" : "NEW SITE REGISTRATION"}
            </DialogTitle>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">CONFIGURE PROJECT TIMELINE & LOCAL WORKER RATES</p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-0.5">PROJECT DISPLAY NAME</Label>
                <div className="relative">
                   <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                   <Input 
                     value={siteName} 
                     onChange={e => setSiteName(e.target.value)} 
                     placeholder="SITE NAME" 
                     className="h-11 pl-10 rounded-sm border-border bg-muted/5 shadow-sm text-sm font-black uppercase tracking-tight text-blue-950"
                   />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-0.5">LOCATION / ADDRESS</Label>
                <div className="relative">
                   <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                   <Input 
                     value={location} 
                     onChange={e => setLocation(e.target.value)} 
                     placeholder="e.g. Anna Nagar, Chennai" 
                     className="h-11 pl-10 rounded-sm border-border bg-muted/5 shadow-sm text-sm font-medium text-blue-950"
                   />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-0.5">START DATE</Label>
                    <div className="relative">
                       <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                       <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="h-11 pl-10 rounded-sm border-border bg-muted/5 font-black uppercase text-xs text-blue-950" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 ml-0.5">END DATE</Label>
                    <div className="relative">
                       <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
                       <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="h-11 pl-10 rounded-sm border-border bg-muted/5 font-black uppercase text-xs text-blue-950" />
                    </div>
                 </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center border-b border-border/40 pb-2">
                   <Label className="text-[9px] font-black uppercase tracking-widest text-primary">WORKER ROLE CONFIGURATION</Label>
                   <Button type="button" variant="outline" size="sm" onClick={handleAddRole} className="h-7 text-[9px] font-black uppercase rounded-sm border-primary/20 text-primary hover:bg-primary/5">
                      <Plus className="w-3 h-3 mr-1" /> ADD ROLE
                   </Button>
                </div>
                
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar no-scrollbar text-blue-950">
                  {roles.map((role, index) => (
                    <div key={index} className="grid grid-cols-7 gap-3 items-end bg-muted/5 p-2 rounded-sm border border-border/10">
                      <div className="col-span-4 space-y-1">
                        <Input 
                          value={role.type} 
                          onChange={e => handleRoleChange(index, "type", e.target.value)} 
                          placeholder="WORK ROLE" 
                          className="h-9 rounded-sm border-border bg-background text-[10px] font-black uppercase tracking-widest"
                        />
                      </div>
                      <div className="col-span-2 space-y-1">
                        <Input 
                          type="number" 
                          value={role.cost} 
                          onChange={e => handleRoleChange(index, "cost", parseFloat(e.target.value) || 0)} 
                          placeholder="RATE"
                          className="h-9 rounded-sm border-border bg-background text-[10px] font-black"
                        />
                      </div>
                      <div className="col-span-1 pb-1 text-center font-bold">
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveRole(index)} className="h-8 w-8 p-0 rounded-sm text-muted-foreground/40 hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-6 border-t border-border/40 gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-11 rounded-sm text-[10px] font-black uppercase tracking-widest opacity-60 hover:opacity-100 text-blue-950">
                 CANCEL
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-11 px-10 rounded-sm bg-primary text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingId ? "SAVE CHANGES" : "REGISTER SITE")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={(o) => !o && setDeleteConfirmId(null)}>
        <AlertDialogContent className="rounded-sm bg-card border-border/40">
           <AlertDialogHeader>
              <AlertDialogTitle className="text-blue-950 uppercase font-black text-lg tracking-tight">CONFIRM DELETION</AlertDialogTitle>
              <AlertDialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                 THIS ACTION IS PERMANENT. ALL HISTORICAL REPORTS ASSOCIATED WITH THIS SITE WILL REMAIN, BUT THE TEMPLATE WILL BE REMOVED.
              </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="h-10 rounded-sm text-[10px] font-black uppercase tracking-widest border-border text-blue-950">CANCEL</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="h-10 rounded-sm bg-destructive hover:bg-destructive/90 text-white text-[10px] font-black uppercase tracking-widest">
                 DELETE FOREVER
              </AlertDialogAction>
           </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
