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
     * Extracts the chapter number from the URL (e.g., /books/Jas/1)
     * @returns {number|null}
     */
    const getChapterFromUrl = () => {
        const match = window.location.pathname.match(/\/books\/[^\/]+\/(\d+)/);
        return match ? parseInt(match[1], 10) : null;
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
        if (!book) return;
        setElementTextById('book-title', book.name || 'Untitled Book');
        setElementTextById('book-description', book.description || 'No description available');
        setElementTextById('chapter-count', book.chapter_count || 0);
        setElementTextById('book-type', book.testament || 'Unknown');
    };

    /**
     * Render chapter content in DOM
     * @param {Object} data - Chapter data including translations
     */
    const renderChapterContent = (data) => {
        const contentContainer = document.getElementById('chapter-content-container');
        const contentDiv = document.getElementById('chapter-content');
        
        if (!contentDiv || !contentContainer) {
            console.error('Chapter content elements not found');
            return;
        }

        contentDiv.innerHTML = '';
        
        // Create translation selector if multiple translations available
        const translations = Object.keys(data.translations);
        if (translations.length > 1) {
            const selectorWrapper = document.createElement('div');
            selectorWrapper.className = 'translation-selector-wrapper';
            
            const label = document.createElement('span');
            label.textContent = 'Translation:';
            label.className = 'translation-label';
            
            const selector = document.createElement('select');
            selector.id = 'translation-selector';
            selector.className = 'translation-selector';
            
            translations.forEach(code => {
                const option = document.createElement('option');
                option.value = code;
                option.textContent = data.translations[code].name;
                selector.appendChild(option);
            });
            
            selectorWrapper.appendChild(label);
            selectorWrapper.appendChild(selector);
            contentDiv.appendChild(selectorWrapper);
            
            // Add event listener to switch translations
            selector.addEventListener('change', () => {
                showTranslation(data, selector.value);
            });
        }
        
        // Create verses container
        const versesContainer = document.createElement('div');
        versesContainer.className = 'verses-container';
        versesContainer.id = 'verses-container';
        contentDiv.appendChild(versesContainer);

        // Add chapter navigation controls only at the bottom
        const navControls = document.createElement('div');
        navControls.className = 'chapter-nav-controls';

        const prevChapter = document.createElement('button');
        prevChapter.className = 'nav-button prev-chapter';
        prevChapter.innerHTML = '&larr; Previous Chapter';
        prevChapter.onclick = () => {
            const prevChapterNum = parseInt(data.chapter.number, 10) - 1;
            if (prevChapterNum > 0) {
                loadChapter(data.book.short, prevChapterNum);
            }
        };

        const nextChapter = document.createElement('button');
        nextChapter.className = 'nav-button next-chapter';
        nextChapter.innerHTML = 'Next Chapter &rarr;';
        nextChapter.onclick = () => {
            const nextChapterNum = parseInt(data.chapter.number, 10) + 1;
            loadChapter(data.book.short, nextChapterNum);
        };

        navControls.appendChild(prevChapter);
        navControls.appendChild(nextChapter);

        
        // Show first translation by default
        if (translations.length > 0) {
            showTranslation(data, translations[0]);
        }
        
        // Add navigation controls at the bottom as well
        const bottomNavControls = navControls.cloneNode(true);
        
        // Re-attach event listeners for the cloned buttons
        bottomNavControls.querySelector('.prev-chapter').onclick = () => {
            const prevChapterNum = parseInt(data.chapter.number, 10) - 1;
            if (prevChapterNum > 0) {
                loadChapter(data.book.short, prevChapterNum);
            }
        };
        
        bottomNavControls.querySelector('.next-chapter').onclick = () => {
            const nextChapterNum = parseInt(data.chapter.number, 10) + 1;
            loadChapter(data.book.short, nextChapterNum);
        };
        
        contentDiv.appendChild(bottomNavControls);
    };

    /**
     * Show a specific translation of the chapter
     * @param {Object} data - Chapter data
     * @param {string} translationCode - Translation code to show
     */
    const showTranslation = (data, translationCode) => {
        const versesContainer = document.getElementById('verses-container');
        
        if (!versesContainer) {
            console.error('Verses container not found');
            return;
        }
        
        // Get the translation
        const translation = data.translations[translationCode];
        if (!translation) {
            console.error(`Translation ${translationCode} not found`);
            versesContainer.innerHTML = '<div class="error-message">Translation not found</div>';
            return;
        }
        
        // Update the selector if it exists
        const selector = document.getElementById('translation-selector');
        if (selector) {
            selector.value = translationCode;
        }
        
        // Clear previous verses
        versesContainer.innerHTML = '';
        
        // Create verses container
        const versesDiv = document.createElement('div');
        versesDiv.className = 'verses';
        
        // Add each verse
        if (data.verses && Array.isArray(data.verses)) {
            data.verses.forEach(verse => {
                const verseDiv = document.createElement('div');
                verseDiv.className = 'verse';
                verseDiv.id = `verse-${verse.number}`;
                
                const verseNumber = document.createElement('span');
                verseNumber.className = 'verse-number';
                verseNumber.textContent = verse.number;
                
                const verseText = document.createElement('span');
                verseText.className = 'verse-text';
                
                // Find the verse text in the current translation
                const verseTranslation = translation.verses && Array.isArray(translation.verses) 
                    ? translation.verses.find(v => v.verse_number === verse.number) 
                    : null;
                
                if (verseTranslation) {
                    verseText.textContent = verseTranslation.text;
                } else {
                    verseText.innerHTML = '<em>Verse not available in this translation</em>';
                }
                
                verseDiv.appendChild(verseNumber);
                verseDiv.appendChild(verseText);
                versesDiv.appendChild(verseDiv);
                
                // Add click handler to highlight verse
                verseDiv.addEventListener('click', () => {
                    // Remove highlight from all verses
                    document.querySelectorAll('.verse').forEach(v => {
                        v.classList.remove('highlighted');
                    });
                    
                    // Add highlight to this verse
                    verseDiv.classList.add('highlighted');
                });
            });
        } else {
            versesDiv.innerHTML = '<div class="error-message">No verses available</div>';
        }
        
        versesContainer.appendChild(versesDiv);
    };

    /**
     * Render chapters list in DOM
     * @param {Array} chapters
     * @param {string} bookShort
     */
    let psalmsChapterPage = 1;
    const PSALMS_CHAPTERS_PER_PAGE = 30;

    const renderChapters = (chapters, bookShort) => {
        console.log('Rendering chapters:', chapters.length);
        console.log('bookShort:', bookShort);
        const chaptersContainer = document.getElementById('chapters-list');
        const chaptersNav = chaptersContainer.parentElement; // aside.chapters-nav
        const loadingIndicator = document.getElementById('loading-chapters');

        const isPsalms = bookShort && (bookShort.toLowerCase() === 'ps' || bookShort.toLowerCase() === 'psa' || bookShort.toLowerCase() === 'psalm' || bookShort.toLowerCase() === 'psalms');
        console.log('isPsalms:', isPsalms, 'psalmsChapterPage:', psalmsChapterPage);
        if (isPsalms) {
            chaptersContainer.classList.add('psalms');
        } else {
            chaptersContainer.classList.remove('psalms');
            psalmsChapterPage = 1; // Reset when switching books
        }

        if (loadingIndicator && loadingIndicator.parentNode) {
            loadingIndicator.parentNode.removeChild(loadingIndicator);
        }
        chaptersContainer.innerHTML = '';

        // Remove any old pagination controls
        const oldPagination = chaptersNav.querySelector('.chapter-pagination-controls');
        if (oldPagination) oldPagination.remove();

        let chaptersToRender = chapters;
        let totalPages = 1;
        let currentPage = 1;
        if (isPsalms) {
            totalPages = Math.ceil(chapters.length / PSALMS_CHAPTERS_PER_PAGE);
            currentPage = psalmsChapterPage;
            chaptersToRender = paginate(chapters, PSALMS_CHAPTERS_PER_PAGE, currentPage);
            // Add prev/next controls ABOVE chapters-list
            const navWrapper = document.createElement('div');
            navWrapper.className = 'chapter-pagination-controls';
            navWrapper.style.display = 'flex';
            navWrapper.style.justifyContent = 'center';
            navWrapper.style.gap = '8px';
            navWrapper.style.marginBottom = '12px';
            navWrapper.style.background = '#f5f6fa';
            navWrapper.style.border = '1px solid #e2e8f0';
            navWrapper.style.padding = '6px 12px';
            navWrapper.style.borderRadius = '8px';
            if (currentPage > 1) {
                const prevBtn = document.createElement('button');
                prevBtn.textContent = '← Prev';
                prevBtn.className = 'nav-button';
                prevBtn.onclick = () => {
                    psalmsChapterPage--;
                    console.log('Prev clicked. psalmsChapterPage:', psalmsChapterPage);
                    renderChapters(chapters, bookShort);
                };
                navWrapper.appendChild(prevBtn);
            }
            const label = document.createElement('span');
            const start = (currentPage - 1) * PSALMS_CHAPTERS_PER_PAGE + 1;
            const end = Math.min(currentPage * PSALMS_CHAPTERS_PER_PAGE, chapters.length);
            label.textContent = `Chapters ${start}–${end} of ${chapters.length}`;
            navWrapper.appendChild(label);
            if (currentPage < totalPages) {
                const nextBtn = document.createElement('button');
                nextBtn.textContent = 'Next →';
                nextBtn.className = 'nav-button';
                nextBtn.onclick = () => {
                    psalmsChapterPage++;
                    console.log('Next clicked. psalmsChapterPage:', psalmsChapterPage);
                    renderChapters(chapters, bookShort);
                };
                navWrapper.appendChild(nextBtn);
            }
            // Insert before chapters-list
            chaptersNav.insertBefore(navWrapper, chaptersContainer);
        }

        chaptersToRender.forEach(chapter => {
            const chapterLink = document.createElement('a');
            chapterLink.href = `/books/${bookShort}/${chapter.number}`;
            chapterLink.className = 'chapter-link';
            chapterLink.setAttribute('data-chapter', chapter.number);
            chapterLink.textContent = chapter.number;
            chapterLink.addEventListener('click', (e) => {
                e.preventDefault();
                loadChapter(bookShort, chapter.number);
            });
            chaptersContainer.appendChild(chapterLink);
        });

        // Highlight active chapter
        const chapterNum = getChapterFromUrl();
        if (chapterNum) {
            const activeChapter = chaptersContainer.querySelector(`[data-chapter="${chapterNum}"]`);
            if (activeChapter) {
                activeChapter.classList.add('active');
            }
        }
        console.log('Finished rendering chapters');
    };

    // Helper to paginate an array
    function paginate(array, page_size, page_number) {
        // page_number is 1-based
        return array.slice((page_number - 1) * page_size, page_number * page_size);
    }

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

    /**
     * Load chapter content
     * @param {string} bookShort
     * @param {number} chapterNum
     */
    const loadChapter = async (bookShort, chapterNum) => {
        const chapterContentContainer = document.getElementById('chapter-content-container');
        const chapterContent = document.getElementById('chapter-content');
        const loadingIndicator = document.getElementById('loading-chapter');
        
        if (!chapterContent || !chapterContentContainer) {
            console.error('Chapter content element not found');
            showError('Could not find the chapter content area.');
            return;
        }
        
        try {
            // Show loading state
            chapterContent.innerHTML = '<div class="loading">Loading chapter content...</div>';
            if (loadingIndicator) loadingIndicator.style.display = 'block';
            
            // Update URL without page reload
            if (window.history && window.history.pushState) {
                window.history.pushState(
                    { bookShort, chapterNum },
                    '',
                    `/books/${bookShort}/${chapterNum}`
                );
            }
            
            // Highlight active chapter in navigation
            const chapterLinks = document.querySelectorAll('.chapter-link');
            if (chapterLinks && chapterLinks.length > 0) {
                chapterLinks.forEach(link => {
                    if (link && link.classList) {
                        link.classList.remove('active');
                        if (link.getAttribute('data-chapter') === chapterNum.toString()) {
                            link.classList.add('active');
                        }
                    }
                });
            }
            
            // Fetch chapter data
            console.log(`Fetching chapter data for ${bookShort} chapter ${chapterNum}`);
            const response = await fetch(`/api/books/${bookShort}/${chapterNum}`);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || `HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Chapter data received:', data);
            
            if (!data || !data.book || !data.chapter) {
                throw new Error('Invalid chapter data received from server');
            }
            
            // Render chapter content
            renderChapterContent(data);
            
            // Update document title
            document.title = `${data.book.name} ${data.chapter.number} - Bible App`;
            
        } catch (error) {
            console.error('Error loading chapter:', error);
            const errorMessage = `Failed to load chapter ${chapterNum}. ${error.message || ''}`.trim();
            
            if (chapterContent) {
                chapterContent.innerHTML = `
                    <div class="error-message">
                        <h3>Error Loading Chapter</h3>
                        <p>${errorMessage}</p>
                        <button onclick="location.reload()" class="retry-button">Try Again</button>
                    </div>`;
            } else {
                showError(errorMessage);
            }
        } finally {
            if (loadingIndicator) loadingIndicator.style.display = 'none';
        }
    };

    /**
     * Safely set textContent only if the element exists
     * @param {string} id
     * @param {string} text
     */
    function setElementTextById(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    // --- Main Logic ---
    const main = async () => {
        const bookShort = getBookShortFromUrl();
        const chapterNum = getChapterFromUrl();
        
        // Hide any previous error messages
        const errorContainer = document.getElementById('error-container');
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
        
        if (!bookShort) {
            showError('Invalid book URL.');
            return;
        }

        try {
            // Show loading state for book data
            setElementTextById('book-title', 'Loading...');
            setElementTextById('book-description', 'Please wait while we load the book data...');
            
            const data = await fetchBookData(bookShort);
            console.log('Fetched book data:', data);
            if (!data || !data.book) {
                throw new Error('Invalid book data received from server');
            }
            
            updateBookInfo(data.book);
            
            // Render chapters and handle the current chapter
            if (data.chapters && data.chapters.length > 0) {
                renderChapters(data.chapters, bookShort);
                
                // If there's a chapter in the URL, load it
                if (chapterNum) {
                    await loadChapter(bookShort, chapterNum);
                } else {
                    // Load the first chapter by default
                    await loadChapter(bookShort, 1);
                }
            } else {
                showError('No chapters available for this book.');
            }
            
        } catch (error) {
            console.error('Error in main logic:', error);
            showError(error.message || 'Failed to load book data. Please try again later.');
        } finally {
            // ALWAYS remove loading indicator
            const loadingIndicator = document.getElementById('loading-chapters');
            if (loadingIndicator && loadingIndicator.parentNode) {
                loadingIndicator.parentNode.removeChild(loadingIndicator);
            }
        }
    };
    
    // Start the main logic
    main();
    
    // Handle browser back/forward navigation
    window.addEventListener('popstate', async (event) => {
        if (event.state && event.state.bookShort) {
            const chapter = getChapterFromUrl();
            if (chapter) {
                await loadChapter(event.state.bookShort, chapter);
            }
        }
    });
});
