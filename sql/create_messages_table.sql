-- Create messages table to store user messages
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  message text not null,
  created_at timestamptz default now(),
  status text default 'unread' -- can be: unread, read, archived
);

-- Create index for faster queries
create index if not exists idx_messages_created_at on public.messages(created_at desc);
create index if not exists idx_messages_status on public.messages(status);

-- Enable Row Level Security (optional - uncomment if needed)
-- ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert messages (for contact form)
-- CREATE POLICY "Anyone can insert messages" ON public.messages 
--   FOR INSERT WITH CHECK (true);

-- Only authenticated users can read messages (for admin)
-- CREATE POLICY "Authenticated users can read messages" ON public.messages 
--   FOR SELECT USING (auth.role() = 'authenticated');

-- Only authenticated users can update messages (for admin marking as read)
-- CREATE POLICY "Authenticated users can update messages" ON public.messages 
--   FOR UPDATE USING (auth.role() = 'authenticated');
