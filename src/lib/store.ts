import { useEffect, useState, useCallback } from "react";

export type Barber = { id: string; name: string };
export type Appointment = {
  id: string;
  name: string;
  phone: string;
  barberId: string;
  service: string;
  price: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  note?: string;
  createdAt: string;
};
export type DayOverride = {
  date: string; // YYYY-MM-DD
  closed?: boolean;
  openFrom?: string; // HH:mm minimum opening time
};
export type AdminUser = { email: string; password: string };

const K = {
  barbers: "sd_barbers",
  appts: "sd_appointments",
  overrides: "sd_overrides",
  admins: "sd_admins",
  session: "sd_session",
};

export const SERVICES = [
  { name: "Saç Tıraşı", price: 400 },
  { name: "Sakal Şekillendirme", price: 200 },
  { name: "Çocuk Tıraşı", price: 250 },
  { name: "Cilt & Bakım", price: 400 },
];

export const DEFAULT_ADMIN: AdminUser = {
  email: "tilki@admin.com",
  password: "TilkiAlperen11523455+",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("sd-store", { detail: { key } }));
}

export function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

/** Remove appointments before today */
export function cleanupPast() {
  const today = todayStr();
  const list = read<Appointment[]>(K.appts, []);
  const fresh = list.filter((a) => a.date >= today);
  if (fresh.length !== list.length) write(K.appts, fresh);
}

export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 10; h <= 20; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (h !== 20) slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}

function useLocal<T>(key: string, fallback: T) {
  const [val, setVal] = useState<T>(() => read(key, fallback));
  
  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (!d || d.key === key) setVal(read(key, fallback));
    };
    window.addEventListener("sd-store", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("sd-store", handler);
      window.removeEventListener("storage", handler);
    };
  }, [key]);

  // ÇİFT KAYDI ÖNLEYEN YENİ GÜNCELLEME BLOĞU
  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const current = read(key, fallback);
      const v = typeof next === "function" ? (next as (p: T) => T)(current) : next;
      write(key, v);
    },
    [key] 
  );

  return [val, update] as const;
}

export function useBarbers() {
  const [list, setList] = useLocal<Barber[]>(K.barbers, [
    { id: "b1", name: "Alperen Usta" },
  ]);
  return {
    barbers: list,
    addBarber: (name: string) =>
      setList((prev) => [...prev, { id: crypto.randomUUID(), name }]),
    removeBarber: (id: string) => setList((prev) => prev.filter((b) => b.id !== id)),
    renameBarber: (id: string, name: string) =>
      setList((prev) => prev.map((b) => (b.id === id ? { ...b, name } : b))),
  };
}

export function useAppointments() {
  useEffect(() => {
    cleanupPast();
  }, []);
  const [list, setList] = useLocal<Appointment[]>(K.appts, []);
  return {
    appointments: list,
    addAppointment: (a: Omit<Appointment, "id" | "createdAt">) => {
      const appt: Appointment = {
        ...a,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setList((prev) => [...prev, appt]);
      return appt;
    },
    updateAppointment: (id: string, patch: Partial<Appointment>) =>
      setList((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a))),
    deleteAppointment: (id: string) =>
      setList((prev) => prev.filter((a) => a.id !== id)),
  };
}

export function useOverrides() {
  const [list, setList] = useLocal<DayOverride[]>(K.overrides, []);
  return {
    overrides: list,
    setOverride: (o: DayOverride) =>
      setList((prev) => {
        const without = prev.filter((p) => p.date !== o.date);
        if (!o.closed && !o.openFrom) return without;
        return [...without, o];
      }),
    getOverride: (date: string) => list.find((o) => o.date === date),
  };
}

export function useAdmins() {
  const [list, setList] = useLocal<AdminUser[]>(K.admins, [DEFAULT_ADMIN]);
  return {
    admins: list,
    addAdmin: (a: AdminUser) => setList((prev) => [...prev, a]),
    updateAdmin: (email: string, patch: Partial<AdminUser>) =>
      setList((prev) => prev.map((a) => (a.email === email ? { ...a, ...patch } : a))),
    removeAdmin: (email: string) =>
      setList((prev) => prev.filter((a) => a.email !== email)),
  };
}

export function useSession() {
  const [s, setS] = useLocal<{ email: string } | null>(K.session, null);
  return {
    session: s,
    login: (email: string, password: string) => {
      const admins = read<AdminUser[]>(K.admins, [DEFAULT_ADMIN]);
      const match = admins.find((a) => a.email === email && a.password === password);
      if (match) {
        setS({ email });
        return true;
      }
      return false;
    },
    logout: () => setS(null),
  };
}

/** Check if a date is in the past (before today) */
export function isPastDate(date: string) {
  return date < todayStr();
}

/** Get blocked slots for a barber on a date */
export function bookedSlots(appts: Appointment[], barberId: string, date: string) {
  return new Set(
    appts.filter((a) => a.barberId === barberId && a.date === date).map((a) => a.time),
  );
}

/** Is a slot in the past (only relevant when date === today) */
export function isSlotPast(date: string, time: string) {
  if (date !== todayStr()) return false;
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  return h < now.getHours() || (h === now.getHours() && m <= now.getMinutes());
}