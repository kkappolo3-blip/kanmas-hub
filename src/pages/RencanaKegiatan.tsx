import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Printer, Wand2 } from "lucide-react";
import { toast } from "sonner";

interface Kegiatan {
  nama: string;
  sasaran: string;
  hasil: string;
  personel: string;
}

const DEFAULT_KEGIATAN: Kegiatan[] = [
  { nama: "Sambang Tokoh Masyarakat", sasaran: "Tokoh Masyarakat Desa", hasil: "Terjalinnya sinergitas antara Polri dan tokoh masyarakat", personel: "1 Orang" },
  { nama: "Pembinaan Pengamanan Swakarsa", sasaran: "Petugas Satpam/Linmas", hasil: "Meningkatnya kemampuan teknis pengamanan swakarsa", personel: "1 Orang" },
  { nama: "Sosialisasi Bahaya Narkoba", sasaran: "Remaja/Karang Taruna", hasil: "Tumbuhnya kesadaran masyarakat akan bahaya narkoba", personel: "1 Orang" },
  { nama: "Monitoring Program Ketahanan Pangan", sasaran: "Kelompok Tani", hasil: "Terdatanya perkembangan program ketahanan pangan", personel: "1 Orang" },
  { nama: "Pengecekan Kelengkapan Pos Kamling", sasaran: "Sarana Prasarana Pos Kamling", hasil: "Pos Kamling aktif dan berfungsi dengan baik", personel: "1 Orang" },
  { nama: "Problem Solving / Mediasi Warga", sasaran: "Warga yang berselisih", hasil: "Tercapainya kesepakatan damai antar warga", personel: "1 Orang" },
  { nama: "Sambang Kantor Desa/Kecamatan", sasaran: "Kepala Desa & Staf", hasil: "Sinkronisasi data dan informasi kamtibmas", personel: "1 Orang" },
  { nama: "Program Jumat Curhat", sasaran: "Jamaah Masjid", hasil: "Terserapnya keluhan dan aspirasi warga", personel: "1 Orang" },
  { nama: "Patroli Dialogis", sasaran: "Warga Pemukiman", hasil: "Terpantaunya situasi keamanan lingkungan", personel: "2 Orang" },
  { nama: "Pengamanan Kegiatan Masyarakat", sasaran: "Peserta Kegiatan", hasil: "Terjaminnya keamanan dan ketertiban kegiatan", personel: "2 Orang" },
  { nama: "Penyuluhan Hukum", sasaran: "Warga Desa", hasil: "Meningkatnya kesadaran hukum masyarakat", personel: "1 Orang" },
  { nama: "Pembinaan FKPM", sasaran: "Anggota FKPM", hasil: "Aktifnya forum kemitraan polisi dan masyarakat", personel: "1 Orang" },
  { nama: "Door to Door System (DDS)", sasaran: "Warga RT/RW", hasil: "Terjalinnya komunikasi yang baik dengan warga", personel: "1 Orang" },
  { nama: "Monitoring Tempat Hiburan Malam", sasaran: "Pemilik/Pengelola THM", hasil: "Terciptanya ketertiban di tempat hiburan", personel: "2 Orang" },
  { nama: "Edukasi Lalu Lintas", sasaran: "Pengguna Jalan", hasil: "Meningkatnya kesadaran tertib berlalu lintas", personel: "1 Orang" },
  { nama: "Sambang Sekolah", sasaran: "Siswa dan Guru", hasil: "Terciptanya lingkungan sekolah yang aman", personel: "1 Orang" },
  { nama: "Monitoring Rumah Ibadah", sasaran: "Pengurus Rumah Ibadah", hasil: "Terjaminnya keamanan tempat ibadah", personel: "1 Orang" },
  { nama: "Koordinasi dengan Babinsa", sasaran: "Babinsa Wilayah", hasil: "Sinkronisasi program kamtibmas dan hankam", personel: "1 Orang" },
];

const DEFAULT_PENGATURAN = {
  resor: "GORONTALO UTARA",
  sektor: "TOLINGGULA",
  unit: "POLSEK TOLINGGULA",
  jabatan: "KANIT BINMAS",
  pangkat: "BRIPKA",
  nama: "MOHAMAD KHAIR",
  nrp: "12345678",
};

const TIME_SLOTS = ["07.00 - 08.00", "09.00 - 10.00", "10.00 - 11.00", "14.00 - 15.00"];
const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

interface DayPlan {
  date: Date;
  rows: { jam: string; nama: string; sasaran: string; hasil: string; personel: string }[];
}

