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

## License

MIT
