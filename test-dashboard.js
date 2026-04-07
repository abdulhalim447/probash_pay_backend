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
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch (e) {
    data = text;
  }
  return { status: res.status, data };
}

async function run() {
  const steps = [];
  
  steps.push('=== Step 1: Admin login ===');
  const step1 = await req('POST', '/auth/admin/login', {
    email: 'admin@probashpay.com',
    password: 'Admin@123'
  });
  if (step1.status !== 201) throw new Error("Failed to login admin");
  const adminToken = step1.data.accessToken;
  steps.push('Admin Token received');

  steps.push('\n=== Step 2: Dashboard stats দেখো ===');
  const step2 = await req('GET', '/admin/dashboard', null, adminToken);
  steps.push(JSON.stringify(step2.data, null, 2));

  fs.writeFileSync('test-dashboard.json', JSON.stringify(steps, null, 2), 'utf-8');
}

run().catch(e => console.error(e));
