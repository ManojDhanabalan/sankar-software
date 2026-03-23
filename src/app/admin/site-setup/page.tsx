"use client";

import { useState, useEffect } from "react";
import { getSites, createSite, deleteSite, updateSite } from "@/lib/firestore";
import type { Site, SiteRole } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Building2, Save, Loader2, IndianRupee, Pencil, X, CheckCircle2, CircleDashed, Filter } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function SiteSetupPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [siteName, setSiteName] = useState("");
  const [status, setStatus] = useState<"Ongoing" | "Completed">("Ongoing");
  const [roles, setRoles] = useState<SiteRole[]>([{ type: "M", cost: 0 }, { type: "MM", cost: 0 }, { type: "WM", cost: 0 }]);

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    setLoading(true);
    try {
      const data = await getSites();
      setSites(data);
    } catch (error) {
      console.error("Error loading sites", error);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setSiteName("");
    setStatus("Ongoing");
    setRoles([{ type: "M", cost: 0 }, { type: "MM", cost: 0 }, { type: "WM", cost: 0 }]);
  };

  const handleEdit = (site: Site) => {
    setEditingId(site.id);
    setSiteName(site.siteName);
    setStatus(site.status || "Ongoing");
    setRoles(site.roles?.length > 0 ? [...site.roles] : [{ type: "M", cost: 0 }, { type: "MM", cost: 0 }, { type: "WM", cost: 0 }]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddRole = () => setRoles([...roles, { type: "", cost: 0 }]);
  const handleRoleChange = (index: number, field: keyof SiteRole, value: string | number) => {
    const newRoles = [...roles];
    newRoles[index] = { ...newRoles[index], [field]: value };
    setRoles(newRoles);
  };
  const handleRemoveRole = (index: number) => setRoles(roles.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteName.trim()) { toast.error("Site Name required"); return; }
    setIsSubmitting(true);
    try {
      const payload = { siteName, status, roles: roles.filter(r => r.type.trim() && r.cost >= 0) };
      if (editingId) { await updateSite(editingId, payload); toast.success("Site Updated Successfully"); } 
      else { await createSite(payload); toast.success("Site Created Successfully"); }
      resetForm(); loadSites();
    } catch (error) { toast.error("Error saving site"); }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this site?")) return;
    try { await deleteSite(id); toast.success("Site Deleted"); loadSites(); } catch (error) { toast.error("Failed to delete"); }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tightest uppercase">
            Site <span className="text-blue-600">Infrastructure</span>
          </h1>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">
            Architectural configuration & role registry
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
          <Card className="border-0 shadow-2xl rounded-[3rem] overflow-hidden bg-white ring-1 ring-slate-100">
            <CardHeader className="bg-slate-900 border-0 p-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5 text-white">
                   <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-6">
                      <Building2 className="w-7 h-7" />
                   </div>
                   <div>
                      <CardTitle className="text-xl font-black tracking-tightest uppercase">
                        {editingId ? "Update" : "Finalize"}
                      </CardTitle>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Registry Protocol</p>
                   </div>
                </div>
                {editingId && (
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl" onClick={resetForm}>
                    <X className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Project Identifier</Label>
                  <Input 
                    placeholder="e.g. SKYLINE TOWERS" 
                    className="h-16 rounded-2xl border-slate-50 bg-slate-50/50 text-base font-black placeholder:text-slate-300 focus:ring-4 focus:ring-blue-100 transition-all uppercase px-6"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Lifecycle Status</Label>
                  <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                    <SelectTrigger className="h-16 rounded-2xl border-slate-50 bg-slate-50/50 font-black uppercase text-xs px-6 tracking-widest">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-white shadow-2xl p-2 bg-white ring-1 ring-slate-100">
                      <SelectItem value="Ongoing" className="font-black py-4 uppercase text-[10px] tracking-widest focus:bg-blue-50 focus:text-blue-600 rounded-xl">Ongoing Project</SelectItem>
                      <SelectItem value="Completed" className="font-black py-4 uppercase text-[10px] tracking-widest focus:bg-emerald-50 focus:text-emerald-600 rounded-xl">Completed Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-6 pt-10 border-t border-slate-50">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Resource Protocol</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={handleAddRole} className="h-8 rounded-xl text-[9px] font-black uppercase border border-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-all px-4">
                      ADD RESOURCE <Plus className="w-3.5 h-3.5 ml-2" />
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {roles.map((role, idx) => (
                      <div key={idx} className="flex items-center gap-3 animate-in fade-in duration-500 group">
                        <Input 
                          placeholder="ROLE" 
                          className="h-12 rounded-xl text-[10px] font-black border-slate-50 bg-white ring-1 ring-slate-100 uppercase w-28 text-center"
                          value={role.type}
                          onChange={(e) => handleRoleChange(idx, "type", e.target.value)}
                        />
                        <div className="relative flex-1">
                          <IndianRupee className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <Input 
                            type="number" 
                            placeholder="RATE" 
                            className="h-12 rounded-xl text-xs font-black pl-10 border-slate-50 bg-white ring-1 ring-slate-100"
                            value={role.cost || ""}
                            onChange={(e) => handleRoleChange(idx, "cost", Number(e.target.value))}
                          />
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 text-red-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          onClick={() => handleRemoveRole(idx)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full h-20 rounded-[2rem] bg-slate-900 hover:bg-black text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl hover:shadow-slate-300 transition-all transform active:scale-95 flex items-center justify-center gap-4" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Save className="w-6 h-6" />
                  )}
                  {editingId ? "Update Node" : "Submit Entity"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 xl:col-span-8">
          <div className="grid gap-8 sm:grid-cols-2">
            {sites.map((site) => (
              <Card key={site.id} className={cn("group border-0 shadow-lg hover:shadow-2xl transition-all duration-700 rounded-[3rem] overflow-hidden bg-white ring-1 ring-slate-100", editingId === site.id ? "ring-4 ring-blue-500 ring-offset-8" : "")}>
                <div className="p-10 space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                       <span className={cn("px-4 py-1.5 rounded-full text-[8.5px] font-black uppercase tracking-[0.2em] shadow-sm flex items-center w-fit gap-2", 
                         site.status === "Completed" ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100" : "bg-blue-50 text-blue-600 ring-1 ring-blue-100")}>
                        {site.status === "Completed" ? <CheckCircle2 className="w-3 h-3" /> : <CircleDashed className="w-3 h-3" />}
                        {site.status || "Ongoing"}
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tightest group-hover:text-blue-600 transition-colors leading-tight pt-2">{site.siteName}</h3>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                        <Filter className="w-3 h-3" /> Archive Created: {new Date(site.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {site.roles?.map((role, i) => (
                      <div key={i} className="px-4 py-2 bg-slate-50 text-[10px] font-black rounded-2xl border border-slate-100 uppercase tracking-tight flex items-center gap-3">
                        <span className="text-slate-400">{role.type}</span>
                        <span className="w-1 h-1 bg-slate-200 rounded-full" />
                        <span className="text-slate-900">₹{role.cost}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                     <div className="flex items-center gap-1.5 translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(site)} className="h-12 w-12 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl">
                          <Pencil className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(site.id)} className="h-12 w-12 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl">
                          <Trash2 className="w-5 h-5" />
                        </Button>
                     </div>
                     <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-700 transform group-hover:rotate-[360deg]">
                        <Building2 className="w-6 h-6" />
                     </div>
                  </div>
                </div>
                <div className={cn("h-2.5 w-full", site.status === "Completed" ? "bg-emerald-500" : "bg-blue-600")} />
              </Card>
            ))}
            {sites.length === 0 && (
              <div className="col-span-full p-40 text-center border-4 border-dashed border-slate-100 rounded-[4rem] text-slate-300 flex flex-col items-center justify-center space-y-8 group">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                   <Building2 className="w-10 h-10 opacity-30" />
                </div>
                <div>
                   <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Registry Empty</p>
                   <p className="text-[10px] uppercase font-black tracking-widest mt-2">Initialize project infrastructure</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
