// 주소창이 보이지 않는 환경(홈 화면 앱, 인앱 브라우저 등)에서도
// 현재 페이지 주소를 확인하고 복사·공유할 수 있게 해 준다.
(function () {
  'use strict';

  var CSS = [
    '.share-btn{',
    '  display:inline-flex; align-items:center; gap:6px;',
    "  font-family:'Noto Sans KR', sans-serif; font-size:14px;",
    '  color:#7a7461; background:var(--card,#fffdf7);',
    '  border:1px solid var(--line,#d9d2bd); border-radius:20px;',
    '  padding:7px 14px; margin-left:8px; cursor:pointer;',
    '  -webkit-tap-highlight-color: transparent;',
    '}',
    '.share-btn:hover{ color:var(--ink,#1f2a24); border-color:var(--accent,#c98a3c); }',

    '.share-overlay{',
    '  position:fixed; inset:0; z-index:9999;',
    '  background:rgba(31,42,36,0.45);',
    '  display:flex; align-items:center; justify-content:center;',
    '  padding:20px;',
    '}',
    '.share-overlay[hidden]{ display:none; }',
    '.share-box{',
    '  background:var(--card,#fffdf7);',
    '  border:1px solid var(--line,#d9d2bd);',
    '  border-radius:10px; padding:22px;',
    '  width:100%; max-width:420px;',
    '  box-shadow:0 10px 30px rgba(0,0,0,0.18);',
    "  font-family:'Noto Sans KR', sans-serif;",
    '}',
    '.share-box h2{',
    "  font-family:'Noto Serif KR', serif; font-weight:900;",
    '  font-size:18px; margin:0 0 4px; color:var(--ink,#1f2a24);',
    '}',
    '.share-box .page{',
    '  font-size:13.5px; color:#8f8973; margin:0 0 16px; line-height:1.5;',
    '}',
    '.share-box .url{',
    '  display:block; width:100%;',
    "  font-family:'Source Serif Pro', serif; font-size:14.5px;",
    '  line-height:1.6; color:var(--ink,#1f2a24);',
    '  background:var(--paper,#f6f3ea);',
    '  border:1px solid var(--line,#d9d2bd); border-radius:6px;',
    '  padding:12px 14px; word-break:break-all;',
    '  -webkit-user-select:all; user-select:all;',
    '}',
    '.share-actions{ display:flex; gap:8px; flex-wrap:wrap; margin-top:16px; }',
    '.share-actions button{',
    "  font-family:'Noto Sans KR', sans-serif; font-size:15px; font-weight:500;",
    '  border-radius:30px; padding:11px 20px; cursor:pointer;',
    '  border:1px solid var(--line,#d9d2bd);',
    '  background:var(--paper,#f6f3ea); color:#5b5647;',
    '  flex:1; justify-content:center; display:inline-flex; align-items:center; gap:6px;',
    '  -webkit-tap-highlight-color: transparent;',
    '}',
    // display 선언이 [hidden] 기본값을 덮어쓰므로 따로 숨긴다
    '.share-actions button[hidden]{ display:none; }',
    '.share-actions button:hover{ border-color:#b9b199; }',
    '.share-actions button.primary{',
    '  background:var(--accent,#c98a3c); border-color:var(--accent,#c98a3c); color:#fff;',
    '}',
    '.share-actions button.primary:hover{ background:#b87a30; border-color:#b87a30; }',
    '.share-close{',
    '  display:block; width:100%; margin-top:10px;',
    '  background:none; border:none; cursor:pointer;',
    "  font-family:'Noto Sans KR', sans-serif; font-size:14px; color:#8f8973;",
    '  padding:8px;',
    '}',
    '.share-close:hover{ color:var(--ink,#1f2a24); }',
    '.share-toast{',
    '  margin-top:12px; font-size:14px; text-align:center;',
    '  color:var(--work,#3a5a45); min-height:20px;',
    '}'
  ].join('\n');

  function injectCss() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function pageName() {
    var h1 = document.querySelector('h1');
    var name = h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : document.title;
    var stamp = document.querySelector('.datestamp');
    if (stamp && stamp.textContent.trim()) {
      name += ' · ' + stamp.textContent.replace(/\s+/g, ' ').trim();
    }
    return name;
  }

  var overlay, urlEl, toastEl, nativeBtn, lastFocus;

  function buildDialog() {
    overlay = document.createElement('div');
    overlay.className = 'share-overlay';
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="share-box" role="dialog" aria-modal="true" aria-label="페이지 주소 공유">'
      + '<h2>이 페이지 주소</h2>'
      + '<p class="page"></p>'
      + '<code class="url"></code>'
      + '<div class="share-actions">'
      +   '<button type="button" class="primary" data-act="copy">링크 복사</button>'
      +   '<button type="button" data-act="share" hidden>공유하기</button>'
      + '</div>'
      + '<div class="share-toast"></div>'
      + '<button type="button" class="share-close" data-act="close">닫기</button>'
      + '</div>';
    document.body.appendChild(overlay);

    urlEl = overlay.querySelector('.url');
    toastEl = overlay.querySelector('.share-toast');
    nativeBtn = overlay.querySelector('[data-act="share"]');

    if (navigator.share) nativeBtn.hidden = false;

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) return close();
      var act = e.target.getAttribute && e.target.getAttribute('data-act');
      if (act === 'close') close();
      else if (act === 'copy') copy();
      else if (act === 'share') nativeShare();
    });

    document.addEventListener('keydown', function (e) {
      if (!overlay.hidden && e.key === 'Escape') close();
    });
  }

  function open() {
    lastFocus = document.activeElement;
    overlay.querySelector('.page').textContent = pageName();
    urlEl.textContent = location.href;
    toastEl.textContent = '';
    overlay.hidden = false;
    overlay.querySelector('[data-act="copy"]').focus();
  }

  function close() {
    overlay.hidden = true;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function toast(message) {
    toastEl.textContent = message;
  }

  function copy() {
    var text = location.href;
    var ok = function () { toast('주소를 복사했어요'); };
    var fail = function () {
      toast('복사가 막혀 있어요 — 위 주소를 길게 눌러 복사해 주세요');
      selectUrl();
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok, function () { legacyCopy(ok, fail); });
    } else {
      legacyCopy(ok, fail);
    }
  }

  function legacyCopy(ok, fail) {
    var ta = document.createElement('textarea');
    ta.value = location.href;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var done = false;
    try { done = document.execCommand('copy'); } catch (e) { done = false; }
    document.body.removeChild(ta);
    if (done) ok(); else fail();
  }

  function selectUrl() {
    try {
      var range = document.createRange();
      range.selectNodeContents(urlEl);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    } catch (e) { /* 무시 */ }
  }

  function nativeShare() {
    if (!navigator.share) return;
    navigator.share({ title: pageName(), url: location.href })
      .then(function () { close(); })
      .catch(function () { /* 사용자가 취소한 경우 */ });
  }

  function addButton() {
    var host = document.querySelector('.topnav') || document.querySelector('.topbar');
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'share-btn';
    btn.textContent = '🔗 주소 복사 · 공유';
    btn.addEventListener('click', open);
    if (host) {
      host.appendChild(btn);
    } else {
      btn.style.position = 'fixed';
      btn.style.top = '12px';
      btn.style.right = '12px';
      btn.style.zIndex = '9998';
      document.body.appendChild(btn);
    }
  }

  function init() {
    injectCss();
    buildDialog();
    addButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
