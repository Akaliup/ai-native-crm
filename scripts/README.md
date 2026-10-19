# scripts/

用于本地开发、验证和部署的命令行脚本。

## 常用检查

- `sonda-pi-na-imagem.mjs`：在已构建的应用目录执行，检查 Pi SDK、原生模块和模型目录是否随镜像交付，不调用模型。
- `sonda-pdf-na-imagem.mjs`：检查实际构建产物能否读取 PDF 文本。
- `seed-e2e-credentials.ts`：为本地 E2E 创建测试账号、权限和已知语言偏好，不连接生产数据。
- 其他脚本的用途、参数及前置条件见各文件头部说明。

## 执行约定

- TypeScript 使用 `pnpm exec tsx`，JavaScript 使用 `node`，shell 使用 Bash。
- 外部输入经过 Zod 验证，真实密钥和客户信息不输出到日志。
- 运行前确认目标环境，破坏性操作使用对应脚本的确认参数。
- 相关业务写入保留审计记录；不要把测试环境中的演示数据当作线上验收证据。
