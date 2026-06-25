import { useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";

const notifyBarber = async (action: string, appt: any) => {
  const instanceId = "instance182184";
  const token = "y7bhy830uk11nz77";
  const barberPhone = "905438792413"; 
  
  // Tarihteki tireleri noktaya çeviriyoruz (Örn: 2026-06-25 -> 2026.06.25)
  const formattedDate = appt.date ? appt.date.replace(/-/g, '.') : "";

  // Not kısmı: Eğer müşteri bir şey yazdıysa onu, yazmadıysa "-" işaretini alır
  const noteText = appt.note ? appt.note : "-";

  const msg = `*${action}*\n\n` +
              `👤 Müşteri: ${appt.name}\n` +
              `💈 Hizmet: ${appt.service}\n` +
              `💵 Fiyat: ${appt.price} ₺\n` +
              `📅 Tarih: ${formattedDate}\n` +
              `⏰ Saat: ${appt.time}\n` +
              `📞 Telefon: ${appt.phone}\n` +
              `📝 Not: _${noteText}_`;

  const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
  const params = new URLSearchParams({ token, to: barberPhone, body: msg });

  try {
    await fetch(url, { method: 'POST', body: params });
  } catch (e) {
    console.error("WhatsApp bildirimi gönderilemedi:", e);
  }
};

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
  { name: "Saç Sakal + Yıkama", price: 800 },
  { name: "Sakal Şekillendirme", price: 300 },
  { name: "Saç Tıraşı", price: 500 },
  { name: "Çocuk Traşı", price: 400 },
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

export function isPastDate(date: string) { return date < todayStr(); }
export function bookedSlots(appts: Appointment[], barberId: string, date: string) {
  return new Set(appts.filter((a) => a.barberId === barberId && a.date === date).map((a) => a.time));
}
export function isSlotPast(date: string, time: string) {
  if (date !== todayStr()) return false;
  const [h, m] = time.split(":").map(Number);
  const now = new Date();
  return h < now.getHours() || (h === now.getHours() && m <= now.getMinutes());
}

export function useBarbers() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  useEffect(() => {
    supabase.from("barbers").select("*").then(({ data, error }) => {
      if (error) console.error("Berberleri çekemedim:", error);
      if (data) setBarbers(data);
    });
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
      let ip = "unknown";
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        ip = data.ip;
      } catch (e) {}

      const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
      
      const { data: pastAppts, error: countError } = await supabase
        .from("appointments")
        .select("id")
        .eq("ip_address", ip)
        .gte("created_at", oneHourAgo);

      if (countError) {
        console.error("IP kontrol hatası:", countError);
      }

      const limitCount = pastAppts ? pastAppts.length : 0;

      if (limitCount >= 2) {
        alert("⚠️ İP ADRESİNİZDEN ÇOK FAZLA DENEME YAPILDI. \n\nDaha sonra tekrar deneyin.");
        throw new Error("İP ADRESİNİZDEN ÇOK FAZLA DENEME YAPILDI.");
      }

      const dbData = { 
        name: a.name, 
        phone: a.phone, 
        date: a.date, 
        time: a.time, 
        service: a.service, 
        price: a.price, 
        barber_id: a.barberId, 
        note: a.note || null,
        ip_address: ip 
      };
      
      const { data, error } = await supabase.from("appointments").insert([dbData]).select();
      
      if (error) {
        console.error("SUPABASE KAYIT HATASI:", error);
        alert("Randevu Kaydedilemedi! Hata: " + error.message);
        throw error;
      }
      
      if (data) {
        const newAppt = { ...data[0], barberId: data[0].barber_id, createdAt: data[0].created_at };
        setAppointments((prev) => [...prev, newAppt]);
        
        // 1. TETİKLEYİCİ: RANDEVU ALINDI BİLDİRİMİ
        await notifyBarber("🟢 YENİ RANDEVU", newAppt);
        
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
        
        // 2. TETİKLEYİCİ: RANDEVU GÜNCELLENDİ BİLDİRİMİ
        await notifyBarber("🟠 RANDEVU GÜNCELLENDİ", updated);
      }
    },
    deleteAppointment: async (id: string) => {
      // Silme işleminden önce randevu detaylarını bulup saklıyoruz
      const target = appointments.find((a) => a.id === id);
      
      await supabase.from("appointments").delete().eq("id", id);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      
      // 3. TETİKLEYİCİ: RANDEVU İPTAL EDİLDİ BİLDİRİMİ
      if (target) {
        await notifyBarber("🔴 RANDEVU SİLİNDİ", target);
      }
    },
  };
}

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
    getOverride: (date: string) => overrides.find((o) => o.date === date),
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
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  useEffect(() => {
    supabase.from("admins").select("*").then(({ data }) => {
      if (data) setAdmins(data as AdminUser[]);
    });
  }, []);

  return {
    admins,
    addAdmin: async (a: AdminUser) => {
      const { data } = await supabase.from("admins").insert([a]).select();
      if (data) setAdmins((prev) => [...prev, data[0] as AdminUser]);
    },
    removeAdmin: async (email: string) => {
      await supabase.from("admins").delete().eq("email", email);
      setAdmins((prev) => prev.filter((a) => a.email !== email));
    },
    updateAdmin: async (oldEmail: string, patch: Partial<AdminUser>) => {
      const { data } = await supabase.from("admins").update(patch).eq("email", oldEmail).select();
      if (data) setAdmins((prev) => prev.map((a) => (a.email === oldEmail ? (data[0] as AdminUser) : a)));
    },
  };
}

export function useSession() {
  const [s, setS] = useLocal<{ email: string } | null>(K.session, null);
  return {
    session: s,
    login: async (email: string, password: string) => {
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .eq("email", email)
        .eq("password", password)
        .single();

      if (data) {
        setS({ email });
        return true;
      }
      
      if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
        setS({ email });
        return true;
      }

      console.error("Giriş hatası:", error);
      return false;
    },
    logout: () => setS(null),
  };
}