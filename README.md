# react-suspensive

Promise wrapper for render-as-you-fetch.

## Installation

```
npm i react-suspensive
```

## Usage

### Suspensive

`Suspensive` wraps `Promise`, and throw an exception if you try to get an unprepared value.
It can be combined with `Suspepense`.

``` typescript
import { Suspensive } from 'react-suspensive';

function ResourceWithLoading() {
  const resource = new Suspensive(fetch(...));

  return (
    <Suspense fallback={<Loading />}>
      <Resource resource={resource} />
    </Suspense>
  );
}

function Resource(props: { resource: Suspensive<Resource>}) {
  // If the value not prepared, throw an exception at the following line.
  const resource = props.resource.value;

  return (
    <>{ resource }</>
  );
}
```

If give the function that returns `Promise` instead of `Promise`,
`Suspensive` calls the function when the value is needed.

``` typescript
function ResourceWithLoading() {
  // Give the function instead of Promise.
  const resource = new Suspensive(() => fetch(...));

  return (
    <Suspense fallback={<Loading />}>
      <Resource resource={resource} />
    </Suspense>
  );
}

function Resource(props: { resource: Suspensive<Resource>}) {
  // When getting the value first, the above function is called here
  // and the returned promise is thrown.
  const resource = props.resource.value;
}
```

`Suspensive` can wrap a value other than `Promise` also.
In this case, no exceptions are thrown when getting the value.

### Suspensive#set

`set` method sets new `Promise` or new value to `Suspensive`.

``` typescript
function Resource(props: { resource: Suspensive<Resource>}) {
  const resource = props.resource.value;

  return (
    <>
      { resource }
      <Button onClick={() => {
        props.resource.set(fetch(...));
      }}>Reload</Button>
    </>
  );
}
```

When setting new value other than `Promise`, the `value` property can be used as the shorthand.

``` typescript
function Counter(props: { counter: Suspensive<number>}) {
  const { counter } = props;

return (
    <>
      { counter.value }
      <Button onClick={() => {
        counter.value = counter.value + 1;
      }}>Increment</Button>
    </>
  );
}
```

`Suspensive` is observable, so when new `Promise` or value is set, it notify to observers.

### useObserver

`useObserver` observes `Suspensive`, and re-renders the component that calls it
when `Suspensive` is set new `Promise` or value.

``` typescript
import { Suspensive, useObserver } from 'react-suspensive';

function ResourceWithLoading() {
  const resource = new Suspensive(() => fetch(...));

  // Re-render this component, when the reload button in Resource component is clicked.
  useObserver(resource);

  return (
    <Suspense fallback={<Loading />}>
      <Resource resource={resource} />
    </Suspense>
  );
}

function Resource(props: { resource: Suspensive<Resource>}) {
  const resource = props.resource.value;

  return (
    <>
      { resource }
      <Button onClick={() => {
        props.resource.set(fetch(...));
      }}>Reload</Button>
    </>
  );
}
```

### Observer

`Observer` is component version of `useObserver`.
This is useful when re-render part of component tree.

### Wait

`Wait` waits `Suspensive` value with using `Suspense`, and render the resolved value.

After `Suspensive` is resolved, the `render` prop is called with the resolved value.
While waiting, it shows the `fallback` prop.

``` typescript
import { Suspensive, Wait } from 'react-suspensive';

const value = new Suspensive(fetch(...));

<Wait suspensive={value}
  fallback={<div>Loading...</div>}
  render={value =>
    <MyComponent value={value} />
  } />
```

If the `fallback` prop omits, the default value, which can be set using
`setDefaultFallback()`, will be used.

``` typescript
import { Suspensive, Wait, setDefaultFallback } from 'react-suspensive';

setDefaultFallback(<MyLoading />);

const value = new Suspensive(fetch(...));

<Wait suspensive={value} render={value =>
  <MyComponent value={value} />
} />
```

The `renderAlways` prop can be used instead of `render` and `fallback` props.
It renders contents based on waiting status and the resolved value.

``` typescript
import { Suspensive, Wait } from 'react-suspensive';

const value = new Suspensive(fetch(...));

<Wait suspensive={value} renderAlways={(waiting, value) =>
  <Button onClick={reload} disabled={waiting}>Reload</Button>
  { waiting || <MyComponent value={value} /> }
} />
```

`Wait` observes `Suspensive`, so re-render automatically when setting new `Promise` or value.

``` typescript
import { Suspensive, Wait } from 'react-suspensive';

async function fetchMyResource() { ... };

const suspensive = new Suspensive(fetchMyResrouce);

<Wait suspensive={suspensive} render={value =>
  <>
    <MyComponent value={value} />
    <Button onClick={() => {
      // Wait re-renders with new Promise.
      suspensive.set(fetchMyResource);
    }}>Reload</Button>
  </>
} />
```

## License

MIT
