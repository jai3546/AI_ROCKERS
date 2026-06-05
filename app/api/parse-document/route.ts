import { NextResponse } from 'next/server';
// @ts-ignore
import { PDFParse } from 'pdf-parse';
// @ts-ignore
import officeParser from 'officeparser';
// Using default pdf-parse worker configuration which is safer for serverless environments

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds the 15MB limit.' }, { status: 413 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = file.name.toLowerCase();
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
