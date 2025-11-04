(function () {
  function includesText(el, t) { return el && ((el.textContent || "").toLowerCase().indexOf(t) !== -1); }
  function commonAncestor(a, b, max) {
    max = max || 5; var chain = []; var x = a, i = 0;
    while (x && i++ < max) { chain.push(x); x = x.parentElement; }
    x = b; i = 0; while (x && i++ < max) { if (chain.indexOf(x) !== -1) return x; x = x.parentElement; }
    return null;
  }
  function looksSmall(node) {
    if (!node || !node.getBoundingClientRect) return false;
    var r = node.getBoundingClientRect();
    var links = node.querySelectorAll ? node.querySelectorAll("a,button").length : 0;
    var kids = node.querySelectorAll ? node.querySelectorAll("*").length : 0;
    return r.width > 0 && r.width <= 420 && r.height > 0 && r.height <= 220 && links <= 4 && kids <= 120;
  }
  function findBadge() {
    var getNodes = Array.prototype.slice.call(document.querySelectorAll("p,span,a,div")).filter(function(n){ return includesText(n, "get this template"); });
    for (var gi = 0; gi < getNodes.length; gi++) {
      var g = getNodes[gi];
      var scope = g.closest ? (g.closest("div") || g.parentElement || g) : (g.parentElement || g);
      var lets = null;
      var candidates = scope.querySelectorAll ? scope.querySelectorAll("p,span,a,div") : [];
      for (var ci = 0; ci < candidates.length; ci++) {
        var c = candidates[ci];
        if (c !== g && (includesText(c, "let’s go!") || includesText(c, "let's go!"))) { lets = c; break; }
      }
      var container = lets ? commonAncestor(g, lets, 4) : (g.closest ? g.closest("div") : g.parentElement);
      var known = g.closest ? g.closest("div.framer-4r7zeg") : null;
      if (known) container = known;
      if (container && looksSmall(container)) return container;
    }
    var knownRoot = document.querySelector && document.querySelector("div.framer-4r7zeg");
    return (knownRoot && looksSmall(knownRoot)) ? knownRoot : null;
  }
  function removeBadge() { var n = findBadge(); if (n && n.parentElement) { n.parentElement.removeChild(n); return true; } return false; }
  function observe(ms) {
    ms = ms || 12000; var end = Date.now() + ms;
    var mo = (typeof MutationObserver !== "undefined") ? new MutationObserver(function(){ removeBadge(); if (Date.now() > end) mo.disconnect(); }) : null;
    if (mo) mo.observe(document.documentElement || document.body, { subtree: true, childList: true });
    var i = 0; var id = setInterval(function(){ if (removeBadge() || ++i > 30 || Date.now() > end) clearInterval(id); }, 200);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ removeBadge(); observe(); });
  else { removeBadge(); observe(); }
})();


