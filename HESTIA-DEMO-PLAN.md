# HESTIA — Comprehensive Live Demo & Device Testing Plan

Dokumen ini adalah panduan lengkap langkah-demi-langkah (*step-by-step execution script*) untuk pengujian dan demonstrasi HESTIA (Elder Care Command Center for Ring).

---

## 🎯 Tujuan Pengujian & Demonstrasi
Memverifikasi alur lengkap:
$$\text{Ring Event / Camera Feed} \longrightarrow \text{Biometric Face Lock} \longrightarrow \text{Scene Engine (S1--S4)} \longrightarrow \text{Nova Micro AI Context} \longrightarrow \text{Caregiver Validator Action} \longrightarrow \text{Family Reassurance}$$

---

## 🖥️ 1. Menjalankan Server & Aplikasi

Pastikan backend API dan frontend web berjalan:

```bash
# Terminal 1: Jalankan Backend API Server (Port 8787)
npm run api

# Terminal 2: Jalankan Frontend Web Dashboard (Port 5173)
npm run dev
```

* **Dashboard Web**: `http://127.0.0.1:5173/`
* **Validator PWA (Mobile View)**: `http://127.0.0.1:5173/?view=validator`
* **API Health Check**: `http://127.0.0.1:8787/health`

---

## 🎬 2. Skenario Pengujian Berdasarkan Device Aktif

### Skenario A: Uji Coba Kamera Lokal / Smartphone (Tanpa Ketergantungan Hardware Ring)

> **Tujuan**: Membuktikan deteksi wajah asli, penguncian target (*Target Locking*), klasifikasi adegan, dan ringkasan AI menggunakan webcam laptop atau kamera HP.

1. **Buka Menu Settings**:
   - Klik tab **Settings** di sidebar kiri.
   - Pada kartu **Ingestion Pipeline**, pilih mode 📷 **Local Camera / Smartphone**.
2. **Aktifkan Kamera**:
   - Klik tombol **"Start Local Camera"**. Browser akan meminta izin akses webcam/kamera.
   - Anda akan melihat tampilan video aktif pada *Viewfinder*.
3. **Pilih Zona Ruangan & Skenario**:
   - **Ingest to Zone**: Pilih `Living Room` atau `Bedroom`.
   - **Simulation Signal**: Pilih `Elder Fall / Distress (S3)`.
   - **Face Hint**: Pilih `Known Resident (Eleanor / Primary Target)`.
4. **Jepret & Ingest ke Pipeline**:
   - Klik tombol **"Capture Snapshot & Ingest to Pipeline"** (atau aktifkan **"Auto-Stream (5s)"** untuk pengiriman otomatis).
5. **Verifikasi Hasil Real-Time**:
   - **Scene Engine**: Mengklasifikasikan situasi sebagai **S3_HELP** (Keyakinan: ≥ 85%).
   - **Subject**: Terkunci sebagai *Eleanor* (Target terverifikasi).
   - **AI Summary (Nova Micro)**: Memunculkan kalimat penjelasan situasi ramah pengasuh (*"Eleanor is in distress in Living Room, immediate assistance recommended"*).
   - **Home Map**: Indikator lampu kamera di *Living Room* berkedip oranye/merah.

---

### Skenario B: Registrasi Wajah Multi-Sudut (People Studio)

> **Tujuan**: Mendaftarkan 3 sudut pose wajah biometrik (Front 0°, Left 45°, Right 45°) untuk melatih model lokal OpenCV/ArcFace.

1. **Buka Tab People**:
   - Klik tab **People** di sidebar.
   - Klik tombol **"Register Resident"** (atau klik **"Studio"** pada kartu Eleanor).
2. **Buka Multi-Angle Face Studio**:
   - Di dalam modal Face Studio, klik **"Enable Camera"** untuk melihat wajah Anda di dalam reticle bidik.
3. **Ambil 3 Pose Wajah**:
   - Pilih tab **FRONT (0°)** $\rightarrow$ Hadapkan wajah lurus $\rightarrow$ Klik **"Capture & Register FRONT Angle"**.
   - Pilih tab **LEFT (45°)** $\rightarrow$ Miringkan wajah 45° ke kiri $\rightarrow$ Klik **"Capture & Register LEFT Angle"**.
   - Pilih tab **RIGHT (45°)** $\rightarrow$ Miringkan wajah 45° ke kanan $\rightarrow$ Klik **"Capture & Register RIGHT Angle"**.
4. **Verifikasi**:
   - Thumbnail foto asli langsung muncul di slot masing-masing sudut beserta skor *cosine similarity* (94%–98%).
   - Data otomatis tersimpan secara permanen di `/public/uploads/` dan `localStorage`.

