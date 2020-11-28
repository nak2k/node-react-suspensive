import { Observable, ObserverCallback } from "./Observer";

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
  private _observers = new Set<ObserverCallback>();

  constructor(promise: T | Promise<T> | (() => Promise<T>)) {
    this._set(promise);
  }

  private _set(promise: T | Promise<T> | (() => Promise<T>)) {
    if (promise instanceof Promise) {
      this._get = () => { throw promise; };

      promise.then(
        value => this._get = () => value,
        reason => this._get = () => { throw reason; }
      );
    } else if (promise instanceof Function) {
      this._get = () => {
        throw promise().then(
          value => this._get = () => value,
          reason => this._get = () => { throw reason; }
        );
      };
    } else {
      this._get = () => promise;
    }
  }

  get value() {
    return this._get();
  }

  set value(value: T) {
    this.set(value);
  }

  set(value: T | Promise<T> | (() => Promise<T>)) {
    this._set(value);

    this._observers.forEach(observer => observer());
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
