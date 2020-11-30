import React, { ReactNode, Suspense, SuspenseProps } from 'react';
import { useObserver } from './Observer';
import { Suspensive } from './Suspensive';

type FallbackProp = SuspenseProps['fallback'];

type WaitProps<T> = {
  suspensive: Suspensive<T>;
  transient?: boolean;
  render: (value: T, pending?: boolean) => ReactNode;
  fallback?: ReactNode;
} | {
  suspensive: Suspensive<T>;
  transient?: boolean;
  renderAlways: (waiting: boolean, value: T, pending?: boolean) => ReactNode;
};

interface RenderProps<T> {
  suspensive: Suspensive<T>;
  render: (value: T, pending?: boolean) => ReactNode;
  pending?: boolean;
}

interface RenderAlwaysProps<T> {
  waiting?: boolean;
  suspensive: Suspensive<T>;
  renderAlways: (waiting: boolean, value: T, pending?: boolean) => ReactNode;
  pending?: boolean;
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
  const { suspensive, transient } = props;

  useObserver(suspensive);

  const pending = transient && suspensive.hasPrev();

  if ('renderAlways' in props) {
    return <Suspense
      fallback={<RenderAlways suspensive={suspensive} waiting pending={pending} renderAlways={props.renderAlways} />}
      children={<RenderAlways suspensive={suspensive} renderAlways={props.renderAlways} />}
    />;
  } else {
    return <Suspense
      fallback={pending
        ? <Render suspensive={suspensive} pending render={props.render} />
        : (props.fallback ?? defaultFallback)}
      children={<Render suspensive={suspensive} render={props.render} />}
    />;
  }
}

function Render<T>({ suspensive, render, pending }: RenderProps<T>) {
  return <>{render(pending ? suspensive.prev : suspensive.value, pending)}</>;
}

function RenderAlways<T>({ waiting, renderAlways, suspensive, pending }: RenderAlwaysProps<T>) {
  return <>{waiting
    ? renderAlways(true, undefined as any as T, pending)
    : renderAlways(false, pending ? suspensive.prev : suspensive.value, pending)
  }</>;
}
