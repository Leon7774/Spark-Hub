-- Create admin_keys table
create table if not exists public.admin_keys (
    id uuid default gen_random_uuid() primary key,
    key text not null unique,
    is_valid boolean default true,
    created_at timestamp with time zone default now(),
    created_by uuid references auth.users(id),
    expires_at timestamp with time zone
);

-- Create staff table if it doesn't exist
create table if not exists public.staff (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) unique not null,
    first_name text not null,
    last_name text not null,
    email text not null unique,
    contact_number text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Set up RLS (Row Level Security)
alter table public.admin_keys enable row level security;
alter table public.staff enable row level security;

-- Policies for admin_keys
create policy "Admin keys are viewable by authenticated users with admin role" 
    on public.admin_keys for select 
    using (auth.jwt() ->> 'role' = 'admin');

create policy "Admin keys are insertable by authenticated users with admin role" 
    on public.admin_keys for insert 
    with check (auth.jwt() ->> 'role' = 'admin');

-- Policies for staff
create policy "Staff records are viewable by authenticated users" 
    on public.staff for select 
    using (auth.role() = 'authenticated');

create policy "Staff can update their own record" 
    on public.staff for update 
    using (auth.uid() = user_id);

-- Function to handle staff registration
create or replace function handle_new_user()
returns trigger as $$
begin
  if new.raw_user_meta_data->>'role' = 'staff' then
    insert into public.staff (
      user_id,
      first_name,
      last_name,
      email,
      contact_number
    ) values (
      new.id,
      new.raw_user_meta_data->>'first_name',
      new.raw_user_meta_data->>'last_name',
      new.email,
      new.raw_user_meta_data->>'contact_number'
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user(); 