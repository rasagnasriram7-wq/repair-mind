-- ====================================================================
-- REPAIR-MIND Database Schema Migration
-- AI-Powered Field Technician Memory Agent for Recurring Equipment Failures
-- ====================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Profiles table linked to Supabase auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'technician' CHECK (role IN ('technician', 'manager', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Equipment table
CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  location TEXT NOT NULL,
  installation_date DATE,
  status TEXT NOT NULL DEFAULT 'Operational' CHECK (status IN ('Operational', 'Needs Inspection', 'Fault Reported', 'Under Repair', 'Critical')),
  description TEXT,
  recurring_fault BOOLEAN NOT NULL DEFAULT FALSE,
  memory_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Maintenance Cases table
CREATE TABLE IF NOT EXISTS public.maintenance_cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  technician_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  failure_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  symptoms TEXT NOT NULL,
  observations TEXT,
  diagnosis TEXT NOT NULL,
  root_cause TEXT,
  diagnostic_procedure TEXT,
  repair_action TEXT NOT NULL,
  components_replaced TEXT,
  outcome TEXT NOT NULL,
  downtime_hours NUMERIC(6, 2) DEFAULT 0,
  technician_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Documents table (manuals, service bulletins, inspection reports)
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID REFERENCES public.equipment(id) ON DELETE SET NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  document_type TEXT NOT NULL,
  extracted_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Maintenance Embeddings table (pgvector 768-dim for Gemini text-embedding-004)
CREATE TABLE IF NOT EXISTS public.maintenance_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES public.maintenance_cases(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(768),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Hindsight Memories table (Automated learning reflections)
CREATE TABLE IF NOT EXISTS public.hindsight_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.maintenance_cases(id) ON DELETE SET NULL,
  reported_symptom TEXT NOT NULL,
  initial_suspected_cause TEXT,
  actual_root_cause TEXT NOT NULL,
  repair_action TEXT NOT NULL,
  parts_replaced TEXT,
  hindsight_reflection TEXT NOT NULL,
  technician_name TEXT DEFAULT 'Field Technician',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Indices for high performance
CREATE INDEX IF NOT EXISTS idx_equipment_code ON public.equipment(equipment_code);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON public.equipment(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_equipment_id ON public.maintenance_cases(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_failure_date ON public.maintenance_cases(failure_date DESC);
CREATE INDEX IF NOT EXISTS idx_hindsight_equipment_id ON public.hindsight_memories(equipment_id);

-- IVFFlat or HNSW index for vector similarity search
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    CREATE INDEX IF NOT EXISTS idx_maintenance_embeddings_vector 
    ON public.maintenance_embeddings 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Vector index could not be created or already exists.';
END $$;

-- 9. Semantic search RPC function
CREATE OR REPLACE FUNCTION public.match_maintenance_cases(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  filter_equipment_id uuid DEFAULT NULL
)
RETURNS TABLE (
  case_id uuid,
  similarity float,
  content text,
  equipment_code text,
  equipment_name text,
  symptoms text,
  diagnosis text,
  root_cause text,
  repair_action text,
  components_replaced text,
  outcome text,
  failure_date timestamp with time zone
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    me.case_id,
    1 - (me.embedding <=> query_embedding) AS similarity,
    me.content,
    e.equipment_code,
    e.name AS equipment_name,
    mc.symptoms,
    mc.diagnosis,
    mc.root_cause,
    mc.repair_action,
    mc.components_replaced,
    mc.outcome,
    mc.failure_date
  FROM public.maintenance_embeddings me
  JOIN public.maintenance_cases mc ON me.case_id = mc.id
  JOIN public.equipment e ON mc.equipment_id = e.id
  WHERE (1 - (me.embedding <=> query_embedding)) > match_threshold
    AND (filter_equipment_id IS NULL OR mc.equipment_id = filter_equipment_id)
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

-- 10. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hindsight_memories ENABLE ROW LEVEL SECURITY;

-- Read policies for authenticated users
CREATE POLICY "Allow authenticated read on profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow user update self profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Allow authenticated read on equipment" ON public.equipment FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on equipment" ON public.equipment FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on equipment" ON public.equipment FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete on equipment" ON public.equipment FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on maintenance_cases" ON public.maintenance_cases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on maintenance_cases" ON public.maintenance_cases FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update on maintenance_cases" ON public.maintenance_cases FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read on documents" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on documents" ON public.documents FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read on maintenance_embeddings" ON public.maintenance_embeddings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on maintenance_embeddings" ON public.maintenance_embeddings FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated read on hindsight_memories" ON public.hindsight_memories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on hindsight_memories" ON public.hindsight_memories FOR INSERT TO authenticated WITH CHECK (true);
