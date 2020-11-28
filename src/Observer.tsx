import React, { ReactNode, useEffect, useReducer } from 'react';

export type ObserverCallback = () => void;

/**
 * The interface that represents an observable.
 *
 * Objects that implement this interface must have a set of observers
 * and notify all the observers when a change occurs in the object.
 */
export interface Observable {
  addObserver(callback: ObserverCallback): void;
  removeObserver(callback: ObserverCallback): void;
}

/**
 * The hook to observe a target.
 *
 * If a change occurs in the target, it will be re-rendered.
 *
 * @param target 
 */
export function useObserver(target: Observable) {
  const reload = useReducer((flag: boolean, _action: unknown) => !flag, false)[1] as ObserverCallback;

  useEffect(() => {
    target.addObserver(reload);

    return () => {
      target.removeObserver(reload);
    };
  }, [target]);
}

/**
 * The component to observe a target.
 *
 * If a change occurs in the target, children will be re-rendered.
 *
 * @param props 
 */
export function Observer(props: { target: Observable, children: ReactNode }) {
  useObserver(props.target);

  return <>{props.children}</>;
}
