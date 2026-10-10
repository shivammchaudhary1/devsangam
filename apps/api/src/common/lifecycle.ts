import { Injectable, type OnApplicationShutdown } from '@nestjs/common';
import mongoose from 'mongoose';
@Injectable()
export class ApiLifecycle implements OnApplicationShutdown {
  private stopReminders?: () => void;
  configure(stopReminders: () => void) { this.stopReminders = stopReminders; }
  async onApplicationShutdown() {
    // Only production bootstrap owns this connection; isolated tests own theirs.
    if (!this.stopReminders) return;
    this.stopReminders();
    this.stopReminders = undefined;
    await mongoose.disconnect();
  }
}
