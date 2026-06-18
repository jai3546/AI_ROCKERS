const { PDFParse } = require('pdf-parse');
console.log("PDFParse class:", typeof PDFParse);

const dummyBuffer = Buffer.from("%PDF-1.5...");
const parser = new PDFParse({ data: dummyBuffer });
parser.getText().then(data => {
  console.log("Parsed dummy data:", data);
}).catch(err => {
  console.log("Parsed dummy error:", err.message);
});
