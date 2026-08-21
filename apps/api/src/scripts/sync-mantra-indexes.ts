import { connectDatabase } from '../config/database.ts';
import { MantraModel } from '../models/mantra.model.ts';

async function syncMantraIndexes() {
  try {
    await connectDatabase();

    console.log('Synchronizing mantra indexes...');

    const droppedIndexes = await MantraModel.syncIndexes();

    console.log('Dropped old indexes:', droppedIndexes);

    const indexes = await MantraModel.collection.indexes();

    console.log('Current mantra indexes:');

    for (const index of indexes) {
      console.log(`- ${index.name}`);
    }

    console.log('✓ Mantra indexes synchronized');

    process.exit(0);
  } catch (error) {
    console.error('Failed to synchronize mantra indexes:', error);
    process.exit(1);
  }
}

void syncMantraIndexes();
