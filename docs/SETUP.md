# 本地开发与运行配置

本指南面向 Windows、macOS 和 Linux 开发环境。完整 CRM 需要数据库、身份服务和任务进程；只执行 `pnpm dev` 不会自动创建这些服务。

## 选择要看的版本

- 只浏览界面：`node scripts/serve-agent-demo.mjs`，打开 `http://127.0.0.1:3008/#/app/ai/workbench`。这是独立演示，不执行真实数据库和发送链路。
- 查看真实工作台：按下列步骤配置后，访问 `http://localhost:3000/app/ai/workbench`。
- 部署 VPS：阅读 [部署说明](runbooks/deploy.md)，或在 Codex 中调用 `$pi-native-instalar`。

## 1. 准备开发工具

- Node.js 22 或更高版本。
- 项目固定的 pnpm 9.15.9，不使用 npm/yarn 改写依赖。
- Git；Windows 推荐使用 Git for Windows 附带的 Git Bash 执行 shell 脚本。
- Docker Desktop 或等价 Docker 环境，用于本地数据库和其他服务。

```powershell
git clone https://github.com/Akaliup/ai-native-crm.git
cd ai-native-crm
corepack pnpm install --frozen-lockfile
```

### 创建开发配置

在项目根目录创建 `.env.local`。只在文件不存在时复制模板，避免覆盖已有配置：

```powershell
if (!(Test-Path .env.local)) { Copy-Item .env.example .env.local }
```

只参考 `.env.example`；不要把实际密钥提交到 GitHub、复制到 issue 或展示在录屏里。`NEXT_PUBLIC_` 变量可被浏览器读取，不能用于保存私钥。完整变量契约见 `lib/env.ts`。

## 2. 配置 Supabase

Supabase 提供 Postgres、Auth、Realtime 和 Storage。可使用自己的开发项目，也可运行本地 Supabase。测试套件只允许连接本地数据库，不连接真实客户环境。

从你自己的项目设置中获取：

| 变量 | 内容 | 边界 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | 项目 API URL | 浏览器可见 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 兼容该项目的 anon 公钥 | 数据访问仍受 RLS 约束 |
| `SUPABASE_SERVICE_ROLE_KEY` | service role 密钥 | 仅服务端；绕过 RLS |
| `SUPABASE_DB_URL` | Postgres 连接 URI | 仅本机/服务端；包含数据库凭据 |

所有值必须来自同一个开发项目。不要把 anon 与 service role 的值互换。项目创建成功还不代表 CRM 数据表已经初始化。

### 初始化新数据库

空数据库的基础 schema 来自 `supabase/baseline.sql`。不要只运行旧 migrations 链来创建新库：早期部分 migration 是占位文件。

在已配置连接、安装 psql 的 Git Bash 或 Linux/macOS shell 中执行：

```bash
pnpm db:migrate
```

脚本见 `scripts/db-migrate.sh`，会处理基础扩展并应用 baseline。已有数据库升级应遵守项目迁移流程，不能删除已有数据或编辑已应用 migration。

如需要消息媒体存储，检查私有 bucket `whatsapp-media`。不要为了让图片显示而把私有 bucket 改为公开；应用使用签名 URL。

## 3. 配置服务端密钥

`INTERNAL_SECRET` 用于内部接口；加密字段由 `CPF_ENCRYPTION_KEY`、`WAHA_BYO_ENCRYPTION_KEY`、`AI_CRED_AES_KEY` 等保护。按 `.env.example` 与 `lib/env.ts` 为各项配置独立的随机值。

生成一段 32 字节随机数据的命令：

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

不要把示例占位值当作真实部署密钥。已经加密数据的环境不能随意更换加密密钥，否则旧数据可能无法读取。可选 MFA、临时支持和导出功能还可能需要自己的配置，以模板和界面提示为准。

## 4. 配置 Redis 与渠道

`UPSTASH_REDIS_REST_URL` 和 `UPSTASH_REDIS_REST_TOKEN` 对应 Redis HTTP 接口。普通 Redis TCP 地址不能直接当作 REST URL 使用。完整应用的必要配置以 `lib/env.ts` 校验结果为准；服务暂时不可达时的降级方式因调用点而异。

渠道开发需要相应的适配服务及以下配置：

- `WAHA_API_BASE_URL`：本地服务的 API 地址。
- `WAHA_API_KEY`：与该服务匹配的访问凭据。
- `WAHA_WEBHOOK_BASE_URL`：服务回调能访问的 Web 地址。

