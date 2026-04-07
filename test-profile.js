const fs = require('fs');
const baseUrl = 'http://127.0.0.1:3005';

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

// Global user vars
let userToken = '';
let userId = '';
let userPhone = '';

async function prepareUser() {
  userPhone = '01900001001';
  let loginRes = await req('POST', '/auth/user/login', { phone: userPhone, pin: '1234' });
  if (!loginRes.data || !loginRes.data.accessToken) {
     // try 5678
     loginRes = await req('POST', '/auth/user/login', { phone: userPhone, pin: '5678' });
     if (!loginRes.data || !loginRes.data.accessToken) {
       await req('POST', '/auth/user/register', { phone: userPhone, pin: '1234', fullName: 'Test Profile' });
       loginRes = await req('POST', '/auth/user/login', { phone: userPhone, pin: '1234' });
     }
  }
  
  if (!loginRes.data || !loginRes.data.accessToken) {
      throw new Error("Failed to prepare user: " + JSON.stringify(loginRes.data));
  }
  
  userToken = loginRes.data.accessToken;
  userId = loginRes.data.user.id;
  
  // reset pin to 1234 if it was 5678 just so tests are consistent
  await req('PATCH', '/profile/change-pin', { currentPin: '5678', newPin: '1234', confirmPin: '1234'}, userToken);
}

async function run() {
  const steps = [];

  await prepareUser();

  steps.push('=== Step 1: User login ===');
  steps.push('User Token saved');

  steps.push('\n=== Step 2: Profile দেখো ===');
  const step2 = await req('GET', '/profile', null, userToken);
  steps.push(step2.data);

  steps.push('\n=== Step 3: Profile update করো ===');
  const step3 = await req('PATCH', '/profile', {
    fullName: "Mohammad Rahim",
    email: `rahim${Date.now()}@example.com`
  }, userToken);
  steps.push(`Updated User: ${step3.data.fullName || step3.data.message}, ${step3.data.email}`);

  steps.push('\n=== Step 4: Profile verify করো ===');
  const step4 = await req('GET', '/profile', null, userToken);
  steps.push(`Verified User: ${step4.data.fullName}, ${step4.data.email}`);

  steps.push('\n=== Step 5: PIN change করো ===');
  const step5 = await req('PATCH', '/profile/change-pin', {
    currentPin: "1234",
    newPin: "5678",
    confirmPin: "5678"
  }, userToken);
  steps.push(step5.data);

  steps.push('\n=== Step 6: নতুন PIN দিয়ে login verify ===');
  const step6 = await req('POST', '/auth/user/login', {
    phone: userPhone,
    pin: "5678"
  });
  if (step6.status === 201) {
    steps.push('Login successful with new PIN');
    userToken = step6.data.accessToken;
  } else {
    steps.push('Login failed with new PIN');
  }

  steps.push('\n=== Step 7: Wrong PIN test ===');
  const step7 = await req('PATCH', '/profile/change-pin', {
    currentPin: "0000",
    newPin: "9999",
    confirmPin: "9999"
  }, userToken);
  steps.push(`Expected 400 Error: ${step7.status === 400 ? step7.data.message : 'Failed'}`);

  steps.push('\n=== Step 8: Admin login + users list ===');
  const adminLogin = await req('POST', '/auth/admin/login', {
    email: 'admin@probashpay.com',
    password: 'Admin@123'
  });
  const adminToken = adminLogin.data.accessToken;
  const step8 = await req('GET', '/admin/users', null, adminToken);
  steps.push(`Admin got ${step8.data.length} users with wallet balances`);

  steps.push('\n=== Step 9: Single user detail ===');
  const step9 = await req('GET', `/admin/users/${userId}`, null, adminToken);
  steps.push(`Single user retrieved: ${step9.data.fullName}, isActive: ${step9.data.isActive}`);

  steps.push('\n=== Step 10: User block করো ===');
  const step10 = await req('PATCH', `/admin/users/${userId}/toggle`, null, adminToken);
  steps.push(`User is blocked: ${step10.data.isActive === false}`);

  steps.push('\n=== Step 11: Blocked user login test ===');
  const step11 = await req('POST', '/auth/user/login', {
    phone: userPhone,
    pin: '5678'
  });
  steps.push(`Expected 401 Error: ${step11.status === 401 ? step11.data.message : 'Failed'}`);

  steps.push('\n=== Step 12: Unblock করো ===');
  const step12 = await req('PATCH', `/admin/users/${userId}/toggle`, null, adminToken);
  steps.push(`User is active again: ${step12.data.isActive === true}`);

  const step13 = await req('POST', '/auth/user/login', {
    phone: userPhone,
    pin: '5678'
  });
  steps.push(step13.status === 201 ? 'Login successful after unblock' : 'Login failed after unblock');

  fs.writeFileSync('test-profile.json', JSON.stringify(steps, null, 2), 'utf-8');
}

run().catch(e => console.error(e));
