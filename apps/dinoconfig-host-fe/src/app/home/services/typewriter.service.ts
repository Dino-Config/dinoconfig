import { Injectable } from '@angular/core';
import { interval, of, from, Observable, concat } from 'rxjs';
import { map, take, delay, concatMap, repeat } from 'rxjs/operators';

interface TypeParams {
  word: string;
  speed: number;
  backwards?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TypewriterService {
  private type({ word, speed, backwards = false }: TypeParams): Observable<string> {
    return interval(speed).pipe(
      map(x => backwards ? word.substring(0, word.length - x) : word.substring(0, x + 1)),
      take(word.length)
    );
  }

  typeEffect(word: string): Observable<string> {
    return concat(
      this.type({ word, speed: 50 }),
      of(word).pipe(delay(3000)),
      this.type({ word, speed: 30, backwards: true }),
      of('').pipe(delay(300))
    );
  }

  getTypewriterEffect(titles: string[]): Observable<string> {
    return from(titles).pipe(
      concatMap(title => this.typeEffect(title)),
      repeat()
    );
  }
}

