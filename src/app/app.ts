import { Component, signal, computed, effect, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TextFitDirective } from './directives/text-fit.directive';
import { StorageService } from './services/storage.service';
import { QuoteService } from './services/quote.service';
import { TimeRemaining } from './models/types';

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, TextFitDirective],
  templateUrl: './app.html',
  styleUrl: './app.css',
  standalone: true,
})
export class App {
  private readonly storageService = inject(StorageService);
  private readonly quoteService = inject(QuoteService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly eventName = signal<string>('');
  protected readonly eventDate = signal<Date | null>(null);

  protected readonly timeRemaining = signal<TimeRemaining | null>(null);
  protected readonly isExpired = computed(() => {
    const remaining = this.timeRemaining();
    return remaining ? remaining.total <= 0 : false;
  });

  protected readonly quote = signal<string | null>(null);
  protected readonly quoteLoading = signal<boolean>(false);
  protected readonly quoteError = signal<string | null>(null);

  constructor() {
    const saved = this.storageService.loadEvent();
    if (saved) {
      this.eventName.set(saved.name);
      this.eventDate.set(saved.date);
    }

    this.fetchQuote();

    effect(() => {
      const name = this.eventName();
      const date = this.eventDate();
      if (name || date) {
        this.storageService.saveEvent(name, date);
      } else {
        this.storageService.clearEvent();
      }
    });

    effect((onCleanup) => {
      const date = this.eventDate();

      if (!date) {
        this.timeRemaining.set(null);
        return;
      }

      this.calculateCountdown();

      const intervalId = setInterval(() => {
        this.calculateCountdown();
      }, 1000);

      onCleanup(() => clearInterval(intervalId));
    });
  }

  protected onNameChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.eventName.set(input.value);
  }

  protected onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const dateValue = input.value;
    if (dateValue) {
      //parse as local date to avoid UTC offset issues
      const [year, month, day] = dateValue.split('-').map(Number);
      this.eventDate.set(new Date(year, month - 1, day));
    } else {
      this.eventDate.set(null);
    }
  }

  protected eventDateString(): string {
    const date = this.eventDate();
    if (!date) return '';

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  protected formatCountdown(time: TimeRemaining): string {
    return `${time.days} days, ${time.hours}h, ${time.minutes}m, ${time.seconds}s`;
  }

  private calculateCountdown(): void {
    const date = this.eventDate();
    if (!date) {
      this.timeRemaining.set(null);
      return;
    }

    const now = Date.now();
    const target = date.getTime();
    const total = target - now;

    if (total <= 0) {
      this.timeRemaining.set({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        total: 0,
      });
      return;
    }

    this.timeRemaining.set({
      days: Math.floor(total / (1000 * 60 * 60 * 24)),
      hours: Math.floor((total / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((total / 1000 / 60) % 60),
      seconds: Math.floor((total / 1000) % 60),
      total,
    });
  }

  private fetchQuote(): void {
    this.quoteLoading.set(true);
    this.quoteError.set(null);

    this.quoteService
      .getRandomQuote()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (quoteText) => {
          this.quote.set(quoteText);
          this.quoteLoading.set(false);
        },
        error: (error) => {
          this.quoteError.set(error.message);
          this.quoteLoading.set(false);

          this.quote.set('Every moment is a fresh beginning.');
        },
      });
  }
}
