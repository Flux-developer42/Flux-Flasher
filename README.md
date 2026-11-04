# Flux Flasher

**A lightweight, user-friendly desktop application for flashing firmware to Flux.**

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
4. **Connect Device:** Plug in your FLUX.
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
  * Launcher port for flux/Marauder: [@wilas0](https://t.me/wilas0)
  * Flipper port for flux: [@BaZa_dimentiya](https://t.me/BaZa_dimentiya) | [TikTok](https://www.tiktok.com/@d1metri1)



# Flux Flasher

**Легкое и удобное десктопное приложение для прошивки Flux.**

---
## На Русском

## ✨ Возможности

* **Современный интерфейс:** Чистый, анимированный дизайн с плиточными кнопками и плавными переходами.
* **Два языка:** Полный перевод интерфейса на русский и английский языки (включая инструкции к прошивкам).
* **Смена темы:** Выбор между темной и светлой темой.
* **Поддержка Drag & Drop:** Просто перетащите `.bin` файл в окно программы, чтобы начать прошивку.
* **Онлайн-каталог прошивок:** Скачивайте актуальные прошивки прямо из репозитория, не выходя из программы.
* **Встроенные инструкции:** Пошаговые руководства для конкретных прошивок (например, для порта Flipper Zero) отображаются прямо в приложении.
* **Кастомный выбор COM-порта:** Красивое анимированное выпадающее меню для выбора порта.
* **Работает локально:** Приложение не требует интернета для прошивки. Ваши файлы и данные устройства остаются на вашем компьютере.
* **Пасхалка:** 5 кликов по знаку `?` в правом нижнем углу могут открыть небольшой сюрприз... 🦖

## 🚀 Как использовать

1. **Скачайте:** Скачайте последнюю версию `FluxFlasher.exe` в разделе **Releases** этого репозитория.
2. **Запустите:** Дважды кликните по `.exe` файлу. Установка не требуется.
3. **Выберите прошивку:** Укажите `.bin` файл на вашем компьютере, скачайте его из встроенного онлайн-каталога или просто перетащите в окно программы.
4. **Подключите устройство:** Подключите FLUX по USB.
5. **Прошейте:** Выберите правильный COM-порт и нажмите кнопку **«Установить»**.
6. **Готово:** Следите за шкалой прогресса. После завершения появится зеленая надпись «✅ Успешно!». Устройство готово к работе.

## 🛠 Для разработчиков

Если вы хотите собрать приложение из исходников или изменить его:

1. **Что нужно:** Установите [Node.js](https://nodejs.org/) и [Python](https://www.python.org/) (с установленной библиотекой `esptool` через `pip install esptool`).

2. **Склонируйте репозиторий:**
   `git clone https://github.com/Flux-developer42/Flux-Flasher.git`
   `cd Flux-Flasher`

3. **Установите зависимости:**
   `npm install`

4. **Запустите в режиме разработки:**
   `npm start`

5. **Соберите `.exe`:**
   `npx electron-builder --win portable`

Готовый `.exe` файл появится в папке `dist`.

## 👥 Авторы и благодарности

* **Разработчик программы:** DeepSeek AI
* **Владелец проекта / Разработчик:** [@Shk1pEr42](https://t.me/Shk1pEr42)
* **Авторы прошивок:**
  * Bruce 1.16 и 1.14: [@photorezistor](https://t.me/photorezistor) | [TikTok](https://www.tiktok.com/@photorezistor)
  * Launcher port for flux/Marauder: [@wilas0](https://t.me/wilas0)
  * Flipper port for flux: [@BaZa_dimentiya](https://t.me/BaZa_dimentiya) | [TikTok](https://www.tiktok.com/@d1metri1)
