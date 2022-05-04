const worker = new SharedWorker('shared-worker.js');
const connections = [];
onconnect = function(e) {
    const port = e.ports[0];
    connections.push(port);
};
worker.port.postMessage('test message');
worker.port.onmessage = function (e) {
    console.log(e.data);
};