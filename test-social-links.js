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

  let whatsappId, telegramId, facebookId;

  steps.push('\n=== Step 2: WhatsApp link add ===');
  const step2 = await req('POST', '/admin/social-links', {
    platform: "WHATSAPP",
    label: "Customer Support",
    url: "https://wa.me/60123456789",
    displayOrder: 1
  }, adminToken);
  whatsappId = step2.data.id;
  steps.push(step2.data);

  steps.push('\n=== Step 3: Telegram add ===');
  const step3 = await req('POST', '/admin/social-links', {
    platform: "TELEGRAM",
    label: "Probash Pay Official",
    url: "https://t.me/probashpay",
    displayOrder: 2
  }, adminToken);
  telegramId = step3.data.id;
  steps.push(step3.data);

  steps.push('\n=== Step 4: Facebook add ===');
  const step4 = await req('POST', '/admin/social-links', {
    platform: "FACEBOOK",
    label: "Facebook Page",
    url: "https://facebook.com/probashpay",
    displayOrder: 3
  }, adminToken);
  facebookId = step4.data.id;
  steps.push(step4.data);

  steps.push('\n=== Step 5: Email add ===');
  const step5 = await req('POST', '/admin/social-links', {
    platform: "EMAIL",
    label: "Support Email",
    url: "mailto:support@probashpay.com",
    displayOrder: 4
  }, adminToken);
  steps.push(step5.data);

  steps.push('\n=== Step 6: Admin সব দেখো ===');
  const step6 = await req('GET', '/admin/social-links', null, adminToken);
  steps.push(`Count: ${step6.data.length}`);

  steps.push('\n=== Step 7: Public API test ===');
  const step7 = await req('GET', '/social-links');
  steps.push(`Count: ${step7.data.length}`);

  steps.push('\n=== Step 8: Toggle inactive ===');
  await req('PATCH', `/admin/social-links/${telegramId}/toggle`, null, adminToken);
  const step8 = await req('GET', '/social-links');
  steps.push(`Public Count after toggle: ${step8.data.length}`);

  steps.push('\n=== Step 9: Update ===');
  const step9 = await req('PATCH', `/admin/social-links/${whatsappId}`, {
    label: "24/7 Support"
  }, adminToken);
  steps.push(`Updated Label: ${step9.data.label}`);

  steps.push('\n=== Step 10: Delete ===');
  const step10 = await req('DELETE', `/admin/social-links/${facebookId}`, null, adminToken);
  steps.push(step10.data);

  const step11 = await req('GET', '/admin/social-links', null, adminToken);
  steps.push(`Admin Count after delete: ${step11.data.length}`);

  fs.writeFileSync('test-social-links.json', JSON.stringify(steps, null, 2), 'utf-8');
}

run().catch(e => console.error(e));
