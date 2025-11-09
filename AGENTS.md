# Repository Guidelines

## Project Structure & Module Organization
- `app/` — Next.js App Router pages and API routes. Key paths: `analysis/` (选题分析 UI), `api/analysis/articles/` (第三方数据代理), `api/analysis/history/` (历史存储接口), `creation/`, `publish/`.
- `components/` — 可复用 UI，如 `components/ui/button.tsx` 及侧边栏；复杂视图应拆分到这里。
- `lib/` — 领域逻辑与工具。例如 `analysis.ts` 负责第三方响应映射，`topics.ts` 封装历史保存查询，`sqlite.ts` 提供 sqlite3 CLI 调用。
- `need/` — 需求说明与 mock 数据 (`mock_kw_search.json`)；生产环境仅用于开发参考。
- `data/` — 运行时生成的 `content-factory.db`（已在 `.gitignore`）；本地存储关键词历史与洞察快照。

## Build, Test, and Development Commands
- `npm run dev` — 本地开发服务器 (默认 `http://localhost:3000`)。
- `npm run build` — 生产构建，CI 必跑。
- `npm start` — 以生产模式运行 `.next` 产物。
- `npm run lint` — ESLint/Next.js 规则校验。首次执行先按提示生成 `.eslintrc`.
- 建议本地安装 `sqlite3`，以便历史接口正常工作：`sqlite3 data/content-factory.db "select count(*) from topics;"`.

## Coding Style & Naming Conventions
- TypeScript、React 18 hooks-first。组件使用 PascalCase；hooks/utilities用 camelCase。
- Tailwind CSS 为主，复杂样式提取到 `globals.css` 或新组件。使用 `cn()` 合并类名。
- 坚持 DRY：跨页面逻辑放在 `lib/`；重复 UI 封装到 `components/`.
- ESLint + TypeScript strict；提交前运行 `npm run lint` 并清理 `console.log`.

## Testing Guidelines
- 目前无自动化测试；提交前需至少手动验证 `app/analysis`（包含 mock/remote 切换、历史保存、回放、导出）。
- 如增加自动化测试，推荐 Playwright/E2E，命名 `tests/<feature>.spec.ts`，并在 PR 描述中粘贴运行命令与结果。

## Commit & Pull Request Guidelines
- Commit message 建议使用简短的 `type: summary`：例如 `feat: persist topic history`、`fix: filter meaningless keywords`.
- PR 描述需包含：变更摘要、验证步骤、影响范围（API/DB/Env）、必要的截图或日志；若修改 `need/` 或数据库 schema，请强调迁移步骤。

## Security & Configuration Tips
- 真实接口密钥通过 `DAJIALA_API_KEY` 提供；默认 fallback 仅供开发。
- `USE_KW_SEARCH_MOCK` 控制数据来源，生产部署请显式设置并确保服务器可访问 `https://www.dajiala.com`.
- `data/` 目录包含本地 SQLite 数据，不要提交。备份前可执行 `sqlite3 data/content-factory.db ".backup backup.db"`.
