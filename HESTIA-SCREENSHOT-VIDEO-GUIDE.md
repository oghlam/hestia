# HESTIA — Screenshot & Video Presentation Guide

## Tujuan

Dokumen ini berisi panduan aset visual dan narasi video untuk kebutuhan hackathon. Fokus utama adalah membuktikan alur:

`Ring event → scene context → caregiver validation → family reassurance`

Dokumen ini dapat digunakan sebagai instruksi kerja lanjutan melalui `AGENTS.md`.

## Checklist Eksekusi

- [ ] Jalankan aplikasi HESTIA dalam mode demo.
- [ ] Siapkan data resident, room, Ring device, dan care team.
- [ ] Ambil lima screenshot sesuai daftar di bawah.
- [ ] Pastikan tidak ada HMAC key, AWS credential, token, atau data pribadi yang terlihat.
- [ ] Rekam video demo dengan durasi maksimal 3 menit.
- [ ] Gunakan narasi suara atau subtitle sesuai naskah.
- [ ] Simpan aset menggunakan nama file yang konsisten.
- [ ] Masukkan screenshot dan URL video ke `devpost-submission.md`.

## Screenshot yang Harus Dibuat

### 1. Dashboard Overview

Tampilkan:

- Greeting dan status rumah.
- Resident status.
- Room cards.
- Home Map dengan posisi Ring device.
- Activity feed atau active alert.

Nama file: `01-dashboard-overview.png`

### 2. Event Inspection dengan Nova Context

Tampilkan:

- Nama resident atau status unknown visitor.
- Lokasi dan room.
- Scene code S1, S2, S3, atau S4.
- Confidence score.
- Signal analysis.
- Nova Micro care-context summary.
- Recommended care action.

Nama file: `02-event-inspection-nova-context.png`

### 3. Validator PWA

Tampilkan:

- Resident dan lokasi.
- Alert context.
- Tombol `OK`, `COMING`, dan `SIREN`.
- Timer atau status `CARE IN PROGRESS`.

Nama file: `03-validator-pwa-action.png`

### 4. Alert Handled dan Family Reassurance

Tampilkan:

- Aksi `I HAVE ARRIVED`.
- Status alert resolved atau handled.
- Konfirmasi family reassurance.
- Audit atau response status jika terlihat jelas.

Nama file: `04-family-reassurance-resolved.png`

### 5. Ring Integration

Tampilkan salah satu:

- Ring simulator.
- Webhook diagnostics.
- Ring device registry dan room pairing.

Jangan tampilkan HMAC signing key, AWS credentials, Ring token, atau alamat/data pribadi yang tidak diperlukan.

Nama file: `05-ring-integration.png`

## Prinsip Pengambilan Screenshot

- Gunakan resolusi tinggi dan crop hanya pada area produk.
- Pastikan teks, status, dan tombol utama terbaca.
- Hindari halaman kosong, loading state, atau modal yang tidak relevan.
- Gunakan data demo yang konsisten pada semua screenshot.
- Tampilkan fitur yang bekerja, bukan hanya halaman konfigurasi.
- Prioritaskan alur produk dibanding jumlah screenshot.

## Video Demo

Durasi target: 2 menit 45 detik sampai 3 menit.

### 0:00–0:20 — Pembukaan dan Masalah

“Families and caregivers often receive raw camera motion alerts without enough context. This can create anxiety, false alarms, and delayed action.

HESTIA is an elder-care command center for Ring that turns those alerts into calm, actionable care context.”

### 0:20–0:45 — Dashboard

“This is the HESTIA Care Command Center.

The interface is designed around four questions: who is involved, what activity occurred, how serious is the scene, and what care action is needed.

The dashboard shows the resident status, room activity, home map, recent events, and the current care team.”

### 0:45–1:10 — Ring Event

“Now I will simulate a Ring event from the living room.

HESTIA receives and verifies the Ring event through a signed webhook, normalizes the payload, and evaluates the scene using its deterministic scene engine.”

### 1:10–1:35 — Event Inspection dan AI Context

“The event is classified as an S3 Help scene.

HESTIA identifies the registered resident target locally and combines the identity result with signals such as location, movement, and activity history.

Amazon Nova Micro receives structured text metadata only. It does not receive raw video or perform face recognition.

The result is a short care-focused explanation instead of a confusing raw AI output.”

### 1:35–2:00 — Validator PWA

“The caregiver receives a fast-action mobile interface.

They can select OK if the resident is safe, COMING if they are responding, or SIREN if immediate escalation is needed.

Here I will select COMING. The alert now moves into care in progress and the response timer starts.”

### 2:00–2:20 — Family Reassurance

“The dashboard updates the alert ownership and care status.

When the caregiver arrives and selects I HAVE ARRIVED, HESTIA marks the alert as handled and provides reassurance to the family.

This keeps the caregiver in control while giving the family visibility without creating unnecessary panic.”

### 2:20–2:45 — Unknown Visitor dan Automation

“HESTIA also separates unknown visitors from resident-care incidents.

An unknown person can be recorded as an access observation without triggering a care siren based on identity alone.

Automation rules can then apply confidence thresholds, zones, active windows, and escalation policies.”

### 2:45–3:00 — Penutup

“HESTIA connects Ring sensing with human care decisions.

It follows one simple flow: Ring event, scene context, caregiver validation, and family reassurance.

The goal is not surveillance. The goal is helping people care for someone they love, even when they are away.”

## Urutan Rekaman yang Disarankan

1. Mulai dari dashboard dalam keadaan normal.
2. Buka atau jalankan Ring simulator.
3. Picu skenario S3 Help.
4. Buka event inspection dan jelaskan context AI.
5. Buka Validator PWA.
6. Pilih `COMING`.
7. Tampilkan perubahan status di dashboard.
8. Pilih `I HAVE ARRIVED`.
9. Tampilkan family reassurance atau handled state.
10. Tutup dengan tampilan Ring integration atau unknown visitor path jika waktu memungkinkan.

## Setelah Aset Selesai

Perbarui bagian berikut di `devpost-submission.md`:

- `## Public Demo Link`
- `## Demo Video`
- `## Screenshot Shot List`
- `## Submission Readiness Notes`

Sebelum dipublikasikan, lakukan pemeriksaan ulang terhadap secret, URL demo, audio video, keterbacaan teks, dan durasi video.

