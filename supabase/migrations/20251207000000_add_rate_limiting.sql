-- Create a table to store rate limit counters
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key text PRIMARY KEY,
    points int DEFAULT 0,
    window_start timestamp with time zone DEFAULT now()
);

-- Enable RLS (though only accessible via RPC/Service Role ideally)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create function to check and update rate limit
-- Implements a fixed window counter
CREATE OR REPLACE FUNCTION public.check_rate_limit(
    rate_key text,
    max_points int DEFAULT 100,
    window_duration_seconds int DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_count int;
    window_start_time timestamp with time zone;
    is_allowed boolean;
BEGIN
    -- cleanup old entries occasionally (could be a separate cron, but doing lazy cleanup here for simplicity on 'key' collision)
    -- effectively we just care about the specific key row
    
    INSERT INTO public.rate_limits (key, points, window_start)
    VALUES (rate_key, 1, now())
    ON CONFLICT (key)
    DO UPDATE SET
        points = CASE
            WHEN (now() - rate_limits.window_start) > (window_duration_seconds || ' seconds')::interval THEN 1
            ELSE rate_limits.points + 1
        END,
        window_start = CASE
            WHEN (now() - rate_limits.window_start) > (window_duration_seconds || ' seconds')::interval THEN now()
            ELSE rate_limits.window_start
        END
    RETURNING points INTO current_count;

    -- Check if within limit
    IF current_count <= max_points THEN
        is_allowed := true;
    ELSE
        is_allowed := false;
    END IF;

    RETURN is_allowed;
END;
$$;
