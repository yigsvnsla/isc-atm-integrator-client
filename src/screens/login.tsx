import { useState } from "react";
import { Text } from "ink";
import { Center } from "@/components/ui/center";
import { Stack } from "@/components/ui/stack";
import { BigText } from "@/components/ui/big-text";
import { EmailInput } from "@/components/ui/email-input";
import { PasswordInput } from "@/components/ui/password-input";
import { Form } from "@/components/ui/form";
import { Spinner } from "@/components/ui/spinner";
import { StatusMessage } from "@/components/ui/status-message";

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  error?: string;
}

export function LoginScreen({ onLogin, error }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: Record<string, unknown>) => {
    setLoading(true);
    try {
      await onLogin(String(values.email ?? ""), String(values.password ?? ""));
    } catch {
      setLoading(false);
    }
  };

  return (
    <Center>
      <Form
        initialValues={{ email: "", password: "" }}
        fields={[
          { name: "email", validate: (v) => (v ? null : "Email is required") },
          {
            name: "password",
            validate: (v) => (v ? null : "Password is required"),
          },
        ]}
        onSubmit={handleSubmit}
      >
        <Stack direction="vertical" gap={1} alignItems="center">
          <BigText font="slim" color="cyan">
            ISC ATM Integrator
          </BigText>
          <EmailInput
            id="email"
            width={40}
            label="Email"
            placeholder="you@example.com"
            autoFocus
          />
          <PasswordInput
            id="password"
            width={40}
            label="Password"
            placeholder="Enter your password"
            showToggle={false}
          />
          {loading && <Spinner label="Logging in..." />}
          {error && <StatusMessage variant="error">{error}</StatusMessage>}
          <Text dimColor>Ctrl+Enter to submit · Tab/Enter between fields</Text>
        </Stack>
      </Form>
    </Center>
  );
}
