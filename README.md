# docker-lite-desk

Multipass + Docker を操作できる、GUIデスクトップアプリケーションです。
Docker Desktop と同等の使いやすさを目指し、CLI 操作や VM セットアップを自動化しています。

---

## ✅ 動作要件

| 項目       | 内容                                                                 |
|------------|----------------------------------------------------------------------|
| ✅ Node.js | バージョン 18 以上（推奨：`nvm install 18 && nvm use 18`）            |
| ✅ Multipass | https://multipass.run/ よりインストール（macOS対応済み）               |
| ✅ インターネット接続 | 初回起動時に必要（MultipassのOSイメージとDocker関連パッケージの取得） |

---

## ✅ セットアップ

以下の手順で、Docker Lite Desk をすぐに使い始めることができます。

```bash
git clone https://github.com/abustoY/docker-lite-desk.git
cd docker-lite-desk
npm install

# フロントエンド（UI）のビルド
cd renderer-vite
npm install
npm run build
cd ..

# アプリの起動
npm start
```

### 🔧 設定ファイル（任意）

`config.json` を使うことで、VM名やSSH鍵パスをカスタマイズできます。

```json
{
  "vmName": "docker-lite-vm",
  "sshKeyPath": ".ssh/id_rsa_docker_lite"
}
```

- `vmName`: Multipass上で作成される仮想マシンの名前
- `sshKeyPath`: SSH鍵のパス（ホームディレクトリからの相対パス）

---

## ✅ 初回起動時の自動処理

初回起動時に以下が自動で実行されます：

1. VM（`config.json` の内容に従う）が存在しなければ作成
2. `cloud-config.yml` によりDockerが自動インストールされる
3. SSH鍵が自動生成され、VMへ登録される
4. ホストにDocker CLIがあれば `docker context` を自動作成・切り替え
5. アプリUIが起動し、GUI操作が可能に

---

## 🖼️ スクリーンショット

<img src="./main-container-view.png" alt="コンテナ一覧表示" width="600" />
<img src="./main-image-view.png" alt="イメージ一覧表示" width="600" />

---

## 📄 ライセンス

MIT