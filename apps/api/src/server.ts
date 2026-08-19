import { app } from './app.ts';

import { connectDatabase } from './config/database.ts';

const PORT = Number(process.env.PORT) || 4000;

async function bootstrap() {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(`✓ DevSangam API running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start DevSangam API:', error);

    process.exit(1);
  }
}

void bootstrap();
