import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ExecutionOverview } from "./ExecutionOverview";

describe("ExecutionOverview", () => {
  it("does not invent an evaluation before a run and opens scope settings", () => {
    const settings = vi.fn();
    render(
      <ExecutionOverview
        scopeLabel=""
        mode="inspect"
        run={null}
        onSettings={settings}
        onDetails={vi.fn()}
      />,
    );
    expect(screen.getByText("等待真实运行")).toBeInTheDocument();
    expect(screen.getByText("尚无评测结论")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "设置任务" }));
    expect(settings).toHaveBeenCalledOnce();
  });

  it("prioritizes unknown writes over model next steps and passing evaluation", () => {
    const details = vi.fn();
    render(
      <ExecutionOverview
        scopeLabel="客户 A"
        mode="act"
        onSettings={vi.fn()}
        onDetails={details}
        run={{
          status: "partial",
          proposals: [
            { status: "executed", result_summary: { outcome: "reconciliation_required" } },
          ],
          evaluation: { verdict: "pass", semanticJudge: { status: "completed" } },
          result_document: { nextStep: "再次发送", missingInformation: ["订单确认"] },
        }}
      />,
    );
    expect(screen.getByText("存在待对账写入")).toBeInTheDocument();
    expect(
      screen.getByText("先核对目标对象与执行记录，再决定如何处理未知写入"),
    ).toBeInTheDocument();
    expect(screen.queryByText("再次发送")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "查看证据" }));
    expect(details).toHaveBeenCalledOnce();
  });

  it("shows evaluation retrieval errors instead of an earlier verdict", () => {
    render(
      <ExecutionOverview
        scopeLabel="客户 A"
        mode="inspect"
        onSettings={vi.fn()}
        onDetails={vi.fn()}
        run={{
          status: "completed",
          proposals: [{ status: "pending" }],
          evaluationError: "offline",
          evaluation: { verdict: "pass", semanticJudge: { status: "completed" } },
        }}
      />,
    );
    expect(screen.getByText("评测读取失败")).toBeInTheDocument();
    expect(screen.queryByText("评测结论通过")).not.toBeInTheDocument();
    expect(screen.getByText("复核 1 项待确认动作，再决定是否批准")).toBeInTheDocument();
  });
});
