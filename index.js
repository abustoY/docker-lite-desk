const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { NodeSSH } = require('node-ssh');
const { execSync } = require('child_process');

const ssh = new NodeSSH();

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

ipcMain.handle('get-docker-containers', async () => {
  try {
    log('Multipass info 実行...');
    const infoOutput = execSync('multipass info docker-vm').toString();
    log('Multipass info 出力:', infoOutput);

    const ipMatch = infoOutput.match(/IPv4:\s+([0-9.]+)/);
    if (!ipMatch) throw new Error('IPアドレスが取得できませんでした。');

    const ip = ipMatch[1];
    log('取得したIP:', ip);

    const privateKeyPath = '/Users/akihiko/.ssh/id_rsa_multipass';
    log('SSH接続中...');

    await ssh.connect({
      host: ip,
      username: 'ubuntu',
      privateKey: require('fs').readFileSync('/Users/akihiko/.ssh/id_rsa_multipass', 'utf8')
    });

    log('SSH接続成功、docker ps 実行中...');
    const result = await ssh.execCommand('docker ps --format "{{.ID}} {{.Image}} {{.Status}}"');
    log('コマンド実行結果:', result);

    return result.stdout || 'コンテナは起動していません';
  } catch (err) {
    log('エラーが発生しました:', err);
    return `エラー: ${err.message}`;
  }
});




ipcMain.handle('get-all-containers', async () => {
  try {
    const infoOutput = execSync('multipass info docker-vm').toString();
    const ip = infoOutput.match(/IPv4:\s+([0-9.]+)/)?.[1];
    const ssh = new NodeSSH();

    await ssh.connect({
      host: ip,
      username: 'ubuntu',
      privateKey: require('fs').readFileSync('/Users/akihiko/.ssh/id_rsa_multipass', 'utf8'),
    });

    const result = await ssh.execCommand(
      'docker ps -a --format "{{.ID}} {{.Image}} {{.Status}} {{.Names}}"'
    );

    return result.stdout.trim().split('\n').map(line => {
      const [id, image, ...rest] = line.split(' ');
      const status = rest.slice(0, -1).join(' ');
      const name = rest[rest.length - 1];
      return { id, image, status, name };
    });
  } catch (err) {
    return [];
  }
});

ipcMain.handle('docker-action', async (_, { action, id }) => {
  try {
    const infoOutput = execSync('multipass info docker-vm').toString();
    const ip = infoOutput.match(/IPv4:\s+([0-9.]+)/)?.[1];
    const ssh = new NodeSSH();

    await ssh.connect({
      host: ip,
      username: 'ubuntu',
      privateKey: require('fs').readFileSync('/Users/akihiko/.ssh/id_rsa_multipass', 'utf8'),
    });

    const result = await ssh.execCommand(`docker ${action} ${id}`);
    return result.stderr ? `エラー: ${result.stderr}` : `${action} 実行完了`;
  } catch (err) {
    return `エラー: ${err.message}`;
  }
});




app.whenReady().then(createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});


ipcMain.handle('get-docker-images', async () => {
  try {
    const infoOutput = execSync('multipass info docker-vm').toString();
    const ip = infoOutput.match(/IPv4:\s+([0-9.]+)/)?.[1];
    const ssh = new NodeSSH();

    await ssh.connect({
      host: ip,
      username: 'ubuntu',
      privateKey: require('fs').readFileSync('/Users/akihiko/.ssh/id_rsa_multipass', 'utf8'),
    });

    const result = await ssh.execCommand('docker images --format "{{.Repository}} {{.Tag}} {{.ID}} {{.Size}}"');

    return result.stdout.trim().split('\n').map(line => {
      const [repository, tag, id, ...rest] = line.split(' ');
      const size = rest.join(' ');
      return { repository, tag, id, size };
    });
  } catch (err) {
    return [];
  }
});
