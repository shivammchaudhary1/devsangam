import { verifyEmailTransport } from '../services/email.service.ts';

async function run() {
  console.log('Testing SMTP connection...');

  await verifyEmailTransport();

  console.log('✓ SMTP connection is healthy');
}

await run();
