import { connectDatabase } from '../config/database.ts';
import { MantraModel } from '../models/mantra.model.ts';
import { PracticeSessionModel } from '../models/practice-session.model.ts';
import mongoose from 'mongoose';

async function syncIndexes() {
  try {
    await connectDatabase();

    console.log('Synchronizing DevSangam indexes...');

    const [droppedMantraIndexes, droppedPracticeIndexes] = await Promise.all([
      MantraModel.syncIndexes(),
      PracticeSessionModel.syncIndexes(),
    ]);

    console.log('Dropped old mantra indexes:', droppedMantraIndexes);
    console.log('Dropped old practice indexes:', droppedPracticeIndexes);

    const [mantraIndexes, practiceIndexes] = await Promise.all([
      MantraModel.collection.indexes(),
      PracticeSessionModel.collection.indexes(),
    ]);

    console.log('Current mantra indexes:');

    for (const index of mantraIndexes) {
      console.log(`- ${index.name}`);
    }

    console.log('Current practice-session indexes:');

    for (const index of practiceIndexes) {
      console.log(`- ${index.name}`);
    }

    console.log('✓ DevSangam indexes synchronized');
  } catch (error) {
    console.error('Failed to synchronize indexes:', error);

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void syncIndexes();
