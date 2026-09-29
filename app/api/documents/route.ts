import { NextRequest, NextResponse } from 'next/server';
import { getDocuments, createDocument } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const equipmentId = searchParams.get('equipmentId') || undefined;
    const docs = await getDocuments(equipmentId);
    return NextResponse.json({ documents: docs });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const equipmentId = (formData.get('equipment_id') as string) || null;
    const documentType = (formData.get('document_type') as string) || 'OEM Manual';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const filename = file.name;
    let extractedText = '';

    // Extract text based on file format
    if (filename.endsWith('.txt') || filename.endsWith('.csv') || filename.endsWith('.json')) {
      extractedText = await file.text();
    } else if (filename.endsWith('.pdf')) {
      // Basic text extraction or fallback summary from filename & buffer
      const buffer = await file.arrayBuffer();
      const rawString = Buffer.from(buffer).toString('utf-8', 0, Math.min(buffer.byteLength, 100000));
      // Extract printable characters
      const cleanChars = rawString.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ');
      const words = cleanChars.match(/[A-Za-z0-9_.,-]{3,}/g) || [];
      extractedText = words.slice(0, 1500).join(' ');
      if (extractedText.length < 50) {
        extractedText = `Document: ${filename} (Binary PDF uploaded for equipment manual reference. Associated with equipment ID ${equipmentId || 'General'}).`;
      }
    } else {
      extractedText = `Uploaded document ${filename} of type ${documentType}.`;
    }

    const created = await createDocument({
      equipment_id: equipmentId,
      filename,
      document_type: documentType,
      extracted_text: extractedText,
    });

    return NextResponse.json({
      document: created,
      message: 'Document uploaded and text extracted for AI memory indexing.',
    });
  } catch (error: any) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Document upload failed', details: error.message },
      { status: 500 }
    );
  }
}