启动前查看使用的 compose 文件和端口映射，不要把历史文档里的端口当作固定事实。只看 CRM 页面不代表渠道已经连通；正式消息应通过连接界面的配置和测试完成。

## 5. 启动 Web、Worker 与调度

分别打开终端运行：

```powershell
corepack pnpm dev
```

```powershell
corepack pnpm worker
```

```powershell
corepack pnpm dev:crons
```

打开 `http://localhost:3000`，完成注册、组织创建和必要配置。只启动 Web 时页面可能正常，但排队的 Agent 任务不会因此自动执行。

Worker 和调度脚本会读取安装配置文件。若脚本要求 `.env`，根据模板准备本机文件，不要从他人的安装复制真实密钥。

## 6. 配置模型与知识能力

在组织的 AI 凭据和模型设置中配置实际凭据、默认模型及工具调用能力。Pi Agent Core 运行循环，Model Gateway 解析模型、凭据和预算；兼容端点只提供模型服务，不替代业务 Harness。

未配置模型时可以查看部分页面，但不能把静态结果当作真实执行。知识库索引需要可用的 embedding 模型和对应凭据。费用、额度及支持模型以供应商当前控制台为准，本指南不承诺免费额度。

Mem0、WeKnora、Langfuse 为可选服务接入，见 [服务接入契约](integrations/agent-services.md)。没有连接的服务不应显示为已验证连通。

## 7. 配置邮件

推荐通过平台管理员的邮件设置界面配置 SMTP，并测试连接。SMTP 可用时走 SMTP；未配置时按路由配置选择 Resend，不通过发送失败后盲目切换来重复发送。

也可参考模板中的 `SMTP_*`、`RESEND_API_KEY` 和 `RESEND_FROM_EMAIL`。生产发送域名需要按供应商要求配置 DNS。未配置邮件时，部分邀请可通过界面复制接受链接；不能据此声称邮件已经送达。

## 8. 其他可选集成与观测

Nuvemshop 等集成需要独立的 OAuth 与组织绑定。没有配置时应显示缺失状态，不能用同名虚构数据代替联调结果。

错误报告见 Sentry 配置。开发时如需关闭对应 DSN，可参考项目支持的 `SENTRY_DSN=off`；关闭观测不等于错误已被修复。不要在日志记录 token、邮箱、电话或完整私密消息。

## 9. 验证与浏览器测试

```powershell
corepack pnpm typecheck
corepack pnpm lint
corepack pnpm test:unit
corepack pnpm build
```

数据库检查：`pnpm test:db`，需要 Docker。安装包检查：`pnpm test:shell`，需要兼容的 shell 环境。

浏览器套件使用专用 `.env.e2e`。先启动本地 Supabase，再执行 `pnpm e2e:env`，按仓库 E2E 脚本构建并运行 `pnpm test:e2e`。配置检查会拒绝非 localhost/127.0.0.1 的 Supabase，不能绕过这项保护来连接生产。

界面语言由个人偏好、组织语言、浏览器信号及默认语言按对应页面规则解析。中文场景应验证中文断言；旧葡萄牙语场景显式选择 `pt-BR`。不能为消除测试报错而关闭语言检查。

## 10. 常见问题

| 现象 | 优先检查 |
| --- | --- |
| 日志显示三个 Supabase 变量为 undefined | `.env.local` 是否在项目根目录、是否保存、是否重启服务 |
| 能登录但没有 CRM 表 | 是否应用 baseline；项目 URL 与数据库连接是否属于同一项目 |
| Agent 任务一直排队 | Worker 是否运行、组织模型是否配置、任务是否等待审批 |
| 修改配置没有生效 | 停止并重启相关进程；检查个人和组织已有设置是否覆盖默认值 |
| 找不到 pnpm | 使用 Corepack 调用固定版本；不要改用 npm install 生成另一份锁文件 |
| Windows shell 脚本无法执行 | 使用 Git Bash，检查 PATH 与 Docker 是否运行 |
| 只看到静态演示数据 | 确认访问的是演示端口还是完整 Next.js 应用 |
| GitHub 红叉 | 打开失败步骤的日志；上传成功不等于测试成功 |

更多边界见 [架构说明](../ARCHITECTURE.md)、[贡献指南](../CONTRIBUTING.md) 与 [演示和源码入口](INTERVIEW-DEMO.zh-CN.md)。
