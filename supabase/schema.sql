-- SmartClinic Supabase schema
-- Run this in Supabase SQL Editor after creating your project

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- profiles: all users (linked to auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role text not null check (role in ('patient', 'admin', 'doctor')) default 'patient',
  phone text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- services: clinic services
create table public.services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  duration_minutes int not null default 30,
  price decimal(10,2),
  is_active boolean default true,
  created_at timestamptz default now()
);

-- doctors: doctor info linked to profile
create table public.doctors (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid not null references public.profiles(id) on delete cascade unique,
  specialty text not null,
  bio text,
  is_available boolean default true,
  created_at timestamptz default now()
);

-- doctor_schedules: availability per day
create table public.doctor_schedules (
  id uuid primary key default uuid_generate_v4(),
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  day_of_week int not null check (day_of_week >= 0 and day_of_week <= 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz default now(),
  unique(doctor_id, day_of_week)
);

-- appointments
create table public.appointments (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid not null references public.doctors(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete restrict,
  appointment_date date not null,
  appointment_time time not null,
  status text not null check (status in ('booked', 'confirmed', 'checked_in', 'completed', 'cancelled')) default 'booked',
  notes text,
  created_at timestamptz default now()
);

-- queue_entries: same-day queue
create table public.queue_entries (
  id uuid primary key default uuid_generate_v4(),
  appointment_id uuid not null references public.appointments(id) on delete cascade unique,
  queue_number int not null,
  status text not null check (status in ('waiting', 'in_progress', 'completed')) default 'waiting',
  checked_in_at timestamptz,
  created_at timestamptz default now()
);

-- notifications
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  message text not null,
  type text default 'info',
  is_read boolean default false,
  created_at timestamptz default now()
);

-- RLS policies
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.doctors enable row level security;
alter table public.doctor_schedules enable row level security;
alter table public.appointments enable row level security;
alter table public.queue_entries enable row level security;
alter table public.notifications enable row level security;

-- profiles: users can read own, service role can do all
create policy "Users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Allow insert for new user" on public.profiles for insert with check (auth.uid() = id);

-- services: public read
create policy "Services are viewable by everyone" on public.services for select using (true);

-- doctors: public read
create policy "Doctors are viewable by everyone" on public.doctors for select using (true);
create policy "Admins can manage doctors" on public.doctors for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'doctor'))
);

-- doctor_schedules: public read
create policy "Schedules are viewable by everyone" on public.doctor_schedules for select using (true);
create policy "Admins can manage schedules" on public.doctor_schedules for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'doctor'))
);

-- appointments: patients own, admin/doctor all
create policy "Patients can read own appointments" on public.appointments for select using (patient_id = auth.uid());
create policy "Patients can insert own appointments" on public.appointments for insert with check (patient_id = auth.uid());
create policy "Patients can update own (cancel)" on public.appointments for update using (patient_id = auth.uid());
create policy "Admin and doctors can manage all appointments" on public.appointments for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'doctor'))
);

-- queue_entries: admin/doctor
create policy "Queue viewable by admin and doctor" on public.queue_entries for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'doctor'))
);
create policy "Queue manageable by admin and doctor" on public.queue_entries for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'doctor'))
);

-- notifications: own only
create policy "Users read own notifications" on public.notifications for select using (user_id = auth.uid());
create policy "Users update own notifications" on public.notifications for update using (user_id = auth.uid());
create policy "Users can create notifications for themselves" on public.notifications for insert with check (auth.uid() = user_id);

-- Trigger: create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed data (optional - run after schema)
-- insert into public.services (name, description, duration_minutes, price) values
-- ('General Checkup', 'Routine health checkup', 30, 50),
-- ('Consultation', 'Doctor consultation', 20, 75);
