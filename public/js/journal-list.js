// Journal list page script
// No dead code or unused imports after refactor

document.addEventListener('DOMContentLoaded', async () => {
    const journalListEl = document.getElementById('journal-list');
    const entryTemplate = document.getElementById('entry-template');
    const noEntriesEl = document.getElementById('no-entries');
    
    try {
        // Fetch journal entries
        const response = await fetch('/api/journal');
        if (!response.ok) {
            throw new Error('Failed to fetch journal entries');
        }
        
        const entries = await response.json();
        
        // Clear loading message
        journalListEl.innerHTML = '';
        
        if (entries.length === 0) {
            // Show no entries message
            noEntriesEl.style.display = 'block';
            return;
        }
        
        // Render each entry
        entries.forEach(entry => {
            const entryEl = entryTemplate.content.cloneNode(true);
            
            // Set entry title
            const titleEl = entryEl.querySelector('.entry-title');
            titleEl.textContent = entry.title || 'Untitled Entry';
            
            // Format and set date
            const dateEl = entryEl.querySelector('.entry-date');
            const entryDate = new Date(entry.created_at);
            dateEl.textContent = entryDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Set preview text (truncate if needed)
            const previewEl = entryEl.querySelector('.entry-preview');
            const previewText = entry.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
            previewEl.textContent = previewText.length > 200 
                ? previewText.substring(0, 200) + '...' 
                : previewText;
            
            // Set link to view entry
            const viewLinkEl = entryEl.querySelector('.view-entry');
            viewLinkEl.href = `/journal/${entry.id}`;
            
            // Add to DOM
            journalListEl.appendChild(entryEl);
        });
        
    } catch (error) {
        console.error('Error loading journal entries:', error);
        journalListEl.innerHTML = `
            <div class="error-message">
                <p>Failed to load journal entries. Please try again later.</p>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
});
