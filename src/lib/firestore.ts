import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  Site,
  DailyEntry,
  ContactMessage,
  DashboardStats,
} from "@/lib/types";

// Helper
const now = () => new Date().toISOString();

// ==================== SITES ====================
export async function getSites(): Promise<Site[]> {
  const snapshot = await getDocs(
    query(collection(db, "sites"), orderBy("createdAt", "desc"))
  );
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Site
  );
}

export async function getSite(id: string): Promise<Site | null> {
  const docRef = doc(db, "sites", id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Site;
}

export async function createSite(data: Omit<Site, "id" | "createdAt" | "updatedAt">) {
  return addDoc(collection(db, "sites"), {
    ...data,
    createdAt: now(),
    updatedAt: now(),
  });
}

export async function updateSite(id: string, data: Partial<Site>) {
  return updateDoc(doc(db, "sites", id), { ...data, updatedAt: now() });
}

export async function deleteSite(id: string) {
  return deleteDoc(doc(db, "sites", id));
}

// ==================== DAILY ENTRIES ====================
export async function getDailyEntries(siteId?: string): Promise<DailyEntry[]> {
  let q = query(collection(db, "dailyEntries"), orderBy("date", "desc"));
  const snapshot = await getDocs(q);
  let results = snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as DailyEntry
  );
  if (siteId) results = results.filter((e) => e.siteId === siteId);
  return results;
}

export async function createDailyEntry(data: Omit<DailyEntry, "id" | "createdAt" | "updatedAt">) {
  return addDoc(collection(db, "dailyEntries"), {
    ...data,
    createdAt: now(),
    updatedAt: now(),
  });
}

export async function updateDailyEntry(id: string, data: Partial<DailyEntry>) {
  return updateDoc(doc(db, "dailyEntries", id), { ...data, updatedAt: now() });
}

export async function deleteDailyEntry(id: string) {
  return deleteDoc(doc(db, "dailyEntries", id));
}

// ==================== CONTACT ====================
export async function submitContactMessage(
  data: Omit<ContactMessage, "id" | "createdAt" | "read">
) {
  return addDoc(collection(db, "contacts"), {
    ...data,
    read: false,
    createdAt: now(),
  });
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const snapshot = await getDocs(
    query(collection(db, "contacts"), orderBy("createdAt", "desc"))
  );
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as ContactMessage
  );
}

// ==================== DASHBOARD ====================
export async function getDashboardStats(): Promise<DashboardStats> {
  const [sites, entries] = await Promise.all([
    getSites(),
    getDailyEntries(),
  ]);

  const today = new Date().toISOString().split("T")[0];

  let totalPendingAmount = 0;
  let todayTotalAmount = 0;
  let todayLabourCost = 0;
  let todayMaterialCost = 0;
  let todayExpenseCost = 0;

  entries.forEach((entry) => {
    // Current date in IST or equivalent local if simple
    if (entry.date === today) {
      todayTotalAmount += entry.totalAmount || 0;
      entry.workers?.forEach(w => todayLabourCost += (w.amount || 0));
      entry.materials?.forEach(m => todayMaterialCost += (m.amount || 0));
      entry.expenses?.forEach(e => todayExpenseCost += (e.amount || 0));
    }
    
    // Sum ALL pending amounts from all historical entries to show actual liability
    entry.workers?.forEach((worker) => {
      totalPendingAmount += worker.pendingAmount || 0;
    });
  });

  return {
    totalSites: sites.length,
    totalPendingAmount,
    todayTotalAmount,
    todayLabourCost,
    todayMaterialCost,
    todayExpenseCost,
  };
}

