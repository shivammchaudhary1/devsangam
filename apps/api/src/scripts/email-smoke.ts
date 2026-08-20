import { verifyEmailTransport } from '../services/email.service.ts';

async function run() {
  console.log('Testing Gmail connection...');

  await verifyEmailTransport();

  console.log('✓ Gmail SMTP connection is healthy');
}

await run();
