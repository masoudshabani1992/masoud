#!/usr/bin/env node
const autoDeploy = require('../server/auto_deploy');

async function main() {
  const args = process.argv.slice(2);
  let targetPath = null;

  for (const arg of args) {
    if (arg.startsWith('--path=')) {
      targetPath = arg.split('=')[1].replace(/^["']|["']$/g, '');
    } else if (arg.startsWith('--set-default=')) {
      const p = arg.split('=')[1].replace(/^["']|["']$/g, '');
      autoDeploy.saveConfig({ defaultTargetPath: p });
      console.log(`💾 Saved default target deployment path: ${p}`);
      return;
    }
  }

  if (!targetPath) {
    const cfg = autoDeploy.loadConfig();
    targetPath = cfg.defaultTargetPath;
  }

  if (!targetPath) {
    console.log('ℹ️ Usage:');
    console.log('  node scripts/auto_deploy.js --path="D:\\BoxFactoryServer"');
    console.log('  node scripts/auto_deploy.js --set-default="D:\\BoxFactoryServer"');
    return;
  }

  await autoDeploy.deployToLocalPath(targetPath);
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Deployment error:', err);
    process.exit(1);
  });
}

module.exports = autoDeploy;
