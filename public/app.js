// Bible Book Grid
document.addEventListener('DOMContentLoaded', () => {
    // Book data structure
    const books = {
        oldTestament: {
            pentateuch: ['Gen', 'Exod', 'Lev', 'Num', 'Deut'],
            history: ['Josh', 'Judg', 'Ruth', '1Sam', '2Sam', '1Kgs', '2Kgs', '1Chr', '2Chr', 'Ezra', 'Neh', 'Esth'],
            poetry: ['Job', 'Ps', 'Prov', 'Eccl', 'Song'],
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

    // Fetch book data
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

    // Update book information
    function updateBookInfo(book) {
        document.getElementById('book-title').textContent = book.name;
        document.getElementById('book-description').textContent = book.description || 'No description available';
        document.getElementById('chapter-count').textContent = book.chapter_count || 0;
        document.getElementById('book-type').textContent = book.testament || 'Unknown';
    }

    // Create chapter groups
    function createChapterGroups(chapters) {
        const chapterGroups = {
            'Introduction': [],
            'Main Content': [],
            'Conclusion': []
        };

        chapters.forEach((chapter, index) => {
            if (index < 3) {
                chapterGroups['Introduction'].push(chapter);
            } else if (index >= chapters.length - 2) {
                chapterGroups['Conclusion'].push(chapter);
            } else {
                chapterGroups['Main Content'].push(chapter);
            }
        });

        return chapterGroups;
    }

    // Render chapter groups
    function renderChapterGroups(chapterGroups, bookShort) {
        const chapterGroupsDiv = document.getElementById('chapter-groups');
        chapterGroupsDiv.innerHTML = '';

        Object.entries(chapterGroups).forEach(([group, chapters]) => {
            if (chapters.length > 0) {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'chapter-group';
                groupDiv.innerHTML = `
                    <h2>${group}</h2>
                    <ul class="chapters-list">
                        ${chapters.map(chapter => `
                            <li>
                                <a href="/books/${bookShort}/${chapter.chapter_number}">
                                    <span class="chapter-number">Chapter ${chapter.chapter_number}</span>
                                    <span class="chapter-verse-count">${chapter.verse_count} verses</span>
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                `;
                chapterGroupsDiv.appendChild(groupDiv);
            }
        });
    }

    // Create book grid
    function createBookGrid(testament, books) {
        const grid = document.createElement('div');
        grid.className = 'books-grid';

        Object.entries(books).forEach(([type, bookList]) => {
            bookList.forEach(book => {
                const tile = document.createElement('div');
                tile.className = `book-tile ${type.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
                tile.textContent = book;
                
                // Navigate to the book detail page on click
                tile.addEventListener('click', () => {
                    window.location.href = `/books/${book}`;
                });
                
                grid.appendChild(tile);
            });
        });

        return grid;
    }

    // Initialize book grids
    const container = document.querySelector('.container');
    
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
