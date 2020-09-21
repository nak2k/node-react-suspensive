/**
 * Promise wrapper for render-as-you-fetch.
 * 
 * ```typescript
 * const resource = new Suspensive(fetch(...));
 * 
 * return (
 *   <Suspense fallback={<Loading />}>
 *     { resource.value }
 *   </Suspense>
 * );
 * ```
 */
export class Suspensive<T> {
  private _get: () => T;

  constructor(promise: Promise<T>) {
    this._get = () => { throw promise };

    promise.then(
      value => this._get = () => value,
      reason => this._get = () => { throw reason }
    );
  }

  get value() {
    return this._get();
  }
}
