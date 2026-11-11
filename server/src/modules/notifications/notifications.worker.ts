import { NotificationsService } from './notifications.service.js';

let isRunning = false;
let intervalHandle: NodeJS.Timeout | null = null;

export class NotificationQueueWorker {
  /**
   * Start recurring background runner in node server runtime.
   */
  static start(intervalMs = 30000) {
    if (intervalHandle) return;

    intervalHandle = setInterval(async () => {
      if (isRunning) return;
      isRunning = true;
      try {
        await NotificationsService.drainQueue(20);
      } catch (err) {
        console.error('[NotificationWorker] Queue run error:', err);
      } finally {
        isRunning = false;
      }
    }, intervalMs);

    // Initial immediate kick
    NotificationsService.drainQueue(20).catch((err) =>
      console.error('[NotificationWorker] Initial drain error:', err)
    );
  }

  static stop() {
    if (intervalHandle) {
      clearInterval(intervalHandle);
      intervalHandle = null;
    }
  }
}
