import { useReducer, DependencyList } from 'react';
import { Suspensive } from './Suspensive';

interface LocalSuspensiveState<T> {
  deps: DependencyList;
  suspensive: Suspensive<T>;
}

/**
 * The hook to store a `Suspensive` as state.
 *
 * @param factory The function that generates a value to set to the `Suspensive`.
 * @param deps The dependency array that triggers to call the `factory` function.
 */
export function useLocalSuspensive<T>(
  factory: () => T | Promise<T> | (() => Promise<T>),
  deps: DependencyList
) {
  const [state, dispatch] = useReducer((state: LocalSuspensiveState<T>, deps: DependencyList) => {
    state.suspensive.set(factory());
    return {
      deps,
      suspensive: state.suspensive,
    };
  }, deps, deps => ({
    deps,
    suspensive: new Suspensive(factory()),
  }));

  if (!areEqual(state.deps, deps)) {
    dispatch(deps);
  }

  return state.suspensive;
}

interface SuspensiveState<T> {
  deps: DependencyList;
  suspensive: Suspensive<T>;
  prev?: Suspensive<T>;
}

/**
 * The hook to use a `Suspensive` external to a component.
 * 
 * When the `Suspensive` referred by this hook is changed and new `Suspensive` has no fallback,
 * this hook sets the value of the old `Suspensive` as the fallback of new `Suspensive`.
 * By doing so, you can use the old `Suspensive` until the new `Suspensive` resolves.
 * 
 * @param factory The function that returns the reference to the external `Suspensive`.
 * @param deps The dependency array that triggers to call the `factory` function.
 */
export function useSuspensive<T>(
  factory: () => Suspensive<T>,
  deps: DependencyList
) {
  const [state, dispatch] = useReducer((state: SuspensiveState<T>, deps: DependencyList): SuspensiveState<T> => {
    const suspensive = factory();

    if (!suspensive.hasFallback() && state.prev) {
      suspensive.fallback = state.prev.value;
    }

    return {
      deps,
      suspensive,
      prev: state.suspensive,
    };
  }, deps, deps => ({
    deps,
    suspensive: factory(),
  }));

  if (!areEqual(state.deps, deps)) {
    dispatch(deps);
  }

  return state.suspensive;
}

function areEqual(prevDeps: DependencyList, nextDeps: DependencyList) {
  if (prevDeps.length !== nextDeps.length) {
    throw new Error('Size of deps must not be changed');
  }

  for (let i = 0; i < nextDeps.length; ++i) {
    if (!Object.is(prevDeps[i], nextDeps[i])) {
      return false;
    }
  }

  return true;
}
