-- Optional seed data. Run after schema.sql.
-- Create services
insert into public.services (name, description, duration_minutes, price) values
  ('General Checkup', 'Routine health assessment and preventive care', 30, 50),
  ('Consultation', 'One-on-one consultation with your doctor', 20, 75),
  ('Follow-up', 'Follow-up visit to track progress', 15, 40)
on conflict do nothing;

-- Note: To add doctors you need to create auth users first, then profiles, then doctors and doctor_schedules.
-- Example (replace UUIDs with real profile IDs from your auth.users / profiles):
-- insert into public.doctors (profile_id, specialty, bio) values
--   ('<profile-uuid>', 'General Practice', 'Experienced in family medicine.');
-- insert into public.doctor_schedules (doctor_id, day_of_week, start_time, end_time) values
--   ('<doctor-uuid>', 1, '09:00:00', '17:00:00'),
--   ('<doctor-uuid>', 2, '09:00:00', '17:00:00');
