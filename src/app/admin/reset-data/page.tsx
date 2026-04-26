"use client";

import { useState } from "react";
import { getDailyEntries, getSites } from "@/lib/firestore";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trash2, ShieldAlert, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Status = "idle" | "counting" | "ready" | "deleting" | "done" | "error";

type Counts = {
  dailyEntries: number;
  sites: number;
};

async function deleteCollection(name: string, onProgress: (n: number) => void) {
  const snapshot = await getDocs(collection(db, name));
  let deleted = 0;
  for (const d of snapshot.docs) {
    await deleteDoc(doc(db, name, d.id));
    deleted++;
    onProgress(deleted);
  }
  return deleted;
}

export default function ResetDataPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [counts, setCounts] = useState<Counts | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [progress, setProgress] = useState({ deleted: 0, total: 0, current: "" });
  const [result, setResult] = useState<{ entries: number; sites: number } | null>(null);
  const [deleteSites, setDeleteSites] = useState(true);

  const CONFIRM_PHRASE = "DELETE ALL DATA";

  const handleCount = async () => {
    setStatus("counting");
    try {
      const [entries, sites] = await Promise.all([getDailyEntries(), getSites()]);
      setCounts({ dailyEntries: entries.length, sites: sites.length });
      setStatus("ready");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_PHRASE) return;
    setStatus("deleting");

    let entriesDeleted = 0;
    let sitesDeleted = 0;

    try {
      const total = (counts?.dailyEntries || 0) + (deleteSites ? (counts?.sites || 0) : 0);
      setProgress({ deleted: 0, total, current: "Daily Entries" });

      // Delete daily entries
      entriesDeleted = await deleteCollection("dailyEntries", (n) => {
        setProgress({ deleted: n, total, current: "Daily Entries" });
      });

      // Delete sites (optional)
      if (deleteSites) {
        setProgress(p => ({ ...p, deleted: entriesDeleted, current: "Sites" }));
        sitesDeleted = await deleteCollection("sites", (n) => {
          setProgress({ deleted: entriesDeleted + n, total, current: "Sites" });
        });
      }

      setResult({ entries: entriesDeleted, sites: sitesDeleted });
      setStatus("done");
    } catch (e) {
      console.error(e);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F2F4] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4 animate-in fade-in duration-400">

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-14 h-14 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-7 h-7 text-rose-500" />
          </div>
          <h1 className="text-[20px] font-black text-[#1A1A1A] uppercase tracking-tight">Reset Test Data</h1>
          <p className="text-[12px] text-[#999]">Permanently delete all records from the database</p>
        </div>

        {/* IDLE state */}
        {status === "idle" && (
          <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm p-5 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[12px] text-amber-700 font-medium leading-relaxed">
                This will permanently delete all <strong>Daily Entries</strong> and optionally all <strong>Sites</strong>. This action cannot be undone.
              </p>
            </div>
            
            {/* Option: include sites */}
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-[#E5E5E5] hover:bg-[#FAFAFA] transition-colors">
              <input
                type="checkbox"
                checked={deleteSites}
                onChange={e => setDeleteSites(e.target.checked)}
                className="w-4 h-4 rounded accent-rose-500"
              />
              <div>
                <p className="text-[12px] font-black text-[#1A1A1A] uppercase">Also delete Sites</p>
                <p className="text-[10px] text-[#999] mt-0.5">Removes all site configurations too</p>
              </div>
            </label>

            <Button
              onClick={handleCount}
              className="w-full h-11 rounded-xl bg-[#1A1A1A] hover:bg-[#333] text-white text-[11px] font-black uppercase tracking-widest"
            >
              Count Records First →
            </Button>
          </div>
        )}

        {/* COUNTING */}
        {status === "counting" && (
          <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm p-8 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#999]" />
            <p className="text-[12px] font-bold text-[#999] uppercase tracking-widest">Counting records…</p>
          </div>
        )}

        {/* READY — show counts + confirm */}
        {status === "ready" && counts && (
          <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm p-5 space-y-4">
            
            {/* Counts */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-rose-400 mb-1">Daily Entries</p>
                <p className="text-[28px] font-black text-rose-600">{counts.dailyEntries}</p>
                <p className="text-[10px] text-rose-400">will be deleted</p>
              </div>
              <div className={`border rounded-xl p-3 text-center ${deleteSites ? "bg-rose-50 border-rose-100" : "bg-[#F5F5F5] border-[#E5E5E5]"}`}>
                <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${deleteSites ? "text-rose-400" : "text-[#CCC]"}`}>Sites</p>
                <p className={`text-[28px] font-black ${deleteSites ? "text-rose-600" : "text-[#CCC]"}`}>{counts.sites}</p>
                <p className={`text-[10px] ${deleteSites ? "text-rose-400" : "text-[#CCC]"}`}>{deleteSites ? "will be deleted" : "kept"}</p>
              </div>
            </div>

            {/* Type to confirm */}
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#999]">
                Type <span className="text-rose-600 font-black">{CONFIRM_PHRASE}</span> to confirm
              </p>
              <Input
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder={CONFIRM_PHRASE}
                className={`h-11 text-[12px] font-bold rounded-xl border-2 transition-colors ${
                  confirmText === CONFIRM_PHRASE
                    ? "border-rose-400 bg-rose-50 text-rose-700"
                    : "border-[#E5E5E5]"
                }`}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => { setStatus("idle"); setConfirmText(""); setCounts(null); }}
                className="flex-1 h-11 rounded-xl text-[11px] font-black uppercase border-[#E5E5E5]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={confirmText !== CONFIRM_PHRASE}
                className="flex-1 h-11 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-rose-200 text-white text-[11px] font-black uppercase tracking-widest transition-all"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete All
              </Button>
            </div>
          </div>
        )}

        {/* DELETING */}
        {status === "deleting" && (
          <div className="bg-white rounded-2xl border border-[#E5E5E5] shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-rose-500 shrink-0" />
              <div className="flex-1">
                <p className="text-[12px] font-black text-[#1A1A1A] uppercase">Deleting {progress.current}…</p>
                <p className="text-[10px] text-[#999] mt-0.5">{progress.deleted} of {progress.total} records removed</p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-500 rounded-full transition-all duration-300"
                style={{ width: progress.total > 0 ? `${Math.round((progress.deleted / progress.total) * 100)}%` : "0%" }}
              />
            </div>
            <p className="text-[10px] text-center text-[#999] font-bold">
              {progress.total > 0 ? Math.round((progress.deleted / progress.total) * 100) : 0}% complete — do not close this page
            </p>
          </div>
        )}

        {/* DONE */}
        {status === "done" && result && (
          <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6 space-y-4 text-center">
            <div className="w-14 h-14 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-[16px] font-black text-[#1A1A1A] uppercase">All Cleared!</h2>
              <p className="text-[12px] text-[#999] mt-1">Database is fresh and ready for real data</p>
            </div>
            <div className="bg-[#FAFAFA] rounded-xl border border-[#E5E5E5] p-3 text-left space-y-1.5">
              <div className="flex justify-between text-[12px]">
                <span className="text-[#999]">Daily Entries deleted</span>
                <span className="font-black text-[#1A1A1A]">{result.entries}</span>
              </div>
              <div className="flex justify-between text-[12px]">
                <span className="text-[#999]">Sites deleted</span>
                <span className="font-black text-[#1A1A1A]">{result.sites}</span>
              </div>
            </div>
            <a
              href="/admin"
              className="block w-full h-11 rounded-xl bg-[#1A1A1A] text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-[#333] transition-colors"
            >
              Go to Dashboard →
            </a>
          </div>
        )}

        {/* ERROR */}
        {status === "error" && (
          <div className="bg-white rounded-2xl border border-rose-200 shadow-sm p-6 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="text-[13px] font-bold text-[#1A1A1A]">Something went wrong</p>
            <p className="text-[11px] text-[#999]">Check the console for details and try again.</p>
            <Button onClick={() => setStatus("idle")} variant="outline" className="w-full h-10 rounded-xl text-[11px] font-black uppercase">
              Try Again
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
