const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    // We will create a tiny dummy PDF content
    const dummyPdfContent = `%PDF-1.5
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 40 >>
stream
BT /F1 12 Tf 100 700 Td (Hello World) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000223 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
314
%%EOF`;

    const buffer = Buffer.from(dummyPdfContent, 'utf-8');
    const blob = new Blob([buffer], { type: 'application/pdf' });
    const formData = new FormData();
    formData.append('file', blob, 'test.pdf');

    console.log("Sending request to http://localhost:3000/api/parse-document...");
    const response = await fetch('http://localhost:3000/api/parse-document', {
      method: 'POST',
      body: formData
    });

    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Response data:", data);
  } catch (err) {
    console.error("Test failed:", err);
  }
}

testUpload();
