# react-suspensive

Promise wrapper for render-as-you-fetch.

## Installation

```
npm i react-suspensive
```

## Usage

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

## License

MIT
