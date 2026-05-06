import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";

const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function LaporanBulanan() {
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [rekap, setRekap] = useState<any[]>([]);
  const [laporan, setLaporan] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadLaporan = async () => {
    const { data } = await supabase.from("laporan_bulanan").select("*").order("tahun", { ascending: false }).order("bulan", { ascending: false });
    setLaporan(data || []);
  };
  useEffect(() => { loadLaporan(); }, []);

  const generate = async () => {
    setLoading(true);
    try {
      const start = `${tahun}-${String(bulan).padStart(2, "0")}-01`;
      const endDate = new Date(tahun, bulan, 0).getDate();
      const end = `${tahun}-${String(bulan).padStart(2, "0")}-${endDate}`;
      const { data } = await supabase.from("rencana_kegiatan").select("*, personil(nama)").gte("tanggal", start).lte("tanggal", end);
      setRekap(data || []);
      const ringkasan = `Total ${data?.length || 0} kegiatan pada ${BULAN[bulan - 1]} ${tahun}.`;
      await supabase.from("laporan_bulanan").upsert({ bulan, tahun, total_kegiatan: data?.length || 0, ringkasan });
      toast.success("Laporan di-generate"); loadLaporan();
    } finally { setLoading(false); }
  };

  const exportCSV = () => {
    if (rekap.length === 0) return toast.error("Generate dulu");
    const header = "Tanggal,Jenis Giat,Sasaran,Lokasi,Personil,Status\n";
    const rows = rekap.map((r) => `${r.tanggal},"${r.jenis_giat}","${r.sasaran || ""}","${r.lokasi || ""}","${r.personil?.nama || ""}",${r.status}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `laporan_${BULAN[bulan - 1]}_${tahun}.csv`; a.click();
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2"><FileText /> Laporan Bulanan</h1>
        <p className="text-sm text-muted-foreground">Rekap kegiatan per bulan</p>
      </div>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base">Generate Laporan</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Bulan</label>
              <Select value={String(bulan)} onValueChange={(v) => setBulan(Number(v))}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>{BULAN.map((b, i) => <SelectItem key={i} value={String(i + 1)}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Tahun</label>
              <Select value={String(tahun)} onValueChange={(v) => setTahun(Number(v))}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>{[0, 1, 2].map((d) => { const y = new Date().getFullYear() - d; return <SelectItem key={y} value={String(y)}>{y}</SelectItem>; })}</SelectContent>
              </Select>
            </div>
            <Button onClick={generate} disabled={loading}><Sparkles className="mr-1 h-4 w-4" />Generate</Button>
            <Button variant="outline" onClick={exportCSV} disabled={rekap.length === 0}><Download className="mr-1 h-4 w-4" />Export CSV</Button>
          </div>

          {rekap.length > 0 && (
            <div className="rounded-lg border p-4 bg-muted/30">
              <h3 className="font-semibold mb-2">Rekap {BULAN[bulan - 1]} {tahun}</h3>
              <p className="text-sm">Total kegiatan: <span className="font-bold text-primary">{rekap.length}</span></p>
              <ul className="mt-2 space-y-1 text-sm max-h-64 overflow-auto">
                {rekap.map((r) => (
                  <li key={r.id} className="flex gap-2 border-b py-1">
                    <span className="text-muted-foreground">{r.tanggal}</span>
                    <span className="font-medium">{r.jenis_giat}</span>
                    <span className="text-muted-foreground">— {r.personil?.nama || "—"} @ {r.lokasi || "—"}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader><CardTitle className="text-base">Riwayat Laporan</CardTitle></CardHeader>
        <CardContent>
          {laporan.length === 0 ? <p className="text-sm text-muted-foreground text-center py-6">Belum ada laporan.</p> : (
            <div className="space-y-2">
              {laporan.map((l) => (
                <div key={l.id} className="flex justify-between items-center border rounded p-3">
                  <div>
                    <p className="font-medium">{BULAN[l.bulan - 1]} {l.tahun}</p>
                    <p className="text-xs text-muted-foreground">{l.ringkasan}</p>
                  </div>
                  <span className="text-2xl font-bold text-primary">{l.total_kegiatan}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
