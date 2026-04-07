const baseUrl = 'http://127.0.0.1:3000';

async function req(method, path, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = await res.text();
  }
  return { status: res.status, data };
}

const fs = require('fs');

async function run() {
  const steps = [];
  steps.push('=== Step 1: Current rate check (Public) ===');
  const step1 = await req('GET', '/exchange-rate');
  steps.push(step1.data);

  steps.push('\n=== Step 2: Admin login ===');
  await req('POST', '/auth/admin/seed');
  const step2 = await req('POST', '/auth/admin/login', {
    email: 'admin@probashpay.com',
    password: 'Admin@123',
  });
  const adminToken = step2.data.accessToken;
  steps.push('Admin Token received');

  steps.push('\n=== Step 3: Rate history ===');
  const step3 = await req('GET', '/admin/exchange-rate/history', null, adminToken);
  steps.push(step3.data);

  steps.push('\n=== Step 4: Rate update ===');
  const step4 = await req('POST', '/admin/exchange-rate', { rate: 26.50 }, adminToken);
  steps.push(step4.data);

  steps.push('\n=== Step 5: Rate verify ===');
  const step5 = await req('GET', '/exchange-rate');
  steps.push(step5.data);

  steps.push('\n=== Step 6: History verify ===');
  const step6 = await req('GET', '/admin/exchange-rate/history', null, adminToken);
  steps.push(step6.data);

  steps.push('\n=== Step 7: Withdrawal ===');
  let userToken;
  const userPhone = '017' + Date.now().toString().slice(-8); // unique user
  const userPin = '12345';
  await req('POST', '/auth/user/register', { phone: userPhone, pin: userPin, fullName: 'Test User' });
  const loginRes = await req('POST', '/auth/user/login', { phone: userPhone, pin: userPin });
  userToken = loginRes.data.accessToken;

  const step7 = await req('POST', '/withdrawals', {
    amountBDT: 530,
    payoutMethod: "BKASH",
    payoutType: "CASHOUT",
    receiverName: "Test User",
    receiverNumber: "01711223344"
  }, userToken);
  steps.push(step7.data);

  fs.writeFileSync('test-output-clean.json', JSON.stringify(steps, null, 2), 'utf-8');
}
run().catch(e => console.error(e));
