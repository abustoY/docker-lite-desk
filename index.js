const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const config = require('./config.json');
const os = require('os');
const privateKeyPath = path.join(os.homedir(), config.sshKeyPath || '.ssh/id_rsa_multipass');
const { NodeSSH } = require('node-ssh');
const { execSync } = require('child_process');
const shellEnv = require('shell-env');
shellEnv().then(env => {
  process.env.PATH = env.PATH;
  console.log('[DEBUG] shell-env PATH:', process.env.PATH);
});

const fs = require('fs');
const vmName = config.vmName;
const cloudInitPath = path.join(__dirname, 'cloud-config.yml');

async function setupEnvironment() {
  try {
    console.log('[DEBUG] 環境セットアップ開始');

    // Multipass VM の存在確認
    const vmList = execSync('multipass list').toString();
    if (!vmList.includes(vmName)) {
      console.log('[DEBUG] VM作成: cloud-config.yml を使用します');
      execSync(`multipass launch -n ${vmName} --disk 20G --memory 2G --cloud-init ${cloudInitPath}`);
    }

    // SSH鍵の存在確認
    if (!fs.existsSync(privateKeyPath)) {
      console.log('[DEBUG] SSH鍵を作成します...');
      execSync(`ssh-keygen -t rsa -b 2048 -f ${privateKeyPath} -N ""`);
    }

    // 公開鍵をVMに登録
    const pubKey = fs.readFileSync(privateKeyPath + '.pub', 'utf8');
    execSync(`multipass exec ${vmName} -- mkdir -p /home/ubuntu/.ssh`);
    execSync(`multipass exec ${vmName} -- bash -c "echo '${pubKey}' >> /home/ubuntu/.ssh/authorized_keys"`);

    console.log('[DEBUG] 環境セットアップ完了');

    // Docker context 自動作成・切り替え
    try {
      const ip = getMultipassIP();
      const contextName = vmName;

      const existingContexts = execSync('docker context ls').toString();
      if (!existingContexts.includes(contextName)) {
        console.log('[DEBUG] Docker context を作成します...');
        execSync(`docker context create ${contextName} --docker "host=tcp://${ip}:2375"`);
      } else {
        console.log('[DEBUG] Docker context は既に存在します');
      }

      execSync(`docker context use ${contextName}`);
      console.log(`[DEBUG] Docker context '${contextName}' を使用中`);
    } catch (e) {
      console.error('[ERROR] Docker context 設定に失敗:', e.message);
    }
  } catch (e) {
    console.error('[ERROR] setupEnvironment 失敗:', e.message);
  }
}

// IP取得とSSH接続の共通処理
async function getSSHConnection() {
  const ip = getMultipassIP();
  return connectSSH(ip);
}

function getMultipassIP() {
  const infoOutput = execSync(`multipass info ${vmName}`).toString();
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

  win.loadFile('renderer-vite/dist/index.html');
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

// app.whenReady().then(createWindow);

app.whenReady().then(async () => {
  await setupEnvironment();
  createWindow();
});
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
