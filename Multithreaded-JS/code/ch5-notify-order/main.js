if (!crossOriginIsolated) throw new Error('Cannot use SharedArrayBuffer');

const buffer = new SharedArrayBuffer(4);
const view = new Int32Array(buffer);

// 4 dedicated workers instantiated
for (let i = 0; i < 4; i++) {
  const worker = new Worker('worker.js');
  worker.postMessage({buffer, name: i});
}

setTimeout(() => {
  // Shared buffer notified at index 0
  Atomics.notify(view, 0, 3);
}, 500);