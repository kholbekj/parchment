# CLAUDE.md

## Project Overview

Parchment is a minimal JavaScript library for markdown navigation. It intercepts clicks on `.md` links, loads the content, parses it with marked.js (or a custom parser), and renders it to a target element.

## File Structure

```
parchment/
├── parchment.js    # The library (single file, no build step)
├── PROJECT.md      # User documentation
├── CLAUDE.md       # This file
└── example.html    # Usage example (to be created)
```

## Architecture

The library exposes a global `Parchment` object with:
- `init(options)` - Initialize with config
- `go(path)` - Navigate programmatically
- `navigate(path, updateHistory)` - Internal navigation
- `bindLinks(container)` - Bind click handlers to `.md` links

### Core Flow

1. User clicks a `.md` link
2. `resolver(path)` fetches the markdown content
3. `parser(text)` converts markdown to HTML
4. `render()` injects HTML into target element
5. `bindLinks()` re-binds handlers on new content

### Key Config Options

- `target` - CSS selector for render target
- `resolver` - Async function to load content (default: fetch)
- `parser` - Function to parse markdown (default: marked.parse)
- `historyMode` - How to handle browser history

## Development Guidelines

- Keep it minimal - no build step, no dependencies (marked.js is optional)
- Single file distribution
- ES6+ but broadly compatible
- No frameworks

## Testing

Create an `example.html` with some `.md` files to test manually. No test framework yet.

## Commands

Since there's no build step, just serve the directory:
```bash
python3 -m http.server 8000
# or
npx serve .
```
