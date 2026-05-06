import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Camera, Image as ImgIcon, Trash2, Car } from "lucide-react";
import { toast } from "sonner";

const SLOTS = [
  { k: "foto_depan", l: "Depan" }, { k: "foto_belakang", l: "Belakang" },
  { k: "foto_kiri", l: "Kiri" }, { k: "foto_kanan", l: "Kanan" },
  { k: "foto_no_rangka", l: "No. Rangka" }, { k: "foto_no_mesin", l: "No. Mesin" },
] as const;

interface Personil { id: string; nama: string; drive_folder?: string; }
interface Ranmor {
  id: string; personil_id?: string; jenis?: string; merk?: string; tipe?: string;
  no_polisi?: string; no_rangka?: string; no_mesin?: string; warna?: string; tahun?: number;
  kondisi?: string; foto_depan?: string; foto_belakang?: string; foto_kiri?: string;
  foto_kanan?: string; foto_no_rangka?: string; foto_no_mesin?: string;
}

export default function AsetRanmor() {
  const [data, setData] = useState<Ranmor[]>([]);
  const [personil, setPersonil] = useState<Personil[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Ranmor | null>(null);
  const [form, setForm] = useState<any>({});

  const load = async () => {
    const [{ data: r }, { data: p }] = await Promise.all([
      supabase.from("ranmor").select("*").order("created_at", { ascending: false }),
      supabase.from("personil").select("id,nama,drive_folder"),
    ]);
    setData(r || []); setPersonil(p || []);
  };
  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing(null); setForm({ kondisi: "Baik" }); setOpen(true); };
  const startEdit = (r: Ranmor) => { setEditing(r); setForm(r); setOpen(true); };

  const save = async () => {
    if (!form.no_polisi) return toast.error("No. Polisi wajib");
    const payload = { ...form, tahun: form.tahun ? Number(form.tahun) : null };
    const { error } = editing
      ? await supabase.from("ranmor").update(payload).eq("id", editing.id)
      : await supabase.from("ranmor").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Tersimpan"); setOpen(false); load();
  };

  const del = async (id: string) => {
    if (!confirm("Hapus ranmor ini?")) return;
    await supabase.from("ranmor").delete().eq("id", id); load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2"><Car /> Aset Ranmor</h1>
          <p className="text-sm text-muted-foreground">Inventaris kendaraan dinas Bhabinkamtibmas</p>
        </div>
        <Button onClick={startNew}><Plus className="mr-1 h-4 w-4" /> Tambah Ranmor</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.map((r) => {
          const p = personil.find((x) => x.id === r.personil_id);
          return (
            <Card key={r.id} className="shadow-card overflow-hidden">
              <div className="grid grid-cols-3 gap-px bg-border">
                {SLOTS.slice(0, 6).map((s) => (
                  <div key={s.k} className="aspect-square bg-muted flex items-center justify-center">
                    {(r as any)[s.k] ? (
                      <img src={(r as any)[s.k]} alt={s.l} className="w-full h-full object-cover" />
                    ) : (
                      <ImgIcon className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </div>
                ))}
              </div>
              <CardContent className="p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-primary">{r.no_polisi}</p>
                  <span className="text-xs px-2 py-0.5 rounded bg-accent/20 text-accent-foreground">{r.kondisi}</span>
                </div>
                <p className="text-sm">{r.merk} {r.tipe} {r.tahun && `(${r.tahun})`}</p>
                <p className="text-xs text-muted-foreground">Pemegang: {p?.nama || "—"}</p>
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => startEdit(r)}>Detail / Edit</Button>
                  <Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {data.length === 0 && (
          <Card className="md:col-span-2 lg:col-span-3"><CardContent className="text-center text-sm text-muted-foreground py-12">Belum ada data Ranmor.</CardContent></Card>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Tambah"} Ranmor</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="No. Polisi *" v={form.no_polisi} onC={(v) => setForm({ ...form, no_polisi: v })} />
              <Field label="Jenis" v={form.jenis} onC={(v) => setForm({ ...form, jenis: v })} placeholder="R2 / R4" />
              <Field label="Merk" v={form.merk} onC={(v) => setForm({ ...form, merk: v })} />
              <Field label="Tipe" v={form.tipe} onC={(v) => setForm({ ...form, tipe: v })} />
              <Field label="No. Rangka" v={form.no_rangka} onC={(v) => setForm({ ...form, no_rangka: v })} />
              <Field label="No. Mesin" v={form.no_mesin} onC={(v) => setForm({ ...form, no_mesin: v })} />
              <Field label="Warna" v={form.warna} onC={(v) => setForm({ ...form, warna: v })} />
              <Field label="Tahun" v={form.tahun} onC={(v) => setForm({ ...form, tahun: v })} type="number" />
              <div>
                <Label>Kondisi</Label>
                <Select value={form.kondisi || "Baik"} onValueChange={(v) => setForm({ ...form, kondisi: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["Baik", "Rusak Ringan", "Rusak Berat"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Pemegang (Bhabin)</Label>
                <Select value={form.personil_id || ""} onValueChange={(v) => setForm({ ...form, personil_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih..." /></SelectTrigger>
                  <SelectContent>{personil.map((p) => <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="pt-2 border-t">
              <Label className="text-sm font-semibold">Foto Kendaraan (6 slot)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {SLOTS.map((s) => (
                  <PhotoSlot
                    key={s.k} label={s.l}
                    value={form[s.k]}
                    folder={personil.find((p) => p.id === form.personil_id)?.drive_folder || "umum"}
                    onChange={(url) => setForm({ ...form, [s.k]: url })}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter><Button onClick={save}>Simpan</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, v, onC, type = "text", placeholder }: any) {
  return (
    <div>
      <Label>{label}</Label>
      <Input type={type} value={v || ""} onChange={(e) => onC(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function PhotoSlot({ label, value, folder, onChange }: { label: string; value?: string; folder: string; onChange: (url: string) => void }) {
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const path = `${folder}/${label}_${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from("kanmas-foto").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("kanmas-foto").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success(`Foto ${label} terupload`);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="border rounded-lg p-2 space-y-2 bg-muted/30">
      <p className="text-xs font-medium">{label}</p>
      <div className="aspect-video bg-background rounded flex items-center justify-center overflow-hidden">
        {value ? <img src={value} alt={label} className="w-full h-full object-cover" /> : <ImgIcon className="h-6 w-6 text-muted-foreground/40" />}
      </div>
      <div className="flex gap-1">
        <Button type="button" size="sm" variant="outline" className="flex-1 text-xs h-7" disabled={busy} onClick={() => camRef.current?.click()}>
          <Camera className="h-3 w-3 mr-1" />Kamera
        </Button>
        <Button type="button" size="sm" variant="outline" className="flex-1 text-xs h-7" disabled={busy} onClick={() => galRef.current?.click()}>
          <ImgIcon className="h-3 w-3 mr-1" />Galeri
        </Button>
      </div>
      <input ref={camRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      <input ref={galRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
    </div>
  );
}
