import { useState } from "react";
import { useKeyboard } from "@opentui/react";
import { Center } from "@/components/ui/center";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Form, useFormContext } from "@/components/ui/form";
import { FormInput } from "@/components/form-input";

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  error?: string;
}

function LoginForm({ onLogin, error, loading, setLoading }: LoginScreenProps & { loading: boolean; setLoading: (v: boolean) => void }) {
  const [focused, setFocused] = useState<"email" | "password">("email");
  const { values } = useFormContext();

  useKeyboard((key) => {
    if (key.name === "tab") {
      setFocused((prev) => (prev === "email" ? "password" : "email"));
    }
    if (key.name === "return" && focused === "password") {
      setLoading(true);
      onLogin(String(values.email ?? ""), String(values.password ?? "")).finally(() => setLoading(false));
    }
  });

  return (
    <Card title="ISC ATM Integrator">
      <box flexDirection="column" gap={1}>
        <box flexDirection="column">
          <text fg="#888"><b>Email</b></text>
          <FormInput name="email" placeholder="you@example.com" maxLength={100} focused={focused === "email"} onSubmit={() => setFocused("password")} />
        </box>
        <box flexDirection="column">
          <text fg="#888"><b>Password</b></text>
          <FormInput name="password" placeholder="Enter your password" maxLength={100} focused={focused === "password"} />
        </box>
        {loading && <Spinner label="Logging in..." />}
        {error && <Alert variant="error">{error}</Alert>}
        <text fg="#666">Tab between fields · Ctrl+S or Enter to submit</text>
      </box>
    </Card>
  );
}

export function LoginScreen({ onLogin, error }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      await onLogin(String(values.email ?? ""), String(values.password ?? ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center>
      <box width={50}>
        <Form
          initialValues={{ email: "", password: "" }}
          fields={[
            { name: "email", validate: (v) => (v ? null : "Email is required") },
            { name: "password", validate: (v) => (v ? null : "Password is required") },
          ]}
          onSubmit={handleSubmit}
        >
          <LoginForm onLogin={onLogin} loading={loading} setLoading={setLoading} error={error} />
        </Form>
      </box>
    </Center>
  );
}
