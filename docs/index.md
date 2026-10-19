# 文档导航

这里是本仓库的阅读入口。首页、安装指南、架构概览、贡献指南、安全政策与项目愿景已提供中文；深层规范、历史记录和部分运维手册仍保留上游原文。文件名、代码标识符与协议字段保持兼容。

文档可能记录过去状态或未来规划。判断功能是否可用，请结合当前源码、测试和实际演示，不将规划与历史验收直接视为今天的能力。

## 从这里开始

| 文档 | 用途 |
|---|---|
| [项目首页](../README.md) | 项目定位、开源来源、本仓库改动与演示入口 |
| [本地安装](SETUP.md) | 完整服务所需依赖、环境配置和启动步骤 |
| [架构概览](../ARCHITECTURE.md) | 应用、权限、数据与 Agent 执行边界 |
| [项目愿景](../VISION.md) | 上游定位、自托管方式与发展方向 |
| [贡献指南](../CONTRIBUTING.md) | 开发约定、验证命令与提交要求 |
| [安全政策](../SECURITY.md) | 私下报告漏洞与保护敏感信息 |
| [行为准则](../CODE_OF_CONDUCT.md) | 社区参与规则 |
| [当前状态](current-state.md) | 实现状态记录，需要结合代码与日期复核 |
| [版本历史](../CHANGELOG.md) | 升级前了解变更与操作要求 |

## 开发规范与架构

文档冲突时按以下顺序处理：`CLAUDE.md` → 技术规范 → 产品需求 → 历史交接 → 项目首页。修改低优先级说明前先核对对应实现。

| 入口 | 内容 |
|---|---|
| [编码规则](../CLAUDE.md) | 开发约定、禁止模式与完成标准 |
| [Agent 仓库指南](../AGENTS.md) | 目录、命令与认证入口 |
| [系统连续性原则](doctrine/sistema-vivo.md) | 下一步、人工交接、日志与闭环要求 |
| [原则实践手册](doctrine/sistema-vivo/README.md) | 各项原则的原因与应用方法 |
| [交付与镜像规范](doctrine/packaging.md) | 自托管镜像、发布与升级约束 |
| [渠道限制](doctrine/restricao-de-canal.md) | 对外渠道的授权边界 |
| [对话与操作分离](doctrine/separacao-fala-e-operacao.md) | 客户沟通与内部执行的区分 |
| [扩展规范](doctrine/extensoes.md) | 核心能力与可选扩展的边界 |
| [架构图目录](architecture/README.md) | 组件、数据流与依赖图 |
| [Agent 回合图](architecture/agent-turn.html) | 消息进入、工具执行、保护检查与发送 |
| [威胁模型](threat-model.md) | 认证入口与攻击面分析 |
| [设计系统](design-system/README.md) | 组件、色彩、排版、动效与交互规范 |

## 产品与技术契约

产品需求说明意图，技术规范说明数据和接口契约；两者都需要与当前代码核对。

| 文档 | 主题 |
|---|---|
| [产品总需求](prd/00-prd-master.md) | 愿景、范围与指标 |
| [业务规则目录](business-rules/00-business-rules-catalog.md) | 业务规则的统一入口 |
| [平台基础](specs/01-spec-platform-base.md) | 租户、权限、API 与审计 |
| [客户视图](specs/02-spec-customer-360.md) | 客户与身份识别 |
| [WhatsApp 渠道](specs/03-spec-whatsapp-waha.md) | 消息收发、队列与渠道集成 |
| [销售流程与接待](specs/04-spec-pipeline-attendance.md) | 看板、接待与工单 |
| [AI 与知识检索](specs/05-spec-ai-rag-handoff.md) | RAG 与人工交接 |
| [集成与隐私](specs/06-spec-nuvemshop-lgpd.md) | 商店集成与数据保护 |
| [事件与 Worker](specs/07-spec-events-workers.md) | 领取任务、重试、退避与失败处理 |
| [部署与可观测性](specs/08-spec-deploy-observability.md) | 部署、日志与监控 |
| [前后端集成](specs/09-spec-frontend-backend-integration.md) | 界面与 API 对接 |
| [Agent 运行时](specs/10-spec-ai-agents-runtime.md) | Agent 执行契约 |
| [MCP 工具服务](specs/11-spec-mcp-server-internal.md) | 工具暴露与调用入口 |
| [Agent 界面](specs/12-spec-ai-agents-ui.md) | 配置与操作界面 |
| [外部 Agent 治理](specs/14-contrato-governanca-agentes-externos.md) | 外部调用的权限与治理 |
| [人工处理事项](specs/15-spec-casos-humanos.md) | Agent 委派给人的工作 |
| [声明式扩展](specs/extensoes-declarativas-v1.md) | 扩展包、目录与组织级启用 |

## 安装、运行与验证

| 文档 | 内容 |
|---|---|
| [自托管说明](deploy-selfhost/README.md) | VPS 安装与运行 |
| [HostGator 安装](deploy-hostgator/README.md) | 上游安装工具包 |
| [部署清单](DEPLOY-CHECKLIST.md) | 部署前后检查 |
| [升级说明](ATUALIZANDO.md) | 更新、恢复与健康检查 |
| [生产部署手册](runbooks/deploy.md) | Compose 组合与反向代理 |
| [CloudPanel 部署](runbooks/cloudpanel.md) | 已有代理环境的配置 |
| [AI 凭证轮换](runbooks/ai-credentials-rotation.md) | 轮换步骤与限制 |
| [用户旅程](testing/user-journey-map.md) | 端到端测试与页面验证范围 |
| [可选 Agent 服务](integrations/agent-services.md) | Mem0、WeKnora、Langfuse 接入边界 |
| [服务验证记录](testing/agent-services-2026-10-02.md) | 适配器证据及尚未完成的部署验证 |
| [系统验收记录](testing/system-acceptance-2026-10-03.md) | 模型、记忆、知识与失败门禁的历史证据 |

## 助手指南与历史资料

助手操作指南位于 [内置技能目录](../.agents/skills/pi-native-contribuir/SKILL.md)，涵盖安装、配置客户、分析指标、调整提示词和贡献代码。它们是开发助手的指南，不是产品界面中的 Agent Skills。

交接记录与阶段报告统一放入 [交接目录](handoffs/README.md)。[任务故事](stories/)、[阶段计划](superpowers/) 和 [原始开发待办](../tasks/todo.md) 用于追溯决策，不能代替当前验收。

`graphify-out/` 为本地生成的知识图谱，可能不存在或已经过期。查看源码和已提交文档不需要先生成它。
