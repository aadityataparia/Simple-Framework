const UrlExt = require('./utils/url');
const JsonExt = require('./utils/json');

// Empty SifrrDom
let SifrrDom = {};

// For elements
SifrrDom.elements = {};
SifrrDom.loadingElements = [];

// Classes
SifrrDom.Element = require('./dom/element');
SifrrDom.Parser = require('./dom/parser');
SifrrDom.Loader = require('./dom/loader');
SifrrDom.SimpleElement = require('./dom/simpleelement');
SifrrDom.Event = require('./dom/event');

SifrrDom.makeEqual = require('./dom/makeequal');
SifrrDom.Url = UrlExt;
SifrrDom.Json = JsonExt;

// HTML to template
SifrrDom.template = require('./dom/template');

// Register Custom Element Function
SifrrDom.register = (Element, options) => {
  Element.useSR = SifrrDom.config.useShadowRoot;
  const name = Element.elementName;
  if (!name) {
    throw Error('Error creating Custom Element: No name given.', Element);
  } else if (window.customElements.get(name)) {
    window.console.warn(`Error creating Element: ${name} - Custom Element with this name is already defined.`);
  } else if (name.indexOf('-') < 1) {
    throw Error(`Error creating Element: ${name} - Custom Element name must have one dash '-'`);
  } else {
    try {
      window.customElements.define(name, Element, options);
      SifrrDom.elements[name] = Element;
      return true;
    } catch (error) {
      window.console.error(`Error creating Custom Element: ${name} - ${error}`, error.trace);
      return false;
    }
  }
  return false;
};

// Initialize SifrrDom
SifrrDom.setup = function(config) {
  SifrrDom.config = Object.assign({
    baseUrl: '',
    useShadowRoot: true
  }, config);
  SifrrDom.Event.add('input');
  SifrrDom.Event.add('change');
  SifrrDom.Event.addListener('change', 'document', SifrrDom.Parser.twoWayBind);
  SifrrDom.Event.addListener('input', 'document', SifrrDom.Parser.twoWayBind);
};

// Load Element HTML and execute script in it
SifrrDom.load = function(elemName, { url, js = true } = {}) {
  let loader = new SifrrDom.Loader(elemName, url);
  SifrrDom.loadingElements.push(customElements.whenDefined(elemName));
  return loader.executeScripts(js);
};

SifrrDom.loading = () => {
  return Promise.all(SifrrDom.loadingElements);
};

// Relative path to element html
SifrrDom.relativeTo = function(elemName, relativeUrl) {
  if (typeof elemName === 'string') return SifrrDom.Url.absolute(SifrrDom.Loader.urls[elemName], relativeUrl);
};

module.exports = SifrrDom;
