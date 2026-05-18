// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js"
import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    getDoc,
    query,
    where
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js"

// GANTI DENGAN FIREBASE CONFIG ANDA
const firebaseConfig = {
    apiKey: "AIzaSyAMYR89DaWshLi9Q3DzlOfd6-zERrlk-Dg",
    authDomain: "ic2025-4d32e.firebaseapp.com",
    projectId: "ic2025-4d32e",
    storageBucket: "ic2025-4d32e.firebasestorage.app",
    messagingSenderId: "614606671675",
    appId: "1:614606671675:web:a92cc69855fb3d7568f11e"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const bukuCollection = collection(db, "buku")
const peminjamanCollection = collection(db, "peminjaman")

// fungsi untuk login
export async function login() {
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value

    const q = query(
        collection(db, "users"),
        where("username", "==", username),
        where("password", "==", password)
    )

    const querySnapshot = await getDocs(collection(db, "users"))

    let ketemu = false

    querySnapshot.forEach((doc) => {
        const data = doc.data()

        if (data.username === username && data.password === password) {
            ketemu = true
        }
    })

    if (ketemu) {
        // simpan status login di localStorage
        localStorage.setItem("isLogin", "true")

        document.getElementById("status").innerText = "Login berhasil"
        // redirect
        window.location.href = "admin.html"
    } else {
        document.getElementById("status").innerText = "Username atau password salah"
    }
}

// fungsi untuk logout
export function logout() {
    // hapus status login dari localStorage
    localStorage.removeItem("isLogin")

    // redirect ke halaman login
    window.location.href = "login.html"
}

//fungsi untuk menampilkan daftar buku
export async function daftarBuku() {

    // ambil snapshot data dari koleksi buku
    const snapshot = await getDocs(bukuCollection)

    // ambil elemen tabel data
    const tabel = document.getElementById('tabelData')

    // kosongkan isi tabel nya
    tabel.innerHTML = ""

    // loop setiap dokumen dalam snapshot
    snapshot.forEach((doc) => {
        // variabel untuk menyimpan data
        const data = doc.data()
        const id = doc.id

        // buat elemen baris baru
        const baris = document.createElement("tr")

        // buat elemen kolom untuk nomor urut
        const nomorUrut = document.createElement("td")
        nomorUrut.textContent = tabel.rows.length + 1

        // buat elemen kolom untuk judul buku
        const judulBuku = document.createElement("td")
        judulBuku.textContent = data.judulBuku

        // buat elemen untuk kolom penulis
        const penulis = document.createElement("td")
        penulis.textContent = data.penulis

        // buat elemen untuk kolom penerbit
        const penerbit = document.createElement("td")
        penerbit.textContent = data.penerbit

        // buat elemen kolom untuk aksi
        const kolomAksi = document.createElement('td')

        // tombol edit
        const tombolEdit = document.createElement('a')
        tombolEdit.textContent = 'Edit'
        tombolEdit.href = 'edit.html?id=' + id
        tombolEdit.className = 'button edit'

        // tombol hapus
        const tombolHapus = document.createElement('button')
        tombolHapus.textContent = 'Hapus'
        tombolHapus.className = 'button delete'
        tombolHapus.onclick = async () => {
            await hapusBuku(id)
        }

        // tambahkan elemen ke dalam kolom aksi
        kolomAksi.appendChild(tombolEdit)
        kolomAksi.appendChild(tombolHapus)

        // tambahkan kolom ke dalam baris
        baris.appendChild(nomorUrut)
        baris.appendChild(judulBuku)
        baris.appendChild(penulis)
        baris.appendChild(penerbit)
        baris.appendChild(kolomAksi)

        // tambahkan baris ke dalam tabel
        tabel.appendChild(baris)

    })
}

// fungsi untuk menambahkan buku baru
export async function tambahBuku() {
    // ambil nilai dari form
    const judulBuku = document.getElementById('judulBuku').value
    const penulis = document.getElementById('penulis').value
    const penerbit = document.getElementById('penerbit').value

    // tambahkan data ke firestore
    await addDoc(bukuCollection, {
        judulBuku: judulBuku,
        penulis: penulis,
        penerbit: penerbit,
    })

    // alihkan ke halaman daftar buku
    window.location.href = 'admin.html'
}

// fungsi untuk menampilkan daftar buku secara publik
export async function daftarBukuPublik() {
    // ambil snapshot data dari koleksi buku
    const snapshot = await getDocs(bukuCollection)

    // ambil elemen container buku
    const container = document.getElementById('container-buku')

    // kosongkan isi container nya
    container.innerHTML = ""

    // loop setiap dokumen dalam snapshot
    snapshot.forEach((doc) => {
        // variabel untuk menyimpan data
        const data = doc.data()
        const id = doc.id

        // buat elemen kartu buku
        const kartu = document.createElement("div")
        kartu.className = "book-card"

        // buat elemen judul buku
        const judulBuku = document.createElement("h3")
        judulBuku.textContent = data.judulBuku

        // buat elemen penulis
        const penulis = document.createElement("p")
        penulis.textContent = "Penulis: " + data.penulis

        // buat elemen tombol pinjam
        const tombolPinjam = document.createElement("button")
        tombolPinjam.textContent = "Pinjam"
        tombolPinjam.className = "btn"
        tombolPinjam.onclick = async () => {
            tombolPinjam.disabled = true
            await pinjamBuku(id, data.judulBuku)
        }

        // tambahkan elemen judul, penulis, dan tombol pinjam ke dalam kartu
        kartu.appendChild(judulBuku)
        kartu.appendChild(penulis)
        kartu.appendChild(tombolPinjam)

        // tambahkan kartu ke dalam container
        container.appendChild(kartu)
    })
}

// fungsi untuk melakukan peminjaman langsung
export async function pinjamBuku(idBuku, judulBuku) {
    // Konfirmasi ke user (opsional, biar lebih interaktif)
    const konfirmasi = confirm(`Apakah Anda yakin ingin meminjam buku "${judulBuku}"?`)

    if (konfirmasi) {
        try {
            // Catat data peminjaman ke Firestore
            await addDoc(peminjamanCollection, {
                idBuku: idBuku,
                judulBuku: judulBuku,
                tanggalPinjam: new Date().toLocaleDateString('id-ID'), // Tanggal hari ini
                status: "Dipinjam" // Status langsung diset aktif
            })

            alert(`Berhasil meminjam buku "${judulBuku}"!`)

            // Opsional: Refresh halaman atau arahkan ke halaman tertentu jika diperlukan
            // window.location.reload()

        } catch (error) {
            console.error("Gagal meminjam buku: ", error)
            alert("Terjadi kesalahan saat memproses peminjaman.")
        }
    }
}

// fungsi untuk menampilkan daftar peminjaman di halaman admin
export async function daftarPeminjaman() {
    // Ambil snapshot data dari koleksi peminjaman
    const peminjamanCollection = collection(db, "peminjaman")
    const snapshot = await getDocs(peminjamanCollection)

    // Ambil elemen tbody untuk tabel peminjaman
    const tabel = document.getElementById('tabelPeminjaman')

    // Pastikan elemennya ada di HTML sebelum memproses
    if (!tabel) return

    // Kosongkan isi tabel terlebih dahulu
    tabel.innerHTML = ""

    // Loop setiap dokumen dalam snapshot peminjaman
    snapshot.forEach((doc) => {
        const data = doc.data()

        // Buat elemen baris baru
        const baris = document.createElement("tr")

        // Kolom 1: Nomor Urut
        const nomorUrut = document.createElement("td")
        nomorUrut.textContent = tabel.rows.length + 1

        // Kolom 2: Judul Buku
        const judulBuku = document.createElement("td")
        judulBuku.textContent = data.judulBuku

        // Kolom 3: Tanggal Pinjam
        const tanggalPinjam = document.createElement("td")
        tanggalPinjam.textContent = data.tanggalPinjam || "-"

        // Kolom 4: Status Peminjaman
        const status = document.createElement("td")
        status.textContent = data.status || "Dipinjam"

        // Opsional: memberi style/warna text berdasarkan status
        status.style.fontWeight = "bold"
        status.style.color = data.status === "Kembali" ? "green" : "orange"

        // Masukkan kolom-kolom ke dalam baris
        baris.appendChild(nomorUrut)
        baris.appendChild(judulBuku)
        baris.appendChild(tanggalPinjam)
        baris.appendChild(status)

        // Masukkan baris ke dalam tabel
        tabel.appendChild(baris)
    })
}
