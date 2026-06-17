import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { LogOut, Trash2, Pencil, Plus, Scissors } from "lucide-react";
import {
  SERVICES,
  generateTimeSlots,
  todayStr,
  useAdmins,
  useAppointments,
  useBarbers,
  useOverrides,
  useSession,
  type Appointment,
} from "@/lib/store";

function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);
  if (!hasMounted) return null;
  return <>{children}</>;
}

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Saloon Deep" }] }),
  component: AdminPage,
});

function AdminPage() {
  const { session, login, logout } = useSession();
  if (!session) return <LoginScreen onLogin={login} />;
  return <Dashboard email={session.email} onLogout={logout} />;
}

function LoginScreen({ onLogin }: { onLogin: (e: string, p: string) => boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLogin(email, password)) toast.error("Hatalı e-posta veya şifre");
  };
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="w-full max-w-sm p-8 bg-card border-border">
        <div className="flex items-center gap-2 justify-center mb-6">
          <Scissors className="w-5 h-5 text-primary" />
          <span className="font-display text-2xl">Saloon <span className="text-primary italic">Deep</span></span>
        </div>
        <h1 className="font-display text-xl text-center mb-6">Admin Girişi</h1>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>E-posta</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-input border-border mt-1" required />
          </div>
          <div>
            <Label>Şifre</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-input border-border mt-1" required />
          </div>
          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:opacity-90">Giriş Yap</Button>
        </form>
      </Card>
    </div>
  );
}

