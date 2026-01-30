-- Enable pg_cron extension (if not already enabled)
-- Run this in the Supabase SQL Editor

-- Create the cron job to send reminder emails daily at 8 AM UTC
SELECT cron.schedule(
  'send-daily-reminders',
  '0 8 * * *',  -- Every day at 8:00 AM UTC
  $$
  SELECT net.http_post(
    url := 'https://ywvmmxesrdlzygdiatcp.supabase.co/functions/v1/send-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To unschedule:
-- SELECT cron.unschedule('send-daily-reminders');
