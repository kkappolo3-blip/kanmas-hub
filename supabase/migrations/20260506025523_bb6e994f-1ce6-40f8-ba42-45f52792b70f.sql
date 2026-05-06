
-- Personil (Bhabin)
CREATE TABLE public.personil (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nama TEXT NOT NULL,
  nrp TEXT,
  pangkat TEXT,
  jabatan TEXT DEFAULT 'Bhabinkamtibmas',
  desa_binaan TEXT,
  no_hp TEXT,
  drive_folder TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aset Ranmor (kendaraan dinas)
CREATE TABLE public.ranmor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  personil_id UUID REFERENCES public.personil(id) ON DELETE SET NULL,
  jenis TEXT,
  merk TEXT,
  tipe TEXT,
  no_polisi TEXT,
  no_rangka TEXT,
  no_mesin TEXT,
  warna TEXT,
  tahun INT,
  kondisi TEXT DEFAULT 'Baik',
  foto_depan TEXT,
  foto_belakang TEXT,
  foto_kiri TEXT,
  foto_kanan TEXT,
  foto_no_rangka TEXT,
  foto_no_mesin TEXT,
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rencana Kegiatan
CREATE TABLE public.rencana_kegiatan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal DATE NOT NULL,
  waktu_mulai TIME,
  waktu_selesai TIME,
  jenis_giat TEXT NOT NULL,
  sasaran TEXT,
  lokasi TEXT,
  personil_id UUID REFERENCES public.personil(id) ON DELETE SET NULL,
  uraian TEXT,
  status TEXT DEFAULT 'Rencana',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Laporan Bulanan
CREATE TABLE public.laporan_bulanan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bulan INT NOT NULL,
  tahun INT NOT NULL,
  ringkasan TEXT,
  total_kegiatan INT DEFAULT 0,
  catatan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Open access (no auth per user request)
ALTER TABLE public.personil ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ranmor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rencana_kegiatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan_bulanan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public all personil" ON public.personil FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public all ranmor" ON public.ranmor FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public all rencana" ON public.rencana_kegiatan FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public all laporan" ON public.laporan_bulanan FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket for foto ranmor
INSERT INTO storage.buckets (id, name, public) VALUES ('kanmas-foto', 'kanmas-foto', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public read kanmas-foto" ON storage.objects FOR SELECT USING (bucket_id = 'kanmas-foto');
CREATE POLICY "public upload kanmas-foto" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'kanmas-foto');
CREATE POLICY "public update kanmas-foto" ON storage.objects FOR UPDATE USING (bucket_id = 'kanmas-foto');
CREATE POLICY "public delete kanmas-foto" ON storage.objects FOR DELETE USING (bucket_id = 'kanmas-foto');
