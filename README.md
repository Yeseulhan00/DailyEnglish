# 오늘의 영어 (Daily English)

하루에 하나씩 영어 표현 묶음을 올리고, 날짜별 목록에서 골라 보는 정적 사이트입니다.

- **목록 페이지**: `index.html` — 날짜 카드를 누르면 그날의 표현으로 이동합니다. 오늘 날짜에는 `오늘` 배지가 붙습니다.
- **본문 페이지**: `posts/YYYY-MM-DD.html` — 표현 10개 + 🔊 발음 듣기(브라우저 음성 합성).
- **목록 데이터**: `posts.js` — `window.POSTS` 배열. 스크립트가 자동으로 갱신합니다.

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
