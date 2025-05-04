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

    // Create book grid
    function createBookGrid(testament, books) {
        const grid = document.createElement('div');
        grid.className = 'books-grid';

        Object.entries(books).forEach(([type, bookList]) => {
            bookList.forEach(book => {
                const tile = document.createElement('div');
                tile.className = `book-tile ${type.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
                tile.textContent = book;
                
                // Make the tile clickable and navigate to the book page
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
