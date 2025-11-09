# Repository Guidelines

## Project Structure & Module Organization
- `app/`：Next.js App Router 页面与 API Route，子目录如 `analysis/`（选题分析 UI）、`api/analysis/articles/`（公众号搜索代理）、`creation/`、`publish/` 等；页面组件均采用客户端组件并依赖 shadcn/ui。
- `components/`：复用 UI（`components/ui`）与导航类组件，必要时在此扩展表单、图表等通用模块。
- `lib/`：工具方法与领域模型，例如 `analysis.ts` 定义第三方接口 payload/映射；新增共享逻辑请优先放入此处。
- `need/`：需求文档与模拟数据（如 `mock_kw_search.json`）；仅供开发阶段调试，不应在生产环境读取。
- 其他关键文件：`next.config.js`（图片白名单）、`tailwind.config.ts`、`tsconfig.json` 等，请在修改前确认对全局构建的影响。

## Build, Test, and Development Commands
- `npm run dev`：启动本地开发服务器（默认 `http://localhost:3000`），支持热更新。
- `npm run build`：执行 Next.js 生产构建，生成 `.next` 产物，请确保在 CI 中运行。
- `npm start`：以生产模式启动已构建应用。
- `npm run lint`：运行 Next.js/ESLint 规则；首次执行需根据提示生成 `.eslintrc`。

## Coding Style & Naming Conventions
- TypeScript + React 18：优先使用函数组件及 hooks，启用严格模式；公共类型放在 `lib/`。
- 样式使用 Tailwind CSS，类名按语义分组；复杂样式提取到 `globals.css` 或新建组件。
- 组件、hook 文件名使用 kebab-case，导出的 React 组件使用 PascalCase；非 UI 工具以 camelCase 命名。
- 严格执行 DRY：跨页面逻辑放入 `lib/` 或 `components/`，避免复制粘贴。

## Testing Guidelines
- 当前仓库未集成自动化测试；提交前至少手动验证 `analysis` 页面（包含模拟与实时数据切换）及关键 API。
- 推荐新增测试时采用 Playwright/E2E 场景覆盖数据流，测试文件放在 `tests/`（需自行创建），命名遵循 `<feature>.spec.ts`。
- 所有测试（若存在）需在 PR 中说明运行命令与结果。

## Commit & Pull Request Guidelines
- Commit 信息遵循“类型: 描述”模式，例如 `feat: add mock dataset switch`、`fix: handle remote api errors`；聚焦单一变更，必要时拆分。
- PR 描述需包含：变更摘要、测试/验证步骤、相关截图或日志，以及引用的 issue/任务编号。
- 当 PR 涉及 API、配置或需求文件（`need/`）调整时，请在描述中明示影响面，并提醒评审重点验证线上密钥。

## Security & Configuration Tips
- 真实 API Key 使用环境变量 `DAJIALA_API_KEY` 注入；默认的 fallback key 仅供本地调试。
- `USE_KW_SEARCH_MOCK` 控制选题分析是否使用模拟数据，CI 与本地推荐默认启用（即不设置或设为 `true`），生产环境显式设为 `false` 并确保网络可访问第三方接口。

