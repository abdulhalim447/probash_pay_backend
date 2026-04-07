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

  let noticeId1, noticeId2;

  steps.push('\n=== Step 2: Notice তৈরি করো ===');
  const step2 = await req('POST', '/admin/notices', {
    title: "সিস্টেম আপডেট নোটিশ",
    content: "আগামী ২৪ ঘণ্টা সিস্টেম মেইনটেন্যান্সে থাকবে।"
  }, adminToken);
  noticeId1 = step2.data.id;
  steps.push(step2.data);

  steps.push('\n=== Step 3: আরেকটি notice তৈরি করো ===');
  const step3 = await req('POST', '/admin/notices', {
    title: "নতুন ফিচার লঞ্চ",
    content: "এখন থেকে bKash এ সরাসরি withdrawal করা যাবে।"
  }, adminToken);
  noticeId2 = step3.data.id;
  steps.push(step3.data);

  steps.push('\n=== Step 4: Admin সব notices দেখো ===');
  const step4 = await req('GET', '/admin/notices', null, adminToken);
  steps.push(`Count: ${step4.data.length}`);

  steps.push('\n=== Step 5: Public API test ===');
  const step5 = await req('GET', '/notices');
  steps.push(`Count: ${step5.data.length}`);

  steps.push('\n=== Step 6: Toggle inactive ===');
  await req('PATCH', `/admin/notices/${noticeId1}/toggle`, null, adminToken);
  const step6 = await req('GET', '/notices');
  steps.push(`Public Count after toggle: ${step6.data.length} (first one hidden)`);

  steps.push('\n=== Step 7: Update notice ===');
  const step7 = await req('PATCH', `/admin/notices/${noticeId2}`, {
    title: "আপডেট: নতুন ফিচার"
  }, adminToken);
  steps.push(`Updated title: ${step7.data.title}`);

  steps.push('\n=== Step 8: Delete notice ===');
  const step8a = await req('DELETE', `/admin/notices/${noticeId1}`, null, adminToken);
  steps.push(step8a.data);
  const step8b = await req('GET', '/admin/notices', null, adminToken);
  steps.push(`Admin Count after delete: ${step8b.data.length}`);

  fs.writeFileSync('test-notices.json', JSON.stringify(steps, null, 2), 'utf-8');
}

run().catch(e => console.error(e));
