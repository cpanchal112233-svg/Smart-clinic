-- Run this once in Neon SQL Editor to allow "book without account" (guest booking).
-- Makes patient_id optional and adds guest_name, guest_email, guest_phone.

ALTER TABLE appointments ALTER COLUMN patient_id DROP NOT NULL;

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS guest_name text;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS guest_email text;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS guest_phone text;

-- Ensure either logged-in patient OR guest details are provided
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'appointments_guest_or_patient'
  ) THEN
    ALTER TABLE appointments ADD CONSTRAINT appointments_guest_or_patient
      CHECK (
        (patient_id IS NOT NULL) OR
        (guest_name IS NOT NULL AND guest_email IS NOT NULL)
      );
  END IF;
END $$;
