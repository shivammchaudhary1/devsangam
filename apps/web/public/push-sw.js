const DEFAULT_NOTIFICATION = {
  title: 'DevSangam',
  body: 'A DevSangam notification is ready.',
  icon: '/pwa-192x192.png',
  badge: '/pwa-192x192.png',
  url: '/',
};

function readPushPayload(event) {
  if (!event.data) {
    return DEFAULT_NOTIFICATION;
  }

  try {
    const payload = event.data.json();

    if (!payload || typeof payload !== 'object') {
      return DEFAULT_NOTIFICATION;
    }

    return payload;
  } catch {
    return DEFAULT_NOTIFICATION;
  }
}

function getText(value, fallback) {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function getNotificationUrl(value) {
  const requestedUrl = new URL(
    getText(value, DEFAULT_NOTIFICATION.url),
    self.location.origin
  );

  if (requestedUrl.origin !== self.location.origin) {
    return new URL(DEFAULT_NOTIFICATION.url, self.location.origin).href;
  }

  return requestedUrl.href;
}

self.addEventListener('push', (event) => {
  const payload = readPushPayload(event);

  const title = getText(payload.title, DEFAULT_NOTIFICATION.title);

  const notificationData =
    payload.data && typeof payload.data === 'object' ? payload.data : {};

  const options = {
    body: getText(payload.body, DEFAULT_NOTIFICATION.body),
    icon: getText(payload.icon, DEFAULT_NOTIFICATION.icon),
    badge: getText(payload.badge, DEFAULT_NOTIFICATION.badge),
    tag: getText(payload.tag, 'devsangam-notification'),
    data: {
      ...notificationData,
      url: getNotificationUrl(payload.url),
    },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = getNotificationUrl(event.notification.data?.url);

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      const exactClient = windowClients.find(
        (client) => client.url === targetUrl
      );

      if (exactClient) {
        await exactClient.focus();

        return;
      }

      const activePracticeClient = windowClients.find((client) => {
        const clientUrl = new URL(client.url);

        return (
          clientUrl.origin === self.location.origin &&
          clientUrl.pathname.startsWith('/practice/') &&
          clientUrl.pathname.includes('/session/')
        );
      });

      /*
       * Never navigate an active Sadhana away just because
       * the user clicked a reminder notification.
       */
      if (activePracticeClient) {
        await activePracticeClient.focus();

        return;
      }

      const existingClient = windowClients.find(
        (client) => new URL(client.url).origin === self.location.origin
      );

      if (existingClient) {
        if ('navigate' in existingClient) {
          await existingClient.navigate(targetUrl);
        }

        await existingClient.focus();

        return;
      }

      await self.clients.openWindow(targetUrl);
    })()
  );
});
