# 📰 NewsHub - News Aggregator

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Javascript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Bootstrap](https://img.shields.io/badge/Bootstrap-563D7C?style=for-the-badge&logo=bootstrap&logoColor=white)
![JQuery](https://img.shields.io/badge/jQuery-0769AD?style=for-the-badge&logo=jquery&logoColor=white)
![NewsAPI](https://img.shields.io/badge/News_API-blue?style=for-the-badge&logo=api&logoColor=white)

NewsHub adalah aplikasi web sederhana untuk menampilkan berita terkini dari berbagai sumber menggunakan **[NewsAPI.org](https://newsapi.org/)**.

---

## 📸 Tampilan Aplikasi
<table align="center">
  <tr>
    <td><img src="screenshot-aplikasi/foto1.png" alt="Screenshot 1" width="100%"</td>
    <td><img src="screenshot-aplikasi/foto2.png" alt="Screenshot 2" width="100%"></td>
  </tr>
</table>

---

## ✨ Fitur Utama
- 🔍 **Pencarian Berita** berdasarkan kata kunci.
- 📰 **Kategori Berita**: Business, Technology, Sports, Health, Science, Entertainment, dll.
- 🌍 **Filter Sumber & Bahasa** (English & Indonesia).
- 🌑 **Dark Mode** toggle.
- 📑 **Bookmark Artikel** dengan penyimpanan di `localStorage`.
- ⏳ **Load More** untuk memuat berita tambahan.
- ⚠️ **Error Handling** untuk koneksi API & data kosong.
- 📱 **Responsive Design** dengan Bootstrap 5.

---

## 🛠 Teknologi yang Digunakan
- **HTML5**
- **Bootstrap**
- **JavaScript (jQuery 3.7)**
- **[News API](https://newsapi.org/)**

---

## 🚀 Instalasi & Penggunaan

### 1. Clone Repository
```bash
git clone https://github.com/ReykaMR/news-aggregator.git
cd news-aggregator
```

### 2. Setup Konfigurasi
- Salin file config.example.php menjadi config.php
- Buka config.php lalu ganti:
define('NEWS_API_KEY', 'your_actual_api_key_here');

### 3. Jalankan Server Lokal
Pastikan Anda memiliki PHP terinstal.
Lalu buka di browser : http://localhost/news-aggregator/index.php

---

## ⚙️ Konfigurasi
- NEWS_API_KEY → API Key NewsAPI.
- DEBUG_MODE → Mode debug untuk error log.
- allowed_origins → Domain yang diizinkan untuk CORS.

---

## 📃 Catatan
NewsAPI memiliki limit request pada paket gratis (100 request/hari).
