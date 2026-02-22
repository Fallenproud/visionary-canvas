-- Add missing UPDATE policies for conversations and project_snapshots

-- Conversations: allow users to update their own conversations (title, mode)
CREATE POLICY "Users can update own conversations"
ON public.conversations FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

-- Project snapshots: allow users to update their own snapshots (label)
CREATE POLICY "Users can update own project snapshots"
ON public.project_snapshots FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM projects p WHERE p.id = project_snapshots.project_id AND p.user_id = auth.uid()));