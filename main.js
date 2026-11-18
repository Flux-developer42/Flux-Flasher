const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { SerialPort } = require('serialport');
const { spawn, exec } = require('child_process');
const https = require('https');
const fs = require('fs');
const os = require('os');
const http = require('http');

// ОТКЛЮЧАЕМ АППАРАТНОЕ УСКОРЕНИЕ (ФИКС ВИДЕО)
app.disableHardwareAcceleration();

let mainWindow;
let logStream;
let logFilePath = '';
let pythonCmd = 'python';

// --- ЛОКАЛЬНЫЙ СЕРВЕР ---
function startLocalServer() {
    const server = http.createServer((req, res) => {
        let reqUrl = req.url.split('?')[0];
        let cleanUrl = reqUrl.startsWith('/') ? reqUrl.substring(1) : reqUrl;
        if (cleanUrl === '') cleanUrl = 'index.html';
        
        if (cleanUrl === 'default.cfg') {
            res.writeHead(200, { 'Content-Type': 'text/plain', 'Access-Control-Allow-Origin': '*' });
            res.end("");
            return;
        }
        
        // ИСПРАВЛЕНИЕ: Ищем игру в нескольких местах (в архиве, в resources, рядом с exe)
        let pathsToTry = [
            path.join(app.getAppPath(), 'game', cleanUrl),
            path.join(process.resourcesPath, 'game', cleanUrl),
            path.join(__dirname, 'game', cleanUrl)
        ];
        
        let filePath = pathsToTry.find(p => fs.existsSync(p));

        if (!filePath) {
            console.error(`[СЕРВЕР] 404 Not Found: ${cleanUrl}`);
            res.writeHead(404); res.end("Not Found"); return;
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404); res.end("Not Found"); return;
            }
            const ext = path.extname(filePath).toLowerCase();
            let mimeType = 'application/octet-stream';
            if (ext === '.html') mimeType = 'text/html; charset=utf-8';
            else if (ext === '.js') mimeType = 'text/javascript';
            else if (ext === '.css') mimeType = 'text/css';
            else if (ext === '.wasm') mimeType = 'application/wasm';
            else if (ext === '.zip') mimeType = 'application/zip'; 
            else if (ext === '.mp3') mimeType = 'audio/mpeg'; 
            
            res.writeHead(200, { 
                'Content-Type': mimeType,
                'Access-Control-Allow-Origin': '*' 
            });
            res.end(data);
        });
    });
    server.listen(8080, () => console.log('Локальный сервер запущен на http://localhost:8080'));
}

// --- ЛОГИ ---
function initLogger() {
    try {
        logFilePath = path.join(app.getPath('userData'), 'debug.log');
        logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
        logMessage(`\n\n=======================================================`);
        logMessage(`--- ЗАПУСК ПРОГРАММЫ ${new Date().toLocaleString()} ---`);
        logMessage(`Файл логов: ${logFilePath}`);
    } catch (err) {
        console.error("Не удалось создать файл логов:", err);
    }
}

