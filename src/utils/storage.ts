import { AppData } from '@/types/subscription';

const STORAGE_KEY = 'cancelproof_data';
const VERSION = '1.0.0';

export function saveToLocalStorage(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable - data will remain in memory
  }
}

export function loadFromLocalStorage(): AppData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored) as AppData;
    return data;
  } catch {
    return null;
  }
}

export function exportBackup(): string {
  const data = loadFromLocalStorage();
  return JSON.stringify(data || { subscriptions: [], version: VERSION }, null, 2);
}

export function importBackup(jsonString: string): AppData {
  try {
    const data = JSON.parse(jsonString) as AppData;
    if (!data.subscriptions || !Array.isArray(data.subscriptions)) {
      throw new Error('Invalid backup format');
    }
    return data;
  } catch (error) {
    throw new Error('Failed to import backup: Invalid format');
  }
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
