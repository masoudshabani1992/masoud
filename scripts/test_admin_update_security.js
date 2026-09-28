async function runSecurityTest() {
  console.log('🔒 Testing System Update Admin Role Isolation...');

  // 1. Test as Sales (Unauthorized)
  const salesLogin = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'sales', password: '123456' })
  }).then(r => r.json());

  const salesUpdateRes = await fetch('http://localhost:3001/api/system/check-updates', {
    headers: { 'Authorization': `Bearer ${salesLogin.token}` }
  });
  console.log('Sales Check Updates Status (Expected 403):', salesUpdateRes.status);
  if (salesUpdateRes.status !== 403) throw new Error('Sales was able to check updates!');

  // 2. Test as CEO (Unauthorized for server updates as per strict role boundary)
  const ceoLogin = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'ceo', password: '123456' })
  }).then(r => r.json());

  const ceoUpdateRes = await fetch('http://localhost:3001/api/system/check-updates', {
    headers: { 'Authorization': `Bearer ${ceoLogin.token}` }
  });
  console.log('CEO Check Updates Status (Expected 403):', ceoUpdateRes.status);
  if (ceoUpdateRes.status !== 403) throw new Error('CEO was able to check updates!');

  // 3. Test as Admin (Authorized)
  const adminLogin = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: '123456' })
  }).then(r => r.json());

  const adminUpdateRes = await fetch('http://localhost:3001/api/system/check-updates', {
    headers: { 'Authorization': `Bearer ${adminLogin.token}` }
  });
  console.log('Admin Check Updates Status (Expected 200):', adminUpdateRes.status);
  if (adminUpdateRes.status !== 200) throw new Error('Admin was blocked from checking updates!');

  console.log('✅ ALL ADMIN UPDATE ROLE ISOLATION TESTS PASSED 100%!');
}

runSecurityTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
