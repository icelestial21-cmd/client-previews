/* Tiny runtime for iCelestial preview pages: renders {{holes}}, <sc-for>, <sc-if> and onClick handlers from a <template id="tpl">. */
class DCLogic {
  constructor(props) { this.props = props || {}; this.state = {}; }
  setState(s) { Object.assign(this.state, typeof s === 'function' ? s(this.state) : s); if (this.__r) this.__r(); }
  forceUpdate() { if (this.__r) this.__r(); }
}
(function () {
  var WHOLE = /^\s*\{\{([^}]+)\}\}\s*$/;
  function get(ctx, path) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (/^-?\d+(\.\d+)?$/.test(path)) return +path;
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, ctx);
  }
  function interp(str, ctx) {
    return str.replace(/\{\{([^}]+)\}\}/g, function (_, p) { var v = get(ctx, p); return v == null ? '' : String(v); });
  }
  function kids(node, ctx, out) { node.childNodes.forEach(function (ch) { render(ch, ctx, out); }); }
  function render(node, ctx, out) {
    if (node.nodeType === 3) { out.appendChild(document.createTextNode(interp(node.nodeValue, ctx))); return; }
    if (node.nodeType !== 1) return;
    var tag = node.localName;
    if (tag === 'sc-for') {
      var list = get(ctx, node.getAttribute('list').match(WHOLE)[1]) || [];
      var as = node.getAttribute('as') || 'item';
      list.forEach(function (it, i) { var c = Object.create(ctx); c[as] = it; c.$index = i; kids(node, c, out); });
      return;
    }
    if (tag === 'sc-if') { if (get(ctx, node.getAttribute('value').match(WHOLE)[1])) kids(node, ctx, out); return; }
    var el = document.createElementNS(node.namespaceURI, node.localName);
    for (var i = 0; i < node.attributes.length; i++) {
      var a = node.attributes[i];
      if (a.name.indexOf('hint-') === 0) continue;
      var m = a.value.match(WHOLE);
      if (a.name.indexOf('on') === 0 && m) {
        var fn = get(ctx, m[1]);
        if (typeof fn === 'function') el.addEventListener(a.name.slice(2), fn);
        continue;
      }
      el.setAttribute(a.name, interp(a.value, ctx));
    }
    var src = node.localName === 'template' ? node.content : node;
    kids(src, ctx, el);
    out.appendChild(el);
  }
  window.mountDC = function (Component) {
    var tpl = document.getElementById('tpl').content;
    var root = document.getElementById('app');
    var comp = new Component({});
    comp.__r = function () {
      var frag = document.createDocumentFragment();
      kids(tpl, comp.renderVals(), frag);
      root.replaceChildren(frag);
    };
    comp.__r();
  };
})();
