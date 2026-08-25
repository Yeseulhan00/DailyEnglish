# 오늘의 영어 (Daily English)

하루에 하나씩 영어 표현 묶음을 올리고, 날짜별 목록에서 골라 보는 정적 사이트입니다.

- **목록 페이지**: `index.html` — 날짜 카드를 누르면 그날의 표현으로 이동합니다. 오늘 날짜에는 `오늘` 배지가 붙습니다.
- **본문 페이지**: `posts/YYYY-MM-DD.html` — 표현 10개 + 🔊 발음 듣기(브라우저 음성 합성).
- **목록 데이터**: `posts.js` — `window.POSTS` 배열. 스크립트가 자동으로 갱신합니다.
- **발음 재생**: `assets/speak.js` — 모든 본문이 공유합니다. 미국식(en-US) 음성을 명시적으로 골라 읽습니다.

## 발음이 한국식으로 들린다면

브라우저는 음성을 지정하지 않으면 시스템 기본 음성(한국어)으로 영어를 읽습니다. `assets/speak.js` 는 항상 `en-US` 음성을 우선 선택하고, en-US가 없으면 다른 영어권 음성을 씁니다.

기기에 영어 음성이 하나도 없으면 본문 상단에 안내가 뜹니다. 이때는 음성을 설치해야 합니다.

- Windows: 설정 → 시간 및 언어 → 음성 → 음성 관리 → **English (United States)** 추가
- Chrome/Edge에서는 `Google US English`, `Microsoft Aria/Guy` 등 온라인 음성이 자동으로 잡히기도 합니다

## 새 표현 추가하기

새로 만든 HTML 파일을 받아서 아래 명령 한 줄만 실행하면 됩니다.

```bash
python tools/add_post.py "새로받은파일.html"
```

날짜를 직접 지정하려면 뒤에 붙입니다.

```bash
python tools/add_post.py "새로받은파일.html" 2026-08-26
```

스크립트가 하는 일:

1. `posts/<날짜>.html` 로 복사하면서 상단에 `← 날짜 목록` 링크와 날짜 표시를 넣습니다.
2. 제목과 표현 개수, 미리보기 3개를 뽑아 `posts.js` 목록에 추가합니다(같은 날짜는 갱신).

그다음 커밋해서 올리면 사이트에 반영됩니다.

```bash
git add -A && git commit -m "Add 2026-08-26" && git push
```

## 사이트 주소

GitHub Pages(Settings → Pages → Branch: `main` / `root`)를 켜면 아래 주소로 열립니다.

https://yeseulhan00.github.io/DailyEnglish/
