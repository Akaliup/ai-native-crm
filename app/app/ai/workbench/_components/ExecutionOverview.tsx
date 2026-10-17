"use client";

import { Database, ShieldCheck, FileSearch, ArrowUpRight } from "lucide-react";
import styles from "./execution-overview.module.css";

type Props = {
  scopeLabel: string;
  mode: string;
  run: {
    status: string;
    proposals: Array<{ status: string; result_summary?: Record<string, unknown> | null }>;
    observed_evidence?: unknown[];
    evaluation?: { verdict: string; semanticJudge: { status: string } };
    evaluationError?: string;
    result_document?: { nextStep: string; missingInformation: string[] } | null;
  } | null;
  onSettings: () => void;
  onDetails: () => void;
};

const verdicts: Record<string, string> = {
  pass: "评测结论通过",
  fail: "评测结论失败",
  needs_review: "需要人工复核",
  not_run: "尚未评测",
};

/** Read-only projection of the existing run response; never infers delivery or acceptance. */
export function ExecutionOverview({ scopeLabel, mode, run, onSettings, onDetails }: Props) {
  const pending = run?.proposals.filter((item) => item.status === "pending").length ?? 0;
  const reconciliation = run?.proposals.some(
    (item) => item.result_summary?.outcome === "reconciliation_required",
  );
  const nextStep = reconciliation
    ? "先核对目标对象与执行记录，再决定如何处理未知写入"
    : pending > 0
      ? `复核 ${pending} 项待确认动作，再决定是否批准`
      : run?.result_document?.nextStep ||
        (run ? "打开运行详情，核对事件、来源与评测" : "选择客户作用域，以只读检查开始调查");

  return (
    <section aria-label="执行证据概览" className={styles.overview}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>CRM / AGENT WORKSPACE</span>
          <h2>从客户事实到可复核执行</h2>
        </div>
        <span className={styles.badge}>{run ? `运行状态 · ${run.status}` : "等待真实运行"}</span>
      </div>
      <div className={styles.grid}>
        <button type="button" onClick={onSettings} className={styles.card}>
          <Database aria-hidden="true" size={18} />
          <span className={styles.label}>任务设置作用域</span>
          <strong>{scopeLabel || "当前组织 · 未限定单个客户"}</strong>
          <span>
            当前配置 · 历史运行以详情记录为准 <ArrowUpRight aria-hidden="true" size={14} />
          </span>
        </button>
        <button type="button" onClick={onDetails} className={styles.card}>
          <ShieldCheck aria-hidden="true" size={18} />
          <span className={styles.label}>业务授权</span>
          <strong>
            {reconciliation
              ? "存在待对账写入"
              : pending
                ? `${pending} 项等待人工确认`
                : mode === "act"
                  ? "分级自治模式"
                  : "只读检查模式"}
          </strong>
          <span>以实际策略事件和审批记录为准</span>
        </button>
        <button type="button" onClick={onDetails} className={styles.card}>
          <FileSearch aria-hidden="true" size={18} />
          <span className={styles.label}>来源与评测</span>
          <strong>
            {run?.evaluationError
              ? "评测读取失败"
              : run?.evaluation
                ? (verdicts[run.evaluation.verdict] ?? run.evaluation.verdict)
                : "尚无评测结论"}
          </strong>
          <span>
            {run ? `${run.observed_evidence?.length ?? 0} 条已记录来源` : "运行后查看来源记录"} ·
            语义评分不替代审批
          </span>
        </button>
      </div>
      <div className={styles.next}>
        <span className={styles.label}>下一步</span>
        <p>{nextStep}</p>
        <button type="button" onClick={run ? onDetails : onSettings}>
          {run ? "查看证据" : "设置任务"}
          <ArrowUpRight aria-hidden="true" size={14} />
        </button>
      </div>
      {run?.result_document && (
        <p className={styles.missing}>
          结果文档与补充信息由 Agent 提交，需结合来源和实际 CRM 状态复核
          {run.result_document.missingInformation.length > 0
            ? ` · 尚缺 ${run.result_document.missingInformation.join(" · ")}`
            : ""}
        </p>
      )}
    </section>
  );
}
