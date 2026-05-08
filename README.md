# my_note_public

[Obsidian](https://obsidian.md) Vault의 `publish/` 폴더에 들어 있는 노트만 [Quartz](https://quartz.jzhao.xyz)로 빌드해 GitHub Pages에 공개하는 저장소입니다.

- 공개 사이트: https://nomber21.github.io/my_note_public/
- 원본 Vault (private): https://github.com/nomber21/my_note

---

## 구조

```
/Users/1111903/obsidian/
├── note/                       # Obsidian Vault (private repo: my_note)
│   ├── *.md                    # 비공개 노트 (기본)
│   └── publish/                # ★ 여기에 들어가면 공개됨 (트리 구조 보존)
│       ├── index.md            # 사이트 홈 (선택)
│       ├── Welcome.md
│       └── notes/sub/...
└── quartz/                     # 이 repo (public)
    ├── content/                # publish/ 가 통째로 복사되는 곳 (자동 생성)
    ├── sync-from-vault.mjs     # Vault publish/ → content/ sync 스크립트
    ├── publish.mjs             # sync + commit + push 자동화
    └── quartz.config.ts        # 사이트 설정
```

## 노트 공개하기

**`note/publish/` 폴더 안에 두면 공개**, 그 외 위치는 비공개입니다. 별도 frontmatter 표시 불필요.

### 1. Obsidian에서 노트를 `publish/` 안에 두기

- 새로 작성: 파일 만들 때 위치를 `publish/` 또는 그 하위 폴더로 지정
- 기존 노트 공개: Obsidian의 파일 탐색기에서 `publish/` 로 드래그
- 비공개로 되돌리기: `publish/` 밖으로 다시 옮기기

폴더 트리 구조는 그대로 사이트에 반영됩니다 (예: `publish/devlog/2026/foo.md` → 사이트의 `/devlog/2026/foo`).

### 2. 빌드 + 배포

```bash
cd /Users/1111903/obsidian/quartz
npm run publish
```

- `sync-from-vault.mjs` 가 `note/publish/` 를 통째로 `content/` 로 복사합니다 (이미지 등 첨부도 함께).
- 변경이 있으면 자동으로 commit + push 합니다.
- push되면 GitHub Actions가 빌드해서 GitHub Pages에 배포합니다 (보통 2~3분).

커밋 메시지를 직접 지정하려면:

```bash
npm run publish -- "publish: 새 글 제목"
```

## 홈페이지 (`index.md`)

`note/publish/index.md` 가 있으면 그게 사이트 홈이 됩니다. 없으면 자동 생성된 안내 페이지가 표시됩니다.

frontmatter `title` 만 있으면 충분합니다 (`publish:` 같은 표시 불필요):

```markdown
---
title: Home
---

# 어서오세요
...
```

## 로컬 미리보기

배포 전에 브라우저에서 확인하고 싶을 때:

```bash
npm run preview
```

http://localhost:8080 에서 확인.

## 명령어 정리

| 명령어 | 동작 |
|---|---|
| `npm run sync` | `note/publish/` 를 `content/` 로 복사 |
| `npm run preview` | sync + 로컬 서버 실행 (http://localhost:8080) |
| `npm run publish` | sync + commit + push (자동 배포 트리거) |

## 동작 흐름

```
Obsidian Vault (private)
  └─ publish/ 폴더의 노트 + 첨부
        │ npm run publish
        ▼
  content/ (이 repo, 트리 구조 그대로)
        │ git push
        ▼
  GitHub Actions (.github/workflows/deploy.yml)
        │ npx quartz build
        ▼
  GitHub Pages → https://nomber21.github.io/my_note_public/
```
