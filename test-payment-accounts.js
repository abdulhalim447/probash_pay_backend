const fs = require('fs');
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

async function run() {
  const steps = [];
  
  steps.push('=== Step 1: Admin login ===');
  const step1 = await req('POST', '/auth/admin/login', {
    email: 'admin@probashpay.com',
    password: 'Admin@123',
  });
  const adminToken = step1.data.accessToken;
  steps.push('Admin Token received');

  let bkashId, bankId, malaysiaBankId;

  steps.push('\n=== Step 2: bKash account add ===');
  const step2 = await req('POST', '/admin/payment-accounts', {
    type: "BKASH",
    accountHolderName: "Probash Pay",
    accountNumber: "01700000000",
    country: "BD",
    displayOrder: 1
  }, adminToken);
  bkashId = step2.data.id;
  steps.push(step2.data);

  steps.push('\n=== Step 3: Bank account add ===');
  const step3 = await req('POST', '/admin/payment-accounts', {
    type: "BANK_BD",
    accountHolderName: "Probash Pay Ltd",
    accountNumber: "1234567890",
    bankName: "Dutch-Bangla Bank",
    branchName: "Gulshan Branch",
    routingNumber: "090268457",
    country: "BD",
    displayOrder: 2
  }, adminToken);
  bankId = step3.data.id;
  steps.push(step3.data);

  steps.push('\n=== Step 4: Malaysia bank add ===');
  const step4 = await req('POST', '/admin/payment-accounts', {
    type: "BANK_MY",
    accountHolderName: "Probash Pay MY",
    accountNumber: "5621234567",
    bankName: "Maybank",
    branchName: "KL Main Branch",
    country: "MY",
    displayOrder: 3
  }, adminToken);
  malaysiaBankId = step4.data.id;
  steps.push(step4.data);

  steps.push('\n=== Step 5: Admin all accounts ===');
  const step5 = await req('GET', '/admin/payment-accounts', null, adminToken);
  steps.push(`Count: ${step5.data.length}`);

  steps.push('\n=== Step 6: Public API (active accounts) ===');
  const step6 = await req('GET', '/payment-accounts');
  steps.push(`Count: ${step6.data.length}`);

  steps.push('\n=== Step 7: Toggle active -> false (bKash) ===');
  await req('PATCH', `/admin/payment-accounts/${bkashId}/toggle`, null, adminToken);
  const step7 = await req('GET', '/payment-accounts');
  steps.push(`Public Count after toggle: ${step7.data.length} (Bkash hidden)`);

  steps.push('\n=== Step 8: Update account ===');
  const step8 = await req('PATCH', `/admin/payment-accounts/${bankId}`, {
    accountNumber: "9999999999"
  }, adminToken);
  steps.push(`Updated Account Number: ${step8.data.accountNumber}`);

  steps.push('\n=== Step 9: Delete account ===');
  const step9a = await req('DELETE', `/admin/payment-accounts/${malaysiaBankId}`, null, adminToken);
  steps.push(step9a.data);
  const step9b = await req('GET', '/admin/payment-accounts', null, adminToken);
  steps.push(`Admin Count after delete: ${step9b.data.length}`);

  fs.writeFileSync('test-payment-accounts.json', JSON.stringify(steps, null, 2), 'utf-8');
}
run().catch(e => console.error(e));
