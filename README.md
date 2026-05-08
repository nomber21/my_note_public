# my_note_public

[Obsidian](https://obsidian.md) Vault에서 `publish: true` 가 표시된 노트만 골라서 [Quartz](https://quartz.jzhao.xyz)로 빌드해 GitHub Pages에 공개하는 저장소입니다.

- 공개 사이트: https://nomber21.github.io/my_note_public/
- 원본 Vault (private): https://github.com/nomber21/my_note

---

## 구조

```
/Users/1111903/obsidian/
├── note/                    # Obsidian Vault (private repo: my_note)
└── quartz/                  # 이 repo (public)
    ├── content/             # publish:true 노트들이 sync 되는 곳 (자동 생성)
    ├── sync-from-vault.mjs  # Vault → content/ sync 스크립트
    ├── publish.mjs          # sync + commit + push 자동화
    └── quartz.config.ts     # 사이트 설정
```

## 노트 공개하기

### 1. Obsidian에서 frontmatter 추가

공개할 노트의 **맨 위**에 다음을 추가합니다.

```markdown
---
title: 노트 제목
publish: true
---

본문...
```

> Obsidian UI에서는 `⌘P` → `Add file property` → `publish` → `true` 로도 가능합니다.

### 2. 빌드 + 배포

```bash
cd /Users/1111903/obsidian/quartz
npm run publish
```

- `sync-from-vault.mjs` 가 Vault에서 `publish: true` 노트만 골라 `content/` 로 복사합니다.
- 변경이 있으면 자동으로 commit + push 합니다.
- push되면 GitHub Actions가 빌드해서 GitHub Pages에 배포합니다 (보통 2~3분).

커밋 메시지를 직접 지정하려면:

```bash
npm run publish -- "publish: 새 글 제목"
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
| `npm run sync` | Vault의 `publish:true` 노트만 `content/` 로 복사 |
| `npm run preview` | sync + 로컬 서버 실행 (http://localhost:8080) |
| `npm run publish` | sync + commit + push (자동 배포 트리거) |

## 동작 흐름

```
Obsidian Vault (private)
  └─ publish:true 노트
        │ npm run publish
        ▼
  content/ (이 repo)
        │ git push
        ▼
  GitHub Actions (.github/workflows/deploy.yml)
        │ npx quartz build
        ▼
  GitHub Pages → https://nomber21.github.io/my_note_public/
```
