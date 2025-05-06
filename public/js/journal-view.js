// Journal view page script
document.addEventListener('DOMContentLoaded', async () => {
    const journalEntryEl = document.getElementById('journal-entry');
    const entryContentEl = document.getElementById('entry-content');
    const entryTitleEl = document.getElementById('entry-title');
    const entryDateEl = document.getElementById('entry-date');
    const entryContentTextEl = document.getElementById('entry-content-text');
    const verseReferencesEl = document.getElementById('verse-references');
    const verseListEl = document.getElementById('verse-list');
    const entryNotFoundEl = document.getElementById('entry-not-found');
    const editEntryBtn = document.getElementById('edit-entry-btn');
    const deleteEntryBtn = document.getElementById('delete-entry-btn');
    
    // Get entry ID from URL
    const urlParts = window.location.pathname.split('/');
    const entryId = urlParts[urlParts.indexOf('journal') + 1];
    
    // Set edit button URL
    editEntryBtn.href = `/journal/${entryId}/edit`;
    
    try {
        // Fetch journal entry
        const response = await fetch(`/api/journal/${entryId}`);
        
        if (response.status === 404) {
            // Entry not found
            journalEntryEl.style.display = 'none';
            entryNotFoundEl.style.display = 'block';
            return;
        }
        
        if (!response.ok) {
            throw new Error('Failed to fetch journal entry');
        }
        
        const entry = await response.json();
        
        // Hide loading and show content
        journalEntryEl.style.display = 'none';
        entryContentEl.style.display = 'block';
        
        // Set entry title
        entryTitleEl.textContent = entry.title || 'Untitled Entry';
        
        // Format and set date
        const entryDate = new Date(entry.created_at);
        entryDateEl.textContent = entryDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Process content and highlight verse references
        entryContentTextEl.innerHTML = processContentWithVerseTags(entry.content, entry.verse_tags);
        
        // Display verse references
        if (entry.verse_tags && entry.verse_tags.length > 0) {
            verseReferencesEl.style.display = 'block';
            renderVerseReferences(entry.verse_tags, verseListEl);
        } else {
            verseReferencesEl.style.display = 'none';
        }
        
        // Handle delete button
        deleteEntryBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this journal entry? This action cannot be undone.')) {
                try {
                    const deleteResponse = await fetch(`/api/journal/${entryId}`, {
                        method: 'DELETE'
                    });
                    
                    if (!deleteResponse.ok) {
                        throw new Error('Failed to delete journal entry');
                    }
                    
                    // Redirect to journal list
                    window.location.href = '/journal';
                    
                } catch (error) {
                    console.error('Error deleting journal entry:', error);
                    alert('Failed to delete journal entry. Please try again later.');
                }
            }
        });
        
    } catch (error) {
        console.error('Error loading journal entry:', error);
        journalEntryEl.innerHTML = `
            <div class="error-message">
                <p>Failed to load journal entry. Please try again later.</p>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
    
    // Function to process content and highlight verse references
    function processContentWithVerseTags(content, verseTags) {
        if (!verseTags || verseTags.length === 0) {
            return content;
        }
        
        // Sort tags by start offset in descending order to avoid position shifts
        const sortedTags = [...verseTags].sort((a, b) => b.start_offset - a.start_offset);
        
        let processedContent = content;
        
        sortedTags.forEach(tag => {
            const verseRef = `${tag.book_name} ${tag.chapter_number}:${tag.verse_number}`;
            const taggedText = processedContent.substring(tag.start_offset, tag.end_offset);
            
            processedContent = 
                processedContent.substring(0, tag.start_offset) +
                `<span class="verse-highlight" data-verse-id="${tag.verse_id}">
                    ${taggedText}
                    <div class="verse-tooltip">${verseRef}</div>
                </span>` +
                processedContent.substring(tag.end_offset);
        });
        
        return processedContent;
    }
    
    // Function to render verse references
    function renderVerseReferences(verseTags, container) {
        // Group verses by book and chapter
        const versesByReference = {};
        
        verseTags.forEach(tag => {
            const refKey = `${tag.book_name} ${tag.chapter_number}`;
            
            if (!versesByReference[refKey]) {
                versesByReference[refKey] = {
                    book: tag.book_name,
                    chapter: tag.chapter_number,
                    verses: []
                };
            }
            
            versesByReference[refKey].verses.push({
                number: tag.verse_number,
                text: tag.text || 'Verse text not available'
            });
        });
        
        // Render each reference group
        Object.values(versesByReference).forEach(reference => {
            const referenceEl = document.createElement('div');
            referenceEl.className = 'verse-reference';
            
            // Sort verses by number
            reference.verses.sort((a, b) => a.number - b.number);
            
            // Create verse text
            const verseTextEl = document.createElement('div');
            verseTextEl.className = 'verse-reference-text';
            
            reference.verses.forEach(verse => {
                const verseSpan = document.createElement('span');
                verseSpan.className = 'verse';
                verseSpan.innerHTML = `<sup>${verse.number}</sup>${verse.text} `;
                verseTextEl.appendChild(verseSpan);
            });
            
            // Create citation
            const citationEl = document.createElement('div');
            citationEl.className = 'verse-citation';
            
            // Format verse numbers (e.g., "1-3" for a range)
            const verseNumbers = reference.verses.map(v => v.number);
            let verseDisplay;
            
            if (verseNumbers.length === 1) {
                verseDisplay = verseNumbers[0];
            } else {
                // Check if it's a continuous range
                const isRange = verseNumbers.every((num, i, arr) => 
                    i === 0 || num === arr[i-1] + 1
                );
                
                if (isRange) {
                    verseDisplay = `${verseNumbers[0]}-${verseNumbers[verseNumbers.length - 1]}`;
                } else {
                    verseDisplay = verseNumbers.join(', ');
                }
            }
            
            citationEl.textContent = `${reference.book} ${reference.chapter}:${verseDisplay}`;
            
            // Add to container
            referenceEl.appendChild(verseTextEl);
            referenceEl.appendChild(citationEl);
            container.appendChild(referenceEl);
        });
    }
});
