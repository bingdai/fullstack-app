-- Seed World English Bible metadata and placeholders

-- 1. Translation
INSERT INTO bible.translations(code,name,language,license,source_url)
VALUES('WEB','World English Bible','English','Public Domain','https://bible-api.com')
ON CONFLICT (code) DO NOTHING;

-- 2. Books (Old Testament)
INSERT INTO bible.books(testament,name,short,sort_order) VALUES
('Old','Genesis','Gen',1),
('Old','Exodus','Exod',2),
('Old','Leviticus','Lev',3),
('Old','Numbers','Num',4),
('Old','Deuteronomy','Deut',5),
('Old','Joshua','Josh',6),
('Old','Judges','Judg',7),
('Old','Ruth','Ruth',8),
('Old','1 Samuel','1Sam',9),
('Old','2 Samuel','2Sam',10),
('Old','1 Kings','1Kgs',11),
('Old','2 Kings','2Kgs',12),
('Old','1 Chronicles','1Chr',13),
('Old','2 Chronicles','2Chr',14),
('Old','Ezra','Ezra',15),
('Old','Nehemiah','Neh',16),
('Old','Esther','Esth',17),
('Old','Job','Job',18),
('Old','Psalms','Ps',19),
('Old','Proverbs','Prov',20),
('Old','Ecclesiastes','Eccl',21),
('Old','Song of Solomon','Song',22),
('Old','Isaiah','Isa',23),
('Old','Jeremiah','Jer',24),
('Old','Lamentations','Lam',25),
('Old','Ezekiel','Ezek',26),
('Old','Daniel','Dan',27),
('Old','Hosea','Hos',28),
('Old','Joel','Joel',29),
('Old','Amos','Amos',30),
('Old','Obadiah','Obad',31),
('Old','Jonah','Jonah',32),
('Old','Micah','Micah',33),
('Old','Nahum','Nah',34),
('Old','Habakkuk','Hab',35),
('Old','Zephaniah','Zeph',36),
('Old','Haggai','Hag',37),
('Old','Zechariah','Zech',38),
('Old','Malachi','Mal',39)
ON CONFLICT DO NOTHING;

-- 3. Books (New Testament)
INSERT INTO bible.books(testament,name,short,sort_order) VALUES
('New','Matthew','Matt',1),
('New','Mark','Mark',2),
('New','Luke','Luke',3),
('New','John','John',4),
('New','Acts','Acts',5),
('New','Romans','Rom',6),
('New','1 Corinthians','1Cor',7),
('New','2 Corinthians','2Cor',8),
('New','Galatians','Gal',9),
('New','Ephesians','Eph',10),
('New','Philippians','Phil',11),
('New','Colossians','Col',12),
('New','1 Thessalonians','1Thess',13),
('New','2 Thessalonians','2Thess',14),
('New','1 Timothy','1Tim',15),
('New','2 Timothy','2Tim',16),
('New','Titus','Titus',17),
('New','Philemon','Phlm',18),
('New','Hebrews','Heb',19),
('New','James','Jas',20),
('New','1 Peter','1Pet',21),
('New','2 Peter','2Pet',22),
('New','1 John','1John',23),
('New','2 John','2John',24),
('New','3 John','3John',25),
('New','Jude','Jude',26),
('New','Revelation','Rev',27)
ON CONFLICT DO NOTHING;

-- 4. Chapters placeholders (example for Genesis); extend similarly for other books
INSERT INTO bible.chapters(book_id,number)
SELECT id, generate_series(1,50)
FROM bible.books WHERE short='Gen'
ON CONFLICT DO NOTHING;

-- Further chapter inserts should follow the same pattern for each book with known chapter counts
