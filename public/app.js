// Bible Book Grid - Refactored for clarity and maintainability

document.addEventListener('DOMContentLoaded', () => {
    // --- Book Data Structure ---
    const books = {
        oldTestament: {
            pentateuch: ['Gen', 'Exod', 'Lev', 'Num', 'Deut'],
            history: ['Josh', 'Judg', 'Ruth', '1Sam', '2Sam', '1Kgs', '2Kgs', '1Chr', '2Chr', 'Ezra', 'Neh', 'Esth'],
            wisdom: ['Job', 'Ps', 'Prov', 'Eccl', 'Song'],
            majorProphets: ['Isa', 'Jer', 'Lam', 'Ezek', 'Dan'],
            minorProphets: ['Hos', 'Joel', 'Amos', 'Obad', 'Jonah', 'Mic', 'Nah', 'Hab', 'Zeph', 'Hag', 'Zech', 'Mal']
        },
        newTestament: {
            gospels: ['Matt', 'Mark', 'Luke', 'John'],
            acts: ['Acts'],
            paulLetters: ['Rom', '1Cor', '2Cor', 'Gal', 'Eph', 'Phil', 'Col', '1Thess', '2Thess', '1Tim', '2Tim', 'Titus', 'Philem'],
            generalLetters: ['Heb', 'Jas', '1Pet', '2Pet', '1John', '2John', '3John', 'Jude'],
            revelation: ['Rev']
        }
    };

    // --- UI Rendering Functions ---

    /**
     * Create a grid of book tiles for a testament
     * @param {string} testament - 'oldTestament' or 'newTestament'
     * @param {object} booksObj - Book categories and lists
     * @returns {HTMLElement} grid div
     */
    const createBookGrid = (testament, booksObj) => {
        const grid = document.createElement('div');
        grid.className = 'books-grid';

        Object.entries(booksObj).forEach(([category, bookList]) => {
            bookList.forEach(bookShort => {
                const tile = document.createElement('div');
                tile.className = `book-tile ${category.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
                tile.textContent = bookShort;
                tile.title = `Go to ${bookShort}`;
                tile.tabIndex = 0;
                tile.setAttribute('role', 'button');

                // Keyboard and click navigation
                tile.addEventListener('click', () => navigateToBook(bookShort));
                tile.addEventListener('keypress', e => {
                    if (e.key === 'Enter' || e.key === ' ') navigateToBook(bookShort);
                });

                grid.appendChild(tile);
            });
        });
        return grid;
    };

    /**
     * Navigate to book detail page
     * @param {string} bookShort
     */
    const navigateToBook = bookShort => {
        window.location.href = `/books/${bookShort}`;
    };

    // --- Initialize Page ---
    const container = document.querySelector('.container');
    if (!container) {
        console.error('Container element not found');
        return;
    }

    // Old Testament
    const oldTestamentHeader = document.createElement('h1');
    oldTestamentHeader.textContent = 'Old Testament';
    container.appendChild(oldTestamentHeader);
    container.appendChild(createBookGrid('oldTestament', books.oldTestament));

    // New Testament
    const newTestamentHeader = document.createElement('h1');
    newTestamentHeader.textContent = 'New Testament';
    container.appendChild(newTestamentHeader);
    container.appendChild(createBookGrid('newTestament', books.newTestament));
});
