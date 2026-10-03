import { once } from 'node:events';
import { createServer } from 'node:net';

// Loopback-only SMTP fixture; no email leaves the test process.
export async function smtpFixture() {
  const messages: string[] = [];
  const server = createServer((socket) => {
    let pending = '';
    let data = false;
    let message = '';
    socket.write('220 localhost ESMTP test\r\n');
    socket.on('data', (bytes) => {
      pending += bytes.toString();
      let separator: number;
      while ((separator = pending.indexOf('\r\n')) !== -1) {
        const line = pending.slice(0, separator);
        pending = pending.slice(separator + 2);
        if (data) {
          if (line === '.') {
            messages.push(message);
            message = '';
            data = false;
            socket.write('250 Message accepted\r\n');
          } else message += line + '\r\n';
        } else if (/^(EHLO|HELO)/i.test(line))
          socket.write('250-localhost\r\n250 AUTH PLAIN\r\n');
        else if (/^AUTH /i.test(line))
          socket.write('235 Authentication accepted\r\n');
        else if (/^DATA$/i.test(line)) {
          data = true;
          socket.write('354 End with dot\r\n');
        } else if (/^QUIT$/i.test(line)) socket.end('221 Bye\r\n');
        else socket.write('250 OK\r\n');
      }
    });
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return {
    messages,
    port: (server.address() as { port: number }).port,
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}
