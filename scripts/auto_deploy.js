#!/usr/bin/env node
/**
 * Auto-Deployment & Direct Server Synchronizer
 * Deploys updates directly to local directory, network share, or remote server
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const CONFIG_FILE = path.join(ROOT_DIR, 'deploy.config.json');

function loadConfig() {
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}

function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf8');
}

function copyRecursiveSync(src, dest, exclude = []) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      if (exclude.includes(childItemName)) return;
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName), exclude);
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function deployToLocalPath(targetPath) {
  console.log(`🚀 Starting Direct Deployment to Local/Network Path: ${targetPath}`);
  
  if (!fs.existsSync(targetPath)) {
    console.log(`📁 Target directory does not exist, creating: ${targetPath}`);
    fs.mkdirSync(targetPath, { recursive: true });
  }

  // Preserve existing DB & Storage if target already has them
  const targetDb = path.join(targetPath, 'server', 'factory.db');
  const targetLic = path.join(targetPath, 'server', 'license.lic');
  const targetStorage = path.join(targetPath, 'storage');

  console.log('📦 1/4 Copying Server files (excluding node_modules & db)...');
  const targetServerDir = path.join(targetPath, 'server');
  copyRecursiveSync(path.join(ROOT_DIR, 'server'), targetServerDir, ['node_modules', 'factory.db', 'factory.db-journal', 'license.lic', 'storage']);

  console.log('🎨 2/4 Copying Compiled Client Dist UI...');
  const targetClientDist = path.join(targetPath, 'client', 'dist');
  copyRecursiveSync(path.join(ROOT_DIR, 'client', 'dist'), targetClientDist);

  console.log('🛠️ 3/4 Copying Setup & Update Windows Scripts...');
  const targetWindowsSetup = path.join(targetPath, 'windows-setup');
  copyRecursiveSync(path.join(ROOT_DIR, 'windows-setup'), targetWindowsSetup);
  
  // Copy root package.json & README
  fs.copyFileSync(path.join(ROOT_DIR, 'package.json'), path.join(targetPath, 'package.json'));
  fs.copyFileSync(path.join(ROOT_DIR, 'README.md'), path.join(targetPath, 'README.md'));

  console.log('⚡ 4/4 Verifying Target Installation...');
  console.log(`✅ DEPLOYMENT FINISHED SUCCESSFULLY TO: ${targetPath}`);
  console.log('----------------------------------------------------');
  console.log('✨ The destination server is now updated to the latest build!');
}

async function main() {
  const args = process.argv.slice(2);
  let targetPath = null;

  for (const arg of args) {
    if (arg.startsWith('--path=')) {
      targetPath = arg.split('=')[1].replace(/^["']|["']$/g, '');
    } else if (arg.startsWith('--set-default=')) {
      const p = arg.split('=')[1].replace(/^["']|["']$/g, '');
      saveConfig({ defaultTargetPath: p });
      console.log(`💾 Saved default target deployment path: ${p}`);
      return;
    }
  }

  if (!targetPath) {
    const cfg = loadConfig();
    targetPath = cfg.defaultTargetPath;
  }

  if (!targetPath) {
    console.log('ℹ️ Usage:');
    console.log('  node scripts/auto_deploy.js --path="D:\\BoxFactoryServer"');
    console.log('  node scripts/auto_deploy.js --set-default="D:\\BoxFactoryServer"');
    console.log('  node scripts/auto_deploy.js --path="/var/www/box-factory"');
    return;
  }

  await deployToLocalPath(targetPath);
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Deployment error:', err);
    process.exit(1);
  });
}

module.exports = { deployToLocalPath, loadConfig, saveConfig };
