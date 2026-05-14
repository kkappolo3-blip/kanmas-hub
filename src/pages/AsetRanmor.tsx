import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Camera, Image as ImgIcon, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

const PHOTO_SLOTS = [
  { k: "foto_depan", l: "FOTO DEPAN" },
  { k: "foto_belakang", l: "FOTO BELAKANG" },
  { k: "foto_no_mesin", l: "FOTO NO MESIN" },
  { k: "foto_no_rangka", l: "FOTO NO RANGKA" },
] as const;

interface Personil {
  id: string; nama: string; pangkat?: string; nrp?: string; jabatan?: string;
}
interface Ranmor {
  id: string; personil_id?: string; jenis?: string; merk?: string; tipe?: string;
  no_mesin?: string; no_rangka?: string; kondisi?: string;
  foto_depan?: string; foto_belakang?: string; foto_no_mesin?: string; foto_no_rangka?: string;
}

export default function AsetRanmor() {
  const [data, setData] = useState<Ranmor[]>([]);
  const [personil, setPersonil] = useState<Personil[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Ranmor | null>(null);
  const [form, setForm] = useState<any>({});
  const [pForm, setPForm] = useState<any>({});
  const [pMode, setPMode] = useState<"existing" | "new">("existing");

  const load = async () => {
    const [{ data: r }, { data: p }] = await Promise.all([
      supabase.from("ranmor").select("*").order("created_at", { ascending: true }),
      supabase.from("personil").select("id,nama,pangkat,nrp,jabatan").order("nama"),
    ]);
    setData((r as any) || []); setPersonil((p as any) || []);
  };
  useEffect(() => { load(); }, []);

  const startNew = () => {
    setEditing(null);
    setForm({ kondisi: "BAIK", jenis: "Roda dua" });
    setPForm({ jabatan: "BHABINKAMTIBMAS" });
    setPMode("existing");
    setOpen(true);
  };
  const startEdit = (r: Ranmor) => {
    setEditing(r); setForm(r); setPForm({}); setPMode("existing"); setOpen(true);
  };

  const save = async () => {
    let personil_id = form.personil_id;
    if (pMode === "new") {
      if (!pForm.nama) return toast.error("Nama pemegang wajib diisi");
      const { data: np, error: pe } = await supabase.from("personil").insert(pForm).select().single();
      if (pe) return toast.error(pe.message);
      personil_id = np.id;
    }
    if (!personil_id) return toast.error("Pilih atau tambahkan pemegang");
    const payload = { ...form, personil_id };
    const { error } = editing
      ? await supabase.from("ranmor").update(payload).eq("id", editing.id)
      : await supabase.from("ranmor").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Data tersimpan");
    setOpen(false); load();
  };

  const del = async (id: string) => {
    if (!confirm("Hapus data ranmor ini?")) return;
    const { error } = await supabase.from("ranmor").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h1 className="text-lg md:text-xl font-bold text-primary">DATA RANMOR DINAS POLSEK TOLINGGULA</h1>
        <p className="text-sm font-semibold text-muted-foreground">POLRES GORONTALO UTARA</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={startNew}><Plus className="mr-1 h-4 w-4" /> Tambah Data Ranmor</Button>
      </div>

      <div className="border rounded-lg overflow-x-auto bg-card">
        <table className="w-full text-xs border-collapse">
          <thead className="bg-muted">
            <tr className="[&>th]:border [&>th]:border-border [&>th]:p-2 [&>th]:font-bold [&>th]:text-center">
              <th className="w-10">NO</th>
              <th className="min-w-[180px]">NAMA PEMEGANG / PANGKAT / NRP / JABATAN</th>
              <th className="min-w-[90px]">JENIS RANMOR</th>
              <th className="min-w-[120px]">MERK / TYPE</th>
              <th className="min-w-[110px]">NO. MESIN</th>
              <th className="min-w-[130px]">NO. RANGKA</th>
              <th className="w-16">KONDISI</th>
              <th className="w-28">FOTO DEPAN</th>
              <th className="w-28">FOTO BELAKANG</th>
              <th className="w-28">FOTO NO MESIN</th>
              <th className="w-28">FOTO NO RANGKA</th>
              <th className="w-20">AKSI</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => {
              const p = personil.find((x) => x.id === r.personil_id);
              return (
                <tr key={r.id} className="[&>td]:border [&>td]:border-border [&>td]:p-2 [&>td]:align-middle">
                  <td className="text-center">{i + 1}.</td>
                  <td>
                    <div className="font-semibold">{p?.nama || "—"}</div>
                    <div className="text-muted-foreground">
                      {[p?.pangkat, p?.nrp, p?.jabatan].filter(Boolean).join(" / ")}
                    </div>
                  </td>
                  <td className="text-center">{r.jenis}</td>
                  <td className="text-center">
                    <div>{r.merk}</div>
                    <div className="text-muted-foreground">{r.tipe}</div>
                  </td>
                  <td className="text-center">{r.no_mesin}</td>
                  <td className="text-center">{r.no_rangka}</td>
                  <td className="text-center font-semibold">{r.kondisi}</td>
                  {PHOTO_SLOTS.map((s) => (
                    <td key={s.k} className="text-center">
                      {(r as any)[s.k] ? (
                        <a href={(r as any)[s.k]} target="_blank" rel="noreferrer">
                          <img src={(r as any)[s.k]} alt={s.l} className="w-24 h-20 object-cover mx-auto rounded" />
                        </a>
                      ) : (
                        <div className="w-24 h-20 mx-auto bg-muted rounded flex items-center justify-center">
                          <ImgIcon className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                      )}
                    </td>
                  ))}
                  <td>
                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="outline" onClick={() => startEdit(r)}>
                        <Pencil className="h-3 w-3 mr-1" />Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => del(r.id)}>
                        <Trash2 className="h-3 w-3 mr-1 text-destructive" />Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr><td colSpan={12} className="text-center text-muted-foreground py-12 border border-border">
                Belum ada data Ranmor. Klik "Tambah Data Ranmor" untuk mulai.
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit" : "Tambah"} Data Ranmor</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg p-3 space-y-3 bg-muted/30">
              <Label className="font-semibold">Pemegang Ranmor</Label>
              {!editing && (
                <div className="flex gap-2 text-sm">
                  <button type="button" onClick={() => setPMode("existing")}
                    className={`px-3 py-1 rounded ${pMode === "existing" ? "bg-primary text-primary-foreground" : "bg-background border"}`}>
                    Pilih dari daftar
                  </button>
                  <button type="button" onClick={() => setPMode("new")}
                    className={`px-3 py-1 rounded ${pMode === "new" ? "bg-primary text-primary-foreground" : "bg-background border"}`}>
                    Tambah pemegang baru
                  </button>
                </div>
              )}
              {(pMode === "existing" || editing) ? (
                <Select value={form.personil_id || ""} onValueChange={(v) => setForm({ ...form, personil_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih pemegang..." /></SelectTrigger>
                  <SelectContent>
                    {personil.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nama} {p.pangkat && `— ${p.pangkat}`} {p.nrp && `(${p.nrp})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Nama *" v={pForm.nama} onC={(v) => setPForm({ ...pForm, nama: v })} />
                  <Field label="Pangkat" v={pForm.pangkat} onC={(v) => setPForm({ ...pForm, pangkat: v })} placeholder="BRIPKA / AIPDA" />
                  <Field label="NRP" v={pForm.nrp} onC={(v) => setPForm({ ...pForm, nrp: v })} />
                  <Field label="Jabatan" v={pForm.jabatan} onC={(v) => setPForm({ ...pForm, jabatan: v })} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Jenis Ranmor" v={form.jenis} onC={(v) => setForm({ ...form, jenis: v })} placeholder="Roda dua / Roda empat" />
              <Field label="Merk" v={form.merk} onC={(v) => setForm({ ...form, merk: v })} placeholder="Honda / Kawasaki" />
              <Field label="Type" v={form.tipe} onC={(v) => setForm({ ...form, tipe: v })} placeholder="VERZA 150" />
              <div>
                <Label>Kondisi</Label>
                <Select value={form.kondisi || "BAIK"} onValueChange={(v) => setForm({ ...form, kondisi: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["BAIK", "RUSAK RINGAN", "RUSAK BERAT"].map((x) => (
                    <SelectItem key={x} value={x}>{x}</SelectItem>
                  ))}</SelectContent>
                </Select>
              </div>
              <Field label="No. Mesin" v={form.no_mesin} onC={(v) => setForm({ ...form, no_mesin: v })} />
              <Field label="No. Rangka" v={form.no_rangka} onC={(v) => setForm({ ...form, no_rangka: v })} />
            </div>

            <div className="pt-2 border-t">
              <Label className="font-semibold">Foto Kendaraan</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                {PHOTO_SLOTS.map((s) => (
                  <PhotoSlot key={s.k} label={s.l} value={form[s.k]}
                    onChange={(url) => setForm({ ...form, [s.k]: url })} />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={save}>Simpan</Button>
          </DialogFooter>
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

function PhotoSlot({ label, value, onChange }: { label: string; value?: string; onChange: (url: string) => void }) {
  const camRef = useRef<HTMLInputElement>(null);
  const galRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `ranmor/${label.replace(/\s+/g, "_")}_${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("kanmas-foto").upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("kanmas-foto").getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success(`${label} terupload`);
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="border rounded-lg p-2 space-y-2 bg-muted/30">
      <p className="text-xs font-semibold text-center">{label}</p>
      <div className="aspect-square bg-background rounded flex items-center justify-center overflow-hidden">
        {value ? <img src={value} alt={label} className="w-full h-full object-cover" /> :
          <ImgIcon className="h-8 w-8 text-muted-foreground/40" />}
      </div>
      <div className="flex gap-1">
        <Button type="button" size="sm" variant="outline" className="flex-1 text-xs h-7 px-1" disabled={busy} onClick={() => camRef.current?.click()}>
          <Camera className="h-3 w-3 mr-1" />Kamera
        </Button>
        <Button type="button" size="sm" variant="outline" className="flex-1 text-xs h-7 px-1" disabled={busy} onClick={() => galRef.current?.click()}>
          <ImgIcon className="h-3 w-3 mr-1" />File
        </Button>
      </div>
      <input ref={camRef} type="file" accept="image/*" capture="environment" hidden
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      <input ref={galRef} type="file" accept="image/*" hidden
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
    </div>
  );
}
