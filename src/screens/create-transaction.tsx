import { useState } from "react";
import { Select } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Alert } from "@/components/ui/alert";
import { api } from "../services/api.js";

const OPERATIONS = [
  "withdrawal", "deposit", "transfer", "balance_inquiry",
  "pin_change", "reversal", "mini_statement",
];
const SOURCE_BANKS = ["bank_a", "bank_b"];
const TYPES = ["debit", "credit"];

const fieldOrder = ["account_id", "amount", "operation", "type", "source_bank", "description"] as const;

type Field = (typeof fieldOrder)[number];

export function CreateTransactionScreen() {
  const [fields, setFields] = useState<Record<Field, string>>({
    account_id: "", amount: "", operation: "withdrawal",
    type: "debit", source_bank: "bank_a", description: "",
  });
  const [step, setStep] = useState(0);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (key: Field) => (v: string) => setFields((f) => ({ ...f, [key]: v }));
  const advance = () => {
    if (step < fieldOrder.length - 1) setStep(step + 1);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        account_id: fields.account_id,
        amount: fields.amount ? parseInt(fields.amount) : undefined,
        operation: fields.operation,
        description: fields.description,
        source_bank: fields.source_bank,
      };
      if (!["balance_inquiry", "pin_change", "mini_statement"].includes(fields.operation)) {
        body.type = fields.type;
      }
      const res = await api<{ data: { id: string } }>("transactions", {
        method: "POST",
        body,
      });
      setResult(`Created: ${res.data.id}`);
    } catch (e: unknown) {
      setResult(`Error: ${(e as Error).message}`);
    }
    setLoading(false);
  };

  const handleSubmit = () => {
    if (step < fieldOrder.length - 1) advance();
    else submit();
  };

  const name = fieldOrder[step];

  return (
    <box flexDirection="column" gap={1}>
      <text><b>Create Transaction</b></text>
      {name === "account_id" && (
        <box flexDirection="column">
          <text fg="#888"><b>Account ID</b></text>
          <input
            placeholder="Enter account ID"
            onInput={update("account_id")}
            onSubmit={advance}
            value={fields.account_id}
          />
        </box>
      )}
      {name === "amount" && (
        <box flexDirection="column">
          <text fg="#888"><b>Amount</b></text>
          <input
            placeholder="in cents"
            onInput={update("amount")}
            onSubmit={advance}
            value={fields.amount}
          />
        </box>
      )}
      {name === "operation" && (
        <Select
          options={OPERATIONS.map((o) => ({ value: o, label: o }))}
          value={fields.operation}
          onChange={update("operation")}
          onSubmit={advance}
          label="Operation"
        />
      )}
      {name === "type" && (
        <Select
          options={TYPES.map((t) => ({ value: t, label: t }))}
          value={fields.type}
          onChange={update("type")}
          onSubmit={advance}
          label="Type"
        />
      )}
      {name === "source_bank" && (
        <Select
          options={SOURCE_BANKS.map((b) => ({ value: b, label: b }))}
          value={fields.source_bank}
          onChange={update("source_bank")}
          onSubmit={advance}
          label="Source Bank"
        />
      )}
      {name === "description" && (
        <box flexDirection="column">
          <text fg="#888"><b>Description</b></text>
          <input
            placeholder="Optional description"
            onInput={update("description")}
            onSubmit={handleSubmit}
            value={fields.description}
          />
        </box>
      )}
      {loading && <Spinner label="Creating..." />}
      {result && (
        <Alert variant={result.startsWith("Error") ? "error" : "success"}>
          {result}
        </Alert>
      )}
      <text fg="#666">Enter to confirm · Esc to cancel</text>
    </box>
  );
}
