const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

async function generate() {
  const certDir = path.join(__dirname, '..', 'certificates');
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  const attrs = [
    { name: 'commonName', value: '192.168.10.130' },
    { name: 'organizationName', value: 'Zemam Logistics' },
  ];

  const pems = await selfsigned.generate(attrs, {
    days: 365,
    keySize: 2048,
    algorithm: 'sha256',
    extensions: [
      {
        name: 'basicConstraints',
        cA: true,
      },
      {
        name: 'subjectAltName',
        altNames: [
          { type: 2, value: 'localhost' },
          { type: 7, ip: '127.0.0.1' },
          { type: 7, ip: '192.168.10.130' },
        ],
      },
    ],
  });

  fs.writeFileSync(path.join(certDir, 'cert.pem'), pems.cert);
  fs.writeFileSync(path.join(certDir, 'key.pem'), pems.private);
  fs.writeFileSync(path.join(certDir, 'zemam-cert.crt'), pems.cert);

  console.log('✅ SSL certificates generated successfully:');
  console.log('   - frontend/certificates/cert.pem');
  console.log('   - frontend/certificates/key.pem');
  console.log('   - frontend/certificates/zemam-cert.crt');
}

generate().catch(console.error);
