<p align="center">
  <img src="assets/logo_mashimurelay.png" alt="Mashimurelay Logo" width="160" />
</p>

# Mashimurelay — Electromechanical Relay CAD Simulator

> High-performance electromechanical relay CAD simulator and circuit solver powered by BFS/DFS equipotential graph traversal for AC 3-phase and DC series-parallel loads. Built with a 60 FPS HTML5 Canvas 2D engine, native Web Audio API synthesis, multi-project LocalStorage schema, and offline PWA service worker with zero external dependencies.

Aplikasi CAD simulator rangkaian relay elektromekanikal dan kontrol motor industri untuk web desktop dan web mobile (Chrome Mobile, Android, iOS, Windows, macOS). Berdiri sendiri (*fully standalone*) dengan dukungan mode **WebView Desktop App**, **Browser Web CAD**, dan **Offline PWA**.

---

## ⚡ Cara Menjalankan

Pilih salah satu cara paling nyaman berikut:

### Opsi 1: Mode WebView App (Rekomendasi - Seperti Aplikasi Desktop Asli)
Cukup klik ganda:
```text
run-webview-app.bat
```
Aplikasi akan langsung terbuka dalam jendela mandiri (*standalone window*) tanpa bilah URL atau tab browser.

### Opsi 2: Mode Browser (Google Chrome / Microsoft Edge / Mobile)
Klik ganda:
```text
run-browser.bat
```
Aplikasi akan membuka browser standar di alamat `http://localhost:8080/index.html`.

### Opsi 3: Menu Interaktif
Klik ganda:
```text
launch.bat
```

---

## 📁 Struktur Direktori `simurelay-web` (100% Mandiri)

```text
simurelay-web/
├── run-webview-app.bat      <-- Launcher aplikasi mode desktop WebView
├── run-browser.bat          <-- Launcher mode browser
├── launch.bat               <-- Menu launcher interaktif
├── serve.py                 <-- Server lokal mandiri (Python HTTP Server)
├── index.html               <-- Antarmuka CAD utama
├── components.json          <-- Database 120 komponen industri
├── css/                     <-- Gaya antarmuka & dark theme (#121216)
├── js/                      <-- Mesin simulasi & canvas renderer
└── assets/                  <-- Salinan simbol SVG vektor asli
```

> [!NOTE]
> Proyek ini **100% independen** dari versi Android (`simurelay-android`). Modifikasi atau perubahan berkas di folder ini tidak akan pernah mempengaruhi proyek Android, begitu pun sebaliknya.
