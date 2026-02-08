import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, retry, timeout, catchError } from 'rxjs/operators';
import { QuoteResponse } from '../models/types';

@Injectable({
  providedIn: 'root',
})
export class QuoteService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://dummyjson.com/quotes/random';

  getRandomQuote(): Observable<string> {
    return this.http.get<QuoteResponse>(this.API_URL).pipe(
      timeout(5000),
      retry({ count: 2, delay: 1000 }),
      map((response) => response.quote),
      catchError((error) => {
        console.error('Quote fetch failed:', error);
        return throwError(() => new Error('Unable to load quote. Please try again.'));
      }),
    );
  }
}
