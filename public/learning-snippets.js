document.addEventListener('DOMContentLoaded', () => {
    const verseInput = document.getElementById('verseInput');
    const sourceLanguage = document.getElementById('sourceLanguage');
    const targetLanguage = document.getElementById('targetLanguage');
    const translateBtn = document.getElementById('translateBtn');
    const translatedText = document.getElementById('translatedText');
    const wordBreakdown = document.getElementById('wordBreakdown');
    const grammarNotes = document.getElementById('grammarNotes');

    // Placeholder translation function (replace with actual API later)
    async function translateText(text, sourceLang, targetLang) {
        // In production, replace with actual translation API call
        const mockTranslations = {
            'en-es': 'Traducción simulada del texto en español',
            'en-fr': 'Traduction simulée du texte en français',
            'en-de': 'Simulierte Übersetzung des Textes auf Deutsch'
        };

        return mockTranslations[`${sourceLang}-${targetLang}`] || 
               `Mock translation to ${targetLang}`;
    }

    // Basic word breakdown (very simplified)
    function analyzeWords(text) {
        const words = text.split(/\s+/);
        return words.map(word => `
            <div class="word-analysis">
                <strong>${word}</strong>
                <small>Length: ${word.length} chars</small>
            </div>
        `).join('');
    }

    // Simplified grammar notes generator
    function generateGrammarNotes(text, targetLang) {
        const grammarHints = {
            'es': 'Spanish often uses subject pronouns differently from English.',
            'fr': 'French has gendered nouns and different verb conjugations.',
            'de': 'German has case systems and verb placement can be complex.'
        };

        return `
            <div class="grammar-insight">
                <h4>Language Insight</h4>
                <p>${grammarHints[targetLang] || 'No specific grammar notes available.'}</p>
            </div>
        `;
    }

    translateBtn.addEventListener('click', async () => {
        const text = verseInput.value.trim();
        if (!text) {
            alert('Please enter some text to analyze');
            return;
        }

        const source = sourceLanguage.value;
        const target = targetLanguage.value;

        try {
            const translation = await translateText(text, source, target);
            translatedText.textContent = translation;
            
            // Update learning tools
            wordBreakdown.innerHTML = analyzeWords(text);
            grammarNotes.innerHTML = generateGrammarNotes(text, target);
        } catch (error) {
            console.error('Analysis error:', error);
            translatedText.textContent = 'Analysis failed. Please try again.';
        }
    });
});
