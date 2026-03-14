-- Doctor applications (pending approval) and doctor location for nearby search
-- Run in your Postgres SQL editor after postgres-schema.sql
-- Important: run as normal Execute/Run, NOT with "Explain" or "Analyze" (EXPLAIN does not support ALTER TABLE).

-- Allow role 'doctor_pending' for applicants waiting for approval
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('patient', 'admin', 'doctor', 'doctor_pending'));

-- Doctor applications: documents and approval workflow
CREATE TABLE IF NOT EXISTS doctor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL,
  specialty text NOT NULL,
  document_urls text[] DEFAULT '{}',
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_doctor_applications_status ON doctor_applications(status);

-- Doctor location for nearby search (latitude, longitude)
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS latitude decimal(10, 8);
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS longitude decimal(11, 8);

COMMENT ON COLUMN doctors.latitude IS 'Clinic/practice latitude for nearby search';
COMMENT ON COLUMN doctors.longitude IS 'Clinic/practice longitude for nearby search';
