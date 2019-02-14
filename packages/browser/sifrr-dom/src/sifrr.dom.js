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

// HTML to template
SifrrDom.template = require('./dom/template');

// Register Custom Element Function
SifrrDom.register = (Element, options) => {
  Element.useSR = SifrrDom.config.useShadowRoot;
  const name = Element.elementName;
  if (!name) {
    throw Error('Error creating Custom Element: No name given.', Element);
  } else if (window.customElements.get(name)) {
    throw Error(`Error creating Element: ${name} - Custom Element with this name is already defined.`);
  } else if (name.indexOf('-') < 1) {
    throw Error(`Error creating Element: ${name} - Custom Element name must have one dash '-'`);
  } else {
    try {
      window.customElements.define(name, Element, options);
      SifrrDom.elements[name] = Element;
      return true;
    } catch (error) {
      window.console.error(`Error creating Custom Element: ${name} - ${error.message}`, error.trace);
      return false;
    }
  }
};

// Initialize SifrrDom
SifrrDom.setup = function(config) {
  SifrrDom.config = Object.assign({
    baseUrl: '',
    useShadowRoot: true
  }, config);
  if (typeof SifrrDom.config.baseUrl !== 'string') throw Error('baseUrl should be a string');
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

module.exports = SifrrDom;
