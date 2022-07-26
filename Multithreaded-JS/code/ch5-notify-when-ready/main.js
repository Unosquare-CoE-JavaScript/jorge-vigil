if (!crossOriginIsolated) throw new Error('Cannot use SharedArrayBuffer');

const buffer = new SharedArrayBuffer(4);
const view = new Int32Array(buffer);
const now = Date.now();
let count = 4;

// 4 dedicated workers instantiated
for (let i = 0; i < 4; i++) {
  const worker = new Worker('worker.js');
  // post a message to the workers
  worker.postMessage({buffer, name: i});
  worker.onmessage = () => {
    console.log(`Ready; id=${i}, count=${--count}, time=${Date.now() - now}ms`);
    // notify the 0th entry once all four workers reply
    if (count === 0) {
      Atomics.notify(view, 0);
    }
  }
}
