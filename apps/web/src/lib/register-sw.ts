import { Workbox } from 'workbox-window';

type Options = {
  onOfflineReady: () => void;
  onNeedRefresh: () => void;
  onRegisterError: (error: unknown) => void;
};
export function registerSW(options: Options) {
  // Match the previous PWA configuration: workers are production-only.
  if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator))
    return async () => undefined;
  const worker = new Workbox('/sw.js', { scope: '/', updateViaCache: 'none' });
  let reloadRequested = false;
  worker.addEventListener('waiting', () => options.onNeedRefresh());
  worker.addEventListener('installed', (event) => {
    if (!event.isUpdate) options.onOfflineReady();
  });
  worker.addEventListener('controlling', () => {
    if (reloadRequested) window.location.reload();
  });
  void worker.register({ immediate: true }).catch(options.onRegisterError);
  return async (reloadPage = false) => {
    reloadRequested = reloadPage;
    worker.messageSkipWaiting();
  };
}
