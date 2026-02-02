# USER GUIDELINES — SCHEDULE BOT

Bot ini digunakan untuk mengelola jadwal event di server Discord
(melihat jadwal, detail, edit, delete, dan reminder otomatis).

────────────────────────────────────────

# PERMISSION

PUBLIC USER
- Hanya bisa melihat jadwal
- Bisa klik tombol View

ADMIN ROLE
- Bisa add, edit, delete schedule
- Tombol Edit & Delete hanya muncul untuk admin

────────────────────────────────────────

# COMMAND USAGE

!sched list
Untuk menampilkan daftar semua schedule di server ini

→ Bot akan mengirim embed berisi list schedule
→ Setiap schedule memiliki tombol

────────────────────────────────────────

!sched add <name>, <DD/MM/YYYY HH:mm>
(ADMIN ONLY)

Untuk menambahkan schedule baru

Contoh:
!sched add Server Upgrade, 10/02/2026 22:00

→ Schedule langsung tersimpan
→ Reminder otomatis akan aktif

────────────────────────────────────────

!sched delete <number>
(ADMIN ONLY)

Untuk menghapus schedule berdasarkan nomor urutan

Contoh:
!sched delete 1

────────────────────────────────────────

# BUTTON USAGE

View <Schedule Name>
(PUBLIC)

Untuk melihat detail schedule

→ Menampilkan:
- Nama schedule
- Tanggal & waktu
- Relative time (contoh: in 2 days)

────────────────────────────────────────

Edit
(ADMIN ONLY)

Untuk mengedit schedule

→ Bot akan masuk ke Edit Mode
→ Admin harus mengirim pesan dengan format:

<new name>, <DD/MM/YYYY HH:mm>

Contoh:
Server Upgrade Final, 11/02/2026 23:00

────────────────────────────────────────

Delete
(ADMIN ONLY)

Untuk menghapus schedule

→ Bot akan menampilkan konfirmasi
→ Klik "Yes, delete" untuk menghapus
→ Klik "Cancel" untuk membatalkan

────────────────────────────────────────

# REMINDER SYSTEM

Bot memiliki reminder otomatis

Reminder akan dikirim:
- Beberapa waktu sebelum schedule dimulai
- Menggunakan embed
- Berdasarkan waktu schedule

Reminder tetap aktif meskipun bot restart
(selama data schedule masih tersimpan)

────────────────────────────────────────

# QUICK FLOW

!sched list
→ klik "View <name>" untuk melihat detail

(Admin)
!sched add <name>, <date>
→ klik Edit / Delete dari list

────────────────────────────────────────

END OF USER GUIDELINES