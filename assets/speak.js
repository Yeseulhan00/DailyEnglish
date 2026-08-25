// 발음 재생 — 반드시 영어(en-US) 음성을 명시적으로 골라서 읽는다.
// lang 속성만 지정하면 시스템 기본 음성(한국어)이 잡혀 한국식 발음이 나온다.
(function () {
  'use strict';

  var currentBtn = null;
  var voices = [];

  function loadVoices() {
    voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  }
  loadVoices();
  if (window.speechSynthesis && 'onvoiceschanged' in window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  // 자연스러운 미국식 음성 우선순위 (Chrome / Edge / macOS 순)
  var PREFERRED = [
    'google us english',
    'microsoft aria', 'microsoft jenny', 'microsoft ava', 'microsoft emma',
    'microsoft guy', 'microsoft andrew', 'microsoft brian', 'microsoft eric',
    'microsoft zira', 'microsoft david', 'microsoft mark',
    'samantha', 'alex', 'allison', 'ava', 'evan', 'tom'
  ];
  var FEMALE_HINTS = ['aria', 'jenny', 'ava', 'emma', 'zira', 'samantha', 'allison',
                      'michelle', 'female', 'susan', 'karen', 'serena', 'kate'];
  var MALE_HINTS = ['guy', 'andrew', 'brian', 'eric', 'david', 'mark', 'alex',
                    'daniel', 'male', 'fred', 'tom', 'evan', 'james'];

  function lang(v) { return (v.lang || '').toLowerCase().replace('_', '-'); }
  function name(v) { return (v.name || '').toLowerCase(); }

  // en-US 우선, 없으면 다른 영어권, 그래도 없으면 빈 배열
  function englishPool() {
    if (!voices.length) loadVoices();
    var en = voices.filter(function (v) { return lang(v).indexOf('en') === 0; });
    var us = en.filter(function (v) { return lang(v).indexOf('en-us') === 0; });
    return us.length ? us : en;
  }

  function byPreference(pool) {
    for (var i = 0; i < PREFERRED.length; i++) {
      for (var j = 0; j < pool.length; j++) {
        if (name(pool[j]).indexOf(PREFERRED[i]) !== -1) return pool[j];
      }
    }
    return pool[0] || null;
  }

  function byHints(pool, hints) {
    for (var i = 0; i < hints.length; i++) {
      for (var j = 0; j < pool.length; j++) {
        if (name(pool[j]).indexOf(hints[i]) !== -1) return pool[j];
      }
    }
    return null;
  }

  // role: 'a' = 남성 톤, 'b' = 여성 톤, null = 기본
  function pickVoice(role) {
    var pool = englishPool();
    if (!pool.length) return null;
    if (role === 'a') return byHints(pool, MALE_HINTS) || byPreference(pool);
    if (role === 'b') return byHints(pool, FEMALE_HINTS) || byPreference(pool);
    return byPreference(pool);
  }

  function roleFor(btn) {
    var line = btn.closest ? btn.closest('.line') : null;
    if (!line) return null;
    if (line.querySelector('.who.a')) return 'a';
    if (line.querySelector('.who.b')) return 'b';
    return null;
  }

  function speak(btn) {
    var text = btn.getAttribute('data-text');
    if (!('speechSynthesis' in window) || !text) return;

    window.speechSynthesis.cancel();
    if (currentBtn) currentBtn.classList.remove('playing');

    var utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.92;

    var role = roleFor(btn);
    var voice = pickVoice(role);
    if (voice) {
      utter.voice = voice;           // 영어 음성을 반드시 명시
      utter.lang = voice.lang;
    } else {
      utter.lang = 'en-US';          // 영어 음성이 하나도 없을 때의 최선
      notifyNoEnglishVoice();
    }
    // 같은 음성이라도 화자별로 살짝 구분
    if (role === 'a') utter.pitch = 0.9;
    else if (role === 'b') utter.pitch = 1.1;

    utter.onstart = function () { btn.classList.add('playing'); currentBtn = btn; };
    utter.onend = function () { btn.classList.remove('playing'); currentBtn = null; };
    window.speechSynthesis.speak(utter);
  }

  var notified = false;
  function notifyNoEnglishVoice() {
    if (notified) return;
    notified = true;
    var box = document.createElement('div');
    box.className = 'voice-warning';
    box.textContent = '이 기기에 영어 음성이 설치되어 있지 않아 발음이 부정확할 수 있어요. '
                    + 'Windows 설정 → 시간 및 언어 → 음성에서 English (United States) 음성을 추가해 주세요.';
    var header = document.querySelector('header');
    if (header && header.parentNode) header.parentNode.insertBefore(box, header.nextSibling);
  }

  // 위임 방식 — 퀴즈처럼 나중에 만들어지는 버튼도 그대로 동작한다.
  document.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('.speak-btn') : null;
    if (btn) speak(btn);
  });
})();
