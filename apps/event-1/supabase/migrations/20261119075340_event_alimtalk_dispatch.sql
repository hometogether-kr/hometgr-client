ALTER TABLE event_1.event_alimtalk_jobs
    ADD COLUMN lease_token uuid,
    ADD COLUMN provider_recipient_seq integer CHECK (provider_recipient_seq >= 0);

CREATE INDEX event_alimtalk_jobs_processing_idx
    ON event_1.event_alimtalk_jobs (updated_at) WHERE status = 'PROCESSING';

DO $$
DECLARE
    app_role name := coalesce(nullif(current_setting('event1.app_role', true), ''), 'event1_app');
BEGIN
    -- The event role may advance delivery jobs, but cannot edit contact details or delete rows.
    EXECUTE format('GRANT UPDATE (status, attempts, available_at, provider_request_id,
        provider_recipient_seq, last_error_code, lease_token, updated_at)
        ON event_1.event_alimtalk_jobs TO %I', app_role);
END $$;
