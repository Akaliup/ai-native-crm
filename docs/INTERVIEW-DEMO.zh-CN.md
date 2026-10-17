# 面试演示与 GitHub 上传

## 项目来源与本次贡献

本项目基于开源 [helsome/AiNativeCrm](https://github.com/helsome/AiNativeCrm)，许可证见根目录 LICENSE。请保留原作者、许可证及来源信息。不能把整个上游项目表述为个人独立开发。

本次改动：在真实 Agent–CRM 工作台加入执行证据概览，将客户作用域、操作审批、已记录来源、评测和下一步集中展示。未知写入的人工对账优先于模型建议，评测读取错误不显示旧的通过结论。复用仓库已有的开源 Lucide 图标及 Sheet 详情抽屉，没有引入新服务或数据库字段。

## 演示路径

1. 按 docs/SETUP.md 配置开发环境，使用 pnpm 9.15.9 和 Node 22 或更高版本。仅使用虚构客户，不展示密钥。
2. 登录真实 CRM，进入 `/app/ai/workbench`，从任务设置限定客户或商机。
3. 先使用只读检查，输入真实调查目标。没有模型配置时先连接组织模型，不使用虚构结果代替执行。
4. 展示概览与运行详情中的工具事件、来源和评测。运行完成不意味着消息送达或业务验收。
5. 对需要写入的任务检查策略和审批。对待对账状态先核对目标对象，不能直接重放未知副作用。
6. 查看下一步与缺失信息，解释何时交给人工继续。

无需密钥的独立预览位于 `examples/chat-first-demo/dist/index.html`。它是已有的静态示例，包含虚构场景及标明来源的历史录制；不运行 Next.js CRM、数据库、Worker 或真实发送链路。本次工作台概览属于真实应用，不会自动出现在静态示例中。

## 面试官问到文件

| 问题                   | 从哪个文件讲起                                                          |
| ---------------------- | ----------------------------------------------------------------------- |
| 前端证据如何展示       | `app/app/ai/workbench/_components/ExecutionOverview.tsx`                |
| 真实请求与人工审批入口 | `app/app/ai/workbench/_components/AgentCrmWorkbench.tsx`                |
| 组织权限与初始数据     | `app/app/ai/workbench/page.tsx`                                         |
| MCP 入口和共享工具     | `app/api/mcp/route.ts`、`lib/mcp/tools/index.ts`                        |
| checkpoint 的来源时序  | `lib/agent-engine/agent/checkpoint-contract.ts`                         |
| 队列与领取身份         | `lib/agent-engine/queue/queue.ts`、`lib/agent-engine/queue/claim.ts`    |
| 来源断言和语义评价     | `lib/ai/evals/evidence-provenance.ts`、`lib/ai/evals/semantic-judge.ts` |

讲述时区分上游已有实现、你能解释的代码和你的实际贡献。不要仅凭文件存在宣称完成部署、压测或第三方联调。

## 上传自己的 GitHub 仓库

当前目录没有 `.git`。若要保留上游历史，推荐先 Fork 上游，再克隆自己的 Fork，将本次修改文件复制进去。若选择把当前源码作为独立快照发布，在 GitHub 创建空仓库，保留 LICENSE 和来源说明。

下面是独立快照方式，在项目根目录用 PowerShell 执行。先安装 Git，并把地址替换成自己的仓库。

```powershell
git init -b main
git status --short
git add .
git diff --cached --stat
git diff --cached --name-only
# 检查清单，移除密钥、客户数据、录制和不应公开的文件后再提交
# 只靠 .gitignore 不足以证明暂存区安全
git commit -m "feat: add CRM execution evidence overview"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

不要上传 `.env*` 的实际配置、访问令牌、客户导出或真实聊天记录。上传源码不等于部署应用；完整运行仍需要数据库、模型与 Worker 配置。

## 验证范围

新增组件测试覆盖未运行空态、待对账优先级、详情入口及评测读取失败。执行 `pnpm test:unit app/app/ai/workbench/_components/ExecutionOverview.test.tsx`、`pnpm typecheck` 和 `pnpm lint`。真实环境验证须另执行 `pnpm test:e2e`，使用本地 Supabase 和虚构数据，保存截图或 trace。未运行的检查不能标为通过。

本次属于核心现有页面的只读展示调整。输入为既有运行接口，输出为任务设置和详情抽屉；无新增业务写入，因此不产生新的审计事件，现有审批仍走原 handler。没有新增配置或自动决策。下一步复用结果文档，待对账和待审批优先提示人工处理；错误可通过现有详情重试入口继续。导航沿用已有工作台入口。
