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
    t.ok(err);
  }

  resolve!('ok');

  setImmediate(() => {
    try {
      t.equal(suspensive.value, 'ok');
    } catch (err) {
      t.fail(err);
    }
  }, 10);
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
  }, 10);
});
