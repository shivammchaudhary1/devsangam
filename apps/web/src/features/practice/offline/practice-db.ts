import type { LocalPracticeSession } from './practice-local.types';
import Dexie, { type EntityTable } from 'dexie';

class DevSangamPracticeDatabase extends Dexie {
  practiceSessions!: EntityTable<
    LocalPracticeSession,
    'sessionId'
  >;

  constructor() {
    super('devsangam-practice');

    this.version(1).stores({
      practiceSessions:
        'sessionId, mantraSlug, status, updatedAt, lastSyncedAt',
    });
  }
}

export const practiceDb =
  new DevSangamPracticeDatabase();