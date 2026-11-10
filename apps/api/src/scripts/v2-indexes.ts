import { connectDatabase } from '../config/database.ts';
import { ensureV2Indexes } from '../config/v2-indexes.ts';
import mongoose from 'mongoose';

try {
  await connectDatabase();
  await ensureV2Indexes();
  console.log('V2 indexes ready.');
} catch {
  console.error(
    'V2 index creation failed. Inspect database permissions and existing duplicate records.'
  );
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
