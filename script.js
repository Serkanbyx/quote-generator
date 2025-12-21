/**
 * Quote Generator - Main JavaScript
 * Features: API fetch, clipboard, speech synthesis, dynamic themes, translation
 * 
 * API INTEGRATION:
 * ================
 * This project uses ZenQuotes API.
 * Documentation: https://zenquotes.io/
 * 
 * API Endpoints:
 * - /api/random  : Single random quote
 * - /api/today   : Quote of the day
 * - /api/quotes  : 50 random quotes
 * 
 * Response format (returns as array):
 * [
 *     {
 *         "q": "Quote text here...",
 *         "a": "Author Name",
 *         "h": "<blockquote>...</blockquote>"
 *     }
 * ]
 * 
 * q = quote (quote text)
 * a = author (author name)
 * h = html (pre-formatted HTML)
 * 
 * NOTE: ZenQuotes free tier doesn't support CORS,
 * so we use CORS proxy to fetch data.
 */

// =============================================
// Configuration
// =============================================
const CONFIG = {
    // ZenQuotes API endpoint
    // Documentation: https://zenquotes.io/
    apiUrl: 'https://zenquotes.io/api/random',
    
    // CORS Proxy list - Tries next one if current fails
    // ZenQuotes CORS headers only available for premium users
    corsProxies: [
        'https://api.codetabs.com/v1/proxy?quest=',
        'https://thingproxy.freeboard.io/fetch/'
    ],
    
    // MyMemory Translation API - Free translation service
    // Documentation: https://mymemory.translated.net/doc/spec.php
    translateApiUrl: 'https://api.mymemory.translated.net/get',
    
    // Fallback quotes JSON file path
    fallbackQuotesUrl: './quotes.json',
    
    // localStorage key for cached quotes
    cacheKey: 'cachedQuotes',
    
    // Maximum number of quotes to cache in localStorage
    maxCacheSize: 100,
    
    // Maximum wait time for API request (milliseconds)
    apiTimeout: 10000,
    
    // Toast notification display duration (milliseconds)
    toastDuration: 2500,
    
    // Speech rate (0.1 - 10, 1 = normal)
    speechRate: 0.9,
    
    // Speech pitch (0 - 2, 1 = normal)
    speechPitch: 1
};

// Dynamic color palettes - Randomly selected for each new quote
const COLOR_PALETTES = [
    { primary: '#FF0000', dark: '#AF0404' },
    { primary: '#e74c3c', dark: '#c0392b' },
    { primary: '#d35400', dark: '#e67e22' },
    { primary: '#8e44ad', dark: '#9b59b6' },
    { primary: '#2980b9', dark: '#3498db' },
    { primary: '#16a085', dark: '#1abc9c' },
    { primary: '#27ae60', dark: '#2ecc71' }
];

// =============================================
// State Management
// =============================================
let state = {
    currentQuote: null,      // Current quote text
    currentAuthor: null,     // Current author name
    currentLanguage: 'en',   // Selected language (en/tr)
    isLoading: false,        // Loading state
    isSpeaking: false        // Speech state
};

