import { useEffect, useState } from "react";
import { useKeyboard } from "@opentui/react";
import { Card } from "@/components/ui/card";
import { DataGrid } from "@/components/ui/data-grid";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Alert } from "@/components/ui/alert";
import { api } from "../services/api.js";

interface ConciliationRun {
  id: string;
  runAt: string;
  status: string;
  summary: { matched: number; discrepancies: number; missing: number };
}

interface ConciliationReport {
  conciliation: ConciliationRun;
  matches: Array<{
    id: string;
    internalTxId: string;
    externalTxId?: string;
    status: string;
    amountDiff: number;
    notes?: string;
  }>;
}

interface ConcsResponse {
  data: ConciliationRun[];
}

const statusBadge = (status: string) => {
  switch (status) {
    case "matched": return "success" as const;
    case "discrepancy": return "warning" as const;
    case "missing": return "error" as const;
    default: return "default" as const;
  }
};

export function ConciliationScreen() {
  const [concs, setConcs] = useState<ConciliationRun[]>([]);
  const [report, setReport] = useState<ConciliationReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState("");

  const load = () => {
    setLoading(true);
    api<ConcsResponse>("conciliation")
      .then((res) => setConcs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  useKeyboard((key) => {
    if (key.name === "r" && !running && !report) runConciliation();
    if (key.name === "q" && report) setReport(null);
  });

  const viewReport = async (id: string) => {
    setLoading(true);
    try {
      const res = await api<{ data: ConciliationReport }>(`conciliation/${id}`);
      setReport(res.data);
    } catch (e: unknown) {
      setMsg(`Error: ${(e as Error).message}`);
    }
    setLoading(false);
  };

  const runConciliation = async () => {
    setRunning(true);
    setMsg("Running conciliation...");
    try {
      await api("conciliation/run", { method: "POST" });
      setMsg("Done!");
      load();
    } catch (e: unknown) {
      setMsg(`Error: ${(e as Error).message}`);
    }
    setRunning(false);
  };

  if (report) {
    const { conciliation, matches } = report;
    const flatMatches: Array<Record<string, unknown>> = matches.map((m) => ({
      internalTxId: m.internalTxId,
      externalTxId: m.externalTxId ?? "-",
      status: m.status,
      amountDiff: m.amountDiff != null ? `$${(m.amountDiff / 100).toFixed(2)}` : "-",
    }));
    return (
      <box flexDirection="column" gap={1}>
        <Card title={`Conciliation Report ${conciliation.id.slice(0, 8)}`}>
          <box flexDirection="column" gap={1}>
            <text>Status: {conciliation.status}</text>
            <box flexDirection="row" gap={2}>
              <Badge color="green">{`Matched: ${conciliation.summary.matched}`}</Badge>
              <Badge color="yellow">{`Discrepancies: ${conciliation.summary.discrepancies}`}</Badge>
              <Badge color="red">{`Missing: ${conciliation.summary.missing}`}</Badge>
            </box>
          </box>
        </Card>
        <DataGrid
          data={flatMatches}
          columns={[
            { key: "internalTxId", header: "Internal Tx", width: 22 },
            { key: "externalTxId", header: "External Tx", width: 22 },
            { key: "status", header: "Status", width: 14 },
            { key: "amountDiff", header: "Diff", width: 10 },
          ]}
          pageSize={15}
        />
        <text fg="#666">Press q to go back</text>
      </box>
    );
  }

  if (loading) return <Spinner label="Loading..." />;

  const flatConcs: Array<Record<string, unknown>> = concs.map((c) => ({
    id: c.id,
    runAt: new Date(c.runAt).toLocaleDateString(),
    status: c.status,
        matched: c.summary.matched,
        discrepancies: c.summary.discrepancies,
        missing: c.summary.missing,
  }));

  return (
    <box flexDirection="column" gap={1}>
      <box flexDirection="row" gap={1}>
        <text><b>Conciliations</b></text>
        <Badge color="cyan">r: run</Badge>
      </box>
      {concs.length === 0 ? (
        <text fg="#666">No conciliations yet. Press r to run one.</text>
      ) : (
        <DataGrid
          data={flatConcs}
          columns={[
            { key: "runAt", header: "Date", width: 24 },
            { key: "status", header: "Status", width: 12 },
            { key: "matched", header: "Match", width: 8 },
            { key: "discrepancies", header: "Diff", width: 8 },
            { key: "missing", header: "Miss", width: 8 },
          ]}
          pageSize={15}
          onRowSelect={(row: Record<string, unknown>) => {
            const found = concs.find((c) => c.id === row.id);
            if (found) viewReport(found.id);
          }}
        />
      )}
      {running && <Spinner label="Running conciliation..." />}
      {msg && <Alert variant={msg.startsWith("Error") ? "error" : "info"}>{msg}</Alert>}
      <text fg="#666">↑↓ navigate · Enter view report · r: run</text>
    </box>
  );
}
