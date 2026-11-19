CREATE SCHEMA event_1;
COMMENT ON SCHEMA event_1 IS 'HomeTogether event_1 intake';
REVOKE ALL ON SCHEMA event_1 FROM PUBLIC;

-- Local databases from the initial API stage retain their existing submissions.
DO $$
BEGIN
    IF current_setting('event1.app_role', true) IS NOT NULL THEN
        IF to_regclass('public.event_applications') IS NOT NULL THEN
            ALTER TABLE public.event_applications SET SCHEMA event_1;
        END IF;
        IF to_regclass('public.event_alimtalk_jobs') IS NOT NULL THEN
            ALTER TABLE public.event_alimtalk_jobs SET SCHEMA event_1;
        END IF;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS event_1.event_applications (
    id uuid PRIMARY KEY,
    submission_key uuid NOT NULL UNIQUE,
    request_fingerprint text NOT NULL CHECK (length(request_fingerprint) = 64),
    university_campus text NOT NULL CHECK (length(university_campus) BETWEEN 1 AND 120),
    phone text NOT NULL CHECK (phone ~ '^[0-9]{10,11}$'),
    email text NOT NULL CHECK (length(email) BETWEEN 1 AND 254),
    consent_version text NOT NULL CHECK (length(consent_version) BETWEEN 1 AND 80),
    consented_at timestamptz NOT NULL DEFAULT now(),
    source text CHECK (length(source) BETWEEN 1 AND 80),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_1.event_alimtalk_jobs (
    id uuid PRIMARY KEY,
    application_id uuid NOT NULL UNIQUE REFERENCES event_1.event_applications(id),
    kind text NOT NULL CHECK (kind = 'APPLICATION_RECEIVED'),
    status text NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'PROCESSING', 'SUBMITTED', 'DELIVERED', 'FAILED')),
    attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
    available_at timestamptz NOT NULL DEFAULT now(),
    provider_request_id text,
    last_error_code text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS event_applications_created_at_idx
    ON event_1.event_applications (created_at DESC, id);
CREATE INDEX IF NOT EXISTS event_alimtalk_jobs_pending_idx
    ON event_1.event_alimtalk_jobs (available_at, id) WHERE status = 'PENDING';

REVOKE ALL ON ALL TABLES IN SCHEMA event_1 FROM PUBLIC;
ALTER TABLE event_1.event_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_1.event_alimtalk_jobs ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    app_role name := coalesce(nullif(current_setting('event1.app_role', true), ''), 'event1_app');
    api_role name;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = app_role) THEN
        EXECUTE format('CREATE ROLE %I NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION CONNECTION LIMIT 5', app_role);
        EXECUTE format('COMMENT ON ROLE %I IS %L', app_role, 'hometogether:event_1:app');
    END IF;
    EXECUTE format('GRANT USAGE ON SCHEMA event_1 TO %I', app_role);
    EXECUTE format('GRANT SELECT, INSERT ON event_1.event_applications, event_1.event_alimtalk_jobs TO %I', app_role);
    EXECUTE format('CREATE POLICY event1_app_access ON event_1.event_applications FOR ALL TO %I USING (true) WITH CHECK (true)', app_role);
    EXECUTE format('CREATE POLICY event1_app_access ON event_1.event_alimtalk_jobs FOR ALL TO %I USING (true) WITH CHECK (true)', app_role);

    FOREACH api_role IN ARRAY ARRAY['anon', 'authenticated', 'service_role']::name[] LOOP
        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role) THEN
            EXECUTE format('REVOKE ALL ON SCHEMA event_1 FROM %I', api_role);
            EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA event_1 FROM %I', api_role);
        END IF;
    END LOOP;
END $$;
