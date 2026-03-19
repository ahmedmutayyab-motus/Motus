-- Phase 2 Complete Minimal Schema for Motus

-- Workspaces
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace Members
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
);

-- Contacts
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    title TEXT,
    website TEXT,
    linkedin_url TEXT,
    industry TEXT,
    location TEXT,
    stage TEXT DEFAULT 'Cold',
    score INTEGER DEFAULT 0,
    tags TEXT[],
    notes_summary TEXT,
    source TEXT DEFAULT 'Manual',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraint: either email or full_name+company is often needed
    CONSTRAINT contacts_workspace_email_key UNIQUE NULLS NOT DISTINCTION (workspace_id, email)
);

-- AI Generations
CREATE TABLE IF NOT EXISTS public.ai_generations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
    generation_type TEXT NOT NULL,
    prompt_summary TEXT,
    output_text TEXT NOT NULL,
    model_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage Events
CREATE TABLE IF NOT EXISTS public.usage_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    event_type TEXT NOT NULL,
    units INTEGER DEFAULT 1,
    metadata_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sequences Phase 4
CREATE TABLE IF NOT EXISTS public.sequences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'draft', 
    created_by UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sequence_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sequence_id UUID REFERENCES public.sequences(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_type TEXT NOT NULL, 
    delay_days INTEGER DEFAULT 1,
    subject_template TEXT,
    body_template TEXT,
    task_title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sequence_enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    sequence_id UUID REFERENCES public.sequences(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'active', 
    current_step INTEGER DEFAULT 1,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (sequence_id, contact_id)
);

-- Stub RLS execution (to be enabled manually in UI or via triggers)
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

-- Note: Policies generally expect auth.uid() bounded logic
-- e.g. CREATE POLICY "Users can access their workspace contacts" ON public.contacts...
