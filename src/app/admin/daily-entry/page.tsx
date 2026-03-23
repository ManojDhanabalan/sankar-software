"use client";

import { useState, useEffect } from "react";
import { getSites, createDailyEntry } from "@/lib/firestore";
import type { Site, DailyWorker, DailyMaterial, DailyExpense } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Plus, Trash2, Save, Loader2, Calendar, Clock, 
  DollarSign, Package, Users, Building2, X, IndianRupee 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function DailyEntryPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState(format(new Date(), "hh:mm a"));

  const [workers, setWorkers] = useState<DailyWorker[]>([]);
  const [materials, setMaterials] = useState<DailyMaterial[]>([]);
  const [expenses, setExpenses] = useState<DailyExpense[]>([]);

  useEffect(() => {
    loadSites();
    const timer = setInterval(() => {
       setTime(format(new Date(), "hh:mm a"));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const loadSites = async () => {
    try {
      const data = await getSites();
      setSites(data);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const selectedSite = sites.find(s => s.id === selectedSiteId);

  const handleAddLabour = () => {
    setWorkers([...workers, {
      personName: "", type: "", shift: 1, amount: 0, paymentStatus: "Not Paid", paidAmount: 0, pendingAmount: 0
    }]);
  };

  const updateWorker = (index: number, field: keyof DailyWorker, value: any) => {
    const newWorkers = [...workers];
    let w = newWorkers[index];
    w = { ...w, [field]: value };
    
    const roleCost = selectedSite?.roles?.find(r => r.type === (field === 'type' ? value : w.type))?.cost || 0;
    const shift = field === 'shift' ? parseFloat(value) || 0 : w.shift;
    const amount = shift * roleCost;
    
    let paidAmount = field === 'paidAmount' ? parseInt(value) || 0 : w.paidAmount;
    let paymentStatus = field === 'paymentStatus' ? value : w.paymentStatus;

    if (paymentStatus === "Paid") paidAmount = amount;
    else if (paymentStatus === "Not Paid") paidAmount = 0;

    newWorkers[index] = { ...w, amount, paidAmount, pendingAmount: amount - paidAmount, paymentStatus };
    setWorkers(newWorkers);
  };

  const handleAddMaterial = () => setMaterials([...materials, { materialName: "", company: "", qty: 1, amount: 0 }]);
  const updateMaterial = (idx: number, field: keyof DailyMaterial, val: any) => {
    const list = [...materials];
    list[idx] = { ...list[idx], [field]: val };
    setMaterials(list);
  };

  const handleAddExpense = () => setExpenses([...expenses, { title: "", amount: 0 }]);
  const updateExpense = (idx: number, field: keyof DailyExpense, val: any) => {
    const list = [...expenses];
    list[idx] = { ...list[idx], [field]: val };
    setExpenses(list);
  };

  const totalLabour = workers.reduce((s, w) => s + w.amount, 0);
  const totalMaterials = materials.reduce((s, m) => s + m.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalAmount = totalLabour + totalMaterials + totalExpenses;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSiteId) return toast.error("Select a site");
    setSubmitting(true);
    try {
      await createDailyEntry({
        date, time, siteId: selectedSiteId,
        workers: workers.filter(w => w.personName.trim()),
        materials: materials.filter(m => m.materialName.trim()),
        expenses: expenses.filter(e => e.title.trim()),
        totalAmount
      });
      toast.success("Entry Saved!");
      setWorkers([]); setMaterials([]); setExpenses([]);
    } catch(err) { toast.error("Failed to save"); }
    setSubmitting(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="w-12 h-12 animate-spin text-maroon-600" /></div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-32 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tightest uppercase">
            Field <span className="text-maroon-600">Operations</span>
          </h1>
          <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest leading-none">
            Daily logs for labor, material & expense
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-maroon-200 transition-colors">
            <Calendar className="w-4 h-4 text-slate-400" />
            <Input type="date" className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0 font-bold text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <Clock className="w-4 h-4 text-slate-400" />
            <Input type="text" className="border-0 p-0 h-auto bg-transparent focus-visible:ring-0 font-bold text-sm w-24" value={time} readOnly />
          </div>
        </div>
      </div>

      <Card className="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden bg-slate-900 text-white transform hover:scale-[1.01] transition-transform duration-500">
        <CardContent className="p-8">
           <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 relative overflow-hidden rounded-2xl shadow-lg shadow-blue-900/40 bg-white p-0.5">
                  <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Project Deployment</p>
                   {selectedSite ? (
                     <div className="flex items-center gap-3 animate-in slide-in-from-left-4">
                        <h2 className="text-2xl font-black tracking-tightest uppercase text-white">{selectedSite.siteName}</h2>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedSiteId("")} className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl">
                          <X className="w-4 h-4" />
                        </Button>
                     </div>
                   ) : (
                     <h2 className="text-2xl font-black tracking-tightest uppercase text-slate-700 italic">Assign Work Site</h2>
                   )}
                </div>
              </div>
              
              {!selectedSite && (
                <Select onValueChange={(val: any) => setSelectedSiteId(val || "")}>
                  <SelectTrigger className="w-full sm:w-80 h-14 bg-white/5 border-white/10 rounded-2xl font-black uppercase text-xs tracking-widest focus:ring-maroon-500">
                    <SelectValue placeholder="DEPLOY TO SITE" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10 text-white rounded-2xl overflow-hidden">
                    {sites.map((site) => (
                      <SelectItem key={site.id} value={site.id} className="focus:bg-maroon-600 focus:text-white py-4 font-black uppercase text-xs tracking-widest border-b border-white/5 last:border-0 cursor-pointer">
                        {site.siteName} {site.status === "Completed" && "✓"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
           </div>
        </CardContent>
      </Card>

      {selectedSite && (
        <div className="grid gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <section className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tightest flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm shadow-indigo-100">
                   <Users className="w-4 h-4" />
                 </div>
                 Labour Force
              </h3>
              <Button onClick={handleAddLabour} className="h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[10px] tracking-widest px-6 shadow-xl shadow-indigo-100 transition-all active:scale-95">
                <Plus className="w-4 h-4 mr-2" /> Add Crew Member
              </Button>
            </div>
            
            <div className="grid gap-4">
              {workers.map((labour, idx) => (
                <Card key={idx} className="border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-[2rem] bg-white overflow-hidden group">
                  <div className="p-6 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-full md:w-auto flex-1 grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Full Name</Label>
                        <Input placeholder="OPERATIVE NAME" className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold uppercase text-xs focus:ring-indigo-100" value={labour.personName} onChange={(e) => updateWorker(idx, "personName", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Technical Role</Label>
                        <Select value={labour.type} onValueChange={(v) => updateWorker(idx, "type", v)}>
                          <SelectTrigger className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-black text-[10px] uppercase">
                            <SelectValue placeholder="ROLE" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-slate-100">
                            {selectedSite.roles.map((role) => (
                              <SelectItem key={role.type} value={role.type} className="font-black py-4 text-[10px] uppercase tracking-widest border-b border-slate-50 last:border-0 cursor-pointer">{role.type} (₹{role.cost})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Shift Count</Label>
                        <Input type="number" step="0.5" className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-black text-center" value={labour.shift} onChange={(e) => updateWorker(idx, "shift", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Ledger Status</Label>
                        <Select value={labour.paymentStatus} onValueChange={(v: any) => updateWorker(idx, "paymentStatus", v)}>
                          <SelectTrigger className={cn("h-12 rounded-xl border-slate-100 font-black text-[10px] uppercase transition-all shadow-sm ring-1 ring-inset px-4", 
                            labour.paymentStatus === "Paid" ? "bg-emerald-50 text-emerald-600 ring-emerald-100" : 
                            labour.paymentStatus === "Not Paid" ? "bg-red-50 text-red-600 ring-red-100" : "bg-amber-50 text-amber-600 ring-amber-100")}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-slate-100">
                            <SelectItem value="Paid" className="font-black text-[10px] uppercase text-emerald-600 py-4 cursor-pointer">FULL SETTLEMENT</SelectItem>
                            <SelectItem value="Not Paid" className="font-black text-[10px] uppercase text-red-600 py-4 cursor-pointer">NON-PAYMENT</SelectItem>
                            <SelectItem value="Partial" className="font-black text-[10px] uppercase text-amber-600 py-4 cursor-pointer">PARTIAL CREDIT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {labour.paymentStatus === "Partial" && (
                       <div className="w-full md:w-32 space-y-1.5 animate-in zoom-in-95">
                          <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Paid Val</Label>
                          <Input type="number" className="h-12 rounded-xl border-maroon-100 bg-maroon-50/30 font-black text-maroon-600" value={labour.paidAmount} onChange={(e) => updateWorker(idx, "paidAmount", e.target.value)} />
                       </div>
                    )}

                    <div className="flex flex-col items-center justify-center px-8 border-l border-slate-100 min-w-[140px] bg-slate-50/30 self-stretch">
                       <p className="text-[9px] font-black uppercase text-slate-400 mb-1 tracking-widest">Wages</p>
                       <p className="text-2xl font-black text-slate-900 tracking-tightest">₹{labour.amount}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setWorkers(workers.filter((_, i) => i !== idx))} className="h-12 w-12 text-slate-200 hover:text-red-600 hover:bg-red-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <div className="grid lg:grid-cols-2 gap-12">
            <section className="space-y-6">
               <div className="flex justify-between items-center px-2">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tightest flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm shadow-emerald-100">
                     <Package className="w-4 h-4" />
                   </div>
                   Material Logs
                </h3>
                <Button variant="outline" onClick={handleAddMaterial} className="h-10 rounded-xl border-emerald-100 text-emerald-600 hover:bg-emerald-50 font-black uppercase text-[10px] tracking-widest px-6 shadow-sm">
                  <Plus className="w-3.5 h-3.5 mr-2" /> Log Stock
                </Button>
              </div>
              <div className="space-y-4">
                {materials.map((mat, idx) => (
                  <Card key={idx} className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden p-6 space-y-6 group hover:shadow-lg transition-all duration-300">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-1.5">
                          <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Involved Material</Label>
                          <Input placeholder="e.g. CEMENT OPC" className="h-12 rounded-2xl border-slate-50 bg-slate-50/50 font-black uppercase text-[10px] tracking-widest" value={mat.materialName} onChange={(e) => updateMaterial(idx, "materialName", e.target.value)} />
                       </div>
                       <div className="space-y-1.5">
                          <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Supply Source</Label>
                          <Input placeholder="VENDOR NAME" className="h-12 rounded-2xl border-slate-50 bg-slate-50/50 font-black uppercase text-[10px] tracking-widest" value={mat.company} onChange={(e) => updateMaterial(idx, "company", e.target.value)} />
                       </div>
                       <div className="space-y-1.5">
                          <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Volume/Qty</Label>
                          <Input placeholder="QTY" className="h-12 rounded-2xl border-slate-50 bg-slate-50/50 font-black text-[10px] text-center" value={mat.qty} onChange={(e) => updateMaterial(idx, "qty", e.target.value)} />
                       </div>
                       <div className="space-y-1.5">
                          <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Market Cost</Label>
                          <div className="relative">
                             <IndianRupee className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                             <Input type="number" placeholder="₹ 0.00" className="h-12 rounded-2xl border-slate-50 bg-slate-50/50 pl-10 font-black text-xs text-emerald-600" value={mat.amount || ""} onChange={(e) => updateMaterial(idx, "amount", e.target.value)} />
                          </div>
                       </div>
                    </div>
                    <div className="flex justify-end pt-4 border-t border-slate-50">
                       <Button variant="ghost" size="sm" onClick={() => setMaterials(materials.filter((_, i) => i !== idx))} className="h-8 rounded-full text-[9px] font-black uppercase text-red-300 hover:text-red-600 hover:bg-red-50 px-4">Remove Entry</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            <section className="space-y-6">
               <div className="flex justify-between items-center px-2">
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tightest flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm shadow-amber-100">
                     <DollarSign className="w-4 h-4" />
                   </div>
                   Incidentals
                </h3>
                <Button variant="outline" onClick={handleAddExpense} className="h-10 rounded-xl border-amber-100 text-amber-600 hover:bg-amber-50 font-black uppercase text-[10px] tracking-widest px-6 shadow-sm">
                  <Plus className="w-3.5 h-3.5 mr-2" /> Log Misc
                </Button>
              </div>
              <div className="space-y-4">
                {expenses.map((exp, idx) => (
                  <Card key={idx} className="border-0 shadow-sm rounded-[1.5rem] bg-white overflow-hidden p-6 group hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-6">
                       <div className="flex-1 space-y-1.5">
                          <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Narrative</Label>
                          <Input placeholder="PETTY CASH/TRANSPORT" className="h-12 rounded-xl border-slate-50 bg-slate-50/50 font-black uppercase text-[10px] tracking-widest" value={exp.title} onChange={(e) => updateExpense(idx, "title", e.target.value)} />
                       </div>
                       <div className="w-40 space-y-1.5">
                          <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Financial Impact</Label>
                          <div className="relative">
                             <IndianRupee className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                             <Input type="number" placeholder="₹ 0.00" className="h-12 rounded-xl border-slate-50 bg-slate-50/50 pl-10 font-black text-xs text-amber-600" value={exp.amount || ""} onChange={(e) => updateExpense(idx, "amount", e.target.value)} />
                          </div>
                       </div>
                       <Button variant="ghost" size="icon" onClick={() => setExpenses(expenses.filter((_, i) => i !== idx))} className="h-12 w-12 text-slate-200 hover:text-red-500 rounded-xl self-end">
                          <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          <div className="pt-12">
             <Button onClick={handleSubmit} className="w-full h-24 rounded-[3rem] bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-[0.3em] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-all transform active:scale-95 group overflow-hidden relative" disabled={submitting}>
                {submitting ? (
                  <Loader2 className="w-10 h-10 animate-spin text-maroon-500" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-maroon-600/10 via-transparent to-maroon-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <Save className="w-8 h-8 mr-6 group-hover:rotate-12 transition-transform duration-500 text-maroon-500" />
                    Commit Daily Transaction
                  </>
                )}
             </Button>
          </div>
        </div>
      )}

      {selectedSite && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-slate-900 border-t border-white/5 text-white z-40 backdrop-blur-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.4)] animate-in slide-in-from-bottom-full duration-1000">
           <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row gap-6 justify-between items-center">
              <div className="flex items-center gap-12">
                <div className="hidden xl:block">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 italic">Protocol Target</p>
                   <p className="text-sm font-black text-maroon-400 uppercase tracking-tighter">{selectedSite.siteName}</p>
                </div>
                <div className="flex gap-8 sm:gap-14">
                  <div>
                    <p className="text-[9px] font-black text-maroon-400/60 uppercase leading-none mb-2 tracking-widest">Labour</p>
                    <p className="text-2xl font-black tracking-tightest">₹{totalLabour.toLocaleString()}</p>
                  </div>
                  <div className="h-10 w-[2px] bg-white/5 self-center" />
                  <div>
                    <p className="text-[9px] font-black text-emerald-400/60 uppercase leading-none mb-2 tracking-widest">Stock</p>
                    <p className="text-2xl font-black tracking-tightest">₹{totalMaterials.toLocaleString()}</p>
                  </div>
                   <div className="h-10 w-[2px] bg-white/5 self-center hidden sm:block" />
                  <div className="hidden sm:block">
                    <p className="text-[9px] font-black text-amber-400/60 uppercase leading-none mb-2 tracking-widest">Misc</p>
                    <p className="text-2xl font-black tracking-tightest">₹{totalExpenses.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="px-10 py-4 bg-gradient-to-br from-maroon-600 to-maroon-800 rounded-[2rem] shadow-2xl shadow-maroon-500/30 ring-1 ring-white/20 transform -translate-y-2 sm:translate-y-0">
                 <p className="text-[9px] font-black text-white/50 uppercase leading-none mb-2 tracking-[0.2em] text-center">Operational Exposure</p>
                 <p className="text-3xl font-black tracking-tightest">₹{totalAmount.toLocaleString('en-IN')}</p>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
