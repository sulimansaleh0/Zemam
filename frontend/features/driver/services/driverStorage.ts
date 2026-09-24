'use client';

import type { DriverTelemetryPayload } from '@/features/gps/types/gps.types';
import type { DriverTask, OfflineAction } from '../types/driverPwa.types';

const DB_NAME = 'zemam_driver_db';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('telemetry_queue')) {
        db.createObjectStore('telemetry_queue', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('offline_actions')) {
        db.createObjectStore('offline_actions', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('cached_tasks')) {
        db.createObjectStore('cached_tasks', { keyPath: '_id' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// ── Telemetry Queue ──
export async function queueTelemetryPoint(point: DriverTelemetryPayload): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('telemetry_queue', 'readwrite');
    const store = tx.objectStore('telemetry_queue');
    store.add(point);
  } catch (err) {
    console.warn('[DriverStorage] queueTelemetryPoint failed:', err);
  }
}

export async function getQueuedTelemetry(): Promise<DriverTelemetryPayload[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('telemetry_queue', 'readonly');
      const store = tx.objectStore('telemetry_queue');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function clearQueuedTelemetry(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('telemetry_queue', 'readwrite');
    const store = tx.objectStore('telemetry_queue');
    store.clear();
  } catch (err) {
    console.warn('[DriverStorage] clearQueuedTelemetry failed:', err);
  }
}

// ── Offline Actions ──
export async function queueOfflineAction(action: OfflineAction): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('offline_actions', 'readwrite');
    const store = tx.objectStore('offline_actions');
    store.put(action);
  } catch (err) {
    console.warn('[DriverStorage] queueOfflineAction failed:', err);
  }
}

export async function getOfflineActions(): Promise<OfflineAction[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('offline_actions', 'readonly');
      const store = tx.objectStore('offline_actions');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function removeOfflineAction(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('offline_actions', 'readwrite');
    const store = tx.objectStore('offline_actions');
    store.delete(id);
  } catch (err) {
    console.warn('[DriverStorage] removeOfflineAction failed:', err);
  }
}

// ── Cached Tasks ──
export async function cacheTasksLocally(tasks: DriverTask[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction('cached_tasks', 'readwrite');
    const store = tx.objectStore('cached_tasks');
    store.clear();
    tasks.forEach((t) => store.put(t));
  } catch (err) {
    console.warn('[DriverStorage] cacheTasksLocally failed:', err);
  }
}

export async function getCachedTasksLocally(): Promise<DriverTask[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction('cached_tasks', 'readonly');
      const store = tx.objectStore('cached_tasks');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}
