(function () {
  function includesText(el, t) { return el && ((el.textContent || "").toLowerCase().indexOf(t) !== -1); }
  function hasAnyText(el, arr) { return arr.some(function(t){ return includesText(el, t); }); }
  function looksSmall(node) {
    if (!node || !node.getBoundingClientRect) return false;
    var r = node.getBoundingClientRect();
    var links = node.querySelectorAll ? node.querySelectorAll("a,button").length : 0;
    var kids = node.querySelectorAll ? node.querySelectorAll("*").length : 0;
    return r.width > 0 && r.width <= 600 && r.height > 0 && r.height <= 320 && links <= 8 && kids <= 240;
  }
  function isBadgeRoot(el){
    if (!el || el.nodeType !== 1) return false;
    var cl = el.classList ? Array.from(el.classList) : [];
    var hasFramerBadgeClass = cl.indexOf('framer-RbLO6') !== -1;
    var dataName = (el.getAttribute && el.getAttribute('data-framer-name')) || '';
    if (hasFramerBadgeClass) return true;
    if (/^open$/i.test(dataName)) return true;
    if (/buy\s*\/\s*preview/i.test(dataName || '')) return true;
    if (hasAnyText(el, ['launchnow','unlock template','get todo access'])) return true;
    try {
      var links = el.querySelectorAll('a[href]');
      for (var i=0;i<links.length;i++){
        var href = (links[i].getAttribute('href')||'').toLowerCase();
        if (href.indexOf('launchnow.design') !== -1) return true;
        if (href.indexOf('buy.polar.sh') !== -1) return true;
      }
    } catch(_e){}
    return false;
  }
  function isFrameshipBadge(el) {
    if (!el || el.nodeType !== 1) return false;
    if (el.classList && el.classList.contains('framer-nm3c8g')) return true;
    try {
      var links = el.querySelectorAll('a[href]');
      for (var i = 0; i < links.length; i++) {
        var href = (links[i].getAttribute('href') || '').toLowerCase();
        if (href.indexOf('frameship.io') !== -1) return true;
        if (href.indexOf('buy.stripe.com') !== -1 && hasAnyText(el, ['upgrade', 'ecommerce', 'frameship'])) return true;
      }
    } catch (_e) {}
    if (hasAnyText(el, ['upgrade to unlock ecommerce', 'use shopify on your website with frameship'])) return true;
    return false;
  }

  function findAllBadges() {
    var out = [];
    var byClass = document.querySelectorAll ? document.querySelectorAll('div.framer-RbLO6') : [];
    for (var i=0;i<byClass.length;i++){ if (isBadgeRoot(byClass[i])) out.push(byClass[i]); }
    var textHints = ['launchnow','unlock template','get todo access','get this template','let\'s go!','\u2019s go!'];
    var nodes = Array.prototype.slice.call(document.querySelectorAll('p,span,a,div'));
    for (var j=0;j<nodes.length;j++){
      var n = nodes[j];
      if (!hasAnyText(n, textHints)) continue;
      var root = n.closest ? n.closest('div') : n;
      var tries = 0; var cur = root;
      while (cur && tries++ < 6 && !isBadgeRoot(cur)) cur = cur.parentElement;
      if (cur && isBadgeRoot(cur)) out.push(cur);
    }
    var linkSel = Array.prototype.slice.call(document.querySelectorAll('a[href*="launchnow.design"],a[href*="buy.polar.sh"]'));
    for (var k=0;k<linkSel.length;k++){
      var a = linkSel[k];
      var anc = a.closest ? a.closest('div') : a.parentElement;
      var tries2 = 0; var cur2 = anc;
      while (cur2 && tries2++ < 6 && !isBadgeRoot(cur2)) cur2 = cur2.parentElement;
      if (cur2 && isBadgeRoot(cur2)) out.push(cur2);
    }

    // --- Frameship badges ---
    var frameshipByClass = document.querySelectorAll ? document.querySelectorAll('div.framer-nm3c8g') : [];
    for (var f = 0; f < frameshipByClass.length; f++) { out.push(frameshipByClass[f]); }
    var frameshipLinks = Array.prototype.slice.call(document.querySelectorAll('a[href*="frameship.io"]'));
    for (var fl = 0; fl < frameshipLinks.length; fl++) {
      var fAnc = frameshipLinks[fl];
      var fTries = 0;
      while (fAnc && fTries++ < 8 && !isFrameshipBadge(fAnc)) fAnc = fAnc.parentElement;
      if (fAnc && isFrameshipBadge(fAnc)) out.push(fAnc);
    }
    var frameshipTextNodes = Array.prototype.slice.call(document.querySelectorAll('p,span,div'));
    for (var ft = 0; ft < frameshipTextNodes.length; ft++) {
      var fn = frameshipTextNodes[ft];
      if (!hasAnyText(fn, ['upgrade to unlock ecommerce', 'use shopify on your website with frameship'])) continue;
      var fRoot = fn;
      var fTries2 = 0;
      while (fRoot && fTries2++ < 8 && !isFrameshipBadge(fRoot)) fRoot = fRoot.parentElement;
      if (fRoot && isFrameshipBadge(fRoot)) out.push(fRoot);
    }

    var uniq = [];
    for (var u=0; u<out.length; u++) { if (uniq.indexOf(out[u]) === -1) uniq.push(out[u]); }
    // Filter: looksSmall for LaunchNow badges, but always include Frameship badges
    return uniq.filter(function(n){ return isFrameshipBadge(n) || looksSmall(n); });
  }
  function removeBadges() {
    var removed = 0;
    var list = findAllBadges();
    for (var i=0;i<list.length;i++){
      var n = list[i];
      if (n && n.parentElement) { n.parentElement.removeChild(n); removed++; }
    }
    return removed;
  }
  function removeEditorButton() {
    var removed = 0;
    var btn = document.getElementById('__framer-editorbar-button');
    if (btn && btn.parentElement) { btn.parentElement.removeChild(btn); removed++; }
    var btn2 = document.querySelector('button[aria-labelledby="__framer-editorbar-label"]');
    if (btn2 && btn2.parentElement) { btn2.parentElement.removeChild(btn2); removed++; }
    return removed;
  }
  function sweepAll(){ return removeBadges() + removeEditorButton(); }
  function observe(ms) {
    ms = ms || 20000; var end = Date.now() + ms;
    var mo = (typeof MutationObserver !== "undefined") ? new MutationObserver(function(){ sweepAll(); if (Date.now() > end) mo.disconnect(); }) : null;
    if (mo) mo.observe(document.documentElement || document.body, { subtree: true, childList: true });
    var i = 0; var id = setInterval(function(){ if (sweepAll() || ++i > 60 || Date.now() > end) clearInterval(id); }, 200);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ sweepAll(); observe(); });
  else { sweepAll(); observe(); }
})();
