-- Ensure the bible schema and tables exist
DO $$
BEGIN
    -- Create schema if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'bible') THEN
        CREATE SCHEMA bible;
        
        -- 1. books
        CREATE TABLE bible.books (
            id           SERIAL PRIMARY KEY,
            testament    VARCHAR(8) NOT NULL,
            name         TEXT NOT NULL,
            short        TEXT NOT NULL,
            sort_order   SMALLINT NOT NULL,
            UNIQUE(testament, sort_order)
        );


        -- 2. chapters
        CREATE TABLE bible.chapters (
            id           SERIAL PRIMARY KEY,
            book_id      INTEGER NOT NULL REFERENCES bible.books(id) ON DELETE CASCADE,
            number       SMALLINT NOT NULL,
            verse_count  SMALLINT,
            UNIQUE(book_id, number)
        );


        -- 3. verses
        CREATE TABLE bible.verses (
            id           SERIAL PRIMARY KEY,
            chapter_id   INTEGER NOT NULL REFERENCES bible.chapters(id) ON DELETE CASCADE,
            number       SMALLINT NOT NULL,
            UNIQUE(chapter_id, number)
        );


        -- 4. translations
        CREATE TABLE bible.translations (
            id            SERIAL PRIMARY KEY,
            code          TEXT NOT NULL UNIQUE,
            name          TEXT NOT NULL,
            language      TEXT NOT NULL,
            license       TEXT,
            source_url    TEXT
        );


        -- 5. verse_translations
        CREATE TABLE bible.verse_translations (
            verse_id        INTEGER NOT NULL REFERENCES bible.verses(id) ON DELETE CASCADE,
            translation_id  INTEGER NOT NULL REFERENCES bible.translations(id) ON DELETE CASCADE,
            text            TEXT NOT NULL,
            PRIMARY KEY(verse_id, translation_id)
        );

        -- Add some sample data for testing
        INSERT INTO bible.books (testament, name, short, sort_order) VALUES
            ('NT', 'James', 'Jas', 59);

        INSERT INTO bible.chapters (book_id, number, verse_count) VALUES
            ((SELECT id FROM bible.books WHERE short = 'Jas'), 1, 27),
            ((SELECT id FROM bible.books WHERE short = 'Jas'), 2, 26),
            ((SELECT id FROM bible.books WHERE short = 'Jas'), 3, 18),
            ((SELECT id FROM bible.books WHERE short = 'Jas'), 4, 17),
            ((SELECT id FROM bible.books WHERE short = 'Jas'), 5, 20);

        RAISE NOTICE 'Bible schema and tables created successfully';
    ELSE
        RAISE NOTICE 'Bible schema already exists';
    END IF;
EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'Error creating bible schema: %', SQLERRM;
END
$$;
