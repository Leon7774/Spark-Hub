-- Create action_logs table
CREATE TABLE IF NOT EXISTS action_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    action_type TEXT NOT NULL,
    description TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE
);

-- Create index on user_id and created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_action_logs_user_id ON action_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_action_logs_created_at ON action_logs(created_at);

-- Enable RLS
ALTER TABLE action_logs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own logs
CREATE POLICY "Users can read their own logs"
    ON action_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow service role to insert logs
CREATE POLICY "Service role can insert logs"
    ON action_logs
    FOR INSERT
    WITH CHECK (true);

-- Create policy to allow service role to read all logs
CREATE POLICY "Service role can read all logs"
    ON action_logs
    FOR SELECT
    USING (true); 