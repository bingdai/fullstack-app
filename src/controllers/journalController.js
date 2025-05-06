// src/controllers/journalController.js
// Business logic for journal routes

const journalModel = require('../models/journal');
const { BOOK_ALIASES } = require('../db');
const { normalizeBookName, VERSE_TAG_REGEX } = require('../utils/verseUtils');

/**
 * Process verse tags from content or explicit tags
 * @param {number} entryId - The journal entry ID
 * @param {string} content - The journal content
 * @param {Array} verseTags - Optional explicit verse tags
 */
async function processVerseTags(entryId, content, verseTags) {
  // If verseTags are provided directly, use them
  if (Array.isArray(verseTags) && verseTags.length > 0) {
    for (const tag of verseTags) {
      try {
        const verseData = await journalModel.findVerseByReference(
          normalizeBookName(tag.book, BOOK_ALIASES),
          tag.chapter,
          tag.verse
        );
        if (verseData && verseData.id) {
          await journalModel.createVerseTag(
            entryId,
            verseData.id,
            tag.startOffset,
            tag.endOffset
          );
          // If it's a verse range, add the other verses too
          if (tag.endVerse && tag.endVerse > tag.verse) {
            for (let v = tag.verse + 1; v <= tag.endVerse; v++) {
              const rangeVerseData = await journalModel.findVerseByReference(
                normalizeBookName(tag.book, BOOK_ALIASES),
                tag.chapter,
                v
              );
              if (rangeVerseData && rangeVerseData.id) {
                await journalModel.createVerseTag(
                  entryId,
                  rangeVerseData.id,
                  tag.startOffset,
                  tag.endOffset
                );
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing verse tag:', error);
      }
    }
    return;
  }
  // Otherwise, extract tags from content
  let match;
  while ((match = VERSE_TAG_REGEX.exec(content)) !== null) {
    try {
      const [fullMatch, bookRaw, chapterStr, startVerseStr, endVerseStr] = match;
      const normalizedBook = normalizeBookName(bookRaw, BOOK_ALIASES);
      const chapter = parseInt(chapterStr);
      const startVerse = parseInt(startVerseStr);
      const endVerse = endVerseStr ? parseInt(endVerseStr) : null;
      const verseData = await journalModel.findVerseByReference(
        normalizedBook,
        chapter,
        startVerse
      );
      if (verseData && verseData.id) {
        await journalModel.createVerseTag(
          entryId,
          verseData.id,
          match.index,
          match.index + fullMatch.length
        );
        // If it's a verse range, add the other verses too
        if (endVerse && endVerse > startVerse) {
          for (let v = startVerse + 1; v <= endVerse; v++) {
            const rangeVerseData = await journalModel.findVerseByReference(
              normalizedBook,
              chapter,
              v
            );
            if (rangeVerseData && rangeVerseData.id) {
              await journalModel.createVerseTag(
                entryId,
                rangeVerseData.id,
                match.index,
                match.index + fullMatch.length
              );
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing verse tag:', error);
    }
  }
}

// Controller functions for routes
module.exports = {
  /**
   * GET /api/journal
   * @param {Request} req
   * @param {Response} res
   */
  async getAllEntries(req, res) {
    try {
      const entries = await journalModel.getAllEntries();
      res.json(entries);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  },

  /**
   * GET /api/journal/:id
   * @param {Request} req
   * @param {Response} res
   */
  async getEntry(req, res) {
    try {
      const entry = await journalModel.getEntry(req.params.id);
      if (!entry) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }
      const verseTags = await journalModel.getEntryVerseTags(entry.id);
      res.json({ ...entry, verse_tags: verseTags });
    } catch (error) {
      console.error('Error fetching journal entry:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  },

  /**
   * POST /api/journal
   * @param {Request} req
   * @param {Response} res
   */
  async createEntry(req, res) {
    try {
      const { title, content, verse_tags } = req.body;
      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }
      const entry = await journalModel.createEntry(title, content);
      await processVerseTags(entry.id, content, verse_tags);
      const updatedEntry = await journalModel.getEntry(entry.id);
      const verseTags = await journalModel.getEntryVerseTags(entry.id);
      res.status(201).json({ ...updatedEntry, verse_tags: verseTags });
    } catch (error) {
      console.error('Error creating journal entry:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  },

  /**
   * PUT /api/journal/:id
   * @param {Request} req
   * @param {Response} res
   */
  async updateEntry(req, res) {
    try {
      const { title, content, verse_tags } = req.body;
      const entryId = req.params.id;
      if (!content) {
        return res.status(400).json({ error: 'Content is required' });
      }
      const entry = await journalModel.updateEntry(entryId, title, content);
      if (!entry) {
        return res.status(404).json({ error: 'Journal entry not found' });
      }
      // Remove and reprocess verse tags
      // (Assume a function exists to delete all tags for entryId, to be added if needed)
      await processVerseTags(entryId, content, verse_tags);
      const updatedEntry = await journalModel.getEntry(entryId);
      const verseTags = await journalModel.getEntryVerseTags(entryId);
      res.json({ ...updatedEntry, verse_tags: verseTags });
    } catch (error) {
      console.error('Error updating journal entry:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  },

  /**
   * DELETE /api/journal/:id
   * @param {Request} req
   * @param {Response} res
   */
  async deleteEntry(req, res) {
    try {
      await journalModel.deleteEntry(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting journal entry:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  },

  /**
   * POST /api/verses/find
   * @param {Request} req
   * @param {Response} res
   */
  async findVerseByReference(req, res) {
    try {
      const { book, chapter, verse } = req.body;
      if (!book || !chapter || !verse) {
        return res.status(400).json({ error: 'Book, chapter, and verse are required' });
      }
      const verseData = await journalModel.findVerseByReference(
        normalizeBookName(book, BOOK_ALIASES),
        chapter,
        verse
      );
      if (!verseData) {
        return res.status(404).json({ error: 'Verse not found' });
      }
      res.json(verseData);
    } catch (error) {
      console.error('Error finding verse:', error);
      res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  }
};
