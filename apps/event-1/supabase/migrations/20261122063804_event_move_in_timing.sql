ALTER TABLE event_1.event_applications
    ADD COLUMN move_in_year smallint,
    ADD COLUMN move_in_month smallint,
    ADD COLUMN move_in_period text,
    ADD CONSTRAINT event_applications_move_in_timing_check CHECK (
        (move_in_year IS NULL AND move_in_month IS NULL AND move_in_period IS NULL)
        OR (
            move_in_year IS NOT NULL AND move_in_month IS NOT NULL AND move_in_period IS NOT NULL
            AND move_in_year BETWEEN 2000 AND 2100
            AND move_in_month BETWEEN 1 AND 12
            AND move_in_period IN ('early', 'mid', 'late')
        )
    );

COMMENT ON COLUMN event_1.event_applications.move_in_year IS 'Desired move-in year; NULL for legacy applications';
COMMENT ON COLUMN event_1.event_applications.move_in_month IS 'Desired move-in month (1-12)';
COMMENT ON COLUMN event_1.event_applications.move_in_period IS 'early: 초, mid: 중순, late: 말; not an exact day';
