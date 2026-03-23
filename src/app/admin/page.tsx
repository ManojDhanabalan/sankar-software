"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/firestore";
import type { DashboardStats } from "@/lib/types";
import { Building2, Users, Package, IndianRupee } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 w-20 bg-slate-200 rounded" />
                  <div className="h-10 w-32 bg-slate-200 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 lg:p-12 text-white shadow-2xl">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-maroon-600/20 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-maroon-800/10 rounded-full blur-3xl -ml-20 -mb-20" />
        
        <div className="relative z-10">
          <h2 className="text-2xl lg:text-4xl font-black tracking-tightest">
            Welcome back, <span className="text-maroon-400">Chief!</span> 👋
          </h2>
          <p className="text-slate-400 mt-2 text-sm sm:text-base font-bold uppercase tracking-wider">
            Consolidated Site Analytics & Payroll Overview
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
              <p className="text-[10px] font-black text-slate-500 uppercase">Live Sites</p>
              <p className="text-xl font-black">{stats?.totalSites || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
        
        {/* Total Sites */}
        <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-white">
          <CardContent className="p-8 relative">
             <div className="w-10 h-10 bg-maroon-50 rounded-xl flex items-center justify-center mb-6 text-maroon-600">
                <Building2 className="w-5 h-5" />
             </div>
             <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Global Status</p>
             <h3 className="text-3xl font-black text-slate-900 mt-2">{stats?.totalSites || 0}</h3>
             <p className="text-[10px] font-bold mt-2 uppercase tracking-tighter text-slate-500">Registered Sites</p>
          </CardContent>
        </Card>

        {/* Today Labour Cost */}
        <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-maroon-800 text-white">
          <CardContent className="p-8">
             <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-5 h-5 text-white" />
             </div>
             <p className="text-[11px] font-black text-maroon-100 uppercase tracking-widest">Today Labour</p>
             <h3 className="text-3xl font-black mt-2">₹{(stats?.todayLabourCost || 0).toLocaleString('en-IN')}</h3>
             <p className="text-[10px] font-bold mt-2 uppercase tracking-tighter text-maroon-50">Daily cost projection</p>
          </CardContent>
        </Card>

        {/* Today Materials */}
        <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-emerald-600 text-white">
          <CardContent className="p-8">
             <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Package className="w-5 h-5 text-white" />
             </div>
             <p className="text-[11px] font-black text-emerald-200 uppercase tracking-widest">Today Materials</p>
             <h3 className="text-3xl font-black mt-2">₹{(stats?.todayMaterialCost || 0).toLocaleString('en-IN')}</h3>
             <p className="text-[10px] font-bold mt-2 uppercase tracking-tighter text-emerald-100">Daily material usage</p>
          </CardContent>
        </Card>

        {/* Total Pending */}
        <Card className="group border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-[2rem] overflow-hidden bg-red-600 text-white shadow-red-600/20">
          <CardContent className="p-8">
             <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-6 animate-pulse">
                <IndianRupee className="w-5 h-5 text-white" />
             </div>
             <p className="text-[11px] font-black text-red-200 uppercase tracking-widest">Global Pending</p>
             <h3 className="text-3xl font-black mt-2">₹{(stats?.totalPendingAmount || 0).toLocaleString('en-IN')}</h3>
             <p className="text-[10px] font-bold mt-2 uppercase tracking-tighter text-red-100">Across all workers</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
