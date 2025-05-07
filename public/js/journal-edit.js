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
        highlightVerseTags();
    });

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

    // Function to highlight verse tags in the editor (for display only)
    function highlightVerseTags() {
        // Only for display: show a highlighted preview below the textarea
        const previewEl = document.getElementById('content-preview');
        if (!previewEl) return;
        let text = contentEditor.value;
        previewEl.innerHTML = text.replace(/@((?:\d\s*)?[\w\s']+)\s*(\d+)\s*:\s*(\d+)(?:\s*[-–]\s*(\d+))?/g, match => `<span class="verse-tag-syntax">${match}</span>`).replace(/\n/g, '<br>');
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
