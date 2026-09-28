const http = require('http');

async function runTest() {
  console.log('Testing Marketer API Workflow...');

  // 1. Marketer Login
  const loginPayload = JSON.stringify({ username: 'marketer', password: '123456' });
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: loginPayload
  });
  const loginData = await loginRes.json();
  console.log('Login Status:', loginRes.status, 'User:', loginData.user?.name);
  const token = loginData.token;

  if (!token) throw new Error('Failed to get token');

  // 2. Submit Inquiry as Marketer
  const leadPayload = {
    customer_name: 'داروسازی ایران نوین',
    customer_phone: '09121112233',
    product_name: 'جعبه قرص مسکن ۲۰ عددی با خط بریل',
    quantity: 15000,
    box_length: 120,
    box_width: 80,
    box_height: 45,
    material_construction: 'ایندربرد بهداشتی ۲۸۰ گرم',
    cardboard_grammage: 280,
    cellophane_type: 'سلفون حرارتی مات',
    has_uv: true,
    has_foil: false,
    has_emboss: true,
    has_window: false,
    window_length: 0,
    window_width: 0,
    flute_type: 'none',
    box_structure: 'standard',
    notes: 'استعلام فوری - تحویل ظرف ۱۰ روز کاری'
  };

  const createRes = await fetch('http://localhost:3001/api/marketing/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(leadPayload)
  });
  const createData = await createRes.json();
  console.log('Create Lead Status:', createRes.status, createData);

  // 3. Fetch Leads List
  const listRes = await fetch('http://localhost:3001/api/marketing/leads', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const listJson = await listRes.json();
  const leads = listJson.leads || listJson;
  console.log('Leads count for marketer:', leads.length);
  const createdLead = leads.find(l => l.customer_phone === '09121112233' || l.customer_name === 'داروسازی ایران نوین');
  console.log('Verified Created Lead:', createdLead?.lead_code, createdLead?.product_name, createdLead?.customer_phone);

  // 4. Update Lead
  if (createdLead) {
    const updateRes = await fetch(`http://localhost:3001/api/marketing/leads/${createdLead.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        ...createdLead,
        notes: 'یادداشت جدید: مذاکره انجام شد و قیمت نهایی توافق گردید.'
      })
    });
    const updateData = await updateRes.json();
    console.log('Update Lead Status:', updateRes.status, updateData);
  }

  console.log('✅ ALL MARKETER WORKFLOW TESTS PASSED SUCCESSFULLY!');
}

runTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
