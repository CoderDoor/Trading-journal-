const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn, fork } = require('child_process');
const http = require('http');

let mainWindow;
let serverProcess;

const isDev = !app.isPackaged;
const PORT = 3000;

// Get the path to the app directory
function getAppPath() {
    if (isDev) {
        return path.join(__dirname, '..');
    }
    // In production, files are in app directory
    return path.join(app.getAppPath());
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 850,
        minWidth: 1000,
        minHeight: 700,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        backgroundColor: '#0a0a0f',
        show: false,
        autoHideMenuBar: true,
        title: 'Voice Trading Journal',
    });

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    mainWindow.setMenuBarVisibility(false);

    const startUrl = `http://localhost:${PORT}`;

    waitForServer(startUrl, 60000).then(() => {
        console.log('Server is ready, loading URL...');
        mainWindow.loadURL(startUrl);
    }).catch((err) => {
        console.error('Server failed to start:', err);
        mainWindow.loadURL(`data:text/html,
            <html>
            <body style="background:#0a0a0f;color:white;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;flex-direction:column;">
                <h1>⚠️ Failed to start server</h1>
                <p>Please restart the application.</p>
                <p style="color:gray;font-size:12px;">Error: ${err.message}</p>
            </body>
            </html>
        `);
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function waitForServer(url, timeout = 60000) {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
        const checkServer = () => {
            if (Date.now() - startTime > timeout) {
                reject(new Error('Server startup timeout'));
                return;
            }

            const req = http.get(url, (res) => {
                if (res.statusCode === 200 || res.statusCode === 304) {
                    resolve();
                } else {
                    setTimeout(checkServer, 300);
                }
            });

            req.on('error', () => {
                setTimeout(checkServer, 300);
            });

            req.setTimeout(1000, () => {
                req.destroy();
                setTimeout(checkServer, 300);
            });
        };

        // Start checking after a small delay
        setTimeout(checkServer, 500);
    });
}

function startServer() {
    return new Promise((resolve, reject) => {
        const appPath = getAppPath();

        if (isDev) {
            console.log('Development mode - server should already be running');
            resolve();
            return;
        }

        // In production, run the standalone Next.js server
        const standalonePath = path.join(appPath, '.next', 'standalone');
        const serverPath = path.join(standalonePath, 'server.js');

        console.log('App path:', appPath);
        console.log('Standalone path:', standalonePath);
        console.log('Server path:', serverPath);

        // Check if server.js exists
        const fs = require('fs');
        if (!fs.existsSync(serverPath)) {
            console.error('server.js not found at:', serverPath);
            reject(new Error('Server file not found'));
            return;
        }

        // Set up environment
        const env = {
            ...process.env,
            PORT: PORT.toString(),
            NODE_ENV: 'production',
            HOSTNAME: 'localhost',
        };

        // Use Electron's built-in Node.js to run the server
        console.log('Starting server...');
        serverProcess = fork(serverPath, [], {
            cwd: standalonePath,
            env: env,
            stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        });

        serverProcess.stdout.on('data', (data) => {
            console.log('Server:', data.toString());
        });

        serverProcess.stderr.on('data', (data) => {
            console.error('Server Error:', data.toString());
        });

        serverProcess.on('error', (err) => {
            console.error('Failed to start server process:', err);
            reject(err);
        });

        serverProcess.on('message', (msg) => {
            console.log('Server message:', msg);
            if (msg === 'ready') {
                resolve();
            }
        });

        // Give server time to initialize
        setTimeout(() => {
            console.log('Server initialization timeout, proceeding...');
            resolve();
        }, 8000);
    });
}

// App lifecycle
app.whenReady().then(async () => {
    console.log('========================================');
    console.log('Voice Trading Journal');
    console.log('========================================');
    console.log('App is ready');
    console.log('Is packaged:', app.isPackaged);
    console.log('App path:', app.getAppPath());
    console.log('User data:', app.getPath('userData'));

    try {
        await startServer();
        console.log('Creating window...');
        createWindow();
    } catch (err) {
        console.error('Startup error:', err);
        createWindow(); // Try to create window anyway
    }

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    console.log('All windows closed');
    killServer();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', () => {
    console.log('App is quitting...');
    killServer();
});

app.on('quit', () => {
    killServer();
});

function killServer() {
    if (serverProcess) {
        console.log('Killing server process...');
        try {
            serverProcess.kill('SIGTERM');
        } catch (e) {
            console.error('Error killing server:', e);
        }
        serverProcess = null;
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
});
