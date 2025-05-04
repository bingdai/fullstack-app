const { query } = require('../config');

(async () => {
  try {
    const result = await query(`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'bible' AND table_name = 'chapters'
      ORDER BY ordinal_position
    `);
    console.log('bible.chapters columns:', result.rows.map(r => r.column_name));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
})();
