"use client";

import { useState, useEffect } from "react";
import { getSites, createDailyEntry, updateDailyEntry, getDailyEntries } from "@/lib/firestore";
import type { Site, DailyWorker, DailyMaterial, DailyExpense, DailyMachinery } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Trash2, Loader2, Calendar, ArrowLeft, Users, Package,
  Wallet, Receipt, Search, Building2, Truck
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type WorkerGroup = {
  id: string;
  personName: string;
  roles: DailyWorker[];
};

export default function DailyEntryPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd")); 
  const [time, setTime] = useState(format(new Date(), "hh:mm a"));

  const [workerGroups, setWorkerGroups] = useState<WorkerGroup[]>([]);
  const [materials, setMaterials] = useState<DailyMaterial[]>([]);
  const [machinery, setMachinery] = useState<DailyMachinery[]>([]);
  const [expenses, setExpenses] = useState<DailyExpense[]>([]);
  const [workerNames, setWorkerNames] = useState<string[]>([]);
  const [roleNames, setRoleNames] = useState<string[]>([]);
  const [materialNames, setMaterialNames] = useState<string[]>([]);
  const [machineryNames, setMachineryNames] = useState<string[]>([]);
  const [machineryOperators, setMachineryOperators] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sitesData, allEntries] = await Promise.all([
        getSites(),
        getDailyEntries(),
      ]);
      setSites(sitesData || []);

      const wNames = new Set<string>();
      const rNames = new Set<string>();
      const matNames = new Set<string>();
      const machNames = new Set<string>();
      const machOps = new Set<string>();

      allEntries.forEach(e => {
        e.workers?.forEach(w => {
          if (w.personName) wNames.add(w.personName.trim().toLowerCase());
          if (w.type && w.type !== 'RW') rNames.add(w.type.trim().toUpperCase());
        });
        e.materials?.forEach(m => {
          if (m.materialName) matNames.add(m.materialName.trim().toLowerCase());
        });
        e.machinery?.forEach(m => {
          if (m.machineryName) machNames.add(m.machineryName.trim().toLowerCase());
          if (m.personName) machOps.add(m.personName.trim().toLowerCase());
        });
      });
      setWorkerNames(Array.from(wNames).sort());
      setRoleNames(Array.from(rNames).sort());
      setMaterialNames(Array.from(matNames).sort());
      setMachineryNames(Array.from(machNames).sort());
      setMachineryOperators(Array.from(machOps).sort());

      if (editId && allEntries.length > 0) {
        const entry = allEntries.find((e) => e.id === editId);
        if (entry) {
          setSelectedSiteId(entry.siteId || "");
          setDate(entry.date || format(new Date(), "yyyy-MM-dd"));
          setTime(entry.time || format(new Date(), "hh:mm a"));
          
          const groups: WorkerGroup[] = [];
          (entry.workers || []).forEach(w => {
            const existing = groups.find(g => g.personName === w.personName);
            if (existing) {
              existing.roles.push({ ...w });
            } else {
              groups.push({ id: Math.random().toString(), personName: w.personName, roles: [{ ...w }] });
            }
          });
          setWorkerGroups(groups);
          
          setMaterials(entry.materials || []);
          setMachinery(entry.machinery || []);
          setExpenses(entry.expenses || []);
        }
      }
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const selectedSite = sites.find(s => s.id === selectedSiteId);

  const handleAddWorkerGroup = () => {
    setWorkerGroups([...workerGroups, {
      id: Math.random().toString(),
      personName: "",
      roles: []
    }]);
  };

  const updateWorkerGroupName = (gIdx: number, val: string) => {
    const list = [...workerGroups];
    list[gIdx].personName = val;
    list[gIdx].roles.forEach(r => r.personName = val);
    setWorkerGroups(list);
  };

  const evaluateRoleAmount = (w: DailyWorker, manualAmount?: number) => {
    if (manualAmount !== undefined) {
      w.amount = manualAmount;
    } else {
      const siteCost = Number(selectedSite?.roles?.find(r => r.type.toUpperCase() === w.type.toUpperCase())?.cost) || 0;
      const roleCost = w.rate ? Number(w.rate) : siteCost;
      let amount = 0;
      if (w.type === 'RW') amount = (Number(w.qty) || 0) * (Number(w.rate) || 0);
      else amount = (Number(w.shift) || 0) * roleCost;
      w.amount = amount;
    }

    if (w.paymentStatus === "Paid") w.paidAmount = w.amount;
    else w.paidAmount = 0;

    w.pendingAmount = w.amount - (Number(w.paidAmount) || 0);
  };

  const handleRoleToggle = (gIdx: number, roleType: string, isChecked: boolean) => {
    const list = [...workerGroups];
    const group = list[gIdx];
    if (isChecked) {
      // Auto-fetch rate from site's configured role cost
      const siteRoleCost = selectedSite?.roles?.find(r => r.type.toUpperCase() === roleType.toUpperCase())?.cost || 0;
      const newRole: DailyWorker = {
        personName: group.personName,
        type: roleType,
        shift: 1,
        qty: 0,
        rate: siteRoleCost,  // pre-filled from site config
        amount: 0,
        paymentStatus: "Not Paid",
        paidAmount: 0,
        pendingAmount: 0,
        ...(roleType === 'RW' ? { labourCount: 1 } : {})
      };
      evaluateRoleAmount(newRole);
      group.roles.push(newRole);
    } else {
      group.roles = group.roles.filter(r => r.type !== roleType);
    }
    setWorkerGroups(list);
  };

  const updateRole = (gIdx: number, rIdx: number, field: keyof DailyWorker, value: any) => {
    const list = [...workerGroups];
    const w = list[gIdx].roles[rIdx];
    (w as any)[field] = value;
    if (field === "amount") {
      evaluateRoleAmount(w, Number(value) || 0);
    } else {
      evaluateRoleAmount(w);
    }
    setWorkerGroups(list);
  };

  const removeWorkerGroup = (gIdx: number) => {
    setWorkerGroups(workerGroups.filter((_, i) => i !== gIdx));
  };

  const handleAddMaterial = () => {
    setMaterials([...materials, { materialName: "", company: "", qty: 1, marketCost: 0, amount: 0, paymentStatus: "Not Paid", paidAmount: 0, pendingAmount: 0 }]);
  };

  const updateMaterial = (idx: number, field: keyof DailyMaterial, val: any) => {
    const list = [...materials];
    const m = { ...list[idx], [field]: (field === 'materialName' || field === 'company') ? val : (Number(val) || 0) };
    if (field !== "amount") {
      m.amount = (Number(m.qty) || 0) * (Number(m.marketCost) || 0);
    }
    list[idx] = m;
    setMaterials(list);
  };

  const handleAddMachinery = () => {
    setMachinery([...machinery, { personName: "", machineryName: "", qty: 1, cost: 0, bata: 0, amount: 0, paymentStatus: "Not Paid", paidAmount: 0, pendingAmount: 0 }]);
  };

  const updateMachinery = (idx: number, field: keyof DailyMachinery, val: any) => {
    const list = [...machinery];
    const m = { ...list[idx], [field]: (field === 'personName' || field === 'machineryName') ? val : (Number(val) || 0) };
    if (field !== "amount") {
      m.amount = (Number(m.qty) || 0) * (Number(m.cost) || 0) + (Number(m.bata) || 0);
    }
    list[idx] = m;
    setMachinery(list);
  };

  const handleAddExpense = () => {
    setExpenses([...expenses, { title: "", amount: 0, paymentStatus: "Not Paid", paidAmount: 0, pendingAmount: 0 }]);
  };

  const updateExpense = (idx: number, field: keyof DailyExpense, val: any) => {
    const list = [...expenses];
    list[idx] = { ...list[idx], [field]: field === 'title' ? val : (Number(val) || 0) };
    setExpenses(list);
  };

  const totalLabour    = workerGroups.reduce((acc, g) => acc + g.roles.reduce((s, r) => s + (Number(r.amount) || 0), 0), 0);
  const totalMaterials = materials.reduce((s, m) => s + (Number(m.amount) || 0), 0);
  const totalMachinery = machinery.reduce((s, m) => s + (Number(m.amount) || 0), 0);
  const totalExpenses  = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalAmount    = totalLabour + totalMaterials + totalMachinery + totalExpenses;

  const handleSubmit = async () => {
    if (!selectedSiteId) return toast.error("Select a site first");
    if (!date) return toast.error("Select an entry date");
    setSubmitting(true);
    const flatWorkers = workerGroups.flatMap(g => g.roles.map(r => {
      const payload: any = { ...r, personName: g.personName.trim().toLowerCase() };
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
      return payload as DailyWorker;
    })).filter(w => w.personName);

    const formattedMaterials = materials.map(m => ({ 
      ...m, 
      materialName: m.materialName.trim().toLowerCase(), 
      company: m.company.trim().toLowerCase(),
      paymentStatus: m.paymentStatus || "Not Paid",
      paidAmount: Number(m.paidAmount) || 0,
      pendingAmount: m.pendingAmount ?? (Number(m.amount) || 0)
    })).filter(m => m.materialName);

    const formattedMachinery = machinery.map(m => ({ 
      ...m, 
      machineryName: m.machineryName.trim().toLowerCase(), 
      personName: m.personName.trim().toLowerCase(),
      paymentStatus: m.paymentStatus || "Not Paid",
      paidAmount: Number(m.paidAmount) || 0,
      pendingAmount: m.pendingAmount ?? (Number(m.amount) || 0)
    })).filter(m => m.machineryName);

    const formattedExpenses = expenses.map(e => ({ 
      ...e, 
      title: e.title.trim().toLowerCase(),
      paymentStatus: e.paymentStatus || "Not Paid",
      paidAmount: Number(e.paidAmount) || 0,
      pendingAmount: e.pendingAmount ?? (Number(e.amount) || 0)
    })).filter(e => e.title);

    try {
      if (editId) {
        await updateDailyEntry(editId, {
          date, time, siteId: selectedSiteId,
          workers: flatWorkers,
          materials: formattedMaterials,
          machinery: formattedMachinery,
          expenses: formattedExpenses,
          totalAmount
        });
        toast.success("Entry updated successfully");
      } else {
        await createDailyEntry({
          date, time, siteId: selectedSiteId,
          workers: flatWorkers,
          materials: formattedMaterials,
          machinery: formattedMachinery,
          expenses: formattedExpenses,
          totalAmount
        });
        toast.success("Entry saved permanently");
        setWorkerGroups([]); setMaterials([]); setMachinery([]); setExpenses([]);
        setSelectedSiteId("");
      }
      router.push("/admin/reports");
    } catch(err) { 
      toast.error(editId ? "Failed to update entry" : "Failed to save entry"); 
    }
    setSubmitting(false);
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-[#F1F2F4]"><Loader2 className="w-8 h-8 animate-spin text-[#1A1A1A]" /></div>;

  return (
    <div className="min-h-screen bg-[#F1F2F4] text-[#1A1A1A] font-sans antialiased pb-20">
      
      {/* Header */}
      <div className="max-w-[1080px] mx-auto pt-6 px-4 sm:px-6 mb-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/reports" className="p-1.5 hover:bg-black/5 rounded-md text-[#4D4D4D] transition-colors -ml-1.5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-[22px] font-semibold text-[#1A1A1A]">{editId ? "Edit Daily Entry" : "Create Daily Entry"}</h1>
        </div>
        <div className="w-full sm:w-[320px] ml-0 sm:ml-[34px]">
           <Select value={selectedSiteId} onValueChange={(val) => setSelectedSiteId(val || "")}>
             <SelectTrigger className="h-10 text-[14px] border-[#D9D9D9] bg-white rounded-lg shadow-sm w-full font-medium text-[#1A1A1A]">
               <SelectValue placeholder="Select Project Site">
                 {selectedSite ? selectedSite.siteName : "Select Project Site"}
               </SelectValue>
             </SelectTrigger>
             <SelectContent>
               {sites.map(s => <SelectItem key={s.id} value={s.id} className="text-[13px]">{s.siteName}</SelectItem>)}
             </SelectContent>
           </Select>
        </div>
      </div>

      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6">

          {/* LABOUR CARD */}
          <Card className="rounded-xl border-[#E5E5E5] shadow-[0_1px_2px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
            <div className="px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2">
                 <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Labour</h2>
                 <span className="text-[13px] text-[#666]">({workerGroups.reduce((acc, g) => acc + g.roles.length, 0)} roles reserved)</span>
              </div>
              <button onClick={handleAddWorkerGroup} className="text-[13px] font-medium text-[#2C6ECB] hover:underline">Add custom worker</button>
            </div>
            
            <div className="flex flex-col bg-[#F9F9F9]">
              {workerGroups.map((group, gIdx) => {
                const groupTotal = group.roles.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
                return (
                <div key={group.id} className="p-4 sm:p-5 flex flex-col gap-4 border-b border-[#E5E5E5] last:border-0 bg-white m-3 sm:m-4 rounded-xl shadow-sm border border-[#E5E5E5]">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E5]">
                      <Input 
                        list="worker-names"
                        placeholder="Worker Name" 
                        className="h-9 w-full sm:w-[240px] text-[15px] font-bold text-[#1A1A1A] placeholder:text-[#999] bg-[#F5F5F5] border-transparent focus-visible:border-[#D9D9D9] shadow-none" 
                        value={group.personName} 
                        onChange={(e) => updateWorkerGroupName(gIdx, e.target.value)} 
                      />
                      <div className="flex items-center gap-3">
                         <DropdownMenu>
                            <DropdownMenuTrigger>
                               <div className="h-8 px-3 inline-flex items-center justify-center rounded-md border border-[#E5E5E5] bg-white text-[12px] font-semibold text-[#1A1A1A] hover:bg-[#F5F5F5] focus:outline-none focus:ring-2 focus:ring-[#D9D9D9] transition-colors cursor-pointer">
                                  + Select Roles
                               </div>
                            </DropdownMenuTrigger>
                             <DropdownMenuContent align="end" className="w-48 bg-white border-[#E5E5E5] shadow-lg max-h-[300px] overflow-y-auto">
                                {(() => {
                                   const siteRoles = selectedSite?.roles || [];
                                   const siteRoleTypes = siteRoles.map(r => r.type.toUpperCase());
                                    const additionalRoles = roleNames.filter(r => !siteRoleTypes.includes(r.toUpperCase()) && r.toUpperCase() !== "LABOUR");
                                   const allDropdownRoles = [
                                     ...siteRoles,
                                     ...additionalRoles.map(r => ({ type: r, cost: 0 })),
                                     { type: "RW", cost: 0 }
                                   ];
                                   
                                   const uniqueDropdownRoles = Array.from(new Map(allDropdownRoles.map(r => [r.type.toUpperCase(), r])).values());

                                   return uniqueDropdownRoles.map(r => {
                                      const isSelected = group.roles.some(gr => gr.type.toUpperCase() === r.type.toUpperCase());
                                      return (
                                         <DropdownMenuCheckboxItem 
                                            key={r.type} 
                                            checked={isSelected}
                                            onCheckedChange={(checked) => handleRoleToggle(gIdx, r.type, checked)}
                                            className="text-[12px] font-medium text-[#1A1A1A] cursor-pointer"
                                         >
                                             {r.type} {(r as any).cost > 0 ? `— ₹${(r as any).cost}` : ""} {r.type === "RW" ? "(Unit)" : ""}
                                         </DropdownMenuCheckboxItem>
                                      )
                                   });
                                })()}
                             </DropdownMenuContent>
                         </DropdownMenu>
                         <button onClick={() => removeWorkerGroup(gIdx)} className="text-[#999] hover:text-red-500 transition-colors p-1">
                           <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                   </div>

                   {/* Roles List for this Group */}
                   {group.roles.length > 0 && (
                     <div className="flex flex-col gap-3 pt-1">
                       <div className="grid grid-cols-[1fr_80px_80px] gap-4 text-[12px] font-medium text-[#666] px-1">
                           <div>Role Tasks</div>
                           <div className="text-center">Shift/Qty</div>
                           <div className="text-right">Amount</div>
                       </div>
                       {group.roles.map((worker, rIdx) => (
                         <div key={rIdx} className="grid grid-cols-[1fr_80px_80px] gap-4 items-center px-1">
                            <div className="flex flex-col gap-1">
                               <span className="text-[13px] font-bold text-[#1A1A1A]">{worker.type}</span>
                                <div className="flex gap-2 items-center">
                                  {worker.type === 'RW' ? (
                                    <>
                                      <Input 
                                        placeholder="Rate" type="number" 
                                        className="h-7 w-16 text-[12px] border-[#E5E5E5] px-2 shadow-sm rounded bg-white text-[#4D4D4D]" 
                                        value={worker.rate || ""} 
                                        onChange={(e) => updateRole(gIdx, rIdx, "rate", e.target.value)}
                                      />
                                      <Input 
                                        placeholder="Labour" type="number" 
                                        className="h-7 w-[65px] text-[12px] border-[#E5E5E5] px-2 shadow-sm rounded bg-white text-[#4D4D4D]" 
                                        title="Labour Count"
                                        value={worker.labourCount || ""} 
                                        onChange={(e) => updateRole(gIdx, rIdx, "labourCount", e.target.value)}
                                      />
                                      <span className="text-[11px] text-[#666]">Unit</span>
                                    </>
                                  ) : (
                                    <>
                                      <Input 
                                        placeholder="Rate" type="number" 
                                        className="h-7 w-20 text-[12px] border-[#E5E5E5] px-2 shadow-sm rounded bg-white text-[#4D4D4D]" 
                                        value={worker.rate || ""} 
                                        onChange={(e) => updateRole(gIdx, rIdx, "rate", e.target.value)}
                                      />
                                      <span className="text-[11px] text-[#666] whitespace-nowrap">
                                          Std: ₹{selectedSite?.roles?.find(r => r.type.toUpperCase() === worker.type.toUpperCase())?.cost || 0}
                                      </span>
                                    </>
                                  )}
                                </div>
                            </div>
                            
                            <Input 
                              type="number" step="0.5" 
                              className="h-8 text-[13px] text-center border-[#E5E5E5] shadow-sm rounded-md bg-white" 
                              value={worker.type === 'RW' ? worker.qty : worker.shift || ""} 
                              onChange={(e) => updateRole(gIdx, rIdx, worker.type === 'RW' ? "qty" : "shift", e.target.value)}
                            />

                            <Input 
                              type="number"
                              className="h-8 w-24 text-[14px] font-semibold text-right border-[#D9D9D9] p-1 shadow-sm rounded bg-white text-[#1A1A1A]" 
                              value={worker.amount || ""} 
                              onChange={(e) => updateRole(gIdx, rIdx, "amount", e.target.value)}
                            />
                         </div>
                       ))}
                       <div className="pt-3 flex justify-between items-center border-t border-[#E5E5E5] mt-2">
                           <span className="text-[12px] font-semibold text-[#666]">Total for {group.personName || "this worker"}</span>
                           <span className="text-[16px] font-bold text-emerald-600">₹{(groupTotal || 0).toLocaleString('en-IN')}</span>
                       </div>
                     </div>
                   )}
                   {group.roles.length === 0 && (
                     <div className="text-center text-[12px] text-[#999] italic py-2">
                        Select roles from the dropdown above
                     </div>
                   )}
                </div>
              )})}
              {workerGroups.length === 0 && (
                <div className="p-8 text-center text-[13px] text-[#666] bg-white">
                   No workers added yet.
                </div>
              )}
            </div>
          </Card>

          {/* MATERIAL CARD */}
          <Card className="rounded-xl border-[#E5E5E5] shadow-[0_1px_2px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
            <div className="px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2">
                 <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Materials</h2>
                 <span className="text-[13px] text-[#666]">({materials.length} records)</span>
              </div>
              <button onClick={handleAddMaterial} className="text-[13px] font-medium text-[#2C6ECB] hover:underline">Add material</button>
            </div>
            
            <div className="px-4 sm:px-5 py-2 grid grid-cols-[1fr_80px_80px_32px] gap-4 text-[13px] font-medium text-[#666] border-b border-[#E5E5E5] bg-[#FAFAFA]">
              <div>Products</div>
              <div className="text-center">Quantity</div>
              <div className="text-right">Total</div>
              <div></div>
            </div>

            <div className="flex flex-col bg-white">
              {materials.map((mat, idx) => (
                <div key={idx} className="p-4 sm:p-5 flex items-start gap-4 sm:gap-5 border-b border-[#E5E5E5] last:border-0 hover:bg-[#FAFAFA] transition-colors group">
                  <div className="flex-1 min-w-0">
                     <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                           <Input 
                             list="material-names"
                             placeholder="Material Name" 
                             className="h-8 text-[14px] border-transparent hover:border-[#E5E5E5] focus-visible:border-[#D9D9D9] shadow-none bg-transparent px-2 -ml-2 font-medium text-[#1A1A1A] placeholder:text-[#999] transition-all" 
                             value={mat.materialName} 
                             onChange={(e) => updateMaterial(idx, "materialName", e.target.value)} 
                           />
                           <div className="flex items-center gap-2">
                             <Input 
                               placeholder="Vendor" 
                               className="h-7 w-[140px] text-[12px] border-[#D9D9D9] px-2 shadow-sm rounded bg-white text-[#4D4D4D]" 
                               value={mat.company} 
                               onChange={(e) => updateMaterial(idx, "company", e.target.value)}
                             />
                             <Input 
                               placeholder="Rate" type="number" 
                               className="h-7 w-24 text-[12px] border-[#D9D9D9] px-2 shadow-sm rounded bg-white text-[#4D4D4D]" 
                               value={mat.marketCost || ""} 
                               onChange={(e) => updateMaterial(idx, "marketCost", e.target.value)}
                             />
                           </div>
                           <div className="text-[12px] text-[#666] px-0.5 truncate max-w-[200px]">
                              {mat.company ? `${mat.company}` : "No vendor specified"}
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-[80px_80px_32px] gap-4 items-center sm:items-start w-full sm:w-auto">
                           <Input 
                             type="number" 
                             className="h-8 text-[13px] text-center border-[#D9D9D9] shadow-sm rounded-md bg-white" 
                             value={mat.qty || ""} 
                             onChange={(e) => updateMaterial(idx, "qty", e.target.value)}
                           />
                           <Input 
                             type="number"
                             className="h-8 w-24 text-[14px] font-semibold text-right border-[#D9D9D9] p-1 shadow-sm rounded bg-white text-[#1A1A1A]" 
                             value={mat.amount || ""} 
                             onChange={(e) => updateMaterial(idx, "amount", e.target.value)}
                           />
                           <div className="pt-1 text-right">
                             <button onClick={() => setMaterials(materials.filter((_, i) => i !== idx))} className="text-[#999] hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100 focus:opacity-100">
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              ))}
              {materials.length === 0 && (
                <div className="p-8 text-center text-[13px] text-[#666]">
                   No items selected yet.
                </div>
              )}
            </div>
          </Card>

          {/* MACHINERY CARD */}
          <Card className="rounded-xl border-[#E5E5E5] shadow-[0_1px_2px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
            <div className="px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2">
                 <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Machinery</h2>
                 <span className="text-[13px] text-[#666]">({machinery.length} records)</span>
              </div>
              <button onClick={handleAddMachinery} className="text-[13px] font-medium text-[#2C6ECB] hover:underline">Add machinery</button>
            </div>
            
            <div className="px-4 sm:px-5 py-2 grid grid-cols-[1fr_80px_80px_80px_32px] gap-4 text-[13px] font-medium text-[#666] border-b border-[#E5E5E5] bg-[#FAFAFA]">
              <div>Equipment</div>
              <div className="text-center">Hrs/Qty</div>
              <div className="text-center">Bata</div>
              <div className="text-right">Total</div>
              <div></div>
            </div>

            <div className="flex flex-col bg-white">
              {machinery.map((mach, idx) => (
                <div key={idx} className="p-4 sm:p-5 flex items-start gap-4 sm:gap-5 border-b border-[#E5E5E5] last:border-0 hover:bg-[#FAFAFA] transition-colors group">
                  <div className="flex-1 min-w-0">
                     <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                           <Input 
                             list="machinery-names"
                             placeholder="Machinery Name" 
                             className="h-8 text-[14px] border-transparent hover:border-[#E5E5E5] focus-visible:border-[#D9D9D9] shadow-none bg-transparent px-2 -ml-2 font-medium text-[#1A1A1A] placeholder:text-[#999] transition-all" 
                             value={mach.machineryName} 
                             onChange={(e) => updateMachinery(idx, "machineryName", e.target.value)} 
                           />
                           <div className="flex items-center gap-2">
                             <Input 
                               list="operator-names"
                               placeholder="Operator / Owner" 
                               className="h-7 w-[140px] text-[12px] border-[#D9D9D9] px-2 shadow-sm rounded bg-white text-[#4D4D4D]" 
                               value={mach.personName} 
                               onChange={(e) => updateMachinery(idx, "personName", e.target.value)}
                             />
                             <Input 
                               placeholder="Rate/hr" type="number" 
                               className="h-7 w-24 text-[12px] border-[#D9D9D9] px-2 shadow-sm rounded bg-white text-[#4D4D4D]" 
                               value={mach.cost || ""} 
                               onChange={(e) => updateMachinery(idx, "cost", e.target.value)}
                             />
                           </div>
                           <div className="text-[12px] text-[#666] px-0.5 truncate max-w-[200px]">
                              {mach.personName ? `${mach.personName}` : "No details specified"}
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-[80px_80px_80px_32px] gap-4 items-center sm:items-start w-full sm:w-auto">
                           <Input 
                             type="number" step="0.5"
                             className="h-8 text-[13px] text-center border-[#D9D9D9] shadow-sm rounded-md bg-white" 
                             value={mach.qty || ""} 
                             onChange={(e) => updateMachinery(idx, "qty", e.target.value)}
                           />
                           <Input 
                             type="number"
                             className="h-8 text-[13px] text-center border-[#D9D9D9] shadow-sm rounded-md bg-white" 
                             value={mach.bata || ""} 
                             onChange={(e) => updateMachinery(idx, "bata", e.target.value)}
                             placeholder="Bata"
                           />
                           <Input 
                             type="number" 
                             className="h-8 w-24 text-[14px] font-semibold text-right border-[#D9D9D9] p-1 shadow-sm rounded bg-white text-[#1A1A1A]" 
                             value={mach.amount || ""} 
                             onChange={(e) => updateMachinery(idx, "amount", e.target.value)}
                           />
                           <div className="pt-1 text-right">
                             <button onClick={() => setMachinery(machinery.filter((_, i) => i !== idx))} className="text-[#999] hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100 focus:opacity-100">
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              ))}
              {machinery.length === 0 && (
                <div className="p-8 text-center text-[13px] text-[#666]">
                   No items selected yet.
                </div>
              )}
            </div>
          </Card>

          {/* MISC EXPENSES CARD */}
          <Card className="rounded-xl border-[#E5E5E5] shadow-[0_1px_2px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
            <div className="px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2">
                 <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Expenses</h2>
              </div>
              <button onClick={handleAddExpense} className="text-[13px] font-medium text-[#2C6ECB] hover:underline">Add custom expense</button>
            </div>
            
            <div className="px-4 sm:px-5 py-2 grid grid-cols-[1fr_80px_32px] gap-4 text-[13px] font-medium text-[#666] border-b border-[#E5E5E5] bg-[#FAFAFA]">
              <div>Description</div>
              <div className="text-right">Total</div>
              <div></div>
            </div>

            <div className="flex flex-col bg-white">
              {expenses.map((exp, idx) => (
                <div key={idx} className="p-4 sm:p-5 flex items-start gap-4 sm:gap-5 border-b border-[#E5E5E5] last:border-0 hover:bg-[#FAFAFA] transition-colors group">
                  <div className="flex-1 min-w-0">
                     <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                           <Input 
                             placeholder="Expense description" 
                             className="h-8 text-[14px] border-transparent hover:border-[#E5E5E5] focus-visible:border-[#D9D9D9] shadow-none bg-transparent px-2 -ml-2 font-medium text-[#1A1A1A] placeholder:text-[#999] transition-all" 
                             value={exp.title} 
                             onChange={(e) => updateExpense(idx, "title", e.target.value)} 
                           />
                           <div className="text-[12px] text-[#666] px-0.5">
                              Miscellaneous site expense
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-[120px_32px] gap-4 items-center sm:items-start w-full sm:w-auto">
                           <Input 
                             type="number" 
                             className="h-8 text-[13px] text-right border-[#D9D9D9] shadow-sm rounded-md bg-white pr-3" 
                             value={exp.amount || ""} 
                             onChange={(e) => updateExpense(idx, "amount", e.target.value)}
                           />
                           <div className="pt-1 text-right">
                             <button onClick={() => setExpenses(expenses.filter((_, i) => i !== idx))} className="text-[#999] hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100 focus:opacity-100">
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>
              ))}
              {expenses.length === 0 && (
                <div className="p-8 text-center text-[13px] text-[#666]">
                   No expenses added.
                </div>
              )}
            </div>
          </Card>

          {/* PAYMENT SUMMARY CARD */}
          <Card className="rounded-xl border-[#E5E5E5] shadow-[0_1px_2px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
            <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-[#E5E5E5] flex items-center gap-2">
              <h2 className="text-[15px] font-semibold text-[#1A1A1A]">Payment</h2>
              <Receipt className="w-4 h-4 text-[#999] ml-1" />
            </div>
            <div className="p-4 sm:p-5 space-y-3">
              <div className="flex justify-between items-center text-[13px]">
                <div className="text-[#4D4D4D]">Labour record count</div>
                <div className="text-[#4D4D4D]">{workerGroups.reduce((acc, g) => acc + g.roles.length, 0)} items</div>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <div className="text-[#4D4D4D]">Material record count</div>
                <div className="text-[#4D4D4D]">{materials.length} items</div>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <div className="text-[#4D4D4D]">Machinery record count</div>
                <div className="text-[#4D4D4D]">{machinery.length} items</div>
              </div>
              
              <div className="pt-3 flex justify-between items-center text-[13px]">
                <span className="text-[#4D4D4D]">Labour subtotal</span>
                <span className="text-[#1A1A1A]">₹{(totalLabour || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-[#4D4D4D]">Materials subtotal</span>
                <span className="text-[#1A1A1A]">₹{(totalMaterials || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-[#4D4D4D]">Machinery subtotal</span>
                <span className="text-[#1A1A1A]">₹{(totalMachinery || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-[#4D4D4D]">Expenses subtotal</span>
                <span className="text-[#1A1A1A]">₹{(totalExpenses || 0).toLocaleString('en-IN')}</span>
              </div>
              
              <div className="pt-4 mt-1 border-t border-[#E5E5E5] flex justify-between items-center mb-5">
                <span className="text-[15px] font-semibold text-[#1A1A1A]">Total</span>
                <span className="text-[15px] font-semibold text-[#1A1A1A]">₹{(totalAmount || 0).toLocaleString('en-IN')}</span>
              </div>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting || !selectedSiteId} 
                className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white h-11 rounded-lg text-[14px] font-medium shadow-md transition-all"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
                {editId ? "Update Entry" : "Create"}
              </Button>
            </div>
          </Card>

          <datalist id="worker-names">
            {workerNames.map(name => <option key={name} value={name} />)}
          </datalist>
          <datalist id="material-names">
            {materialNames.map(name => <option key={name} value={name} />)}
          </datalist>
          <datalist id="machinery-names">
            {machineryNames.map(name => <option key={name} value={name} />)}
          </datalist>
          <datalist id="operator-names">
            {machineryOperators.map(name => <option key={name} value={name} />)}
          </datalist>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* Notes (Date) */}
          <Card className="rounded-xl border-[#E5E5E5] shadow-[0_1px_2px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E5E5] flex justify-between items-center">
               <h2 className="text-[14px] font-semibold text-[#1A1A1A]">Notes</h2>
            </div>
            <div className="p-4 space-y-3">
               <div className="text-[13px] text-[#666]">Entry Date</div>
               <Input 
                 type="date" 
                 value={date} 
                 onChange={e => setDate(e.target.value)} 
                 className="h-8 text-[13px] border-[#D9D9D9] shadow-sm rounded-md w-full text-[#1A1A1A]" 
               />
               <div className="text-[13px] text-[#666] pt-1 border-t border-[#E5E5E5] mt-3">
                 System time is {time}
               </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
