import test from 'tape';
import { Suspensive } from '..';

test('test resolve', t => {
  t.plan(2);

  let resolve: (value: string) => void;

  const promise = new Promise<string>((_resolve, _reject) => {
    resolve = _resolve;
  });

  const suspensive = new Suspensive(promise);

  try {
    suspensive.value;
    t.fail();
  } catch (err) {
    t.ok(err instanceof Promise);
  }

  resolve!('ok');

  setImmediate(() => {
    try {
      t.equal(suspensive.value, 'ok');
    } catch (err: any) {
      t.fail(err);
    }
  });
});

test('test reject', t => {
  t.plan(2);

  let reject: (reason: string) => void;

  const promise = new Promise<string>((_resolve, _reject) => {
    reject = _reject;
  });

  const suspensive = new Suspensive(promise);

  try {
    suspensive.value;
    t.fail();
  } catch (err) {
    t.ok(err);
  }

  reject!('err');

  setImmediate(() => {
    try {
      suspensive.value;
      t.fail();
    } catch (err) {
      t.equal(err, 'err');
    }
  });
});

test('Cancel previous promise', t => {
  t.plan(4);

  let resolve1st: (value: string) => void;

  const promise1st = new Promise<string>((_resolve, _reject) => {
    resolve1st = _resolve;
  });

  const suspensive = new Suspensive(promise1st);

  try {
    suspensive.value;
    t.fail();
  } catch (err) {
    t.ok(err instanceof Promise);
  }

  let resolve2nd: (value: string) => void;

  const promise2nd = new Promise<string>((_resolve, _reject) => {
    resolve2nd = _resolve;
  });

  suspensive.value = promise2nd;

  try {
    suspensive.value;
    t.fail();
  } catch (err) {
    t.ok(err instanceof Promise);
  }

  resolve2nd!('2nd');

  setImmediate(() => {
    try {
      t.equal(suspensive.value, '2nd');
    } catch (err: any) {
      t.fail(err);
    }

    resolve1st!('1st');

    setImmediate(() => {
      try {
        t.equal(suspensive.value, '2nd');
      } catch (err: any) {
        t.fail(err);
      }
    });
  });
});
