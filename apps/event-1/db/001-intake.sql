CREATE TABLE event_applications (
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

CREATE TABLE event_alimtalk_jobs (
    id uuid PRIMARY KEY,
    application_id uuid NOT NULL UNIQUE REFERENCES event_applications(id),
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

CREATE INDEX event_applications_created_at_idx ON event_applications (created_at DESC, id);
CREATE INDEX event_alimtalk_jobs_pending_idx ON event_alimtalk_jobs (available_at, id)
    WHERE status = 'PENDING';
