// book.js: Handles the book detail page logic (refactored for clarity)

document.addEventListener('DOMContentLoaded', async () => {
    // --- Helpers ---
    /**
     * Extracts the book short name from the URL (e.g., /books/Jas)
     * @returns {string|null}
     */
    const getBookShortFromUrl = () => {
        const match = window.location.pathname.match(/\/books\/([^\/]+)/);
        return match ? match[1] : null;
    };

    /**
     * Fetch book data from API
     * @param {string} bookShort
     * @returns {Promise<object>}
     */
    const fetchBookData = async (bookShort) => {
        try {
            console.log(`Fetching data for book: ${bookShort}`);
            const response = await fetch(`/api/books/${bookShort}`);
            const data = await response.json();
            if (!response.ok) {
                console.error('API Error:', data);
                throw new Error(data.details || 'Failed to fetch book data');
            }
            console.log('Book data received:', data);
            return data;
        } catch (error) {
            console.error('Error in fetchBookData:', error);
            throw error;
        }
    };

    /**
     * Update book info in DOM
     * @param {object} book
     */
    const updateBookInfo = (book) => {
        document.getElementById('book-title').textContent = book.name;
        document.getElementById('book-description').textContent = book.description || 'No description available';
        document.getElementById('chapter-count').textContent = book.chapter_count || 0;
        document.getElementById('book-type').textContent = book.testament || 'Unknown';
    };

    /**
     * Render chapters list in DOM
     * @param {Array} chapters
     * @param {string} bookShort
     */
    const renderChapters = (chapters, bookShort) => {
        const chapterGroupsDiv = document.getElementById('chapter-groups');
        chapterGroupsDiv.innerHTML = '';
        if (!chapters.length) {
            chapterGroupsDiv.innerHTML = '<div>No chapters found.</div>';
            return;
        }
        const ul = document.createElement('ul');
        ul.className = 'chapters-list';
        chapters.forEach(chapter => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="/books/${bookShort}/${chapter.number}">Chapter ${chapter.number}</a>`;
            ul.appendChild(li);
        });
        chapterGroupsDiv.appendChild(ul);
    };

    /**
     * Show user-friendly error message
     * @param {string} message
     */
    const showError = (message) => {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <h3>Error Loading Book</h3>
            <p>${message}</p>
            <p>URL: ${window.location.href}</p>
            <p>Please try refreshing the page or go back to the <a href="/">homepage</a>.</p>
        `;
        document.body.innerHTML = '';
        document.body.appendChild(errorDiv);
    };

    // --- Main Logic ---
    const bookShort = getBookShortFromUrl();
    if (!bookShort) {
        showError('Invalid book URL.');
        return;
    }
    try {
        const data = await fetchBookData(bookShort);
        updateBookInfo(data.book);
        renderChapters(data.chapters, bookShort);
    } catch (error) {
        console.error('Error initializing book page:', error);
        showError(error.message || 'Failed to load book data. Please try again later.');
    }
});
