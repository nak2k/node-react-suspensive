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
export class Suspensive<T> {
  protected _get: () => T;

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
