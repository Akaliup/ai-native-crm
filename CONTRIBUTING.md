# 贡献指南

本仓库从开源项目的源码快照开始，保留 MIT 许可证与上游来源。请区分继承能力与自己的增量；不补造历史提交、生产指标或个人职责。

## 开始之前

1. 阅读 [CLAUDE.md](CLAUDE.md) 和 [AGENTS.md](AGENTS.md)。约定冲突时，CLAUDE.md 优先。
2. 阅读 [架构说明](ARCHITECTURE.md) 和 [文档入口](docs/index.md)。
3. 检查 `git status`、当前分支和远程地址。不要操作其他会话尚未提交的文件。
4. 从更新后的 main 建立命名分支，使用 merge 保留已有工作；不执行 `reset --hard` 或强制推送。

仓库提供 `.agents/skills/` 指南。在 Codex 中可以调用 `$pi-native-contribuir`；安装和排障可调用 `$pi-native-instalar`。需要安装到全局位置时使用 `bash scripts/instalar-guias.sh`，编辑本地指南时可使用 `--fonte .`。

## 分支与提交

```text
feat/short-description
fix/short-description
docs/short-description
chore/short-description
```

采用 Conventional Commits，例如 `fix(ci): repair image smoke tag`。如果关联 epic，在提交和 PR 中注明真实来源。不要把自己的品牌、密钥或部署配置混入通用产品改动。

## 实现与检查

```bash
pnpm cercas
pnpm typecheck
pnpm lint
pnpm lint:channels
pnpm lint:role-rank
pnpm test:unit
pnpm build
```

按改动范围追加：

- 数据库 schema、RLS 或租户隔离：`pnpm test:db`。
- UI 或用户流程：`pnpm test:e2e`，使用本地测试数据库并保留截图或 trace。
- Dockerfile、compose、安装和升级脚本：`pnpm test:shell`。

`pnpm gov:verify` 不能替代数据库、浏览器和自托管脚本检查。无法运行某项检查时，在 PR 说明原因和已经证明的范围，不勾选未执行项目。

## 必须守住的边界

- 外部输入经过 Zod；角色使用规范 guard；组织 ID 来自可信身份。
- service role 查询显式过滤组织，新增组织表启用 RLS。
- 相关写入发出审计；使用结构化 logger，不遗留 `console.log`。
- schema 变更提交 migration、baseline 幂等追加和 MANIFEST 三项；不改已应用 migration。
- 新变量进入 `.env.example` 和 `lib/env.ts`，默认值不能破坏已有安装。
- 私有配置、真实客户数据和访问令牌不进入仓库。
- 新页面必须有导航入口；新行为说明输入、输出、下一步及人工接管路径。
- 自托管更新不要求用户手动修改源码；已有代理环境遵循部署 runbook。

`tests/invariants/` 保存产品约束。若业务变更与约束冲突，先在 PR 说明理由，不删除或放宽断言来获得绿色结果。当前完整 Definition of Done 见 [CLAUDE.md](CLAUDE.md)。

## PR 与发布记录

PR 说明应包含：触发问题、最终行为、改动归属、测试命令和结果、没有测量的内容。不要仅凭仓库里有某文件声称已完成线上交付。

可见行为变更提供 `.changes/` 片段，格式参照现有文件，执行 `pnpm release:conferir`。不手写 CHANGELOG 版本章节；版本由发布流程生成。

大型 epic 保留 `epic_id`、`priority`、`depends_on`、`status` 等机器字段，完成后更新执行记录和 `docs/stories/epics/MASTER.md`。如果维护者向 PR 分支追加修复，先拉取再继续，不使用强制推送覆盖。

## 品牌与许可证

品牌由数据库和设置界面管理，不修改 `DEFAULT_APP_NAME` 或硬编码产品名称来定制某个客户。参见 [品牌说明](docs/white-label.md)。保留 LICENSE 和原版权声明。
