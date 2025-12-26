# Parchment

A minimal JavaScript library for markdown navigation. Intercepts clicks on markdown links, loads the content, parses it, and renders to the page.

## Quick Start

```html
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script src="parchment.js"></script>

<div id="parchment-content">
  <a href="hello.md">Hello</a>
  <a href="about.md">About</a>
</div>

<script>
  Parchment.init();
</script>
```

## API

### `Parchment.init(options)`

Initialize Parchment with optional configuration.

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | string | `'#parchment-content'` | CSS selector for render target |
| `linkSelector` | string | `'a[href$=".md"]'` | CSS selector for links to intercept |
| `resolver` | function | fetch from path | Async function `(path) => Promise<string>` |
| `parser` | function | `marked.parse` | Function `(markdown) => html` |
| `evalScripts` | boolean | `false` | Execute `<script>` tags in markdown |
| `backLink` | string/null | `null` | URL for back link, or `true` for history.back() |
| `historyMode` | string | `'param'` | `'param'`, `'path'`, or `'none'` |
| `paramName` | string | `'path'` | URL parameter name for path |
| `onNavigate` | function | `null` | Callback before navigation `(path) => void` |
| `onLoad` | function | `null` | Callback after load `(path, element) => void` |

### `Parchment.go(path)`

Programmatically navigate to a markdown path.

```javascript
Parchment.go('/docs/getting-started.md');
```

### `Parchment.bindLinks(container)`

Re-bind link handlers (useful after dynamically adding content).

```javascript
Parchment.bindLinks(document.getElementById('new-content'));
```

## Examples

### Custom resolver (IndexedDB)

```javascript
Parchment.init({
  resolver: async (path) => {
    const db = await openDB('mysite');
    const content = await db.get('pages', path);
    if (!content) throw new Error('Page not found');
    return content;
  }
});
```

### Custom parser

```javascript
Parchment.init({
  parser: (text) => {
    // Use a different markdown library
    return myMarkdownLib.render(text);
  }
});
```

### With callbacks

```javascript
Parchment.init({
  onNavigate: (path) => {
    console.log('Navigating to:', path);
    showLoadingSpinner();
  },
  onLoad: (path, element) => {
    hideLoadingSpinner();
    highlightCode(element);
  }
});
```

## Dependencies

- Requires a markdown parser. [marked.js](https://marked.js.org/) is recommended but not required if you provide a custom `parser`.

## Browser Support

Modern browsers with ES6+ support (async/await, arrow functions, template literals).
