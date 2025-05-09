-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS app;

-- Create learning_snippets table
CREATE TABLE IF NOT EXISTS app.learning_snippets (
    id            SERIAL PRIMARY KEY,
    content       TEXT NOT NULL,
    source_lang   TEXT,
    target_lang   TEXT,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    tags          TEXT[],
    translation   TEXT,
    word_count    INTEGER GENERATED ALWAYS AS (array_length(string_to_array(content, ' '), 1)) STORED
);

-- Create an index for faster searching and sorting
CREATE INDEX IF NOT EXISTS idx_learning_snippets_created_at 
ON app.learning_snippets(created_at);

-- Create an index for language-based searches
CREATE INDEX IF NOT EXISTS idx_learning_snippets_languages 
ON app.learning_snippets(source_lang, target_lang);
