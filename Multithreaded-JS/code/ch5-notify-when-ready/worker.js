self.onmessage = ({data: {buffer, name}}) => {
  // post message back to parent thread to signal ready
  postMessage('ready');
  const view = new Int32Array(buffer);
  console.log(`Worker ${name} started`);
  // wait for notification on the 0th entry
  const result = Atomics.wait(view, 0, 0);
  console.log(`Worker ${name} awoken with ${result}`);
};