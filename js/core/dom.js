const SVG_NS = 'http://www.w3.org/2000/svg';

function applyAttrs(el, attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === 'class') {
      el.setAttribute('class', value);
    } else if (key === 'style' && typeof value === 'object') {
      for (const [prop, val] of Object.entries(value)) {
        if (prop.startsWith('--')) el.style.setProperty(prop, val);
        else el.style[prop] = val;
      }
    } else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) {
      el.setAttribute(key, '');
    } else {
      el.setAttribute(key, String(value));
    }
  }
}

function appendChildren(el, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    el.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
}

function isAttrs(value) {
  return value && typeof value === 'object' && !value.nodeType && !Array.isArray(value);
}

/** Crea un elemento HTML. h('div', { class: 'x' }, 'texto', otroNodo) */
export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (isAttrs(attrs)) applyAttrs(el, attrs);
  else children.unshift(attrs);
  appendChildren(el, children);
  return el;
}

/** Crea un elemento SVG. */
export function svg(tag, attrs, ...children) {
  const el = document.createElementNS(SVG_NS, tag);
  if (isAttrs(attrs)) applyAttrs(el, attrs);
  else children.unshift(attrs);
  appendChildren(el, children);
  return el;
}
