/* Knockout pop-up. Shows the circular bracket first once the league reaches its knockouts.
   Switch on by setting CSQ_STAGE to 'round-of-64' or 'round-of-32' (admin setting on the live site),
   or automatically from KO_START. ?stage=knockouts forces it for previews. */
(function () {
  var CSQ_STAGE = 'first-round';
  var KO_START = new Date('2026-12-21T00:00:00-05:00');
  var q = new URLSearchParams(location.search);
  var forced = q.get('stage') === 'knockouts';
  var live = CSQ_STAGE === 'round-of-64' || CSQ_STAGE === 'round-of-32' || new Date() >= KO_START;
  var seen = false; try { seen = sessionStorage.getItem('csq_ko_seen') === '1'; } catch (e) {}
  if (!forced && (!live || seen)) return;
  var div = q.get('div') === 'women' ? '&div=women' : '';
  var last = document.activeElement;
  var wrap = document.createElement('div');
  wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true'); wrap.setAttribute('aria-labelledby', 'koTitle');
  wrap.style.cssText = 'position:fixed;inset:0;z-index:100;background:rgba(7,28,37,.78);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:16px;animation:koIn .35s ease';
  wrap.innerHTML = '<style>@keyframes koIn{from{opacity:0}to{opacity:1}}@keyframes koUp{from{transform:translateY(24px) scale(.97)}to{transform:none}}@media (prefers-reduced-motion:reduce){[role=dialog],[role=dialog] *{animation:none!important}}</style>' +
    '<div style="width:min(1100px,100%);max-height:calc(100vh - 32px);display:flex;flex-direction:column;background:#0e3546;border:2px solid #FCAE40;border-radius:22px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.5);animation:koUp .45s cubic-bezier(.2,.8,.2,1)">' +
      '<div style="display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;padding:14px 18px;background:#14485D;color:#fff;font-family:Inter,sans-serif">' +
        '<div><div style="font:700 11px Inter,sans-serif;letter-spacing:.12em;color:#FCAE40">KNOCKOUTS ARE LIVE</div><div id="koTitle" style="font:400 30px \'Bebas Neue\',sans-serif;letter-spacing:.02em;line-height:1">Christmas Domino League · Round of 32</div></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap"><a href="bracket.html' + (div ? '?' + div.slice(1) : '') + '" style="min-height:44px;display:inline-flex;align-items:center;padding:0 16px;border-radius:999px;background:#FCAE40;color:#0e3546;font:700 14px Inter,sans-serif;text-decoration:none">Open full bracket</a>' +
        '<button type="button" id="koClose" style="min-height:44px;padding:0 16px;border-radius:999px;border:2px solid #fff;background:transparent;color:#fff;font:700 14px Inter,sans-serif;cursor:pointer">Continue to league page</button></div></div>' +
      '<iframe title="Knockout bracket" src="bracket.html?embed=1' + div + '" style="border:0;width:100%;height:min(78vh,820px);display:block;background:#0e3546"></iframe></div>';
  function close() { wrap.remove(); try { sessionStorage.setItem('csq_ko_seen', '1'); } catch (e) {} document.removeEventListener('keydown', onKey); if (last && last.focus) last.focus(); }
  function onKey(e) { if (e.key === 'Escape') close(); }
  document.body.appendChild(wrap);
  wrap.addEventListener('click', function (e) { if (e.target === wrap) close(); });
  document.getElementById('koClose').addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  document.getElementById('koClose').focus();
})();
