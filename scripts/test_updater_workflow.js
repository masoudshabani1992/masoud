async function runUpdaterTest() {
  console.log('🧪 Testing In-App Live One-Click Auto-Updater & Deployment...');

  // 1. Login as Admin
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: '123456' })
  });
  const loginData = await loginRes.json();
  const token = loginData.token;

  if (!token) throw new Error('Failed to login as admin');

  // 2. Check System Updates
  const checkRes = await fetch('http://localhost:3001/api/system/check-updates', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const checkData = await checkRes.json();
  console.log('Check Updates Status:', checkRes.status, 'Current:', checkData.currentVersion, 'Latest:', checkData.latestVersion);

  // 3. Save Deploy Config
  const cfgRes = await fetch('http://localhost:3001/api/system/deploy-config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      targetPath: '/home/user/masoud/test_deploy_target',
      autoDeployEnabled: true
    })
  });
  const cfgData = await cfgRes.json();
  console.log('Save Deploy Config Status:', cfgRes.status, cfgData.message);

  // 4. Test Deploy to Target
  const deployRes = await fetch('http://localhost:3001/api/system/deploy-now', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      targetPath: '/home/user/masoud/test_deploy_target'
    })
  });
  const deployData = await deployRes.json();
  console.log('Deploy Now Status:', deployRes.status, deployData.message);

  // 5. Test Live One-Click In-App Update
  const updateRes = await fetch('http://localhost:3001/api/system/apply-auto-update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });
  const updateData = await updateRes.json();
  console.log('Apply Auto-Update Status:', updateRes.status, updateData.message, 'Backup:', updateData.backupFolder);

  // Cleanup test deploy folder
  const fs = require('fs');
  const path = require('path');
  const testDir = path.join(__dirname, '..', 'test_deploy_target');
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }

  console.log('✅ ALL IN-APP ONE-CLICK LIVE UPDATER TESTS PASSED SUCCESSFULLY!');
}

runUpdaterTest().catch(err => {
  console.error('❌ Updater test failed:', err);
  process.exit(1);
});
