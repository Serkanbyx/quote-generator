# 💬 Quote Generator

A modern, accessible random quote generator with dynamic themes, real-time translation, speech synthesis, dark/light mode, and favorite quotes functionality. Get inspired with quotes from influential figures throughout history!

[![Created by Serkanby](https://img.shields.io/badge/Created%20by-Serkanby-blue?style=flat-square)](https://serkanbayraktar.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Serkanbyx-181717?style=flat-square&logo=github)](https://github.com/Serkanbyx)

## Features

- **Random Quotes**: Fetches inspiring quotes from ZenQuotes API with over 1500+ quotes available
- **Real-Time Translation**: Automatic translation to Turkish using MyMemory Translation API
- **Text-to-Speech**: Listen to quotes with Web Speech API integration and language detection
- **Dynamic Themes**: Random color palette changes with smooth transitions on each new quote
- **Dark/Light Mode**: Toggle between dark and light themes with system preference detection
- **Favorite Quotes**: Save your favorite quotes to localStorage with a beautiful slide-in panel
- **Social Sharing**: One-click sharing to X (Twitter) with pre-formatted quote text
- **Clipboard Copy**: Copy quotes instantly with modern Clipboard API and visual feedback
- **Skeleton Loading**: Modern loading states with shimmer animation for better UX
- **Multi-Language UI**: Complete English and Turkish interface support
- **Keyboard Shortcuts**: Quick actions with keyboard navigation for power users
- **Fully Responsive**: Works perfectly on all devices from mobile to desktop
- **Accessible**: ARIA labels, screen reader support, high contrast mode, and reduced motion support

## Live Demo

[🎮 View Live Demo](https://serkanbyx.github.io/quote-generator/)

## Technologies

- **HTML5**: Semantic markup with ARIA attributes for maximum accessibility
- **CSS3**: Custom properties, Flexbox, Grid, smooth animations, and dark/light theme support
- **Vanilla JavaScript (ES6+)**: Async/await, Fetch API, modular code structure, no dependencies
- **ZenQuotes API**: Source for inspirational quotes with 1500+ quotes database
- **MyMemory Translation API**: Real-time quote translation with 5000 words/day free tier
- **Web Speech API**: Text-to-speech functionality with language detection
- **Clipboard API**: Modern clipboard access with fallback for older browsers
- **LocalStorage API**: Persistent storage for favorites, theme preference, and quote cache
- **Font Awesome 6**: Beautiful, accessible icons
- **Google Fonts**: Playfair Display (headings) & Source Sans 3 (body text)

## Installation

### Local Development

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Serkanbyx/quote-generator.git
   cd quote-generator
   ```

2. **Start a local server** (choose one):

   Using Node.js:

   ```bash
   npx serve
   ```

   Using Python:

   ```bash
   python -m http.server 8000
   ```

   Using VS Code:

   - Install "Live Server" extension
   - Right-click on `index.html` and select "Open with Live Server"

3. **Open in browser**:
   ```
   http://localhost:3000
   ```

## Usage

1. **Get a Quote**: Click the "New Quote" button or press `Space`/`Enter` key
2. **Change Language**: Click `EN` or `TR` buttons to switch interface and quote language
3. **Listen**: Click the speaker icon or press `S` to hear the quote read aloud
4. **Copy**: Click the copy icon or press `C` to copy the quote to clipboard
5. **Share**: Click the X icon or press `T` to share on X (Twitter)
6. **Favorite**: Click the heart icon or press `F` to save the quote to favorites
7. **Toggle Theme**: Click the moon/sun icon or press `D` to switch dark/light mode
8. **View Favorites**: Click the heart button with badge to open favorites panel

### Keyboard Shortcuts

| Key               | Action                 |
| ----------------- | ---------------------- |
| `Space` / `Enter` | Get new quote          |
| `C`               | Copy to clipboard      |
| `T`               | Share on X (Twitter)   |
| `S`               | Toggle speech          |
| `F`               | Toggle favorite        |
| `D`               | Toggle dark/light mode |
| `Escape`          | Close favorites panel  |

## How It Works?

### API Integration

The application fetches quotes from ZenQuotes API through CORS proxies (since free tier doesn't support CORS):

```javascript
const CONFIG = {
  apiUrl: "https://zenquotes.io/api/random",
  corsProxies: [
    "https://api.codetabs.com/v1/proxy?quest=",
    "https://thingproxy.freeboard.io/fetch/",
  ],
};
```

### Fallback System

The app uses a 3-tier fallback system for reliability:

1. **Primary**: Fetch from ZenQuotes API via CORS proxy
2. **Secondary**: Use cached quotes from localStorage
3. **Tertiary**: Load quotes from local `quotes.json` file

```javascript
async function getQuoteFromFallback() {
  // Try localStorage cache first
  const cachedQuote = getRandomCachedQuote();
  if (cachedQuote) return cachedQuote;

  // Try fallback JSON file
  const fallbackQuote = await getRandomFallbackQuote();
  if (fallbackQuote) return fallbackQuote;

  return null;
}
```

### Translation System

When Turkish is selected, quotes are automatically translated using MyMemory API:

```javascript
async function translateText(text, fromLang, toLang) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=${fromLang}|${toLang}`;
  const response = await fetch(url);
  const data = await response.json();
  return data.responseData.translatedText;
}
```

### Dynamic Theme System

Colors change randomly with each new quote using CSS custom properties:

```javascript
const COLOR_PALETTES = [
  { primary: "#FF0000", dark: "#AF0404" },
  { primary: "#e74c3c", dark: "#c0392b" },
  { primary: "#8e44ad", dark: "#9b59b6" },
  // ... more palettes
];

function changeTheme() {
  const palette =
    COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
  document.documentElement.style.setProperty(
    "--color-primary",
    palette.primary
  );
  document.documentElement.style.setProperty(
    "--color-primary-dark",
    palette.dark
  );
}
```

### Dark/Light Mode

Theme preference is detected from system and persisted to localStorage:

```javascript
function loadTheme() {
  const savedTheme = localStorage.getItem("theme");

  if (!savedTheme) {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    state.currentTheme = prefersDark ? "dark" : "light";
  } else {
    state.currentTheme = savedTheme;
  }

  applyTheme();
}
```

### Favorites System

Favorites are stored in localStorage with full CRUD operations:

```javascript
function toggleFavorite() {
  const currentQuote = {
    text: state.currentQuote,
    author: state.currentAuthor,
    addedAt: new Date().toISOString(),
  };

  const index = state.favorites.findIndex((q) => q.text === currentQuote.text);

  if (index === -1) {
    state.favorites.unshift(currentQuote);
  } else {
    state.favorites.splice(index, 1);
  }

  saveFavorites();
  updateFavoriteButton();
}
```

## Customization

### Add Your Own Color Palettes

Edit the `COLOR_PALETTES` array in `script.js`:

```javascript
const COLOR_PALETTES = [
  { primary: "#your-color", dark: "#your-dark-color" },
  { primary: "#3498db", dark: "#2980b9" }, // Blue theme
  { primary: "#9b59b6", dark: "#8e44ad" }, // Purple theme
  // Add more palettes...
];
```

### Change API Timeout

Modify the timeout value in `CONFIG`:

```javascript
const CONFIG = {
  apiTimeout: 10000, // 10 seconds (default)
  // ...
};
```

### Adjust Speech Settings

Customize speech rate and pitch:

```javascript
const CONFIG = {
  speechRate: 0.9, // 0.1 - 10 (1 = normal)
  speechPitch: 1, // 0 - 2 (1 = normal)
  // ...
};
```

### Customize Light Mode Colors

Edit the CSS variables in `style.css`:

```css
:root[data-theme="light"] {
  --color-bg-dark: #f8f9fa;
  --color-bg-medium: #ffffff;
  --color-text-primary: #1a1a1a;
  /* ... more variables */
}
```

## Features in Detail

### Completed Features

- ✅ Random quote fetching from API
- ✅ CORS proxy fallback system
- ✅ Real-time translation (EN/TR)
- ✅ Text-to-speech with language detection
- ✅ Copy to clipboard with toast notification
- ✅ X (Twitter) sharing
- ✅ Dynamic color themes
- ✅ Skeleton loading states
- ✅ Keyboard shortcuts
- ✅ Responsive design
- ✅ Accessibility features (ARIA, reduced motion)
- ✅ Save favorite quotes to localStorage
- ✅ Dark/Light mode toggle with system preference
- ✅ SEO optimizations (Open Graph, Twitter Cards, Favicon)
- ✅ Favorites panel with copy, share, delete actions

### Future Features

- [ ] Quote categories/tags filter
- [ ] More language options (Spanish, German, French)
- [ ] Quote of the day notification
- [ ] Share to more platforms (WhatsApp, LinkedIn, Facebook)
- [ ] Export favorites as JSON/PDF
- [ ] Quote search functionality
- [ ] PWA support for offline usage

## Project Structure

```
quote-generator/
├── index.html          # Semantic HTML with accessibility features
├── style.css           # Modern CSS with custom properties & themes
├── script.js           # ES6+ JavaScript with API integration
├── quotes.json         # Fallback quotes database (50 quotes)
├── favicon.svg         # SVG favicon with gradient
├── README.md           # Project documentation
├── LICENSE             # MIT License
├── CONTRIBUTING.md     # Contribution guidelines
├── CODE_OF_CONDUCT.md  # Code of conduct
├── SECURITY.md         # Security policy
└── .github/
    └── ISSUE_TEMPLATE/ # GitHub issue templates
```

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push** to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Commit Message Format

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

## License

This project is open source and available under the [MIT License](LICENSE).

## Developer

**Serkanby**

- Website: [serkanbayraktar.com](https://serkanbayraktar.com/)
- GitHub: [@Serkanbyx](https://github.com/Serkanbyx)
- Email: serkanbyx1@gmail.com

## Acknowledgments

- [ZenQuotes API](https://zenquotes.io/) - Inspirational quotes source
- [MyMemory Translation API](https://mymemory.translated.net/) - Translation service
- [Font Awesome](https://fontawesome.com/) - Icons
- [Google Fonts](https://fonts.google.com/) - Typography (Playfair Display, Source Sans 3)
- [Shields.io](https://shields.io/) - Badges

## Contact

- **Issues**: [GitHub Issues](https://github.com/Serkanbyx/quote-generator/issues)
- **Email**: serkanbyx1@gmail.com
- **Website**: [serkanbayraktar.com](https://serkanbayraktar.com/)

---

⭐ If you like this project, don't forget to give it a star!
