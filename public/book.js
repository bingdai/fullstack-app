// book.js: Handles the book detail page logic

document.addEventListener('DOMContentLoaded', async () => {
    // Helper: Get book short name from URL (e.g., /books/Jas)
    function getBookShortFromUrl() {
        const match = window.location.pathname.match(/\/books\/([^\/]+)/);
        return match ? match[1] : null;
    }

    // Fetch book data from API
    async function fetchBookData(bookShort) {
        try {
            const response = await fetch(`/api/books/${bookShort}`);
            if (!response.ok) {
                throw new Error('Failed to fetch book data');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching book data:', error);
            throw error;
        }
    }

    // Update book info in DOM
    function updateBookInfo(book) {
        document.getElementById('book-title').textContent = book.name;
        document.getElementById('book-description').textContent = book.description || 'No description available';
        document.getElementById('chapter-count').textContent = book.chapter_count || 0;
        document.getElementById('book-type').textContent = book.testament || 'Unknown';
    }

    // Render chapters
    function renderChapters(chapters, bookShort) {
        const chapterGroupsDiv = document.getElementById('chapter-groups');
        chapterGroupsDiv.innerHTML = '';
        if (!chapters.length) {
            chapterGroupsDiv.innerHTML = '<div>No chapters found.</div>';
            return;
        }
        // Simple: just list all chapters
        const ul = document.createElement('ul');
        ul.className = 'chapters-list';
        chapters.forEach(chapter => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="/books/${bookShort}/${chapter.number}">Chapter ${chapter.number}</a>`;
            ul.appendChild(li);
        });
        chapterGroupsDiv.appendChild(ul);
    }

    // Main logic
    const bookShort = getBookShortFromUrl();
    if (!bookShort) {
        document.body.innerHTML = '<div class="error-message">Invalid book URL.</div>';
        return;
    }
    try {
        const data = await fetchBookData(bookShort);
        updateBookInfo(data.book);
        renderChapters(data.chapters, bookShort);
    } catch (error) {
        document.body.innerHTML = '<div class="error-message">Failed to load book data. Please try again later.</div>';
    }
});
