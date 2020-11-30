import React from "react";
import { Suspensive, Wait, setDefaultFallback } from "react-suspensive";

setDefaultFallback(<div>Loading...</div>);

const counter = new Suspensive(0);
const counter2 = new Suspensive(delayedValue(0));

function delayedValue(value: number) {
  return new Promise<number>(resolve => {
    setTimeout(() => {
      resolve(value);
    }, 1000);
  });
}

export default function App() {
  return (
    <>
      <section>
        <h1>Counter</h1>
        <Wait suspensive={counter} render={value =>
          <div>{value}</div>
        } />
        <button onClick={() => counter.value++}>Increment</button>
        <button onClick={() => counter.value--}>Decrement</button>
      </section>

      <section>
        <h1>Async Counter</h1>
        <Wait suspensive={counter2} render={counter =>
          <div>{counter}</div>
        } />
        <Wait suspensive={counter2} transient render={(counter, pending) =>
          <div>{counter} {pending && 'pending'}</div>
        } />
        <Wait suspensive={counter2} transient renderAlways={(waiting, value, pending) =>
          <>
            <div>
              <button disabled={waiting} onClick={() =>
                counter2.set(delayedValue(value + 1))
              }>Increment</button>
              <button disabled={waiting} onClick={() =>
                counter2.set(delayedValue(value - 1))
              }>Decrement</button>
            </div>
            <div>Waiting: {`${waiting}`}</div>
            <div>Pending: {`${pending}`}</div>
          </>
        } />
      </section>
    </>
  );
}
