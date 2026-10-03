import { app } from './app.ts';
import { connectDatabase } from './config/database.ts';
import { validateProductionEnvironment } from './config/env.ts';
import { ensureV2Indexes } from './config/v2-indexes.ts';
import { startPushReminderScheduler } from './services/push-reminder.service.ts';

const PORT = Number(process.env.PORT) || 4000;

async function bootstrap() {
  try {
    validateProductionEnvironment();
    await connectDatabase();
    await ensureV2Indexes();

    startPushReminderScheduler();

    app.listen(PORT, () => {
      console.log(`✓ DevSangam API running on port ${PORT}`);
    });
  } catch (error) {
    console.error(
      'Failed to start DevSangam API:',
      error instanceof Error &&
        error.message.startsWith('Invalid production configuration:')
        ? error.message
        : 'Database or startup configuration unavailable.'
    );

    process.exit(1);
  }
}

void bootstrap();
