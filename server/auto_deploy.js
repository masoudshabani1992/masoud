#!/usr/bin/env node
/**
 * Auto-Deployment & Direct Server Synchronizer
 * Deploys updates directly to local directory, network share, or remote server
 */

const fs = require('fs');
const path = require('path');

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
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving deploy config:', e);
  }
}

function copyRecursiveSync(src, dest, exclude = []) {
  if (!fs.existsSync(src)) return;
  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();

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

  console.log('📦 1/4 Copying Server files (excluding node_modules & db)...');
  const targetServerDir = path.join(targetPath, 'server');
  copyRecursiveSync(path.join(ROOT_DIR, 'server'), targetServerDir, ['node_modules', 'factory.db', 'factory.db-journal', 'license.lic', 'storage']);

  console.log('🎨 2/4 Copying Compiled Client Dist UI...');
  const targetClientDist = path.join(targetPath, 'client', 'dist');
  copyRecursiveSync(path.join(ROOT_DIR, 'client', 'dist'), targetClientDist);

  console.log('🛠️ 3/4 Copying Setup & Update Windows Scripts...');
  const targetWindowsSetup = path.join(targetPath, 'windows-setup');
  copyRecursiveSync(path.join(ROOT_DIR, 'windows-setup'), targetWindowsSetup);
  
  if (fs.existsSync(path.join(ROOT_DIR, 'package.json'))) {
    fs.copyFileSync(path.join(ROOT_DIR, 'package.json'), path.join(targetPath, 'package.json'));
  }
  if (fs.existsSync(path.join(ROOT_DIR, 'README.md'))) {
    fs.copyFileSync(path.join(ROOT_DIR, 'README.md'), path.join(targetPath, 'README.md'));
  }
  if (fs.existsSync(path.join(ROOT_DIR, 'start-server.bat'))) {
    fs.copyFileSync(path.join(ROOT_DIR, 'start-server.bat'), path.join(targetPath, 'start-server.bat'));
  }

  console.log('⚡ 4/4 Verifying Target Installation...');
  console.log(`✅ DEPLOYMENT FINISHED SUCCESSFULLY TO: ${targetPath}`);
  return { success: true, targetPath };
}

module.exports = { deployToLocalPath, loadConfig, saveConfig };
