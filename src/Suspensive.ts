import { Observable, ObserverCallback } from "./Observer";

export const NOT_IN_TRANSITION = Symbol('Not in transition');

/**
 * Promise wrapper for render-as-you-fetch.
 *
 * ```typescript
 * function ResourceWithLoading() {
 *   const resource = new Suspensive(fetch(...));
 *
 *   return (
 *     <Suspense fallback={<Loading />}>
 *       <Resource resource={resource} />
 *     </Suspense>
 *   );
 * }
 *
 * function Resource(props: { resource: Suspensive<Resource>}) {
 *   // If the value not prepared, throw an exception at the following line.
 *   const resource = props.resource.value;
 *   ...
 * }
 * ```
 */
export class Suspensive<T> implements Observable {
  private _get: () => T;
  private _fallback: T | typeof NOT_IN_TRANSITION;
  private _observers = new Set<ObserverCallback>();

  constructor(promise: T | Promise<T> | (() => Promise<T>)) {
    this._get = () => NOT_IN_TRANSITION as unknown as T;
    this._set(promise);
  }

  private _set(promise: T | Promise<T> | (() => Promise<T>)) {
    try {
      this._fallback = this._get();
    } catch (promise: any) {
      if (promise instanceof Error) {
        // Ignore if the previous promise is rejected.
      } else {
        promise?.cancel();
      }
    }

    if (promise instanceof Promise) {
      const wrapped = this._wrapPromise(promise);
      this._get = () => { throw wrapped; };
    } else if (promise instanceof Function) {
      this._get = () => {
        throw this._wrapPromise(promise());
      };
    } else {
      this._get = () => promise;
    }
  }

  private _wrapPromise(promise: Promise<T>) {
    let canceled: boolean;

    const wrappedPromise = promise.then(
      value => {
        if (!canceled) {
          this._fallback = NOT_IN_TRANSITION;
          this._get = () => value;
        }
      },
      reason => {
        if (!canceled) {
          this._fallback = NOT_IN_TRANSITION;
          this._get = () => { throw reason; };
        }
      }
    );

    (wrappedPromise as any).cancel = () => { canceled = true };

    return wrappedPromise;
  }

  get value(): T {
    return this._get();
  }

  set value(value: T | Promise<T> | (() => Promise<T>)) {
    this.set(value);
  }

  set(value: T | Promise<T> | (() => Promise<T>)) {
    this._set(value);

    setTimeout(() => {
      this._observers.forEach(observer => observer());
    }, 0);
  }

  get fallback(): T {
    if (this._fallback === NOT_IN_TRANSITION) {
      throw new Error('The `fallback` property can be get only in a transition');
    }

    return this._fallback;
  }

  set fallback(fallback: T) {
    this._fallback = fallback;
  }

  hasFallback() {
    return this._fallback !== NOT_IN_TRANSITION;
  }

  clearFallback() {
    this._fallback = NOT_IN_TRANSITION;
    this._get = () => NOT_IN_TRANSITION as unknown as T;
  }

  addObserver(callback: ObserverCallback) {
    this._observers.add(callback);
  }

  removeObserver(callback: ObserverCallback) {
    this._observers.delete(callback);
  }
}

export function isSuspensive<T>(obj: any): obj is Suspensive<T> {
  return obj instanceof Suspensive;
}
