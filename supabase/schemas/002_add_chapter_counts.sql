-- Add chapter counts for all books

-- Old Testament
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 50) FROM bible.books b WHERE b.short = 'Gen';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 40) FROM bible.books b WHERE b.short = 'Exod';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 27) FROM bible.books b WHERE b.short = 'Lev';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 36) FROM bible.books b WHERE b.short = 'Num';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 34) FROM bible.books b WHERE b.short = 'Deut';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 24) FROM bible.books b WHERE b.short = 'Josh';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 21) FROM bible.books b WHERE b.short = 'Judg';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 4) FROM bible.books b WHERE b.short = 'Ruth';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 31) FROM bible.books b WHERE b.short = '1Sam';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 24) FROM bible.books b WHERE b.short = '2Sam';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 22) FROM bible.books b WHERE b.short = '1Kgs';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 25) FROM bible.books b WHERE b.short = '2Kgs';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 29) FROM bible.books b WHERE b.short = '1Chr';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 36) FROM bible.books b WHERE b.short = '2Chr';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 10) FROM bible.books b WHERE b.short = 'Ezra';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 13) FROM bible.books b WHERE b.short = 'Neh';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 10) FROM bible.books b WHERE b.short = 'Esth';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 42) FROM bible.books b WHERE b.short = 'Job';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 150) FROM bible.books b WHERE b.short = 'Ps';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 31) FROM bible.books b WHERE b.short = 'Prov';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 12) FROM bible.books b WHERE b.short = 'Eccl';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 8) FROM bible.books b WHERE b.short = 'Song';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 66) FROM bible.books b WHERE b.short = 'Isa';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 52) FROM bible.books b WHERE b.short = 'Jer';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 5) FROM bible.books b WHERE b.short = 'Lam';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 48) FROM bible.books b WHERE b.short = 'Ezek';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 12) FROM bible.books b WHERE b.short = 'Dan';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 14) FROM bible.books b WHERE b.short = 'Hos';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 3) FROM bible.books b WHERE b.short = 'Joel';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 9) FROM bible.books b WHERE b.short = 'Amos';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 1) FROM bible.books b WHERE b.short = 'Obad';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 4) FROM bible.books b WHERE b.short = 'Jonah';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 7) FROM bible.books b WHERE b.short = 'Micah';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 3) FROM bible.books b WHERE b.short = 'Nah';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 3) FROM bible.books b WHERE b.short = 'Hab';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 3) FROM bible.books b WHERE b.short = 'Zeph';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 2) FROM bible.books b WHERE b.short = 'Hag';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 14) FROM bible.books b WHERE b.short = 'Zech';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 4) FROM bible.books b WHERE b.short = 'Mal';

-- New Testament
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 28) FROM bible.books b WHERE b.short = 'Matt';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 16) FROM bible.books b WHERE b.short = 'Mark';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 24) FROM bible.books b WHERE b.short = 'Luke';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 21) FROM bible.books b WHERE b.short = 'John';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 28) FROM bible.books b WHERE b.short = 'Acts';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 16) FROM bible.books b WHERE b.short = 'Rom';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 16) FROM bible.books b WHERE b.short = '1Cor';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 13) FROM bible.books b WHERE b.short = '2Cor';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 6) FROM bible.books b WHERE b.short = 'Gal';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 6) FROM bible.books b WHERE b.short = 'Eph';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 4) FROM bible.books b WHERE b.short = 'Phil';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 4) FROM bible.books b WHERE b.short = 'Col';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 5) FROM bible.books b WHERE b.short = '1Thess';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 3) FROM bible.books b WHERE b.short = '2Thess';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 6) FROM bible.books b WHERE b.short = '1Tim';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 4) FROM bible.books b WHERE b.short = '2Tim';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 3) FROM bible.books b WHERE b.short = 'Titus';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 1) FROM bible.books b WHERE b.short = 'Phlm';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 13) FROM bible.books b WHERE b.short = 'Heb';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 5) FROM bible.books b WHERE b.short = 'Jas';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 5) FROM bible.books b WHERE b.short = '1Pet';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 3) FROM bible.books b WHERE b.short = '2Pet';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 5) FROM bible.books b WHERE b.short = '1John';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 1) FROM bible.books b WHERE b.short = '2John';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 1) FROM bible.books b WHERE b.short = '3John';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 1) FROM bible.books b WHERE b.short = 'Jude';
INSERT INTO bible.chapters (book_id, number)
SELECT b.id, generate_series(1, 22) FROM bible.books b WHERE b.short = 'Rev';
