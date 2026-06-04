import { NextResponse } from 'next/server';
// @ts-ignore
import { PDFParse } from 'pdf-parse';
// @ts-ignore
import officeParser from 'officeparser';
import path from 'path';
import { pathToFileURL } from 'url';

// Configure absolute worker path dynamically as a file:// URL to support Windows paths in dynamic imports
// Using the nested pdfjs-dist inside pdf-parse to ensure API and Worker versions match exactly
const workerPath = path.join(process.cwd(), 'node_modules', 'pdf-parse', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs');
const workerURL = pathToFileURL(workerPath).href;
PDFParse.setWorker(workerURL);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds the 15MB limit.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Validate file size (15MB limit)
    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB in bytes
    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: 'File size exceeds 15MB limit' 
      }, { status: 400 });
    const arrayBuffer = await file.arrayBuffer();
    const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB limit
    if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size exceeds 15MB limit' }, { status: 413 });
    }
    const buffer = Buffer.from(arrayBuffer);
    const filename = file.name.toLowerCase();

    let text = '';

    if (filename.endsWith('.pdf')) {
      const parser = new PDFParse({ data: buffer });
      const parsed = await parser.getText();
      text = parsed.text || '';
      await parser.destroy();
    } else if (filename.endsWith('.pptx') || filename.endsWith('.ppt')) {
      text = await new Promise<string>((resolve, reject) => {
        officeParser.parseBuffer(buffer, (err: any, data: any) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });
    } else if (filename.endsWith('.txt')) {
      text = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ 
        error: 'Unsupported file type. Please upload a PDF, PPT, PPTX or TXT file.' 
      }, { status: 400 });
    }

    // Sanitize and limit output text content size to protect token limits
    const sanitized = text.replace(/\r\n/g, '\n').replace(/\n\s*\n/g, '\n\n');
    const words = sanitized.split(/\s+/);
    const maxWords = 10000;
    
    let processedText = sanitized;
    if (words.length > maxWords) {
      processedText = words.slice(0, maxWords).join(' ') + '\n\n... [Document content truncated to 10,000 words]';
    }

    return NextResponse.json({ 
      text: processedText, 
      filename: file.name,
      wordCount: words.length
    });
  } catch (error: any) {
    console.error('[parse-document] Document parsing failed:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to extract text from the document.' 
    }, { status: 500 });
  }
}
