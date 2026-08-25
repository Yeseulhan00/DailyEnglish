# -*- coding: utf-8 -*-
"""오늘의 영어 HTML 한 개를 사이트에 추가한다.

사용법:
    python tools/add_post.py <원본.html> [YYYY-MM-DD]

하는 일:
  1. 원본을 posts/<날짜>.html 로 복사하면서 목록 링크와 날짜를 넣는다.
  2. 원본에 들어있는 발음 재생 스크립트를 공용 assets/speak.js 로 교체한다.
     (원본 스크립트는 영어 음성을 명시하지 않아 한국어 음성으로 읽히는 문제가 있다)
  3. posts.js 의 목록에 해당 날짜를 추가한다(같은 날짜는 덮어쓴다).
"""
import json
import os
import re
import sys
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS_DIR = os.path.join(ROOT, "posts")
POSTS_JS = os.path.join(ROOT, "posts.js")
MARK = "<!-- daily-english-patched -->"
SPEAK_TAG = '<script src="../assets/speak.js"></script>'

EXTRA_CSS = """
  /* --- 목록 연결용 --- */
  .topbar{
    max-width:760px;
    margin:0 auto 18px;
  }
  .topbar a{
    display:inline-flex;
    align-items:center;
    gap:6px;
    text-decoration:none;
    color:#7a7461;
    font-size:14px;
    background:var(--card);
    border:1px solid var(--line);
    border-radius:20px;
    padding:7px 14px;
  }
  .topbar a:hover{ color:var(--ink); border-color:#b9b199; }
  header .datestamp{
    font-family:'Noto Serif KR', serif;
    font-size:14px;
    color:#8f8973;
    margin:0 0 10px;
  }
  footer a{ color:var(--accent); }
  .voice-warning{
    max-width:760px;
    margin:0 auto 20px;
    background:var(--life-bg);
    color:var(--life);
    border:1px solid #e2c9bb;
    border-radius:6px;
    padding:12px 16px;
    font-size:14px;
    line-height:1.6;
  }
"""


def weekday_ko(d):
    return "월화수목금토일"[d.weekday()] + "요일"


def swap_speech_script(html):
    """인라인 발음 스크립트를 공용 스크립트 참조로 바꾼다."""
    if SPEAK_TAG in html:
        return html
    pattern = re.compile(r"<script(?P<attrs>[^>]*)>(?P<body>.*?)</script>", re.S)

    def repl(m):
        if "src=" in m.group("attrs"):
            return m.group(0)
        if "speechSynthesis" not in m.group("body"):
            return m.group(0)
        return SPEAK_TAG

    html, n = pattern.subn(repl, html)
    if n == 0 or SPEAK_TAG not in html:
        # 예상과 다른 형태면 최소한 공용 스크립트는 붙여 둔다
        html = html.replace("</body>", SPEAK_TAG + "\n</body>", 1)
    return html


def patch(html, day):
    if MARK not in html:
        html = html.replace("</style>", EXTRA_CSS + "</style>", 1)
        html = html.replace(
            "<body>",
            "<body>\n" + MARK
            + '\n<div class="topbar"><a href="../index.html">← 날짜 목록</a></div>',
            1,
        )
        stamp = '<div class="datestamp">%d년 %d월 %d일 · %s</div>' % (
            day.year, day.month, day.day, weekday_ko(day))
        html = html.replace("</h1>", "</h1>\n  " + stamp, 1)
        html = re.sub(
            r"<footer>(.*?)</footer>",
            lambda m: "<footer>" + m.group(1)
                      + '<br><a href="../index.html">← 다른 날짜 보기</a></footer>',
            html,
            count=1,
            flags=re.S,
        )
    return swap_speech_script(html)


def load_posts():
    if not os.path.exists(POSTS_JS):
        return []
    raw = open(POSTS_JS, encoding="utf-8").read()
    m = re.search(r"window\.POSTS\s*=\s*(\[.*?\]);", raw, re.S)
    return json.loads(m.group(1)) if m else []


def save_posts(posts):
    posts.sort(key=lambda p: p["date"], reverse=True)
    body = json.dumps(posts, ensure_ascii=False, indent=2)
    with open(POSTS_JS, "w", encoding="utf-8") as f:
        f.write("// 날짜 목록 데이터 — tools/add_post.py 가 자동으로 갱신합니다.\n")
        f.write("window.POSTS = " + body + ";\n")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    src = sys.argv[1]
    day = date.fromisoformat(sys.argv[2]) if len(sys.argv) > 2 else date.today()
    key = day.isoformat()

    html = open(src, encoding="utf-8").read()
    title = re.search(r"<h1>(.*?)</h1>", html, re.S)
    title = re.sub(r"\s+", " ", title.group(1)).strip() if title else "오늘의 영어표현"
    phrases = [re.sub(r"<.*?>", "", p).strip()
               for p in re.findall(r'<span class="phrase">(.*?)</span>', html, re.S)]

    os.makedirs(POSTS_DIR, exist_ok=True)
    dest = os.path.join(POSTS_DIR, key + ".html")
    with open(dest, "w", encoding="utf-8") as f:
        f.write(patch(html, day))

    posts = [p for p in load_posts() if p["date"] != key]
    posts.append({
        "date": key,
        "title": title,
        "count": len(phrases),
        "preview": phrases[:3],
    })
    save_posts(posts)
    print("추가 완료: posts/%s.html (표현 %d개)" % (key, len(phrases)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
