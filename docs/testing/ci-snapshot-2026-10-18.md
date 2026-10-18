# 源码快照导入后的 CI 修复

目标仓库：Akaliup/ai-native-crm。原始提交：`34b93de7255722507fd9abe990a36125c000500b`。

## GitHub 日志中的失败

| 运行 | 原因 | 修复 |
| --- | --- | --- |
| [perf 39079651328](https://github.com/Akaliup/ai-native-crm/actions/runs/39079651328) | 编译成功后，TypeScript 进程在约 2 GiB 堆限制处 OOM | Build 步骤设置 4096 MiB Node 堆，不跳过类型检查 |
| [e2e 39079651335](https://github.com/Akaliup/ai-native-crm/actions/runs/39079651335) | 五个分片均在浏览器测试开始前的生产构建阶段 OOM | E2E job 设置相同堆限制，保留全部 specs |
| [ci 39079651284](https://github.com/Akaliup/ai-native-crm/actions/runs/39079651284) | 结构扫描调用外部 rg，执行失败被 catch 转为空集合；正向控制与消费者检查失败 | 用 Node 遍历一次源码，读取失败直接抛错 |
| 同一 CI 的 verify-parte (2) | 单测仍在运行时达到 15 分钟取消上限，超过 12 分钟预算 | 两个分片改为四个，保持预算和取消门槛 |

原始 CI 中 Postgres 15、17 的数据库不变量检查均通过。该结果只属于原始提交。

## 本地发现的额外问题

Windows 下 `relative()` 生成反斜杠路径，结构测试选择器的 glob 无法匹配，并且数据库套件排除规则失效。现统一输出 `/` 路径，保留对其他 runner 套件的排除，并补回归断言。

## 范围

改动属于基础设施和文档，不改变业务权限、数据库 schema 或工具效果。README 明确区分开源基座与本仓库增量，并将克隆地址指向本仓库。未改写既有提交，未补造个人开发历史。面试练习目录不包含在本次提交中。

相关测试和完整结构测试由本地运行；生产构建、全量单测和完整 E2E 的最终结果应以修复分支的 GitHub Actions 为准。不能用重新运行按钮把原始失败当作已经修复。
