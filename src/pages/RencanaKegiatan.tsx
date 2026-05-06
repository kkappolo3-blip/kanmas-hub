import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CalendarDays, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function RencanaKegiatan() {
  const [rows, setRows] = useState<any[]>([]);
  const [personil, setPersonil] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({ status: "Rencana", tanggal: new Date().toISOString().slice(0, 10) });

  const load = async () => {
    const [{ data: r }, { data: p }] = await Promise.all([
      supabase.from("rencana_kegiatan").select("*, personil(nama)").order("tanggal", { ascending: false }),
      supabase.from("personil").select("id,nama"),
    ]);
    setRows(r || []); setPersonil(p || []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.tanggal || !form.jenis_giat) return toast.error("Tanggal & Jenis Giat wajib");
    const { error } = await supabase.from("rencana_kegiatan").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Rencana ditambahkan"); setOpen(false);
    setForm({ status: "Rencana", tanggal: new Date().toISOString().slice(0, 10) });
    load();
  };
  const del = async (id: string) => { await supabase.from("rencana_kegiatan").delete().eq("id", id); load(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2"><CalendarDays /> Rencana Kegiatan</h1>
          <p className="text-sm text-muted-foreground">Jadwal & rencana giat Bhabinkamtibmas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" /> Tambah</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Tambah Rencana Kegiatan</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Tanggal *</Label><Input type="date" value={form.tanggal || ""} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} /></div>
                <div><Label>Jenis Giat *</Label><Input value={form.jenis_giat || ""} onChange={(e) => setForm({ ...form, jenis_giat: e.target.value })} placeholder="Sambang, DDS, Penyuluhan..." /></div>
                <div><Label>Mulai</Label><Input type="time" value={form.waktu_mulai || ""} onChange={(e) => setForm({ ...form, waktu_mulai: e.target.value })} /></div>
                <div><Label>Selesai</Label><Input type="time" value={form.waktu_selesai || ""} onChange={(e) => setForm({ ...form, waktu_selesai: e.target.value })} /></div>
                <div><Label>Sasaran</Label><Input value={form.sasaran || ""} onChange={(e) => setForm({ ...form, sasaran: e.target.value })} /></div>
                <div><Label>Lokasi</Label><Input value={form.lokasi || ""} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} /></div>
                <div>
                  <Label>Personil</Label>
                  <Select value={form.personil_id || ""} onValueChange={(v) => setForm({ ...form, personil_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                    <SelectContent>{personil.map((p) => <SelectItem key={p.id} value={p.id}>{p.nama}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["Rencana", "Pelaksanaan", "Selesai", "Batal"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>Uraian</Label><Textarea rows={3} value={form.uraian || ""} onChange={(e) => setForm({ ...form, uraian: e.target.value })} /></div>
            </div>
            <DialogFooter><Button onClick={save}>Simpan</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base">Daftar Rencana</CardTitle></CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">Belum ada rencana. Gunakan tombol "1-Click Generate" di Dashboard.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow><TableHead>Tanggal</TableHead><TableHead>Waktu</TableHead><TableHead>Jenis Giat</TableHead><TableHead>Sasaran</TableHead><TableHead>Lokasi</TableHead><TableHead>Personil</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.tanggal}</TableCell>
                      <TableCell className="text-xs">{r.waktu_mulai}-{r.waktu_selesai}</TableCell>
                      <TableCell className="font-medium">{r.jenis_giat}</TableCell>
                      <TableCell>{r.sasaran}</TableCell>
                      <TableCell>{r.lokasi}</TableCell>
                      <TableCell>{r.personil?.nama || "-"}</TableCell>
                      <TableCell><span className="text-xs px-2 py-0.5 rounded bg-secondary">{r.status}</span></TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => del(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
