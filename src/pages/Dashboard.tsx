import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, Users, Car, CalendarDays, FileText, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Personil { id: string; nama: string; nrp?: string; pangkat?: string; desa_binaan?: string; no_hp?: string; }

export default function Dashboard() {
  const [personil, setPersonil] = useState<Personil[]>([]);
  const [stats, setStats] = useState({ ranmor: 0, rencana: 0, laporan: 0 });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nama: "", nrp: "", pangkat: "", desa_binaan: "", no_hp: "" });
  const [generating, setGenerating] = useState(false);

  const load = async () => {
    const [{ data: p }, { count: c1 }, { count: c2 }, { count: c3 }] = await Promise.all([
      supabase.from("personil").select("*").order("created_at", { ascending: false }),
      supabase.from("ranmor").select("*", { count: "exact", head: true }),
      supabase.from("rencana_kegiatan").select("*", { count: "exact", head: true }),
      supabase.from("laporan_bulanan").select("*", { count: "exact", head: true }),
    ]);
    setPersonil(p || []);
    setStats({ ranmor: c1 || 0, rencana: c2 || 0, laporan: c3 || 0 });
  };

  useEffect(() => { load(); }, []);

  const addPersonil = async () => {
    if (!form.nama.trim()) return toast.error("Nama wajib diisi");
    const folderPath = `bhabin/${form.nama.replace(/\s+/g, "_")}_${Date.now()}/.keep`;
    // Auto-create folder in storage by uploading a placeholder file
    await supabase.storage.from("kanmas-foto").upload(folderPath, new Blob([""]), { upsert: true });
    const { error } = await supabase.from("personil").insert({ ...form, drive_folder: folderPath.replace("/.keep", "") });
    if (error) return toast.error(error.message);
    toast.success("Bhabin ditambahkan & folder foto dibuat otomatis");
    setForm({ nama: "", nrp: "", pangkat: "", desa_binaan: "", no_hp: "" });
    setOpen(false);
    load();
  };

  const deletePersonil = async (id: string) => {
    if (!confirm("Hapus personil ini?")) return;
    await supabase.from("personil").delete().eq("id", id);
    load();
  };

  const generateRencana = async () => {
    setGenerating(true);
    try {
      if (personil.length === 0) {
        toast.error("Tambahkan minimal 1 personil dulu");
        return;
      }
      const today = new Date();
      const jenisGiat = ["Sambang Desa", "DDS (Door to Door)", "Penyuluhan Kamtibmas", "Patroli Dialogis", "Kunjungan Tokoh Masyarakat", "Problem Solving", "Mediasi"];
      const sasaran = ["Tokoh Masyarakat", "Pemuda Karang Taruna", "Pelajar/Mahasiswa", "Pelaku Usaha", "Petani/Nelayan"];
      const rows: any[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(today); d.setDate(d.getDate() + i);
        const p = personil[i % personil.length];
        const giat = jenisGiat[i % jenisGiat.length];
        const sas = sasaran[i % sasaran.length];
        rows.push({
          tanggal: d.toISOString().slice(0, 10),
          waktu_mulai: "08:00",
          waktu_selesai: "12:00",
          jenis_giat: giat,
          sasaran: sas,
          lokasi: p.desa_binaan || "Wilayah Binaan",
          personil_id: p.id,
          uraian: `Pelaksanaan ${giat} oleh ${p.nama} kepada ${sas} di ${p.desa_binaan || "wilayah binaan"} guna meningkatkan harkamtibmas.`,
          status: "Rencana",
        });
      }
      const { error } = await supabase.from("rencana_kegiatan").insert(rows);
      if (error) throw error;
      toast.success(`✨ ${rows.length} rencana kegiatan berhasil di-generate!`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <Card className="shadow-card">
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-3 rounded-lg ${color}`}><Icon className="h-5 w-5 text-primary-foreground" /></div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Ringkasan operasional Kanit Binmas</p>
        </div>
        <Button onClick={generateRencana} disabled={generating} size="lg" className="bg-[image:var(--gradient-accent)] text-accent-foreground hover:opacity-90 shadow-elegant">
          <Sparkles className="mr-2 h-4 w-4" />
          {generating ? "Memproses..." : "1-Click Generate Rencana Kegiatan"}
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Personil Bhabin" value={personil.length} color="bg-primary" />
        <StatCard icon={Car} label="Aset Ranmor" value={stats.ranmor} color="bg-primary-glow" />
        <StatCard icon={CalendarDays} label="Rencana Giat" value={stats.rencana} color="bg-accent" />
        <StatCard icon={FileText} label="Laporan" value={stats.laporan} color="bg-destructive" />
      </div>

      <Card className="shadow-card">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Daftar Personil Bhabinkamtibmas</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus className="mr-1 h-4 w-4" /> Tambah Bhabin</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Tambah Bhabin Baru</DialogTitle></DialogHeader>
              <div className="space-y-3">
                {[
                  { k: "nama", l: "Nama Lengkap *" }, { k: "nrp", l: "NRP" }, { k: "pangkat", l: "Pangkat" },
                  { k: "desa_binaan", l: "Desa Binaan" }, { k: "no_hp", l: "No. HP" },
                ].map(({ k, l }) => (
                  <div key={k}>
                    <Label>{l}</Label>
                    <Input value={(form as any)[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">📁 Folder foto akan dibuat otomatis di penyimpanan.</p>
              </div>
              <DialogFooter><Button onClick={addPersonil}>Simpan</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {personil.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Belum ada personil. Klik "Tambah Bhabin".</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Nama</TableHead><TableHead>NRP</TableHead><TableHead>Pangkat</TableHead><TableHead>Desa Binaan</TableHead><TableHead>HP</TableHead><TableHead></TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {personil.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.nama}</TableCell>
                    <TableCell>{p.nrp || "-"}</TableCell>
                    <TableCell>{p.pangkat || "-"}</TableCell>
                    <TableCell>{p.desa_binaan || "-"}</TableCell>
                    <TableCell>{p.no_hp || "-"}</TableCell>
                    <TableCell><Button variant="ghost" size="icon" onClick={() => deletePersonil(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
