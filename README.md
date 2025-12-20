# 💬 Quote Generator

A modern, accessible random quote generator with dynamic themes, real-time translation, speech synthesis, and social sharing capabilities. Get inspired with quotes from influential figures throughout history!

[![Created by Serkanby](https://img.shields.io/badge/Created%20by-Serkanby-blue?style=flat-square)](https://serkanbayraktar.com/)
[![GitHub](https://img.shields.io/badge/GitHub-Serkanbyx-181717?style=flat-square&logo=github)](https://github.com/Serkanbyx)

## Features

- **Random Quotes**: Fetches inspiring quotes from ZenQuotes API with over 1500+ quotes
- **Real-Time Translation**: Automatic translation to Turkish using MyMemory Translation API
- **Text-to-Speech**: Listen to quotes with Web Speech API integration
- **Dynamic Themes**: Random color palette changes with smooth transitions on each new quote
- **Social Sharing**: One-click sharing to X (Twitter)
- **Clipboard Copy**: Copy quotes instantly with Clipboard API
- **Skeleton Loading**: Modern loading states for better UX
- **Multi-Language UI**: English and Turkish interface support
- **Keyboard Shortcuts**: Quick actions with keyboard navigation
- **Fully Responsive**: Works perfectly on all devices
- **Accessible**: ARIA labels, screen reader support, reduced motion support

## Live Demo

[🎮 View Live Demo](https://serkanbyx.github.io/quote-generator/)

## Technologies

- **HTML5**: Semantic markup with ARIA attributes for accessibility
- **CSS3**: Custom properties, Flexbox, Grid, smooth animations and transitions
- **Vanilla JavaScript (ES6+)**: Async/await, Fetch API, modular code structure
- **ZenQuotes API**: Source for inspirational quotes
- **MyMemory Translation API**: Real-time quote translation
- **Web Speech API**: Text-to-speech functionality
- **Clipboard API**: Modern clipboard access
- **Font Awesome 6**: Beautiful icons
- **Google Fonts**: Playfair Display & Source Sans 3

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

1. **Get a Quote**: Click the "New Quote" button or press `Space`/`Enter`
2. **Change Language**: Click `EN` or `TR` buttons to switch language
3. **Listen**: Click the speaker icon to hear the quote read aloud
4. **Copy**: Click the copy icon to copy the quote to clipboard
5. **Share**: Click the X icon to share on X (Twitter)

### Keyboard Shortcuts

| Key               | Action            |
| ----------------- | ----------------- |
| `Space` / `Enter` | Get new quote     |
| `C`               | Copy to clipboard |
| `T`               | Share on X        |
| `S`               | Toggle speech     |

## How It Works?

### API Integration

The application fetches quotes from ZenQuotes API through a CORS proxy:

```javascript
const CONFIG = {
  apiUrl: "https://zenquotes.io/api/random",
  corsProxies: [
    "https://api.codetabs.com/v1/proxy?quest=",
    "https://thingproxy.freeboard.io/fetch/",
  ],
};
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

Colors change randomly with each new quote:

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
}
```

## Customization

### Add Your Own Color Palettes

Edit the `COLOR_PALETTES` array in `script.js`:

```javascript
const COLOR_PALETTES = [
  { primary: "#your-color", dark: "#your-dark-color" },
  // Add more palettes...
];
```

### Change API Timeout

Modify the timeout value in `CONFIG`:

```javascript
const CONFIG = {
  apiTimeout: 10000, // 10 seconds
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
- ✅ Accessibility features

### Future Features

- [ ] Save favorite quotes to localStorage
- [ ] Quote categories/tags filter
- [ ] More language options
- [ ] Quote of the day notification
- [ ] Dark/Light mode toggle
- [ ] Share to more platforms (WhatsApp, LinkedIn)

## Project Structure

```
quote-generator/
├── index.html          # Semantic HTML with accessibility
├── style.css           # Modern CSS with custom properties
├── script.js           # ES6+ JavaScript with API integration
└── README.md           # Project documentation
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
- [Google Fonts](https://fonts.google.com/) - Typography

## Contact

- **Issues**: [GitHub Issues](https://github.com/Serkanbyx/quote-generator/issues)
- **Email**: serkanbyx1@gmail.com
- **Website**: [serkanbayraktar.com](https://serkanbayraktar.com/)

---

⭐ If you like this project, don't forget to give it a star!
