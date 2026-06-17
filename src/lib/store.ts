import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

export type Barber = { id: string; name: string };
export type Appointment = {
  id: string;
  name: string;
  phone: string;
  barberId: string;
  service: string;
  price: number;
  date: string;
  time: string;
  note?: string;
  createdAt: string;
};
export type DayOverride = {
  date: string;
  closed?: boolean;
  openFrom?: string;
};
export type AdminUser = { email: string; password: string };

const K = { admins: "sd_admins", session: "sd_session" };

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

export function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 10; h <= 20; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    if (h !== 20) slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}

export function useBarbers() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  useEffect(() => {
    supabase.from("barbers").select("*").then(({ data }) => { if (data) setBarbers(data); });
  }, []);
  return {
    barbers,
    addBarber: async (name: string) => {
      const { data } = await supabase.from("barbers").insert([{ name }]).select();
      if (data) setBarbers((prev) => [...prev, data[0]]);
    },
    removeBarber: async (id: string) => {
      await supabase.from("barbers").delete().eq("id", id);
      setBarbers((prev) => prev.filter((b) => b.id !== id));
    },
    renameBarber: async (id: string, name: string) => {
      const { data } = await supabase.from("barbers").update({ name }).eq("id", id).select();
      if (data) setBarbers((prev) => prev.map((b) => (b.id === id ? data[0] : b)));
    },
  };
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    supabase.from("appointments").select("*").gte("date", todayStr()).then(({ data }) => {
      if (data) {
        const mapped = data.map((d) => ({
          ...d,
          barberId: d.barber_id,
          createdAt: d.created_at,
        }));
        setAppointments(mapped);
      }
    });
  }, []);

  return {
    appointments,
    addAppointment: async (a: Omit<Appointment, "id" | "createdAt">) => {
      const dbData = { name: a.name, phone: a.phone, date: a.date, time: a.time, service: a.service, price: a.price, barber_id: a.barberId, note: a.note || null };
      const { data } = await supabase.from("appointments").insert([dbData]).select();
      if (data) {
        const newAppt = { ...data[0], barberId: data[0].barber_id, createdAt: data[0].created_at };
        setAppointments((prev) => [...prev, newAppt]);
        return newAppt;
      }
    },
    updateAppointment: async (id: string, patch: Partial<Appointment>) => {
      const dbPatch: any = { ...patch };
      if (patch.barberId) {
        dbPatch.barber_id = patch.barberId;
        delete dbPatch.barberId;
      }
      const { data, error } = await supabase.from("appointments").update(dbPatch).eq("id", id).select();
      if (error) throw error;
      if (data) {
        const updated = { ...data[0], barberId: data[0].barber_id, createdAt: data[0].created_at };
        setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      }
    },
    deleteAppointment: async (id: string) => {
      await supabase.from("appointments").delete().eq("id", id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
    },
  }; // Bu süslü parantez objeyi kapatıyor
} // BU DA FONKSİYONU KAPATIYOR (EKSİK OLAN BUYDU)

export function useOverrides() {
  const [overrides, setOverrides] = useState<DayOverride[]>([]);
  useEffect(() => {
    supabase.from("overrides").select("*").gte("date", todayStr()).then(({ data }) => {
      if (data) {
        const mapped = data.map((d) => ({ ...d, openFrom: d.open_from }));
        setOverrides(mapped);
      }
    });
  }, []);

  return {
    overrides,
    setOverride: async (o: DayOverride) => {
      await supabase.from("overrides").delete().eq("date", o.date);
      if (o.closed || o.openFrom) {
        const { data } = await supabase.from("overrides").insert([{ date: o.date, closed: o.closed, open_from: o.openFrom }]).select();
        if (data) {
          setOverrides((prev) => {
            const without = prev.filter((p) => p.date !== o.date);
            return [...without, { ...data[0], openFrom: data[0].open_from }];
          });
        }
      } else {
        setOverrides((prev) => prev.filter((p) => p.date !== o.date));
      }
    },
  };
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("sd-store", { detail: { key } }));
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
    return () => { window.removeEventListener("sd-store", handler); window.removeEventListener("storage", handler); };
  }, [key]);
  const update = useCallback((next: T | ((prev: T) => T)) => {
    const current = read(key, fallback);
    const v = typeof next === "function" ? (next as (p: T) => T)(current) : next;
    write(key, v);
  }, [key]);
  return [val, update] as const;
}

export function useAdmins() {
  const [list, setList] = useLocal<AdminUser[]>(K.admins, [DEFAULT_ADMIN]);
  return {
    admins: list,
    addAdmin: (a: AdminUser) => setList((prev) => [...prev, a]),
    updateAdmin: (email: string, patch: Partial<AdminUser>) => setList((prev) => prev.map((a) => (a.email === email ? { ...a, ...patch } : a))),
    removeAdmin: (email: string) => setList((prev) => prev.filter((a) => a.email !== email)),
  };
}

export function useSession() {
  const [s, setS] = useLocal<{ email: string } | null>(K.session, null);
  return {
    session: s,
    login: (email: string, password: string) => {
      const admins = read<AdminUser[]>(K.admins, [DEFAULT_ADMIN]);
      const match = admins.find((a) => a.email === email && a.password === password);
      if (match) { setS({ email }); return true; }
      return false;
    },
    logout: () => setS(null),
  };
}