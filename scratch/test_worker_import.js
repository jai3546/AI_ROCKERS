const path = require('path');
const { pathToFileURL } = require('url');

const workerPath = path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs');
const workerURL = pathToFileURL(workerPath).href;

console.log("Worker path:", workerPath);
console.log("Worker URL:", workerURL);

import(workerURL).then(m => {
  console.log("Successfully imported worker dynamically! Keys:", Object.keys(m).slice(0, 5));
}).catch(err => {
  console.error("Worker dynamic import failed:", err);
});
