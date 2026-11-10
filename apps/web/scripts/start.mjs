import { pathToFileURL } from 'node:url';
import path from 'node:path';
const port = Number(process.argv[2] || process.env.PORT || 5173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid web port.');
process.env.PORT = String(port);
await import(pathToFileURL(path.resolve('.next/standalone/apps/web/server.js')).href);