// =============================================
// DOM Elements
// =============================================
const elements = {
    quoteText: document.getElementById('quote-text'),
    quoteAuthor: document.getElementById('quote-author'),
    btnNewQuote: document.getElementById('btn-new-quote'),
    btnTwitter: document.getElementById('btn-twitter'),
    btnCopy: document.getElementById('btn-copy'),
    btnSpeak: document.getElementById('btn-speak'),
    btnLangEn: document.getElementById('btn-lang-en'),
    btnLangTr: document.getElementById('btn-lang-tr'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toast-message')
};

// =============================================
// Cache & Fallback Functions
// =============================================

/**
 * Saves a quote to localStorage cache
 * Prevents duplicates and respects maxCacheSize limit
 * 
 * @param {Object} quote - Quote object with text and author
 */
function saveQuoteToCache(quote) {
    try {
        const cachedQuotes = getCachedQuotes();
        
        // Check for duplicates (by quote text)
        const isDuplicate = cachedQuotes.some(
            cached => cached.text === quote.text
        );
        
        if (!isDuplicate) {
            cachedQuotes.push(quote);
            
            // Limit cache size - remove oldest quotes if exceeds limit
            while (cachedQuotes.length > CONFIG.maxCacheSize) {
                cachedQuotes.shift();
            }
            
            localStorage.setItem(CONFIG.cacheKey, JSON.stringify(cachedQuotes));
            console.log(`Quote cached. Total cached: ${cachedQuotes.length}`);
        }
    } catch (error) {
        console.warn('Failed to cache quote:', error.message);
    }
}

/**
 * Retrieves all cached quotes from localStorage
 * 
 * @returns {Array} - Array of cached quote objects
 */
function getCachedQuotes() {
    try {
        const cached = localStorage.getItem(CONFIG.cacheKey);
        return cached ? JSON.parse(cached) : [];
    } catch (error) {
        console.warn('Failed to read cache:', error.message);
        return [];
    }
}

/**
 * Gets a random quote from localStorage cache
 * 
 * @returns {Object|null} - Random quote object or null if cache is empty
 */
function getRandomCachedQuote() {
    const cachedQuotes = getCachedQuotes();
    
    if (cachedQuotes.length === 0) {
        return null;
    }
    
    const randomIndex = Math.floor(Math.random() * cachedQuotes.length);
    return cachedQuotes[randomIndex];
}

/**
 * Fetches fallback quotes from quotes.json file
 * Used when API fails and localStorage cache is empty
 * 
 * @returns {Promise<Array>} - Array of quote objects
 */
async function fetchFallbackQuotes() {
    try {
        const response = await fetch(CONFIG.fallbackQuotesUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to load fallback quotes: ${response.status}`);
        }
        
        const data = await response.json();
        return data.quotes || [];
        
    } catch (error) {
        console.error('Failed to fetch fallback quotes:', error.message);
        return [];
    }
}

/**
 * Gets a random quote from fallback JSON file
 * 
 * @returns {Promise<Object|null>} - Random quote object or null
 */
async function getRandomFallbackQuote() {
    const fallbackQuotes = await fetchFallbackQuotes();
    
    if (fallbackQuotes.length === 0) {
        return null;
    }
    
    const randomIndex = Math.floor(Math.random() * fallbackQuotes.length);
    const quote = fallbackQuotes[randomIndex];
    
    // Convert from JSON format (q, a) to app format (text, author)
    return {
        text: quote.q,
        author: quote.a
    };
}

/**
 * Gets a quote from fallback sources (cache or JSON file)
 * Priority: 1. localStorage cache, 2. quotes.json file
 * 
 * @returns {Promise<Object|null>} - Quote object or null if all sources fail
 */
async function getQuoteFromFallback() {
    // Try localStorage cache first
    const cachedQuote = getRandomCachedQuote();
    
    if (cachedQuote) {
        console.log('Using cached quote from localStorage');
        return cachedQuote;
    }
    
    // Try fallback JSON file
    console.log('Cache empty, trying fallback JSON file...');
    const fallbackQuote = await getRandomFallbackQuote();
    
    if (fallbackQuote) {
        console.log('Using quote from fallback JSON file');
        return fallbackQuote;
    }
    
    // All sources failed
    return null;
}

// =============================================
// API Functions
// =============================================

/**
 * Tries to fetch data from API using a single proxy
 * @param {string} proxyUrl - Proxy URL to use
 * @returns {Promise<{text: string, author: string}>}
 */
async function tryFetchWithProxy(proxyUrl) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.apiTimeout);
    
    try {
        const fullUrl = proxyUrl + encodeURIComponent(CONFIG.apiUrl);
        
        const response = await fetch(fullUrl, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const quote = data[0];
        
        // Check for API rate limit error message
        // ZenQuotes returns this as a "quote" when rate limited
        if (quote.q && quote.q.toLowerCase().includes('too many requests')) {
            throw new Error('API rate limit exceeded');
        }
        
        // Clean author name
        // Sometimes API returns "zenquotes.io" or empty value
        let author = quote.a;
        if (!author || author === 'zenquotes.io' || author === 'type.fit') {
            author = 'Unknown';
        }
        
        return {
            text: quote.q,
            author: author
        };
        
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Fetches a random quote from ZenQuotes API
 * Tries multiple CORS proxies, uses next one if current fails
 * 
 * ZENQUOTES API:
 * - Endpoint: https://zenquotes.io/api/random
 * - Response format: [{ "q": "quote", "a": "author", "h": "html" }]
 * - q = quote (quote text)
 * - a = author (author name)
 * 
 * CORS ISSUE:
 * - ZenQuotes doesn't send CORS headers for free users
 * - Therefore we use CORS proxy
 * - Multiple proxies increase reliability
 * 
 * @returns {Promise<{text: string, author: string}>}
 */
async function fetchQuoteFromApi() {
    let lastError;
    
    // Try all proxies sequentially
    for (const proxy of CONFIG.corsProxies) {
        try {
            console.log(`Trying proxy: ${proxy}`);
            const quote = await tryFetchWithProxy(proxy);
            console.log('Quote fetched successfully!');
            return quote;
        } catch (error) {
            console.warn(`Proxy failed (${proxy}):`, error.message);
            lastError = error;
            // Try next proxy
            continue;
        }
    }
    
    // Throw error if all proxies failed
    throw lastError || new Error('All proxies failed');
}

/**
 * Translates text to another language
 * 
 * MYMEMORY TRANSLATION API:
 * - Endpoint: https://api.mymemory.translated.net/get
 * - Parameters: q (text), langpair (source|target)
 * - Free: 5000 words per day limit
 * - Supports CORS (no proxy needed)
 * 
 * @param {string} text - Text to translate
 * @param {string} fromLang - Source language (e.g., 'en')
 * @param {string} toLang - Target language (e.g., 'tr')
 * @returns {Promise<string>} - Translated text
 */
async function translateText(text, fromLang, toLang) {
    try {
        // Build API URL
        const url = `${CONFIG.translateApiUrl}?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Translation API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // API response format: { responseData: { translatedText: "..." } }
        if (data.responseStatus === 200 && data.responseData) {
            return data.responseData.translatedText;
        }
        
        // Return original text if translation fails
        console.warn('Translation failed, using original text');
        return text;
        
    } catch (error) {
        console.error('Translation error:', error.message);
        // Return original text on error
        return text;
    }
}

/**
 * Main function - Fetches a new quote
 * 
 * HOW ASYNC/AWAIT WORKS:
 * - async: Indicates the function is asynchronous
 * - await: Waits for Promise to resolve
 * - try/catch: Catches errors
 * 
 * FALLBACK MECHANISM:
 * - First tries to fetch from API
 * - On success: saves quote to localStorage cache
 * - On failure: uses cached quotes or fallback JSON file
 * 
 * TRANSLATION FEATURE:
 * - If Turkish is selected, quote is automatically translated
 * - Uses MyMemory API
 */
async function getQuote() {
    // Exit if already loading
    if (state.isLoading) return;
    
    // Start loading state
    setLoadingState(true);
    
    let quote = null;
    let isFromFallback = false;
    
    try {
        // Try to fetch quote from API (English)
        quote = await fetchQuoteFromApi();
        
        // Save to cache for future fallback use
        saveQuoteToCache(quote);
        
    } catch (error) {
        // API failed - try fallback sources
        console.warn('API Error:', error.message);
        console.log('Attempting to use fallback quotes...');
        
        quote = await getQuoteFromFallback();
        isFromFallback = true;
    }
    
    // Process and display quote
    if (quote) {
        let displayText = quote.text;
        
        // Translate if Turkish is selected
        if (state.currentLanguage === 'tr') {
            console.log('Translating quote to Turkish...');
            displayText = await translateText(quote.text, 'en', 'tr');
            console.log('Translation complete!');
        }
        
        // Display quote on screen
        displayQuote(displayText, quote.author);
        
        // Show info if using fallback
        if (isFromFallback) {
            console.log('Quote served from fallback source');
        }
        
    } else {
        // All sources failed
        console.error('All quote sources failed');
        displayError();
    }
    
    // Always close loading state and change theme
    setLoadingState(false);
    changeTheme();
}

// =============================================
// Display Functions
// =============================================

/**
 * Writes the quote to DOM
 * @param {string} text - Quote text
 * @param {string} author - Author name
 */
function displayQuote(text, author) {
    // Update state
    state.currentQuote = text;
    state.currentAuthor = author;
    
    // Hide skeletons
    hideSkeletons();
    
    // Update quote text
    elements.quoteText.textContent = `"${text}"`;
    elements.quoteText.classList.add('fade-in');
    
    // Update author name
    const authorName = elements.quoteAuthor.querySelector('.author-name');
    authorName.textContent = author || 'Unknown';
    elements.quoteAuthor.classList.add('fade-in');
    
    // Remove animation classes
    setTimeout(() => {
        elements.quoteText.classList.remove('fade-in');
        elements.quoteAuthor.classList.remove('fade-in');
    }, 500);
}

/**
 * Displays error message
 */
function displayError() {
    hideSkeletons();
    
    const errorText = state.currentLanguage === 'tr' 
        ? 'Alinti yuklenemedi. Lutfen tekrar deneyin.'
        : 'Failed to load quote. Please try again.';
    
    elements.quoteText.textContent = errorText;
    
    const authorName = elements.quoteAuthor.querySelector('.author-name');
    authorName.textContent = '';
}

/**
 * Shows skeleton loading animations
 */
function showSkeletons() {
    elements.quoteText.innerHTML = `
        <div class="skeleton skeleton-text" aria-hidden="true"></div>
        <div class="skeleton skeleton-text skeleton-short" aria-hidden="true"></div>
    `;
    
    const authorName = elements.quoteAuthor.querySelector('.author-name');
    authorName.innerHTML = '<div class="skeleton skeleton-author" aria-hidden="true"></div>';
}

/**
 * Hides skeleton loading animations
 */
function hideSkeletons() {
    const skeletons = document.querySelectorAll('.skeleton');
    skeletons.forEach(skeleton => skeleton.classList.add('hidden'));
}

/**
 * Sets loading state
 * @param {boolean} loading
 */
function setLoadingState(loading) {
    state.isLoading = loading;
    
    if (loading) {
        elements.btnNewQuote.classList.add('loading');
        showSkeletons();
    } else {
        elements.btnNewQuote.classList.remove('loading');
    }
}

// =============================================
// Theme Functions
// =============================================

/**
 * Selects and applies random color palette
 * 
 * CSS VARIABLES:
 * - Variables defined in :root
 * - Changed via document.documentElement.style.setProperty()
 */
function changeTheme() {
    // Select random palette
    const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    
    // Update CSS variables
    document.documentElement.style.setProperty('--color-primary', palette.primary);
    document.documentElement.style.setProperty('--color-primary-dark', palette.dark);
}

// =============================================
// Social & Utility Functions
// =============================================

/**
 * Shares quote on X (Twitter)
 * 
 * X INTENT API:
 * - URL: https://twitter.com/intent/tweet?text=...
 * - encodeURIComponent: Makes special characters URL-safe
 * - Note: The intent URL still uses twitter.com domain
 */
function tweetQuote() {
    if (!state.currentQuote) return;
    
    const tweetText = encodeURIComponent(`"${state.currentQuote}" - ${state.currentAuthor}`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
    
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Copies quote to clipboard
 * 
 * CLIPBOARD API:
 * - navigator.clipboard.writeText() - Modern method
 * - Returns Promise, used with async/await
 */
async function copyToClipboard() {
    if (!state.currentQuote) return;
    
    const textToCopy = `"${state.currentQuote}" - ${state.currentAuthor}`;
    
    try {
        // Modern Clipboard API
        await navigator.clipboard.writeText(textToCopy);
        
        // Show success state
        elements.btnCopy.classList.add('copied');
        elements.btnCopy.innerHTML = '<i class="fas fa-check" aria-hidden="true"></i>';
        
        // Show toast notification
        showToast();
        
        // Reset button
        setTimeout(() => {
            elements.btnCopy.classList.remove('copied');
            elements.btnCopy.innerHTML = '<i class="fas fa-copy" aria-hidden="true"></i>';
        }, CONFIG.toastDuration);
        
    } catch (error) {
        console.error('Failed to copy:', error);
        fallbackCopyToClipboard(textToCopy);
    }
}

/**
 * Fallback copy method for older browsers
 * @param {string} text
 */
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        showToast();
    } catch (error) {
        console.error('Fallback copy failed:', error);
    }
    
    document.body.removeChild(textArea);
}

/**
 * Shows toast notification
 */
function showToast() {
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, CONFIG.toastDuration);
}

// =============================================
// Speech Synthesis Functions
// =============================================

/**
 * Reads the quote aloud
 * 
 * WEB SPEECH API:
 * - window.speechSynthesis - Speech synthesis service
 * - SpeechSynthesisUtterance - Text to be spoken object
 * - rate: Speech rate
 * - pitch: Voice pitch
 * - lang: Language code
 */
function speakQuote() {
    if (!state.currentQuote) return;
    
    // Check browser support
    if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported');
        return;
    }
    
    // Stop if already speaking
    if (state.isSpeaking) {
        window.speechSynthesis.cancel();
        setSpeakingState(false);
        return;
    }
    
    // Prepare text to speak
    const textToSpeak = `${state.currentQuote}. By ${state.currentAuthor}`;
    
    // Create utterance object
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Voice settings
    utterance.rate = CONFIG.speechRate;
    utterance.pitch = CONFIG.speechPitch;
    utterance.lang = state.currentLanguage === 'tr' ? 'tr-TR' : 'en-US';
    
    // Event handlers
    utterance.onstart = () => setSpeakingState(true);
    utterance.onend = () => setSpeakingState(false);
    utterance.onerror = () => setSpeakingState(false);
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
}

