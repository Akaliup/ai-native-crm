# 架构说明

本项目基于开源 Pi Native CRM。本文介绍现有系统边界；文件存在不等于当前环境已经完成部署或联调。开发约定以 [CLAUDE.md](CLAUDE.md) 为准，文档入口见 [docs/index.md](docs/index.md)。

## 系统分层

| 层 | 职责 | 主要入口 |
| --- | --- | --- |
| Web 应用 | Next.js App Router 页面和 Route Handlers；默认使用 Server Components，交互部分使用 Client Components | `app/`、`components/` |
| 身份与组织 | Supabase Auth、组织成员关系、角色、可选 MFA | `lib/auth/`、`proxy.ts` |
| 数据库 | Postgres 保存客户事实、执行状态和审计；组织数据受 RLS 约束 | `lib/supabase/`、`supabase/` |
| Agent 内核 | Pi 驱动模型与工具循环，适配层隔离供应商类型 | `lib/agent-runtime/` |
| 业务执行约束 | 限定客户作用域、工具效果、审批、预算与结果提交 | `lib/ai/agents/` |
| 持久任务 | SQL 队列、领取身份、重试、恢复和取消；数据库 trigger 不直接发送 HTTP | `lib/agent-engine/queue/`、`workers/` |
| 工具接口 | 外部 MCP 与内部运行时复用领域 handler | `app/api/mcp/`、`lib/mcp/` |
| 知识与评测 | RAG、确认记忆、来源核验、语义评价与回归样例 | `lib/ai/` |

Model Gateway 负责模型供应商、组织凭据、模型绑定、预算、价格、用量和审计。Vercel AI SDK 用于 embeddings 和辅助调用；Agent 循环的规范内核是 Pi。

## 认证请求如何流转

```text
request
  → proxy.ts：请求关联标识、会话与公开路径判断
  → Zod：验证 body、query、path
  → requireRole / requirePlatformAdmin / secret / HMAC
  → 从可信身份解析 organization_id
  → 会话客户端使用 RLS；service role 查询显式过滤组织
  → 相关写入调用 audit()
  → ok() / fail() 返回统一响应
```

每个组织相关数据表包含 `organization_id`。service role 会绕过 RLS，不能把前端或模型传入的组织 ID 当作授权依据。服务端使用 `getUser()` 验证用户，不使用 `getSession()` 作为身份依据。

HTTP JSON 使用 snake_case，时间使用 ISO-8601 UTC，金额以 `_cents` 和 `currency` 表示。`X-Request-Id` 关联请求与审计。新增幂等创建接口时应检查 `lib/api/idempotency.ts`，不能假定所有 POST 已支持相同的幂等保证。

## Agent 的业务路径

```text
客户消息 → 渠道验签与去重 → event_log / SQL 队列
→ Worker 领取 → 组装 CRM、知识和记忆上下文
→ Pi 模型与工具循环 → Harness 策略和审批
→ 受控业务效果 → 事件、来源、用量与 Eval
→ 下一步、恢复或人工接管
```

模型完成、工具执行、进入发送队列、渠道送达和业务验收是不同状态。租约约束执行所有权；外部操作可能完成但本地记账未知时，需要对账，不能直接重放。

## 外部依赖

- Supabase：数据库、身份、Realtime、私有 Storage，是完整应用的基础依赖。
- 渠道适配器：负责消息接收、发送、会话与渠道约束。供应商细节集中在 `lib/channels/` 等适配层。
- Redis：用于限流和部分协调能力；具体降级行为由对应实现决定。
- 模型与知识服务：按组织配置凭据和启用状态；未配置时应在界面说明缺失能力。
- 邮件：可配置 SMTP 或 Resend；路由见 `lib/email/roteador.ts`。
- Sentry：错误观测与敏感信息清理；配置和隐私边界见源码。

## 自托管与数据库变更

新数据库以 `supabase/baseline.sql` 为基础。schema 变更必须同时包含：版本 migration、baseline 幂等追加、`supabase/migrations/MANIFEST.md` 记录。不能编辑已经应用的 migration。

生产 compose 使用已发布镜像；自托管更新必须能到达已有安装。涉及镜像、compose 或安装包时执行 `pnpm test:shell`。如果环境已有反向代理，遵循 [部署说明](docs/runbooks/deploy.md) 同时使用对应 compose 文件。

## 继续阅读

- [开发配置](docs/SETUP.md)
- [贡献指南](CONTRIBUTING.md)
- [请求与平台契约](docs/specs/01-spec-platform-base.md)
- [事件与 Worker 契约](docs/specs/07-spec-events-workers.md)
- [Agent–CRM 工作台](docs/architecture/agent-crm-workbench.md)
- [安全威胁模型](docs/threat-model.md)
- [架构与系统持续运行约定](docs/doctrine/sistema-vivo.md)
