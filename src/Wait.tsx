import React, { ReactNode, Suspense, SuspenseProps } from 'react';
import { useObserver } from './Observer';
import { Suspensive } from './Suspensive';

type FallbackProp = SuspenseProps['fallback'];

type WaitProps<T> = {
  suspensive: Suspensive<T>;
  render: (value: T) => ReactNode;
  fallback?: ReactNode;
} | {
  suspensive: Suspensive<T>;
  renderAlways: (waiting: boolean, value: T) => ReactNode;
};

interface RenderProps<T> {
  suspensive: Suspensive<T>;
  render: (value: T) => ReactNode;
}

interface RenderAlwaysProps<T> {
  waiting?: boolean;
  suspensive: Suspensive<T>;
  renderAlways: (waiting: boolean, value: T) => ReactNode;
}

let defaultFallback: FallbackProp = 'Loading...';

export function setDefaultFallback(node: FallbackProp) {
  defaultFallback = node;
}

/**
 * `Wait` waits `Suspensive` value with using `Suspense`, and render the resolved value.
 *
 * After `Suspensive` is resolved, the `render` prop is called with the resolved value.
 * While waiting, it shows the `fallback` prop.
 *
 * ```
 * <Wait suspensive={suspensive}
 *   fallback={<div>Loading...</div>}
 *   render={value =>
 *     <MyComponent value={value} />
 *   } />
 * ```
 * 
 * If the `fallback` prop omits, the default value, which can be set using
 * `setDefaultFallback()`, will be used.
 *
 * ```
 * <Wait suspensive={suspensive} render={value =>
 *   <MyComponent value={value} />
 * } />
 * ```
 *
 * The `renderAlways` prop can be used instead of `render` and `fallback` props.
 * It renders contents based on waiting status and the resolved value.
 * 
 * ```
 * <Wait suspensive={suspensive} renderAlways={(waiting, value) =>
 *   <Button onClick={reload} disabled={waiting}>Reload</Button>
 *   { waiting || <MyComponent value={value} /> }
 * } />
 * ```
 */
export function Wait<T>(props: WaitProps<T>) {
  useObserver(props.suspensive);

  return 'renderAlways' in props
    ? <Suspense
      fallback={<RenderAlways waiting {...props} />}
      children={<RenderAlways {...props} />} />
    : <Suspense
      fallback={props.fallback ?? defaultFallback}
      children={<Render suspensive={props.suspensive} render={props.render} />} />;
}

function Render<T>({ suspensive, render }: RenderProps<T>) {
  return <>{render(suspensive.value)}</>;
}

function RenderAlways<T>({ waiting, renderAlways, suspensive }: RenderAlwaysProps<T>) {
  return <>{waiting
    ? renderAlways(true, undefined as any as T)
    : renderAlways(false, suspensive.value)
  }</>;
}
