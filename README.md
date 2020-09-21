# react-suspensive

Promise wrapper for render-as-you-fetch.

## Installation

```
npm i react-suspensive
```

## Usage

``` typescript
import { Suspensive } from 'react-suspensive';

const resource = new Suspensive(fetch(...));
  
return (
  <Suspense fallback={<Loading />}>
    { resource.value }
  </Suspense>
);
```

## License

MIT
