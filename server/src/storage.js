import { promises as fs } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Storage adapters share one interface:
//   insert(collection, doc) -> saved doc
//   list(collection, { limit }) -> docs, newest first
//   kind -> 'mongodb' | 'file'

export function makeReference(prefix, now = new Date()) {
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${date}-${rand}`;
}

class FileStore {
  constructor(file) {
    this.kind = 'file';
    this.file = file;
    this.queue = Promise.resolve();
  }

  async read() {
    try {
      return JSON.parse(await fs.readFile(this.file, 'utf8'));
    } catch (err) {
      if (err.code === 'ENOENT') return { appointments: [], messages: [] };
      throw err;
    }
  }

  // Serialise writes and write atomically (temp file + rename) so concurrent
  // submissions never corrupt the file.
  insert(collection, doc) {
    const run = async () => {
      const data = await this.read();
      data[collection] = data[collection] || [];
      data[collection].push(doc);
      await fs.mkdir(path.dirname(this.file), { recursive: true });
      const tmp = `${this.file}.${process.pid}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(data, null, 2), { mode: 0o600 });
      await fs.rename(tmp, this.file);
      return doc;
    };
    this.queue = this.queue.then(run, run);
    return this.queue;
  }

  async list(collection, { limit = 500 } = {}) {
    const data = await this.read();
    return (data[collection] || []).slice().reverse().slice(0, limit);
  }

  async close() {}
}

class MongoStore {
  constructor(client, db) {
    this.kind = 'mongodb';
    this.client = client;
    this.db = db;
  }

  async insert(collection, doc) {
    await this.db.collection(collection).insertOne({ ...doc });
    return doc;
  }

  async list(collection, { limit = 500 } = {}) {
    return this.db
      .collection(collection)
      .find({}, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  }

  async close() {
    await this.client.close();
  }
}

export async function createStore(config, log = console) {
  if (config.mongoUri) {
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(config.mongoUri, { serverSelectionTimeoutMS: 10000 });
    await client.connect();
    const db = client.db(config.mongoDbName);
    await db.collection('appointments').createIndex({ createdAt: -1 });
    await db.collection('messages').createIndex({ createdAt: -1 });
    log.info?.('[storage] Connected to MongoDB');
    return new MongoStore(client, db);
  }
  if (config.allowFileStorage) {
    log.warn?.(`[storage] Using local file storage at ${config.dataFile}. Fine for development; use MongoDB in production.`);
    return new FileStore(config.dataFile);
  }
  log.warn?.('[storage] No storage configured (set MONGODB_URI). Form submissions will be refused with 503.');
  return null;
}
