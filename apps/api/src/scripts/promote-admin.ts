import { connectDatabase } from '../config/database.ts';
import { AdminAuditModel } from '../models/commerce.model.ts';
import { UserModel } from '../models/user.model.ts';
import mongoose from 'mongoose';
import { z } from 'zod';

try {
  const email = z.email().parse(process.argv[2]).trim().toLowerCase();
  await connectDatabase();
  await mongoose.connection.transaction(async (session) => {
    const user = await UserModel.findOne({ email }).session(session);
    if (!user) throw new Error('An existing account is required.');
    if (user.role === 'admin') return;
    user.role = 'admin';
    await user.save({ session });
    await AdminAuditModel.create(
      [
        {
          adminUserId: user._id,
          action: 'role.promoted',
          targetType: 'user',
          targetId: user.id,
          metadata: { source: 'operator-cli' },
        },
      ],
      { session }
    );
  });
  console.log('Existing account promoted to administrator.');
} catch {
  console.error(
    'Promotion failed. Supply a valid existing account email and database configuration.'
  );
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
