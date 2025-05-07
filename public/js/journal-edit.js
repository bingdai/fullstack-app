// Journal edit page script
// No dead code or unused imports after refactor

document.addEventListener('DOMContentLoaded', async () => {
    const journalForm = document.getElementById('journal-form');
    const titleInput = document.getElementById('title');
    const contentEditor = document.getElementById('content-editor');
    const pageTitle = document.getElementById('page-title');

    // (No need for HTML sanitization or paste handlers with textarea)

    // Guarantee clean content on every input (no HTML except verse tags)
    contentEditor.addEventListener('input', () => {
        // Auto-grow textarea
        contentEditor.style.height = 'auto';
        contentEditor.style.height = contentEditor.scrollHeight + 'px';
        highlightVerseTags();
    });
    // Initialize height on page load
    contentEditor.style.height = 'auto';
    contentEditor.style.height = contentEditor.scrollHeight + 'px';

    // Get entry ID from URL if editing an existing entry
    const urlParts = window.location.pathname.split('/');
    const isEditMode = urlParts.includes('edit');
    const entryId = isEditMode ? urlParts[urlParts.indexOf('journal') + 1] : null;

    // Set page title based on mode
    if (isEditMode) {
        pageTitle.textContent = 'Edit Journal Entry';
    }

    // If in edit mode, load the existing entry
    if (isEditMode && entryId) {
        try {
            const response = await fetch(`/api/journal/${entryId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch journal entry');
            }

            const entry = await response.json();

            // Populate form with entry data, sanitize to plain text
            titleInput.value = entry.title || '';
            // For textarea, just set value
            contentEditor.value = entry.content || '';
            highlightVerseTags();

        } catch (error) {
            console.error('Error loading journal entry:', error);
            alert('Failed to load journal entry. Please try again later.');
        }
    }

    // Handle form submission
    journalForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = titleInput.value.trim();
        // Always sanitize to plain text before saving
        let content = contentEditor.value || '';

        if (!content.trim()) {
            alert('Please enter some content for your journal entry.');
            return;
        }

        // Extract verse tags using the improved regex
        const verseTags = extractVerseTags(content);

        try {
            const url = isEditMode
                ? `/api/journal/${entryId}`
                : '/api/journal';

            const method = isEditMode ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title,
                    content,
                    verse_tags: verseTags
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save journal entry');
            }

            const savedEntry = await response.json();

            // Redirect to view the saved entry
            window.location.href = `/journal/${savedEntry.id}`;

        } catch (error) {
            console.error('Error saving journal entry:', error);
            alert('Failed to save journal entry. Please try again later.');
        }
    });

    contentEditor.addEventListener('input', () => {
        highlightVerseTags();
    });

    // Bible book data for validation
    const BIBLE_BOOKS = {
        // Old Testament
        'genesis': { abbr: ['gen', 'ge'], chapters: 50 },
        'exodus': { abbr: ['exod', 'ex'], chapters: 40 },
        'leviticus': { abbr: ['lev', 'le'], chapters: 27 },
        'numbers': { abbr: ['num', 'nu'], chapters: 36 },
        'deuteronomy': { abbr: ['deut', 'dt'], chapters: 34 },
        'joshua': { abbr: ['josh', 'jos'], chapters: 24 },
        'judges': { abbr: ['judg', 'jdg'], chapters: 21 },
        'ruth': { abbr: ['ru'], chapters: 4 },
        '1 samuel': { abbr: ['1 sam', '1sam', '1 sa'], chapters: 31 },
        '2 samuel': { abbr: ['2 sam', '2sam', '2 sa'], chapters: 24 },
        '1 kings': { abbr: ['1 ki', '1ki'], chapters: 22 },
        '2 kings': { abbr: ['2 ki', '2ki'], chapters: 25 },
        '1 chronicles': { abbr: ['1 chr', '1chr', '1 ch'], chapters: 29 },
        '2 chronicles': { abbr: ['2 chr', '2chr', '2 ch'], chapters: 36 },
        'ezra': { abbr: ['ezr'], chapters: 10 },
        'nehemiah': { abbr: ['neh', 'ne'], chapters: 13 },
        'esther': { abbr: ['est', 'es'], chapters: 10 },
        'job': { abbr: ['jb'], chapters: 42 },
        'psalm': { abbr: ['ps', 'psalms', 'psa'], chapters: 150 },
        'proverbs': { abbr: ['prov', 'pr'], chapters: 31 },
        'ecclesiastes': { abbr: ['eccl', 'ec'], chapters: 12 },
        'song of solomon': { abbr: ['song', 'sos', 'song of songs'], chapters: 8 },
        'isaiah': { abbr: ['isa', 'is'], chapters: 66 },
        'jeremiah': { abbr: ['jer', 'je'], chapters: 52 },
        'lamentations': { abbr: ['lam', 'la'], chapters: 5 },
        'ezekiel': { abbr: ['ezek', 'eze'], chapters: 48 },
        'daniel': { abbr: ['dan', 'da'], chapters: 12 },
        'hosea': { abbr: ['hos', 'ho'], chapters: 14 },
        'joel': { abbr: ['joe', 'jl'], chapters: 3 },
        'amos': { abbr: ['am'], chapters: 9 },
        'obadiah': { abbr: ['obad', 'ob'], chapters: 1 },
        'jonah': { abbr: ['jon'], chapters: 4 },
        'micah': { abbr: ['mic', 'mi'], chapters: 7 },
        'nahum': { abbr: ['nah', 'na'], chapters: 3 },
        'habakkuk': { abbr: ['hab'], chapters: 3 },
        'zephaniah': { abbr: ['zeph', 'zep'], chapters: 3 },
        'haggai': { abbr: ['hag'], chapters: 2 },
        'zechariah': { abbr: ['zech', 'zec'], chapters: 14 },
        'malachi': { abbr: ['mal'], chapters: 4 },
        
        // New Testament
        'matthew': { abbr: ['matt', 'mt'], chapters: 28 },
        'mark': { abbr: ['mk'], chapters: 16 },
        'luke': { abbr: ['lk'], chapters: 24 },
        'john': { abbr: ['jn'], chapters: 21 },
        'acts': { abbr: ['ac'], chapters: 28 },
        'romans': { abbr: ['rom', 'ro'], chapters: 16 },
        '1 corinthians': { abbr: ['1 cor', '1cor', '1 co'], chapters: 16 },
        '2 corinthians': { abbr: ['2 cor', '2cor', '2 co'], chapters: 13 },
        'galatians': { abbr: ['gal', 'ga'], chapters: 6 },
        'ephesians': { abbr: ['eph'], chapters: 6 },
        'philippians': { abbr: ['phil', 'php'], chapters: 4 },
        'colossians': { abbr: ['col'], chapters: 4 },
        '1 thessalonians': { abbr: ['1 thess', '1thess', '1 th'], chapters: 5 },
        '2 thessalonians': { abbr: ['2 thess', '2thess', '2 th'], chapters: 3 },
        '1 timothy': { abbr: ['1 tim', '1tim', '1 ti'], chapters: 6 },
        '2 timothy': { abbr: ['2 tim', '2tim', '2 ti'], chapters: 4 },
        'titus': { abbr: ['tit'], chapters: 3 },
        'philemon': { abbr: ['phlm'], chapters: 1 },
        'hebrews': { abbr: ['heb'], chapters: 13 },
        'james': { abbr: ['jas'], chapters: 5 },
        '1 peter': { abbr: ['1 pet', '1pet', '1 pe'], chapters: 5 },
        '2 peter': { abbr: ['2 pet', '2pet', '2 pe'], chapters: 3 },
        '1 john': { abbr: ['1 jn', '1jn'], chapters: 5 },
        '2 john': { abbr: ['2 jn', '2jn'], chapters: 1 },
        '3 john': { abbr: ['3 jn', '3jn'], chapters: 1 },
        'jude': { abbr: ['jud'], chapters: 1 },
        'revelation': { abbr: ['rev', 're'], chapters: 22 }
    };

    // Chapter verse counts for common books (simplified - just max verses for validation)
    const CHAPTER_VERSES = {
        'genesis': { 1: 31, 2: 25, 3: 24 },
        'psalm': { 23: 6, 119: 176 },
        'john': { 3: 36, 1: 51 },
        'romans': { 8: 39 }
        // Add more as needed, or load dynamically
    };

    // Function to validate a Bible reference
    function validateVerseReference(book, chapter, verse) {
        // Normalize book name
        const bookLower = book.toLowerCase().trim();
        
        // Find the book in our database
        let validBook = null;
        let bookKey = null;
        
        // Check direct match
        if (BIBLE_BOOKS[bookLower]) {
            validBook = BIBLE_BOOKS[bookLower];
            bookKey = bookLower;
        } else {
            // Check abbreviations
            for (const [key, data] of Object.entries(BIBLE_BOOKS)) {
                if (data.abbr.includes(bookLower)) {
                    validBook = data;
                    bookKey = key;
                    break;
                }
            }
        }
        
        // If book not found, it's invalid
        if (!validBook) {
            return { 
                isValid: false, 
                reason: 'Unknown book',
                normalizedName: book // Keep original for display
            };
        }
        
        // Check if chapter is valid
        if (chapter <= 0 || chapter > validBook.chapters) {
            return {
                isValid: false,
                reason: `${bookKey} has ${validBook.chapters} chapters`,
                normalizedName: bookKey
            };
        }
        
        // Check verse if we have detailed verse data
        if (CHAPTER_VERSES[bookKey] && CHAPTER_VERSES[bookKey][chapter]) {
            const maxVerse = CHAPTER_VERSES[bookKey][chapter];
            if (verse > maxVerse) {
                return {
                    isValid: false,
                    reason: `${bookKey} ${chapter} has ${maxVerse} verses`,
                    normalizedName: bookKey
                };
            }
        }
        
        // If we got here, it's valid
        return {
            isValid: true,
            normalizedName: bookKey
        };
    }

    // Function to highlight verse tags in the editor and update preview
    function highlightVerseTags() {
        const text = contentEditor.value;
        const previewContent = document.getElementById('verse-preview-content');
        const verseRegex = /@((?:\d\s*)?[\w\s']+)\s*(\d+)\s*:\s*(\d+)(?:\s*[-–]\s*(\d+))?/g;
        
        // Extract all verse tags
        const tags = [];
        let match;
        let hasMatches = false;
        
        while ((match = verseRegex.exec(text)) !== null) {
            hasMatches = true;
            const [fullMatch, book, chapter, startVerse, endVerse] = match;
            
            // Validate the reference
            const validation = validateVerseReference(
                book.trim(), 
                parseInt(chapter, 10), 
                parseInt(startVerse, 10)
            );
            
            tags.push({
                text: fullMatch,
                book: book.trim(),
                chapter: parseInt(chapter, 10),
                verse: parseInt(startVerse, 10),
                endVerse: endVerse ? parseInt(endVerse, 10) : null,
                isValid: validation.isValid,
                reason: validation.reason,
                normalizedName: validation.normalizedName
            });
        }
        
        // Update the preview section
        if (previewContent) {
            if (!hasMatches) {
                previewContent.innerHTML = '<p class="verse-preview-empty">No Bible verses detected yet. Start typing with @Book Chapter:Verse format.</p>';
            } else {
                let html = '';
                
                tags.forEach(tag => {
                    const cssClass = tag.isValid ? 'verse-tag-valid' : 'verse-tag-invalid';
                    const tooltip = tag.isValid 
                        ? `Valid reference: ${tag.normalizedName} ${tag.chapter}:${tag.verse}${tag.endVerse ? '-' + tag.endVerse : ''}`
                        : `Invalid reference: ${tag.reason}`;
                    
                    html += `<span class="${cssClass}" title="${tooltip}">${tag.text}${!tag.isValid ? ' ⚠️' : ''}</span>`;
                });
                
                previewContent.innerHTML = html;
            }
        }
    }

    // Function to extract verse tags from content
    function extractVerseTags(content) {
        // Improved regex: matches @Book Chapter:Verse (optionally, ranges), even inside parentheses or after commas
        const regex = /@?\s*([\dA-Za-z\s']+?)\s+(\d+)\s*:\s*(\d+)(?:\s*[-–]\s*(\d+))?/g;
        const tags = [];
        let match;
        while ((match = regex.exec(content)) !== null) {
            const [fullMatch, book, chapter, startVerse, endVerse] = match;
            tags.push({
                book: book.trim(),
                chapter: parseInt(chapter, 10),
                verse: parseInt(startVerse, 10),
                endVerse: endVerse ? parseInt(endVerse, 10) : null,
                matchText: fullMatch,
                startOffset: match.index,
                endOffset: match.index + fullMatch.length
            });
        }
        return tags;
    }
});