/**
 * Sets speaking state
 * @param {boolean} speaking
 */
function setSpeakingState(speaking) {
    state.isSpeaking = speaking;
    
    if (speaking) {
        elements.btnSpeak.classList.add('speaking');
        elements.btnSpeak.innerHTML = '<i class="fas fa-stop" aria-hidden="true"></i>';
    } else {
        elements.btnSpeak.classList.remove('speaking');
        elements.btnSpeak.innerHTML = '<i class="fas fa-volume-up" aria-hidden="true"></i>';
    }
}

// =============================================
// Language Functions
// =============================================

/**
 * Changes language
 * @param {string} lang - Language code ('en' or 'tr')
 */
async function changeLanguage(lang) {
    if (state.currentLanguage === lang) return;
    
    state.currentLanguage = lang;
    
    // Update button states
    elements.btnLangEn.classList.toggle('active', lang === 'en');
    elements.btnLangTr.classList.toggle('active', lang === 'tr');
    elements.btnLangEn.setAttribute('aria-pressed', lang === 'en');
    elements.btnLangTr.setAttribute('aria-pressed', lang === 'tr');
    
    // Update page content
    updateLanguageContent(lang);
    
    // Fetch new quote
    getQuote();
}

/**
 * Updates content based on data-en/data-tr attributes
 * @param {string} lang
 */
