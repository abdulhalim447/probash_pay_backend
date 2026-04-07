const baseUrl = 'http://127.0.0.1:3000';

async function test() {
  const res = await fetch(`${baseUrl}/auth/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '01900001001', pin: '1234' })
  });
  
  const text = await res.text();
  console.log('STATUS:', res.status);
  console.log('BODY HEAD:', text.substring(0, 500));
}

test().catch(e => console.error(e));
