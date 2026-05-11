ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER TABLE public.projects REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;