function updateLanguageContent(lang) {
    // NOTE: Using 'langElements' because global 'elements' variable exists
    const langElements = document.querySelectorAll('[data-en][data-tr]');
    
    langElements.forEach(el => {
        const text = lang === 'tr' ? el.dataset.tr : el.dataset.en;
        
        if (el.tagName === 'TITLE') {
            document.title = text;
        } else if (el.hasAttribute('title')) {
            el.setAttribute('title', text);
        } else {
            el.textContent = text;
        }
    });
    
    // Update HTML lang attribute
    document.documentElement.lang = lang === 'tr' ? 'tr' : 'en';
}

// =============================================
// Event Listeners
// =============================================

/**
 * Initializes all event listeners
 */
function initEventListeners() {
    // New quote button
    elements.btnNewQuote.addEventListener('click', getQuote);
    
    // Twitter share button
    elements.btnTwitter.addEventListener('click', tweetQuote);
    
    // Copy to clipboard button
    elements.btnCopy.addEventListener('click', copyToClipboard);
    
    // Text to speech button
    elements.btnSpeak.addEventListener('click', speakQuote);
    
    // Language toggle buttons
    elements.btnLangEn.addEventListener('click', () => changeLanguage('en'));
    elements.btnLangTr.addEventListener('click', () => changeLanguage('tr'));
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

/**
 * Handles keyboard shortcuts
 * @param {KeyboardEvent} event
 */
function handleKeyboardShortcuts(event) {
    // Ignore if typing in input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    switch (event.key.toLowerCase()) {
        case ' ':
        case 'enter':
            if (document.activeElement === elements.btnNewQuote) return;
            event.preventDefault();
            getQuote();
            break;
        case 'c':
            if (event.ctrlKey || event.metaKey) return;
            copyToClipboard();
            break;
        case 't':
            tweetQuote();
            break;
        case 's':
            speakQuote();
            break;
    }
}

// =============================================
// Initialization
// =============================================

/**
 * Initializes the application
 */
function init() {
    // Initialize event listeners
    initEventListeners();
    
    // Fetch initial quote
    getQuote();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
