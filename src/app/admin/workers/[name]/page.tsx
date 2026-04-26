"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { getDailyEntries, getSites } from "@/lib/firestore";
import type { DailyEntry, Site } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CheckCircle2, Clock, CalendarDays } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

const safeFormatDate = (dateStr: string) => {
  if (!dateStr) return "N/A";
  const d = parseISO(dateStr);
  return isValid(d) ? format(d, "dd MMM, yyyy").toUpperCase() : "N/A";
};

type WorkerRow = {
  personName: string;
  types: string[];
  shiftTexts: string[];
  amount: number;
  paymentStatus: "Paid" | "Not Paid" | "Partial";
  paidAmount: number;
  pendingAmount: number;
  labourCount: number;
  date: string;
  siteId: string;
  entryId: string;
};

const PAGE_SIZE = 10;

export default function WorkerHistoryPage() {
  const params = useParams();
  const workerName = decodeURIComponent(params.name as string);

  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  async function loadData() {
    try {
      const [eData, sData] = await Promise.all([getDailyEntries(), getSites()]);
      setEntries(eData || []);
      setSites(sData || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const workerKey = workerName.trim().toLowerCase();

  const workerRows: WorkerRow[] = entries
    .filter(e => e.workers?.some(w => w.personName.trim().toLowerCase() === workerKey))
    .sort((a, b) => b.date.localeCompare(a.date))
    .map(e => {
      const matchWorkers = (e.workers || []).filter(w => w.personName.trim().toLowerCase() === workerKey);
      
      const totalAmount = matchWorkers.reduce((s, w) => s + (Number(w.amount) || 0), 0);
      const totalPaid = matchWorkers.reduce((s, w) => s + (Number(w.paidAmount) || 0), 0);
      const totalPending = matchWorkers.reduce((s, w) => s + (Number(w.pendingAmount) || 0), 0);
      
      const types = Array.from(new Set(matchWorkers.map(w => w.type || "—")));
      
      const totalLabourCount = matchWorkers.reduce((s, w) => s + (Number(w.labourCount) || (w.type === 'RW' ? 1 : 0)), 0);

      const shiftTexts: string[] = [];
      matchWorkers.forEach(w => {
        if (w.type === "RW") shiftTexts.push(`${w.qty} × ₹${w.rate}`);
        else if (Number(w.shift) > 0) shiftTexts.push(`${w.shift} shift`);
      });

      const paymentStatus = totalPending <= 0 ? "Paid" : totalPaid > 0 ? "Partial" : "Not Paid";

      return {
        personName: matchWorkers[0].personName,
        types,
        shiftTexts,
        amount: totalAmount,
        paidAmount: totalPaid,
        pendingAmount: totalPending,
        paymentStatus,
        labourCount: totalLabourCount,
        date: e.date,
        siteId: e.siteId,
        entryId: e.id
      } as WorkerRow;
    });

  const totalEarned  = workerRows.reduce((s, w) => s + (Number(w.amount) || 0), 0);
  const totalPaid    = workerRows.reduce((s, w) => s + (Number(w.paidAmount) || 0), 0);
  const totalPending = workerRows.reduce((s, w) => s + (Number(w.pendingAmount) || 0), 0);

  const totalPages = Math.ceil(workerRows.length / PAGE_SIZE);
  const paginatedRows = workerRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F2F4] pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 space-y-5 animate-in fade-in duration-400">

        {/* Back + Title */}
        <div className="flex items-center gap-3">
          <Link href="/admin/reports?tab=workers" className="p-1.5 hover:bg-black/5 rounded-md text-[#4D4D4D] transition-colors -ml-1.5">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1">
            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground/50">Worker History</p>
            <h1 className="text-[22px] font-bold text-[#1A1A1A] uppercase leading-tight">{workerName}</h1>
          </div>
          <Link href="/admin/weekly-pay">
            <Button variant="outline" size="sm" className="h-9 rounded-xl border-[#E5E5E5] bg-white shadow-sm text-[10px] font-black uppercase tracking-wider gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> Manage Payments
            </Button>
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-[#E5E5E5] p-4 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1.5">Total Earned</p>
            <p className="text-[20px] font-bold text-[#1A1A1A]">₹{totalEarned.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-muted-foreground/50 mt-1">{workerRows.length} entries</p>
          </div>
          <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600/60 mb-1.5">Total Paid</p>
            <p className="text-[20px] font-bold text-emerald-600">₹{totalPaid.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-emerald-600/40 mt-1">
              {workerRows.filter(w => w.paymentStatus === 'Paid').length} paid days
            </p>
          </div>
          <div className="bg-white rounded-xl border border-rose-100 p-4 shadow-sm">
            <p className="text-[9px] font-black uppercase tracking-widest text-rose-500/60 mb-1.5">Pending</p>
            <p className="text-[20px] font-bold text-rose-500">₹{totalPending.toLocaleString('en-IN')}</p>
            <p className="text-[10px] text-rose-500/40 mt-1">
              {workerRows.filter(w => w.paymentStatus !== 'Paid').length} unpaid days
            </p>
          </div>
        </div>

        {/* Payment Management Banner */}
        <Link href="/admin/weekly-pay" className="block">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl p-4 flex items-center justify-between shadow-md hover:opacity-95 transition-opacity">
            <div className="flex items-center gap-3">
              <CalendarDays className="w-6 h-6 text-white/70" />
              <div>
                <p className="text-[12px] font-black text-white uppercase tracking-wider">Manage Payments from Weekly Pay</p>
                <p className="text-[10px] text-white/60 mt-0.5">All salary payments are managed weekly (Sun–Sat)</p>
              </div>
            </div>
            <span className="text-white/50 text-[20px]">→</span>
          </div>
        </Link>

        {/* History List (Read-Only) */}
        <div className="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
            <h2 className="text-[14px] font-semibold text-[#1A1A1A]">Work History</h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
              {workerRows.length} records
            </span>
          </div>

          {workerRows.length === 0 ? (
            <div className="p-12 text-center text-[13px] text-[#999]">No history found for this worker.</div>
          ) : (
            <div className="divide-y divide-[#E5E5E5]">
              {paginatedRows.map((w, i) => {
                const siteName = sites.find(s => s.id === w.siteId)?.siteName || "Unknown Site";
                const isPaid = w.paymentStatus === "Paid";
                return (
                  <div key={`${w.entryId}-${i}`} className="px-5 py-4 flex items-center gap-4 hover:bg-[#FAFAFA] transition-colors">
                    {/* Left */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[13px] font-bold text-[#1A1A1A]">{safeFormatDate(w.date)}</span>
                        <div className="flex gap-1.5 flex-wrap">
                          {w.types.map((type, idx) => (
                            <span key={idx} className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/60">
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-[12px] text-[#666] truncate">{siteName}</p>
                      <p className="text-[11px] text-[#999] mt-0.5">
                        {w.shiftTexts.join(" · ") || "0 shifts"}
                        {w.labourCount > 0 && (
                          <span className="ml-2 font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                            {w.labourCount} LABOUR
                          </span>
                        )}
                      </p>
                      {/* Paid / Pending breakdown */}
                      {!isPaid && (
                        <p className="text-[11px] text-[#999] mt-0.5">
                          Paid: <span className="text-emerald-600 font-bold">₹{(Number(w.paidAmount) || 0).toLocaleString('en-IN')}</span>
                          {" · "}
                          Pending: <span className="text-rose-500 font-bold">₹{(Number(w.pendingAmount) || 0).toLocaleString('en-IN')}</span>
                        </p>
                      )}
                    </div>

                    {/* Right */}
                    <div className="text-right shrink-0 flex flex-col items-end gap-2">
                      <div className="text-[15px] font-bold text-[#1A1A1A]">
                        ₹{(Number(w.amount) || 0).toLocaleString('en-IN')}
                      </div>
                      <div className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                        isPaid
                          ? "text-emerald-700 bg-emerald-50 border border-emerald-100"
                          : w.paymentStatus === "Partial"
                          ? "text-amber-700 bg-amber-50 border border-amber-100"
                          : "text-rose-600 bg-rose-50 border border-rose-100"
                      )}>
                        {isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {w.paymentStatus || "Not Paid"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Grand Total Footer */}
          <div className="px-5 py-4 border-t-2 border-[#E5E5E5] bg-[#FAFAFA] flex items-center justify-between">
            <span className="text-[13px] font-bold text-[#1A1A1A]">Grand Total</span>
            <span className="text-[16px] font-bold text-[#1A1A1A]">₹{totalEarned.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 py-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-5 rounded-lg text-[11px] font-black uppercase text-blue-950"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(v => v - 1)}
            >
              ← Prev
            </Button>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-5 rounded-lg text-[11px] font-black uppercase text-blue-950"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(v => v + 1)}
            >
              Next →
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
