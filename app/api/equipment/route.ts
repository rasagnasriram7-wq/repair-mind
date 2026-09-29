import { NextRequest, NextResponse } from 'next/server';
import { getEquipmentList, createEquipment } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase();
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    let list = await getEquipmentList();

    if (search) {
      list = list.filter(
        (e) =>
          e.equipment_code.toLowerCase().includes(search) ||
          e.name.toLowerCase().includes(search) ||
          e.location.toLowerCase().includes(search) ||
          (e.description && e.description.toLowerCase().includes(search))
      );
    }

    if (type && type !== 'all') {
      list = list.filter((e) => e.equipment_type.toLowerCase() === type.toLowerCase());
    }

    if (status && status !== 'all') {
      list = list.filter((e) => e.status.toLowerCase() === status.toLowerCase());
    }

    return NextResponse.json({ equipment: list });
  } catch (error: any) {
    console.error('Error fetching equipment:', error);
    return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { equipment_code, name, equipment_type, manufacturer, model, location, status, description, installation_date } = body;

    // Validation
    if (!equipment_code || !equipment_code.trim()) {
      return NextResponse.json({ error: 'Equipment code is required (e.g., P-204).' }, { status: 400 });
    }
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Equipment name is required.' }, { status: 400 });
    }
    if (!equipment_type || !equipment_type.trim()) {
      return NextResponse.json({ error: 'Equipment type is required (e.g., Centrifugal Pump).' }, { status: 400 });
    }

    const created = await createEquipment({
      equipment_code: equipment_code.trim(),
      name: name.trim(),
      equipment_type: equipment_type.trim(),
      manufacturer: manufacturer?.trim() || 'General Machinery',
      model: model?.trim() || 'Standard Model',
      location: location?.trim() || 'Plant Facility',
      status: status || 'Operational',
      description: description?.trim() || '',
      installation_date: installation_date || new Date().toISOString().split('T')[0],
      recurring_fault: false,
    });

    return NextResponse.json({ equipment: created }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating equipment:', error);
    return NextResponse.json({ error: 'Failed to create equipment', details: error.message }, { status: 500 });
  }
}
