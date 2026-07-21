import type { InputProps } from "@opentui/react";
import { useFormContext } from "@/components/ui/form";

type FormInputProps = InputProps & {
  name: string;
};

export function FormInput({ name, value: _value, onInput, onChange, onSubmit, ...props }: FormInputProps) {
  const { values, setFieldValue } = useFormContext();

  return (
    <input
      value={(values[name] as string) ?? ""}
      onInput={(v: string) => {
        setFieldValue(name, v);
        onInput?.(v);
      }}
      onChange={(v: string) => {
        setFieldValue(name, v);
        onChange?.(v);
      }}
      onSubmit={onSubmit}
      {...props}
    />
  );
}
