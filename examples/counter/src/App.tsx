import React from "react";
import { Suspensive, Wait, setDefaultFallback } from "react-suspensive";

setDefaultFallback(<div>Loading...</div>);

const counter = new Suspensive(0);
const counter2 = new Suspensive(0);

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
        <Wait suspensive={counter2} renderAlways={(waiting, value) =>
          <>
            <button disabled={waiting} onClick={() =>
              counter2.set(new Promise(resolve => {
                setTimeout(() => {
                  resolve(value + 1);
                }, 1000);
              }))
            }>Increment</button>
            <button disabled={waiting} onClick={() =>
              counter2.set(new Promise(resolve => {
                setTimeout(() => {
                  resolve(value - 1);
                }, 1000);
              }))
            }>Decrement</button>
          </>
        } />
      </section>
    </>
  );
}
