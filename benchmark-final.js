const http = require('http');

const ENDPOINTS = [
  { name: 'Dashboard Page', path: '/dashboard', method: 'GET' },
  { name: 'History Page', path: '/history', method: 'GET' },
  { name: 'Reports Page', path: '/reports', method: 'GET' },
  { name: 'Settings Page', path: '/settings', method: 'GET' },
  { name: 'Customers Page', path: '/customers', method: 'GET' },
  { name: 'Subscriptions Page', path: '/subscriptions', method: 'GET' },
  { name: 'History API (Filtered)', path: '/api/history?page=1&limit=50', method: 'GET' },
  { name: 'Customers API (Filtered)', path: '/api/customers?filter=ACTIVE', method: 'GET' },
];

const ITERATIONS = 5;

// Mock login cookie for zalte (ID: 1)
const COOKIE = `next-auth.session-token=mock-jwt-token`; 

async function measure(endpoint) {
  let totalTime = 0;
  let maxTime = 0;
  let sizes = [];

  for (let i = 0; i < ITERATIONS; i++) {
    const start = process.hrtime.bigint();
    
    await new Promise((resolve, reject) => {
      const req = http.request({
        hostname: 'localhost',
        port: 3000,
        path: endpoint.path,
        method: endpoint.method,
        headers: {
          'Cookie': COOKIE,
          'Accept': 'application/json, text/html'
        }
      }, (res) => {
        let size = 0;
        res.on('data', (chunk) => { size += chunk.length; });
        res.on('end', () => {
          sizes.push(size);
          resolve();
        });
      });
      req.on('error', reject);
      req.end();
    });

    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1e6; // ms
    totalTime += duration;
    if (duration > maxTime) maxTime = duration;
  }

  const avgTime = totalTime / ITERATIONS;
  const avgSize = (sizes.reduce((a, b) => a + b, 0) / ITERATIONS) / 1024; // KB

  console.log(`| ${endpoint.name} | ${endpoint.method} | ${avgTime.toFixed(2)}ms | ${maxTime.toFixed(2)}ms | ${avgSize.toFixed(2)} KB |`);
}

async function run() {
  console.log('Warming up server...');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('| Endpoint | Method | Avg Time (ms) | Max Time (ms) | Avg Payload (KB) |');
  console.log('|---|---|---|---|---|');

  for (const endpoint of ENDPOINTS) {
    await measure(endpoint);
  }
}
run();
