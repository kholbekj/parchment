/**
 * Parchment - A minimal markdown navigation library
 *
 * Intercepts markdown link clicks, loads content, parses it, and renders to the page.
 */
(function (global) {
  'use strict';

  const defaults = {
    target: '#parchment-content',
    linkSelector: 'a[href$=".md"]',
    resolver: defaultResolver,
    parser: defaultParser,
    evalScripts: false,
    backLink: null,
    onNavigate: null,
    onLoad: null,
    historyMode: 'param', // 'param' uses ?path=, 'path' uses pushState with path, 'none' disables
    paramName: 'path',
  };

  let config = {};
  let targetElement = null;

  /**
   * Default resolver - fetches markdown from URL
   */
  async function defaultResolver(path) {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load ${path}: ${response.status}`);
    }
    return response.text();
  }

  /**
   * Default parser - uses marked.js if available, otherwise returns raw text
   */
  function defaultParser(text) {
    if (typeof marked !== 'undefined' && marked.parse) {
      return marked.parse(text);
    }
    console.warn('Parchment: marked.js not found, returning raw markdown');
    return `<pre>${escapeHtml(text)}</pre>`;
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Bind click handlers to markdown links
   */
  function bindLinks(container) {
    const root = container || document;
    root.querySelectorAll(config.linkSelector).forEach(function (link) {
      // Skip already bound links
      if (link.hasAttribute('data-parchment-bound')) return;
      link.setAttribute('data-parchment-bound', 'true');

      link.addEventListener('click', function (event) {
        event.preventDefault();
        const path = this.getAttribute('href');
        navigate(path);
      });
    });
  }

  /**
   * Navigate to a markdown path
   */
  async function navigate(path, updateHistory = true) {
    if (config.onNavigate) {
      const result = config.onNavigate(path);
      if (result === false) return;
    }

    try {
      const text = await config.resolver(path);
      const html = config.parser(text);
      render(html, path, updateHistory);
    } catch (error) {
      console.error('Parchment: Failed to load content', error);
      targetElement.innerHTML = `<p>Error loading content: ${escapeHtml(error.message)}</p>`;
    }
  }

  /**
   * Render HTML content to the target element
   */
  function render(html, path, updateHistory) {
    let content = html;

    // Add back link if configured
    if (config.backLink) {
      const backHtml = typeof config.backLink === 'string'
        ? `<a href="${config.backLink}">Back</a><br><br>`
        : '<a href="javascript:history.back()">Back</a><br><br>';
      content = backHtml + content;
    }

    targetElement.innerHTML = content;

    // Eval scripts if enabled
    if (config.evalScripts) {
      evalScripts(targetElement);
    }

    window.scrollTo(0, 0);

    // Update history
    if (updateHistory && config.historyMode !== 'none') {
      let url;
      if (config.historyMode === 'param') {
        // Preserve existing query params, only update the path param
        const params = new URLSearchParams(window.location.search);
        params.set(config.paramName, path);
        url = `${window.location.pathname}?${params.toString()}`;
      } else {
        url = path;
      }
      history.pushState({ parchmentPath: path }, '', url);
    }

    // Rebind links in new content
    bindLinks(targetElement);

    if (config.onLoad) {
      config.onLoad(path, targetElement);
    }
  }

  /**
   * Recursively evaluate script tags
   */
  function evalScripts(element) {
    if (element.tagName === 'SCRIPT') {
      if (element.src) {
        const script = document.createElement('script');
        script.src = element.src;
        document.head.appendChild(script);
      } else {
        eval(element.innerHTML);
      }
    } else {
      element.childNodes.forEach(evalScripts);
    }
  }

  /**
   * Handle browser back/forward
   */
  function handlePopState(event) {
    if (event.state && event.state.parchmentPath) {
      navigate(event.state.parchmentPath, false);
    } else {
      // Check URL params for path
      const urlParams = new URLSearchParams(window.location.search);
      const path = urlParams.get(config.paramName);
      if (path) {
        navigate(path, false);
      }
    }
  }

  /**
   * Initialize Parchment
   */
  function init(options = {}) {
    config = Object.assign({}, defaults, options);

    targetElement = document.querySelector(config.target);
    if (!targetElement) {
      console.error(`Parchment: Target element "${config.target}" not found`);
      return false;
    }

    // Check for path in URL params on init
    const urlParams = new URLSearchParams(window.location.search);
    const initialPath = urlParams.get(config.paramName);

    if (initialPath) {
      navigate(initialPath, false);
    } else {
      bindLinks();
    }

    // Handle browser navigation
    window.addEventListener('popstate', handlePopState);

    return true;
  }

  /**
   * Programmatically navigate to a path
   */
  function go(path) {
    return navigate(path);
  }

  /**
   * Get current configuration
   */
  function getConfig() {
    return Object.assign({}, config);
  }

  // Public API
  global.Parchment = {
    init: init,
    go: go,
    navigate: navigate,
    bindLinks: bindLinks,
    getConfig: getConfig,
    version: '0.2.0'
  };

})(typeof window !== 'undefined' ? window : this);
