# Flux ESP32-S3 Flasher

**A lightweight, user-friendly desktop application for flashing firmware to ESP32-S3 boards designed in the Flux ecosystem.**

---

## in English

### ✨ Features

* **Modern & Intuitive UI:** A clean, animated, tile-based interface with smooth transitions.
* **Dual Language Support:** Full interface translation in English and Russian (including firmware instructions).
* **Theme Toggle:** Choose between Dark and Light modes.
* **Drag & Drop Support:** Simply drag a `.bin` file into the app to start flashing.
* **Online Firmware Catalog:** Download the latest firmwares directly from the repository without leaving the app.
* **Built-in Instructions:** Step-by-step guides for specific firmwares (e.g., Flipper Zero port) are displayed right in the app.
* **Custom COM Port Selector:** A beautiful, animated dropdown for selecting the serial port.
* **Offline & Local:** Works completely locally. Your firmware files and device data stay on your machine.
* **Easter Egg:** 5 clicks on the `?` in the bottom right corner might reveal a little surprise... 🦖

### 🚀 How to Use

1. **Download:** Download the latest `FluxFlasher.exe` from the **Releases** section of this repository.
2. **Run:** Double-click the `.exe` file to launch the application. No installation is required.
3. **Select Firmware:** Choose a `.bin` file from your computer, download one from the built-in online catalog, or simply drag & drop it into the app window.
4. **Connect Device:** Plug in your ESP32-S3 board. Make sure you have the necessary USB drivers installed (e.g., CH340 or CP210x).
5. **Flash:** Select the correct COM port and click **"Install"**.
6. **Wait:** Watch the progress bar. Once it's done, you'll see a green "✅ Success!" message. Your device is ready!

### 🛠 For Developers

* If you want to build the application from source or modify it:

* 1. **Prerequisites:** Install [Node.js](https://nodejs.org/) and [Python](https://www.python.org/) (with `esptool` installed via `pip install esptool`).
* 2. **Clone the repository:**
git clone https://github.com/winkirsel509-del/Flux-Flasher.git
cd Flux-Flasher

* 3. Install dependencies:
npm install

* 4. Run in dev mode:
npm start

* 5.Build the .exe:
npx electron-builder --win portable

## 👥 Authors & Credits

* **Program Developer:** DeepSeek AI
* **Project Owner / Developer:** [@Shk1pEr42](https://t.me/Shk1pEr42)
* **Firmware Authors:**
  * Bruce 1.16 & 1.14: [@photorezistor](https://t.me/photorezistor) | [TikTok](https://www.tiktok.com/@photorezistor)
  * Launcher port for flux: [@wilas0](https://t.me/wilas0)
  * Flipper port for flux: [@BaZa_dimentiya](https://t.me/BaZa_dimentiya) | [TikTok](https://www.tiktok.com/@d1metri1)
