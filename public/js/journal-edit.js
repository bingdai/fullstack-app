// Journal edit page script
document.addEventListener('DOMContentLoaded', async () => {
    const journalForm = document.getElementById('journal-form');
    const titleInput = document.getElementById('title');
    const contentEditor = document.getElementById('content-editor');
    const pageTitle = document.getElementById('page-title');
    
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
            
            // Populate form with entry data
            titleInput.value = entry.title || '';
            contentEditor.innerHTML = formatContentWithVerseTags(entry.content, entry.verse_tags);
            
        } catch (error) {
            console.error('Error loading journal entry:', error);
            alert('Failed to load journal entry. Please try again later.');
        }
    }
    
    // Handle form submission
    journalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = titleInput.value.trim();
        const content = contentEditor.innerHTML.trim();
        
        if (!content) {
            alert('Please enter some content for your journal entry.');
            return;
        }
        
        // Extract verse tags using regex
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
    
    // Add syntax highlighting for verse tags as you type
    contentEditor.addEventListener('input', () => {
        highlightVerseTags();
    });
    
    // Initial highlighting if in edit mode
    if (isEditMode) {
        setTimeout(highlightVerseTags, 100);
    }
    
    // Function to highlight verse tags in the editor
    function highlightVerseTags() {
        const content = contentEditor.innerHTML;
        const regex = /@([\w\s]+)\s+(\d+):(\d+)(?:[-–](\d+))?/g;
        
        // Save cursor position
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const cursorPosition = range.startOffset;
        
        // Apply highlighting
        let highlightedContent = content.replace(regex, (match) => {
            return `<span class="verse-tag-syntax">${match}</span>`;
        });
        
        // Only update if content changed to avoid cursor jumping
        if (highlightedContent !== content) {
            contentEditor.innerHTML = highlightedContent;
            
            // Restore cursor position
            try {
                const newRange = document.createRange();
                newRange.setStart(contentEditor.childNodes[0], cursorPosition);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
            } catch (e) {
                // Ignore cursor restoration errors
            }
        }
    }
    
    // Function to extract verse tags from content
    function extractVerseTags(content) {
        const regex = /@([\w\s]+)\s+(\d+):(\d+)(?:[-–](\d+))?/g;
        const tags = [];
        let match;
        
        while ((match = regex.exec(content)) !== null) {
            const [fullMatch, book, chapter, startVerse, endVerse] = match;
            
            tags.push({
                book: book.trim(),
                chapter: parseInt(chapter),
                verse: parseInt(startVerse),
                endVerse: endVerse ? parseInt(endVerse) : null,
                matchText: fullMatch,
                startOffset: match.index,
                endOffset: match.index + fullMatch.length
            });
        }
        
        return tags;
    }
    
    // Function to format content with verse tags when loading an existing entry
    function formatContentWithVerseTags(content, verseTags) {
        if (!verseTags || verseTags.length === 0) {
            return content;
        }
        
        // Sort tags by start offset in descending order to avoid position shifts
        const sortedTags = [...verseTags].sort((a, b) => b.start_offset - a.start_offset);
        
        let formattedContent = content;
        
        sortedTags.forEach(tag => {
            const taggedText = formattedContent.substring(tag.start_offset, tag.end_offset);
            formattedContent = 
                formattedContent.substring(0, tag.start_offset) +
                `<span class="verse-tag-syntax">${taggedText}</span>` +
                formattedContent.substring(tag.end_offset);
        });
        
        return formattedContent;
    }
});
