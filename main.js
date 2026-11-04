const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { SerialPort } = require('serialport');
const { spawn } = require('child_process');
const https = require('https');
const fs = require('fs');
const os = require('os');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 550,
    height: 750,
    resizable: true,
    autoHideMenuBar: true,
    title: "Flux Flasher by winki",
    icon: path.join(__dirname, 'ico', 'Flux_Flasher.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: true,
      webSecurity: false
    }
  });

  mainWindow.loadFile('flasher.html');
}

app.whenReady().then(createWindow);

// --- 1. Получение списка COM-портов ---
ipcMain.handle('get-ports', async () => {
  try {
    const ports = await SerialPort.list();
    return ports.map(p => ({ path: p.path, name: p.friendlyName || p.path }));
  } catch (err) {
    return [];
  }
});

// --- 2. Скачивание JSON со списком прошивок ---
ipcMain.handle('fetch-firmware-list', async (event, url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return https.get(response.headers.location, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try { resolve(JSON.parse(data)); } catch(e) { reject(new Error('Ошибка формата JSON')); }
          });
        }).on('error', reject);
      }
      if (response.statusCode !== 200) return reject(new Error(`Сервер вернул ошибку: ${response.statusCode}`));
      
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { reject(new Error('Ошибка формата JSON')); }
      });
    }).on('error', reject);
  });
});

// --- 3. Скачивание JSON со списком авторов ---
ipcMain.handle('fetch-authors-list', async (event, url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return https.get(response.headers.location, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            try { resolve(JSON.parse(data)); } catch(e) { reject(new Error('Ошибка формата JSON')); }
          });
        }).on('error', reject);
      }
      if (response.statusCode !== 200) return reject(new Error(`Сервер вернул ошибку: ${response.statusCode}`));
      
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try { resolve(JSON.parse(data)); } catch(e) { reject(new Error('Ошибка формата JSON')); }
      });
    }).on('error', reject);
  });
});

// --- 4. Скачивание файла (прошивки или доп. архива) с прогрессом ---
ipcMain.handle('download-file', async (event, { url, isExtra = false, defaultName = 'firmware.bin' }) => {
  return new Promise((resolve, reject) => {
    let targetPath;
    
    if (isExtra) {
      const downloadsPath = app.getPath('downloads');
      targetPath = path.join(downloadsPath, defaultName);
    } else {
      targetPath = path.join(os.tmpdir(), `flux_firmware_${Date.now()}.bin`);
    }

    const file = fs.createWriteStream(targetPath);

    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return https.get(response.headers.location, (res) => handleResponse(res));
      }
      handleResponse(response);
    }).on('error', (err) => {
      fs.unlink(targetPath, () => {}); 
      reject(err);
    });

    function handleResponse(response) {
      if (response.statusCode !== 200) {
        return reject(new Error(`Сервер вернул ошибку: ${response.statusCode}`));
      }
      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;

      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        if (totalSize) {
          const percent = Math.round((downloadedSize / totalSize) * 100);
          event.sender.send('download-progress', { percent });
        }
      });

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(targetPath);
      });
    }
  });
});

// --- 5. Прошивка устройства через esptool ---
ipcMain.on('flash-device', (event, { port, filePath }) => {
  const child = spawn('python', [
    '-m', 'esptool',
    '--chip', 'esp32s3',
    '--port', port,
    '--baud', '921600',
    'write_flash', '-z',
    '--flash_mode', 'dio',
    '--flash_freq', '80m',
    '0x10000', filePath 
  ]);

  let output = '';

  child.stdout.on('data', (data) => {
    output += data.toString();
    const match = output.match(/\((\d+)\s%\)/);
    if (match) {
      event.reply('flash-progress', parseInt(match[1]));
    }
    if (output.includes('Hard resetting') || output.includes('Hash of data verified')) {
      event.reply('flash-result', { ok: true });
    }
  });

  child.stderr.on('data', (data) => {
    const errText = data.toString();
    if (errText.includes('warning') || errText.includes('deprecated')) return;
    console.error(errText);
    event.reply('flash-result', { ok: false, error: errText });
  });

  child.on('close', (code) => {
    if (code !== 0) {
      event.reply('flash-result', { ok: false, error: `Процесс завершился с кодом ${code}` });
    }
  });
});