function logMessage(msg) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${msg}`;
    console.log(logLine);
    if (logStream) logStream.write(logLine + '\n');
}

function createWindow() {
    // Путь к иконке (лежит в папке ico рядом с main.js)
    const iconPath = path.join(app.getAppPath(), 'ico', 'FluxFlasher.ico');

    mainWindow = new BrowserWindow({
        width: 550,
        height: 750,
        resizable: true,
        autoHideMenuBar: true,
        title: "Flux Flasher 3.9.9 BETA",
        icon: iconPath,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            devTools: true,
            webSecurity: false,
            allowRunningInsecureContent: true
        }
    });

    mainWindow.loadFile('flasher.html');

    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
        logMessage(`[UI] ${message}`);
    });
}

app.whenReady().then(() => {
    initLogger();
    startLocalServer();
    createWindow();
});

// --- УМНЫЙ ПОИСК PYTHON ---
async function findPython() {
    try {
        await new Promise((resolve, reject) => {
            exec('python --version', (error) => error ? reject(error) : resolve());
        });
        return 'python';
    } catch (e) { /* Идем дальше */ }
    
    try {
        await new Promise((resolve, reject) => {
            exec('python3 --version', (error) => error ? reject(error) : resolve());
        });
        return 'python3';
    } catch (e) { /* Идем дальше */ }

    const username = os.userInfo().username;
    const possiblePaths = [
        `C:\\Users\\${username}\\AppData\\Local\\Programs\\Python\\Python314\\python.exe`,
        `C:\\Users\\${username}\\AppData\\Local\\Programs\\Python\\Python313\\python.exe`,
        `C:\\Users\\${username}\\AppData\\Local\\Programs\\Python\\Python312\\python.exe`,
        `C:\\Users\\${username}\\AppData\\Local\\Programs\\Python\\Python311\\python.exe`,
        `C:\\Users\\${username}\\AppData\\Local\\Programs\\Python\\Python310\\python.exe`,
        `C:\\Program Files\\Python314\\python.exe`,
        `C:\\Program Files\\Python313\\python.exe`,
        `C:\\Program Files\\Python312\\python.exe`,
        `C:\\Program Files\\Python311\\python.exe`
    ];
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            return p;
        }
    }
    try {
        const whereResult = await new Promise((resolve, reject) => {
            exec('where python', (error, stdout) => error ? reject(error) : resolve(stdout));
        });
        if (whereResult) {
            const paths = whereResult.split('\n');
            if (paths.length > 0 && paths[0].trim()) {
                return paths[0].trim();
            }
        }
    } catch (e) { /* Идем дальше */ }
    return null; 
}

// --- IPC ОБРАБОТЧИКИ ---
ipcMain.handle('get-ports', async () => {
    try {
        const ports = await SerialPort.list();
        return ports.map(p => ({ path: p.path, name: p.friendlyName || p.path }));
    } catch (err) {
        return [];
    }
});

ipcMain.handle('get-log-path', () => logFilePath);

ipcMain.handle('check-environment', async (event) => {
    logMessage('Проверка окружения (Python + esptool)...');
    const foundPython = await findPython();
    
    if (!foundPython) {
        logMessage('Python не найден!');
        return { 
            success: false, 
            needRestart: false, 
            message: 'Python не обнаружен! Установите Python с python.org и добавьте его в PATH.' 
        };
    }
    pythonCmd = foundPython; 
    logMessage(`Python найден: ${pythonCmd}`);
    
    const hasEsptool = await new Promise((resolve) => {
        exec(`"${pythonCmd}" -m esptool version`, (error) => resolve(!error));
    });
    
    if (!hasEsptool) {
        logMessage('esptool не найден. Установка в фоне...');
        event.sender.send('env-status', 'Установка библиотеки esptool...');
        return new Promise((resolve) => {
            const cmd = spawn('cmd.exe', [
                '/c', `"${pythonCmd}" -m pip install esptool`
            ], { stdio: 'ignore' });
            
            cmd.on('close', (code) => {
                logMessage(`Установка esptool завершена (код ${code}).`);
                setTimeout(() => {
                    app.relaunch();
                    app.exit(0);
                }, 1000);
            });
        });
    }
    logMessage('Окружение готово к работе!');
    return { success: true, needRestart: false, message: 'Всё готово!' };
});

ipcMain.handle('fetch-firmware-list', async (event, url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                return https.get(response.headers.location, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        try { resolve(JSON.parse(data)); } catch(e) { reject(new Error('Ошибка JSON')); }
                    });
                }).on('error', reject);
            }
            if (response.statusCode !== 200) return reject(new Error(`Ошибка сервера: ${response.statusCode}`));
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                try { resolve(JSON.parse(data)); } catch(e) { reject(new Error('Ошибка JSON')); }
            });
        }).on('error', reject);
    });
});

ipcMain.handle('fetch-authors-list', async (event, url) => {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                return https.get(response.headers.location, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        try { resolve(JSON.parse(data)); } catch(e) { reject(new Error('Ошибка JSON')); }
                    });
                }).on('error', reject);
            }
            if (response.statusCode !== 200) return reject(new Error(`Ошибка сервера: ${response.statusCode}`));
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                try { resolve(JSON.parse(data)); } catch(e) { reject(new Error('Ошибка JSON')); }
            });
        }).on('error', reject);
    });
});

ipcMain.handle('download-file', async (event, { url, isExtra = false, defaultName = 'firmware.bin' }) => {
    return new Promise((resolve, reject) => {
        let targetPath;
        if (isExtra) {
            targetPath = path.join(app.getPath('downloads'), defaultName);
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
            if (response.statusCode !== 200) return reject(new Error(`Ошибка сервера: ${response.statusCode}`));
            const totalSize = parseInt(response.headers['content-length'], 10);
            let downloadedSize = 0;
            
            response.on('data', (chunk) => {
                downloadedSize += chunk.length;
                if (totalSize) event.sender.send('download-progress', { percent: Math.round((downloadedSize / totalSize) * 100) });
            });
            
            response.pipe(file);
            file.on('finish', () => { file.close(); resolve(targetPath); });
        }
    });
});

ipcMain.on('flash-device', (event, { port, filePath, chip, flashAddr }) => {
    logMessage(`\n>>> НАЧАЛО ПРОШИВКИ <<<`);
    logMessage(`Порт: ${port}, Файл: ${filePath}, Чип: ${chip || 'auto'}, Адрес: ${flashAddr || '0x0'}`);
    logMessage(`Используем Python: ${pythonCmd}`);
    
    if (!fs.existsSync(filePath)) {
        return event.reply('flash-result', { ok: false, error: 'Файл не найден' });
    }
    
    const args = [
        '-m', 'esptool',
        '--port', port,
        '--baud', '921600'
    ];
    if (chip) {
        args.push('--chip', chip);
    }
    args.push(
        'write_flash', '-z',
        flashAddr || '0x0', 
        filePath 
    );
    
    const child = spawn(`"${pythonCmd}"`, args, { shell: true }); 
    
    let outputBuffer = '';
    
    child.stdout.on('data', (data) => {
        const text = data.toString();
        outputBuffer += text;
        logMessage(`[ESPTOOL] ${text.trim()}`);
        
        const matches = [...outputBuffer.matchAll(/(\d+(?:\.\d+)?)\s*%/g)];
        if (matches.length > 0) {
            const lastMatch = matches[matches.length - 1];
            const percent = Math.floor(parseFloat(lastMatch[1]));
            event.reply('flash-progress', percent);
        }
        
        if (outputBuffer.includes('Hard resetting') || outputBuffer.includes('Hash of data verified')) {
            event.reply('flash-result', { ok: true });
        }
    });
    
    child.stderr.on('data', (data) => {
        const errText = data.toString();
        if (errText.includes('warning') || errText.includes('deprecated')) return;
        logMessage(`[ESPTOOL ОШИБКА] ${errText.trim()}`);
    });
    
    child.on('close', (code) => {
        logMessage(`Процесс esptool завершен с кодом: ${code}`);
        if (code !== 0) {
            if (outputBuffer.includes('No serial data received') || outputBuffer.includes('Failed to connect')) {
                event.reply('flash-result', { 
                    ok: false, 
                    error: 'Плата не отвечает. Подключите её, зажав кнопку "<". Если не помогает — зажмите BOOT, нажмите RST, отпустите BOOT.' 
                });
            } else {
                event.reply('flash-result', { ok: false, error: `Ошибка esptool (код ${code}).` });
            }
        }
    });
    
    child.on('error', (err) => {
        event.reply('flash-result', { ok: false, error: 'Не удалось запустить Python.' });
    });
});
