import { NextRequest, NextResponse } from 'next/server';
import { getEquipmentById, updateEquipment, deleteEquipment } from '@/lib/db/store';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const equipment = await getEquipmentById(params.id);
    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }
    return NextResponse.json({ equipment });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch equipment details' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const updated = await updateEquipment(params.id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }
    return NextResponse.json({ equipment: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update equipment' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteEquipment(params.id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete equipment' }, { status: 500 });
  }
}
