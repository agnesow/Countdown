import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly STORAGE_KEY = 'countdown-event';

  saveEvent(name: string, date: Date | null): void {
    try {
      const data = { name, date: date ? date.toISOString() : null };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save event to localStorage:', error);
    }
  }

  loadEvent(): { name: string; date: Date | null } | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return null;

      const parsed = JSON.parse(data);
      return {
        name: parsed.name,
        date: parsed.date ? new Date(parsed.date) : null,
      };
    } catch (error) {
      console.error('Failed to load event from localStorage:', error);
      return null;
    }
  }

  clearEvent(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear event from localStorage:', error);
    }
  }
}
