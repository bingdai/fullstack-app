const { query } = require('../config');

(async () => {
  try {
    // Get the book ID for James
    const bookResult = await query('SELECT id FROM bible.books WHERE short = $1', ['Jas']);
    const bookId = bookResult.rows[0]?.id;
    if (!bookId) {
      console.error('James not found');
      process.exit(1);
    }
    // Get chapters for James
    const chaptersResult = await query('SELECT * FROM bible.chapters WHERE book_id = $1 ORDER BY number', [bookId]);
    console.log('Chapters:', chaptersResult.rows);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
})();
