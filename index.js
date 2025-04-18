const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const privateKeyPath = path.join(os.homedir(), '.ssh', 'id_rsa_multipass');
const { NodeSSH } = require('node-ssh');
const { execSync } = require('child_process');

// IP取得とSSH接続の共通処理
async function getSSHConnection() {
  const ip = getMultipassIP();
  return connectSSH(ip);
}

function getMultipassIP() {
  const infoOutput = execSync('multipass info docker-vm').toString();
  const ipMatch = infoOutput.match(/IPv4:\s+([0-9.]+)/);
  if (!ipMatch) throw new Error('IPアドレスが取得できませんでした。');
  return ipMatch[1];
}

async function connectSSH(ip) {
  const ssh = new NodeSSH();
  await ssh.connect({
    host: ip,
    username: 'ubuntu',
    privateKey: require('fs').readFileSync(privateKeyPath, 'utf8')
  });
  return ssh;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile('index.html');
}

// デバッグ用ログ関数
function log(...args) {
  console.log('[DEBUG]', ...args);
}

async function getAllContainers() {
  const ssh = await getSSHConnection();
  const result = await ssh.execCommand(
    'docker ps -a --format "{{.ID}} {{.Image}} {{.Status}} {{.Names}}"'
  );

  return result.stdout.trim().split('\n').map(line => {
    const [id, image, ...rest] = line.split(' ');
    const status = rest.slice(0, -1).join(' ');
    const name = rest[rest.length - 1];
    return { id, image, status, name };
  });
}

async function dockerAction({ action, id }) {
  const ssh = await getSSHConnection();
  const result = await ssh.execCommand(`docker ${action} ${id}`);
  return result.stderr ? `エラー: ${result.stderr}` : `${action} 実行完了`;
}

async function getDockerImages() {
  const ssh = await getSSHConnection();
  const result = await ssh.execCommand('docker images --format "{{.Repository}} {{.Tag}} {{.ID}} {{.Size}}"');

  return result.stdout.trim().split('\n').map(line => {
    const [repository, tag, id, ...rest] = line.split(' ');
    const size = rest.join(' ');
    return { repository, tag, id, size };
  });
}

ipcMain.handle('get-all-containers', async () => {
  try {
    log('Fetching all containers');
    return await getAllContainers();
  } catch (err) {
    log('Error fetching containers:', err);
    return [];
  }
});

ipcMain.handle('docker-action', async (_, payload) => {
  try {
    log('Executing docker action:', payload);
    return await dockerAction(payload);
  } catch (err) {
    log('Error executing docker action:', err);
    return `エラー: ${err.message}`;
  }
});

ipcMain.handle('get-docker-images', async () => {
  try {
    log('Fetching docker images');
    return await getDockerImages();
  } catch (err) {
    log('Error fetching docker images:', err);
    return [];
  }
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