export default function RencanaKegiatan() {
  const [pengaturan, setPengaturan] = useState(() => {
    try { return { ...DEFAULT_PENGATURAN, ...JSON.parse(localStorage.getItem("rk_pengaturan") || "{}") }; }
    catch { return DEFAULT_PENGATURAN; }
  });
  const [kegiatan, setKegiatan] = useState<Kegiatan[]>(() => {
    try {
      const s = localStorage.getItem("rk_kegiatan");
      return s ? JSON.parse(s) : DEFAULT_KEGIATAN;
    } catch { return DEFAULT_KEGIATAN; }
  });
  const [newK, setNewK] = useState<Kegiatan>({ nama: "", sasaran: "", hasil: "", personel: "1 Orang" });
  const today = new Date();
  const [bulan, setBulan] = useState(today.getMonth());
  const [tahun, setTahun] = useState(today.getFullYear());
  const [generated, setGenerated] = useState<DayPlan[]>([]);

  useEffect(() => { localStorage.setItem("rk_pengaturan", JSON.stringify(pengaturan)); }, [pengaturan]);
  useEffect(() => { localStorage.setItem("rk_kegiatan", JSON.stringify(kegiatan)); }, [kegiatan]);

  const setP = (k: string, v: string) => setPengaturan({ ...pengaturan, [k]: v });

  const addKegiatan = () => {
    if (!newK.nama || !newK.sasaran || !newK.hasil) return toast.error("Lengkapi semua kolom");
    setKegiatan([...kegiatan, newK]);
    setNewK({ nama: "", sasaran: "", hasil: "", personel: "1 Orang" });
  };
  const delKegiatan = (i: number) => setKegiatan(kegiatan.filter((_, idx) => idx !== i));

  const generate = () => {
    if (kegiatan.length < 3) return toast.error("Minimal 3 kegiatan di database");
    const daysInMonth = new Date(tahun, bulan + 1, 0).getDate();
    const plans: DayPlan[] = [];
    let kIdx = 0;
    const pick = () => {
      const k = kegiatan[kIdx % kegiatan.length];
      kIdx++;
      return k;
    };
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(tahun, bulan, d);
      const rows = [
        { jam: TIME_SLOTS[0], nama: "Apel Pagi dan Anev Kinerja", sasaran: "Personel Polsek", hasil: "Terlaksananya apel pagi dan evaluasi kinerja", personel: "15 Orang" },
        ...TIME_SLOTS.slice(1).map((jam) => { const k = pick(); return { jam, ...k }; }),
      ];
      plans.push({ date, rows });
    }
    setGenerated(plans);
    toast.success(`${plans.length} hari berhasil di-generate`);
  };

  const mingguKe = (date: Date) => Math.ceil(date.getDate() / 7);

  const print = () => window.print();

  const years = useMemo(() => Array.from({ length: 7 }, (_, i) => today.getFullYear() - 2 + i), []);

  return (
    <div className="space-y-4">
      <div className="text-center print:hidden">
        <h1 className="text-xl font-bold text-primary">Generator Laporan Kegiatan Harian</h1>
        <p className="text-sm text-muted-foreground">Otomatis & Cepat</p>
      </div>

      <Card className="print:hidden">
        <CardHeader><CardTitle className="text-base">Pengaturan Data</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-semibold text-sm mb-2">Kop Surat</p>
            <div className="grid md:grid-cols-3 gap-3">
              <div><Label>Resor</Label><Input value={pengaturan.resor} onChange={(e) => setP("resor", e.target.value)} /></div>
              <div><Label>Sektor</Label><Input value={pengaturan.sektor} onChange={(e) => setP("sektor", e.target.value)} /></div>
              <div><Label>Unit Kerja</Label><Input value={pengaturan.unit} onChange={(e) => setP("unit", e.target.value)} /></div>
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm mb-2">Pejabat Tanda Tangan</p>
            <div className="grid md:grid-cols-2 gap-3">
              <div><Label>Jabatan</Label><Input value={pengaturan.jabatan} onChange={(e) => setP("jabatan", e.target.value)} /></div>
              <div><Label>Pangkat</Label><Input value={pengaturan.pangkat} onChange={(e) => setP("pangkat", e.target.value)} /></div>
              <div><Label>Nama</Label><Input value={pengaturan.nama} onChange={(e) => setP("nama", e.target.value)} /></div>
              <div><Label>NRP</Label><Input value={pengaturan.nrp} onChange={(e) => setP("nrp", e.target.value)} /></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="print:hidden">
        <CardHeader><CardTitle className="text-base">Database Kegiatan ({kegiatan.length} kegiatan)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-5 gap-2">
            <Input placeholder="Nama Kegiatan" value={newK.nama} onChange={(e) => setNewK({ ...newK, nama: e.target.value })} />
            <Input placeholder="Sasaran" value={newK.sasaran} onChange={(e) => setNewK({ ...newK, sasaran: e.target.value })} />
            <Input placeholder="Hasil" value={newK.hasil} onChange={(e) => setNewK({ ...newK, hasil: e.target.value })} />
            <Input placeholder="Personel" value={newK.personel} onChange={(e) => setNewK({ ...newK, personel: e.target.value })} />
            <Button onClick={addKegiatan}><Plus className="h-4 w-4 mr-1" />Tambah</Button>
          </div>
          <div className="border rounded overflow-x-auto max-h-72 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted sticky top-0"><tr className="[&>th]:p-2 [&>th]:text-left [&>th]:border-b">
                <th className="w-8">No</th><th>Kegiatan</th><th>Sasaran</th><th>Hasil</th><th>Personel</th><th></th>
              </tr></thead>
              <tbody>
                {kegiatan.map((k, i) => (
                  <tr key={i} className="[&>td]:p-2 [&>td]:border-b">
                    <td>{i + 1}</td><td>{k.nama}</td><td>{k.sasaran}</td><td>{k.hasil}</td><td>{k.personel}</td>
                    <td><Button size="icon" variant="ghost" onClick={() => delKegiatan(i)}><Trash2 className="h-3 w-3 text-destructive" /></Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="print:hidden">
        <CardHeader><CardTitle className="text-base">Generate Data</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="w-40"><Label>Bulan</Label>
              <Select value={String(bulan)} onValueChange={(v) => setBulan(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BULAN.map((b, i) => <SelectItem key={i} value={String(i)}>{b}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="w-32"><Label>Tahun</Label>
              <Select value={String(tahun)} onValueChange={(v) => setTahun(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={generate}><Wand2 className="h-4 w-4 mr-1" />Generate Data</Button>
            {generated.length > 0 && <Button variant="outline" onClick={print}><Printer className="h-4 w-4 mr-1" />Cetak Semua</Button>}
          </div>
        </CardContent>
      </Card>

      {generated.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8 print:hidden">
          Belum ada data. Silakan generate data terlebih dahulu.
        </p>
      ) : (
        <div className="space-y-6 print-area">
          {generated.map((day, idx) => (
            <div key={idx} className="bg-white text-black p-6 border rounded shadow-sm print:shadow-none print:border-0 print:rounded-none print:break-after-page">
              <div className="text-center font-bold text-sm leading-tight">
                <div>KEPOLISIAN NEGARA REPUBLIK INDONESIA</div>
                <div>RESOR {pengaturan.resor}</div>
                <div>SEKTOR {pengaturan.sektor}</div>
              </div>
              <hr className="border-t-2 border-black my-2" />
              <div className="text-center font-bold text-sm underline mb-1">RENCANA KEGIATAN UNIT BINMAS</div>
              <div className="text-center text-sm italic mb-3">
                Hari/Tanggal : {HARI[day.date.getDay()]}, {String(day.date.getDate()).padStart(2, "0")} {BULAN[bulan]} {tahun}, Minggu Ke - {mingguKe(day.date)}
              </div>
              <table className="w-full text-xs border-collapse border border-black">
                <thead>
                  <tr className="[&>th]:border [&>th]:border-black [&>th]:p-1 [&>th]:font-bold [&>th]:text-center bg-white">
                    <th className="w-8">NO</th>
                    <th className="w-24">JAM</th>
                    <th>BENTUK KEGIATAN</th>
                    <th>SASARAN</th>
                    <th>HASIL YANG DICAPAI</th>
                    <th className="w-20">KUAT PERSONEL</th>
                  </tr>
                </thead>
                <tbody>
                  {day.rows.map((r, i) => (
                    <tr key={i} className="[&>td]:border [&>td]:border-black [&>td]:p-1 [&>td]:align-top">
                      <td className="text-center">{i + 1}</td>
                      <td>{r.jam}</td>
                      <td>{r.nama}</td>
                      <td>{r.sasaran}</td>
                      <td>{r.hasil}</td>
                      <td className="text-center">{r.personel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end mt-6">
                <div className="text-center text-sm">
                  <div>{pengaturan.sektor.charAt(0) + pengaturan.sektor.slice(1).toLowerCase()}, {day.date.getDate()} {BULAN[bulan]} {tahun}</div>
                  <div className="font-semibold">{pengaturan.jabatan}</div>
                  <div className="h-16" />
                  <div className="font-bold underline">{pengaturan.nama}</div>
                  <div>{pengaturan.pangkat} NRP {pengaturan.nrp}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