---

### Skenario C: Respon Cepat Pengasuh (Caregiver Validator Loop)

> **Tujuan**: Memvalidasi tindakan pengasuh pada Validator PWA dan alur penenang keluarga (*Family Reassurance*).

1. **Buka Dua Jendela Browser Bersisian**:
   - Jendela Kiri: Dashboard Utama (`http://127.0.0.1:5173/`).
   - Jendela Kanan: Validator Mobile (`http://127.0.0.1:5173/?view=validator`).
2. **Picu Alert Bantuan (S3 Help)**:
   - Di dashboard, klik tombol **"Trigger Distress Demo"** (atau lewat Local Camera Studio).
   - Jendela kanan (Validator) langsung bergetar/berbunyi memunculkan kartu bahaya merah dengan foto lansia, zona kamar, dan hitung mundur SLA.
3. **Pengasuh Mengambil Tindakan**:
   - Pengasuh menekan tombol **`COMING`** (Saya Menuju Lokasi).
   - Status berubah menjadi **`CARE_IN_PROGRESS`** (ETA: 5 menit).
   - Keluarga menerima notifikasi update penenang: *"Maria is en route to Bedroom"*.
4. **Konfirmasi Selesai di Lokasi**:
   - Setelah tiba, pengasuh menekan **`I HAVE ARRIVED`** $\rightarrow$ Status berubah menjadi **`HANDLED`**.
   - Atau tekan **`OK`** jika situasi sudah aman $\rightarrow$ Status berubah menjadi **`RESOLVED`**.
5. **Verifikasi Audit Trail**:
   - Di tab **Events** dan **Care Team**, seluruh riwayat aksi pengasuh tercatat lengkap pada *Validator Action Audit Log*.

---

### Skenario D: Manajemen Zona Ruangan & Kalibrasi Peta (Floor Plan)

1. **Buka Tab Rooms**:
   - Pilih sub-tab **Floor Map Setup & Pin Calibration**.
2. **Kalibrasi Posisi Kamera Ring**:
   - Klik **"Calibrate Position"** pada salah satu ruangan.
   - Klik di atas gambar denah rumah untuk memindahkan posisi pin kamera secara presisi (rasio 16:10).
3. **Uji Coba Tambah Ruangan Baru**:
   - Klik **`+ Add Room & Camera`** $\rightarrow$ Masukkan nama ruangan (misal: *Patio & Taman Belakang*) $\rightarrow$ Pilih tipe Ring Stick Up Cam $\rightarrow$ Simpan.
   - Ruangan baru langsung muncul di denah, kartu ruangan, dan dropdown kamera.

---

### Skenario E: Mesin Aturan Otomatisasi (Automation Rules Engine)

1. **Buka Tab Automation**:
   - Lihat 5 kartu aturan aktif (*Fall & Distress Guard*, *Night Wandering Guard*, *Visitor Filter*, *Camera Offline*, *Morning Routine*).
2. **Uji Toggle Sakelar**:
   - Klik sakelar on/off pada salah satu kartu aturan untuk mengaktifkan/menonaktifkan pengawasan zona.
3. **Buat Aturan Kustom**:
   - Klik **`Create Custom Rule`** $\rightarrow$ Atur batas keyakinan (*Confidence Gate Slider*), jam aktif (24/7 atau rentang jam), batas waktu SLA, dan kebijakan eskalasi $\rightarrow$ Simpan.

---

## 📊 3. Checklist Verifikasi Akhir

| No | Fitur yang Diuji | Status | Catatan |
| :--- | :--- | :---: | :--- |
| 1 | Pendaftaran Lansia & Foto Wajah 3 Sudut | ✅ Siap | Thumbnail tersimpan permanen |
| 2 | Kamera Lokal / Webcam Feed ke Pipeline | ✅ Siap | Snapshot masuk ke `/api/pipeline/feed` |
| 3 | Klasifikasi Scene S1, S2, S3, S4 | ✅ Siap | Akurat sesuai ambang batas |
| 4 | Ringkasan Teks AI Amazon Nova Micro | ✅ Siap | Bahasa natural ramah pengasuh |
| 5 | Validator PWA Mobile Action (`COMING`, `OK`) | ✅ Siap | Sinkron 2.5s real-time |
| 6 | Log Event Explorer (Search, Filter, Paging) | ✅ Siap | Lengkap dengan filter tanggal |
| 7 | CRUD Care Team & Foto Pengasuh | ✅ Siap | Tersimpan di disk & local storage |
| 8 | Kalibrasi Pin Denah Rumah | ✅ Siap | Rasio 16:10 stabil |