function Dashboard({ email, onLogout }: { email: string; onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-5 py-4 flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-primary" />
          <span className="font-display text-lg">Saloon <span className="text-primary italic">Deep</span> Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden sm:inline">{email}</span>
          <Button variant="outline" size="sm" onClick={onLogout}><LogOut className="w-4 h-4 mr-1" />Çıkış</Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 sm:p-8">
        <Tabs defaultValue="appts">
          <TabsList className="grid grid-cols-4 mb-6 bg-card">
            <TabsTrigger value="appts">Randevular</TabsTrigger>
            <TabsTrigger value="barbers">Berberler</TabsTrigger>
            <TabsTrigger value="schedule">Takvim</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
          </TabsList>
          <TabsContent value="appts"><AppointmentsTab /></TabsContent>
          <TabsContent value="barbers"><BarbersTab /></TabsContent>
          <TabsContent value="schedule"><ScheduleTab /></TabsContent>
          <TabsContent value="profile"><ProfileTab currentEmail={email} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function AppointmentsTab() {
  const { appointments, deleteAppointment, updateAppointment } = useAppointments();
  const { barbers } = useBarbers();
  const [editing, setEditing] = useState<Appointment | null>(null);

  const sorted = useMemo(
    () => [...appointments].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [appointments],
  );

  const barberName = (id: string) => barbers.find((b) => b.id === id)?.name ?? "—";

  const safeDelete = async (id: string) => {
    if (!confirm("Bu randevuyu silmek istediğine emin misin?")) return;
    await deleteAppointment(id);
    toast.success("Silindi");
  };

  return (
    <Card className="bg-card border-border p-0 overflow-hidden">
      {sorted.length === 0 ? (
        <div className="p-10 text-center text-muted-foreground">Aktif randevu bulunmuyor.</div>
      ) : (
        <div className="divide-y divide-border">
          {sorted.map((a) => (
            <div key={a.id} className="p-4">
              <div className="font-bold text-lg mb-3">
                {a.name} <span className="text-muted-foreground mx-2 font-normal">-</span> {a.phone}
              </div>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mb-3">
                <div><div className="text-[10px] text-muted-foreground uppercase font-bold">TARİH</div><div className="font-medium">{a.date}</div></div>
                <div><div className="text-[10px] text-muted-foreground uppercase font-bold">SAAT</div><div className="font-bold text-lg">{a.time}</div></div>
                <div><div className="text-[10px] text-muted-foreground uppercase font-bold">HİZMET</div><div className="font-medium">{a.service} ({a.price}TL)</div></div>
                <div><div className="text-[10px] text-muted-foreground uppercase font-bold">BERBER</div><div className="font-medium">{barberName(a.barberId)}</div></div>
              </div>
              {a.note && (<div className="mb-3 p-2 bg-input rounded text-sm italic border-l-4 border-primary">{a.note}</div>)}
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="outline" onClick={() => setEditing(a)}><Pencil className="w-4 h-4 mr-1" /> Düzenle</Button>
                <Button size="sm" variant="destructive" onClick={() => safeDelete(a.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && (
        <ClientOnly>
          <EditApptDialog
            key={editing.id}
            appt={editing}
            onClose={() => setEditing(null)}
            onSave={async (patch) => {
              try {
                await updateAppointment(editing.id, patch);
                toast.success("Güncellendi");
                setEditing(null);
              } catch (err: any) {
                toast.error("Hata: " + (err.message || "İşlem yapılamadı"));
              }
            }}
          />
        </ClientOnly>
      )}
    </Card>
  );
}

function EditApptDialog({ appt, onClose, onSave }: { appt: Appointment; onClose: () => void; onSave: (p: Partial<Appointment>) => void }) {
  const { barbers } = useBarbers();
  const { appointments } = useAppointments(); // Randevuları kontrol etmek için ekledik
  const [name, setName] = useState(appt.name);
  const [phone, setPhone] = useState(appt.phone);
  const [barberId, setBarberId] = useState(appt.barberId);
  const [service, setService] = useState(appt.service);
  const [date, setDate] = useState(appt.date);
  const [time, setTime] = useState(appt.time);
  const slots = generateTimeSlots();

  // Seçili gün ve berber için dolu olan saatleri bul (kendi randevun hariç)
  const booked = useMemo(() => {
    return appointments
      .filter((a) => a.date === date && a.barberId === barberId && a.id !== appt.id)
      .map((a) => a.time);
  }, [appointments, date, barberId, appt.id]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader><DialogTitle>Randevuyu Düzenle</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {/* İSİM VE TELEFON */}
          <div><Label>İsim</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="bg-input mt-1" /></div>
          <div><Label>Telefon</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-input mt-1" /></div>
          
          {/* BERBER SEÇİMİ */}
          <div>
            <Label>Berber</Label>
            <Select value={barberId} onValueChange={setBarberId}>
              <SelectTrigger className="bg-input mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{barbers.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {/* HİZMET SEÇİMİ */}
          <div>
            <Label>Hizmet</Label>
            <Select value={service} onValueChange={setService}>
              <SelectTrigger className="bg-input mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{SERVICES.map((s) => <SelectItem key={s.name} value={s.name}>{s.name} — {s.price}TL</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {/* TARİH VE SAAT */}
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Tarih</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-input mt-1" /></div>
            <div>
              <Label>Saat</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="bg-input mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {slots.map((s) => {
                    const isBooked = booked.includes(s);
                    return (
                      <SelectItem key={s} value={s} disabled={isBooked} className={isBooked ? "text-muted-foreground opacity-50" : ""}>
                        {s} {isBooked ? "(Dolu)" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* KAYDET BUTONU */}
          <Button onClick={() => {
            const svc = SERVICES.find((s) => s.name === service);
            onSave({ name, phone, barberId, service, price: svc?.price ?? appt.price, date, time });
          }} className="w-full bg-primary text-primary-foreground">Kaydet</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function BarbersTab() {
  const { barbers, addBarber, removeBarber, renameBarber } = useBarbers();
  const [name, setName] = useState("");
  return (
    <Card className="bg-card border-border p-6">
      <div className="flex gap-2 mb-6">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Yeni berber adı" className="bg-input" />
        <Button onClick={() => { if (name.trim()) { addBarber(name.trim()); setName(""); toast.success("Berber eklendi"); } }} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-1" />Ekle
        </Button>
      </div>
      <div className="space-y-2">
        {barbers.length === 0 && <p className="text-muted-foreground text-sm">Henüz berber eklenmemiş.</p>}
        {barbers.map((b) => (
          <div key={b.id} className="flex gap-2 items-center">
            <Input value={b.name} onChange={(e) => renameBarber(b.id, e.target.value)} className="bg-input" />
            <Button size="sm" variant="destructive" onClick={() => { removeBarber(b.id); toast.success("Berber silindi"); }}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ScheduleTab() {
  const { overrides, setOverride } = useOverrides();
  const [date, setDate] = useState(todayStr());
  const [openFrom, setOpenFrom] = useState("");
  const slots = generateTimeSlots();
  return (
    <Card className="bg-card border-border p-6 space-y-6">
      <div>
        <h3 className="font-display text-lg mb-3">Gün Yönetimi</h3>
        <div className="grid sm:grid-cols-3 gap-3 items-end">
          <div><Label>Tarih</Label><Input type="date" min={todayStr()} value={date} onChange={(e) => setDate(e.target.value)} className="bg-input mt-1" /></div>
          <div>
            <Label>Açılış saati (opsiyonel)</Label>
            <Select value={openFrom} onValueChange={setOpenFrom}>
              <SelectTrigger className="bg-input mt-1"><SelectValue placeholder="Varsayılan 10:00" /></SelectTrigger>
              <SelectContent className="max-h-64">{slots.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { setOverride({ date, openFrom: openFrom || undefined }); toast.success("Kaydedildi"); }} className="bg-primary text-primary-foreground flex-1">Kaydet</Button>
            <Button variant="destructive" onClick={() => { setOverride({ date, closed: true }); toast.success("Gün kapatıldı"); }}>Kapat</Button>
          </div>
        </div>
      </div>
      <div>
        <h3 className="font-display text-lg mb-3">Aktif İstisnalar</h3>
        {overrides.length === 0 && <p className="text-muted-foreground text-sm">Hiç özel ayar yok.</p>}
        <div className="space-y-2">
          {overrides.map((o) => (
            <div key={o.date} className="flex items-center justify-between p-3 rounded-md bg-input">
              <div className="text-sm">
                <span className="font-semibold">{o.date}</span> — {o.closed ? <span className="text-destructive">Kapalı</span> : <span>Açılış: {o.openFrom}</span>}
              </div>
              <Button size="sm" variant="outline" onClick={() => setOverride({ date: o.date })}>Kaldır</Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function ProfileTab({ currentEmail }: { currentEmail: string }) {
  const { admins, addAdmin, updateAdmin, removeAdmin } = useAdmins();
  const [newEmail, setNewEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const me = admins.find((a) => a.email === currentEmail);
  const [editEmail, setEditEmail] = useState(me?.email ?? "");
  const [editPass, setEditPass] = useState(me?.password ?? "");
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="bg-card border-border p-6">
        <h3 className="font-display text-lg mb-4">Profilim</h3>
        <div className="space-y-3">
          <div><Label>E-posta</Label><Input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="bg-input mt-1" /></div>
          <div><Label>Şifre</Label><Input type="password" value={editPass} onChange={(e) => setEditPass(e.target.value)} className="bg-input mt-1" /></div>
          <Button onClick={() => { updateAdmin(currentEmail, { email: editEmail, password: editPass }); toast.success("Profil güncellendi. Yeniden giriş yapın."); }} className="bg-primary text-primary-foreground w-full">Kaydet</Button>
        </div>
      </Card>
      <Card className="bg-card border-border p-6">
        <h3 className="font-display text-lg mb-4">Yeni Admin Ekle</h3>
        <div className="space-y-3">
          <div><Label>E-posta</Label><Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="bg-input mt-1" /></div>
          <div><Label>Şifre</Label><Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="bg-input mt-1" /></div>
          <Button onClick={() => {
            if (!newEmail || !newPass) return toast.error("Tüm alanları doldurun");
            if (admins.some((a) => a.email === newEmail)) return toast.error("Bu e-posta zaten var");
            addAdmin({ email: newEmail, password: newPass });
            setNewEmail(""); setNewPass("");
            toast.success("Admin eklendi");
          }} className="bg-primary text-primary-foreground w-full">Ekle</Button>
        </div>
        <div className="mt-6 space-y-2">
          <p className="text-sm text-muted-foreground">Mevcut adminler:</p>
          {admins.map((a) => (
            <div key={a.email} className="flex justify-between items-center p-2 rounded bg-input text-sm">
              <span>{a.email}{a.email === currentEmail && <span className="text-primary ml-2">(siz)</span>}</span>
              {a.email !== currentEmail && (
                <Button size="sm" variant="destructive" onClick={() => { removeAdmin(a.email); toast.success("Silindi"); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}