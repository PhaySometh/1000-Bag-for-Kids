-- Create campaign table and seed default row
create table if not exists public.campaign (
  id text primary key,
  title text,
  subtitle text,
  current_bags integer default 0,
  goal integer default 5000,
  donation_items jsonb,
  location_url text,
  qr_url text,
  school_name text,
  last_updated timestamptz
);

-- seed the default row if not present
insert into public.campaign (id, title, subtitle, current_bags, goal, donation_items, location_url, qr_url, school_name, last_updated)
values (
  'default',
  'មូលនិធិ៥ពាន់កាបូបនៃស្នាមញញឹម',
  'សម្រាប់ក្មេងៗភៀសសឹក',
  0,
  5000,
  '["អាវរងារ និង សំលៀកបំពាក់ផ្សេងៗ", "ភេសជ្ជៈនំចំណី", "សៀវភៅសម្រាប់អាន", "សម្ភារៈសម្រាប់សរសេរ និងគូរ", "សម្ភារៈក្មេងលេង"]',
  'https://maps.google.com/?q=phnom+penh',
  '',
  'School of Hope',
  now()
)
on conflict (id) do nothing;

-- Optional: Allow public select (if you want client-side reads without auth)
-- ALTER TABLE public.campaign ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public read" ON public.campaign FOR SELECT USING (true);
-- Run this SQL in Supabase SQL Editor to create the campaign table
create table if not exists campaign (
  id text primary key,
  title text,
  subtitle text,
  current_bags integer default 0,
  goal integer default 5000,
  donation_items jsonb,
  location_url text,
  qr_url text,
  school_name text,
  last_updated timestamptz
);

insert into campaign (id, title, subtitle, current_bags, goal, donation_items, last_updated)
values ('default', 'មូលនិធិ៥ពាន់កាបូបនៃស្នាមញញឹម', 'សម្រាប់ក្មេងៗភៀសសឹក', 0, 5000, '[]', now())
on conflict (id) do nothing;
