import { useMemo, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  SERVICES,
  bookedSlots,
  generateTimeSlots,
  isPastDate,
  isSlotPast,
  todayStr,
  useAppointments,
  useBarbers,
  useOverrides,
} from "@/lib/store";

export function BookingModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { barbers } = useBarbers();
  const { appointments, addAppointment } = useAppointments();
  const { getOverride } = useOverrides();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [barberId, setBarberId] = useState<string>("");
  const [service, setService] = useState<string>("");
  const [date, setDate] = useState<string>(todayStr());
  const [time, setTime] = useState<string>("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setBarberId(barbers[0]?.id ?? "");
  }, [open, barbers]);

  const allSlots = useMemo(() => generateTimeSlots(), []);
  const override = getOverride(date);
  const dateObj = new Date(date + "T00:00:00");
  const isSunday = dateObj.getDay() === 0;
  const dateClosed = isSunday || override?.closed;

  const blocked = useMemo(
    () => (barberId ? bookedSlots(appointments, barberId, date) : new Set<string>()),
    [appointments, barberId, date],
  );

  const availableSlots = useMemo(() => {
    if (dateClosed) return [];
    return allSlots.filter((t) => {
      if (override?.openFrom && t < override.openFrom) return false;
      if (isSlotPast(date, t)) return false;
      return true;
    });
  }, [allSlots, date, dateClosed, override]);

  useEffect(() => {
    setTime("");
  }, [date, barberId]);

  const submit = () => {
    if (!name.trim() || !phone.trim() || !barberId || !service || !date || !time) {
      toast.error("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }
    if (isPastDate(date)) {
      toast.error("Geçmiş bir tarihe randevu alınamaz.");
      return;
    }
    if (blocked.has(time)) {
      toast.error("Bu saat seçili berber için dolu.");
      return;
    }
    const svc = SERVICES.find((s) => s.name === service)!;
    addAppointment({
      name: name.trim(),
      phone: phone.trim(),
      barberId,
      service: svc.name,
      price: svc.price,
      date,
      time,
      note: note.trim() || undefined,
    });
    toast.success("Randevu talebiniz alındı. Detaylı bilgi için arayabilirsiniz.");
    setName(""); setPhone(""); setService(""); setTime(""); setNote("");
    onOpenChange(false);
  };

  const minDate = todayStr();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Online Randevu</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Bilgilerinizi girin, sizi en kısa sürede arayalım.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <Label>İsim</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Adınız Soyadınız" className="bg-input border-border mt-1" />
          </div>
          <div>
            <Label>Telefon</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0xxx xxx xx xx" className="bg-input border-border mt-1" />
          </div>
          <div>
            <Label>Berber</Label>
            <Select value={barberId} onValueChange={setBarberId}>
              <SelectTrigger className="bg-input border-border mt-1"><SelectValue placeholder="Berber seçin" /></SelectTrigger>
              <SelectContent>
                {barbers.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Hizmet</Label>
            <Select value={service} onValueChange={setService}>
              <SelectTrigger className="bg-input border-border mt-1"><SelectValue placeholder="Hizmet seçin" /></SelectTrigger>
              <SelectContent>
                {SERVICES.map((s) => (
                  <SelectItem key={s.name} value={s.name}>{s.name} — {s.price}TL</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tarih</Label>
              <Input type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} className="bg-input border-border mt-1" />
              {isSunday && <p className="text-xs text-destructive mt-1">Pazar günleri kapalıyız.</p>}
              {override?.closed && !isSunday && <p className="text-xs text-destructive mt-1">Bu gün kapalı.</p>}
            </div>
            <div>
              <Label>Saat</Label>
              <Select value={time} onValueChange={setTime} disabled={dateClosed || !barberId}>
                <SelectTrigger className="bg-input border-border mt-1"><SelectValue placeholder="Saat" /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {availableSlots.length === 0 && <div className="px-2 py-3 text-sm text-muted-foreground">Uygun saat yok</div>}
                  {availableSlots.map((t) => {
                    const isBlocked = blocked.has(t);
                    return (
                      <SelectItem key={t} value={t} disabled={isBlocked}>
                        {t}{isBlocked ? " — dolu" : ""}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Notunuz (opsiyonel)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tercih ettiğiniz stil, özel istekler..." className="bg-input border-border mt-1" />
          </div>
          <Button onClick={submit} className="w-full bg-primary text-primary-foreground hover:opacity-90 font-semibold h-11">
            Randevu Talebini Gönder
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}