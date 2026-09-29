import { NextResponse } from 'next/server';
import { resetToSeedData } from '@/lib/db/store';
import { isSupabaseServerConfigured } from '@/lib/supabase/server';
import { isGeminiConfigured } from '@/lib/ai/gemini';

export async function POST() {
  const result = resetToSeedData();
  return NextResponse.json({
    message: 'REPAIR-MIND database memory reset and seeded with standard industrial demo assets.',
    count: result.count,
    success: result.success,
  });
}

export async function GET() {
  return NextResponse.json({
    supabaseConfigured: isSupabaseServerConfigured(),
    geminiConfigured: isGeminiConfigured(),
    geminiModel: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    timestamp: new Date().toISOString(),
  });
}
