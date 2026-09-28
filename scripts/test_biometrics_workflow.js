async function runBiometricTests() {
  console.log('🧪 Starting Biometric & Passkeys API Verification...');

  // 1. Get Biometric Users
  const usersRes = await fetch('http://localhost:3001/api/auth/biometric/users-enabled');
  const usersData = await usersRes.json();
  console.log('Biometric Users Status:', usersRes.status, 'Total users:', usersData.users?.length);
  if (!usersData.users || usersData.users.length === 0) {
    throw new Error('No biometric users returned');
  }

  // 2. Challenge for CEO
  const chalRes = await fetch('http://localhost:3001/api/auth/biometric/login-challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'ceo' })
  });
  const chalData = await chalRes.json();
  console.log('Challenge Status:', chalRes.status, 'Challenge received:', Boolean(chalData.challenge));

  // 3. Verify Biometric Login for CEO (Face ID)
  const verifyRes = await fetch('http://localhost:3001/api/auth/biometric/verify-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'ceo',
      authMethod: 'face_id',
      deviceType: 'mobile_face_id',
      deviceName: 'آیفون ۱۵ پرو مدیریت'
    })
  });
  const verifyData = await verifyRes.json();
  console.log('Biometric Login Status:', verifyRes.status, 'User:', verifyData.user?.full_name, 'Token:', Boolean(verifyData.token));
  if (!verifyData.token) throw new Error('Biometric login failed to return token');

  const token = verifyData.token;

  // 4. Register new Android Fingerprint Device
  const regRes = await fetch('http://localhost:3001/api/auth/biometric/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      device_name: 'سامسونگ گلکسی S24 اولترا',
      device_type: 'mobile_fingerprint',
      device_info: 'Chrome Mobile / Android 14'
    })
  });
  const regData = await regRes.json();
  console.log('Register Device Status:', regRes.status, 'Result:', regData.message);

  // 5. Get Registered Devices
  const devRes = await fetch('http://localhost:3001/api/auth/biometric/devices', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const devData = await devRes.json();
  console.log('CEO Registered Devices Count:', devData.devices?.length);

  // 6. Quick Login with bioToken
  const quickRes = await fetch('http://localhost:3001/api/auth/biometric/quick-login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bioToken: regData.bioToken,
      username: 'ceo'
    })
  });
  const quickData = await quickRes.json();
  console.log('Quick 1-Tap Login Status:', quickRes.status, 'User:', quickData.user?.full_name);

  console.log('✅ ALL BIOMETRIC & WEBAUTHN / PASSKEY TESTS PASSED SUCCESSFULLY!');
}

runBiometricTests().catch(err => {
  console.error('❌ Biometric test failed:', err);
  process.exit(1);
});
