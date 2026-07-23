import type { InputProps } from "@opentui/react";
import { useFormContext } from "@/components/ui/form";

type FormInputProps = InputProps & {
  name: string;
  disabled?: boolean;
};

export function FormInput({ name, value: _value, onInput, onChange, onSubmit, disabled, ...props }: FormInputProps) {
  const { values, setFieldValue } = useFormContext();

  return (
    <input
      value={(values[name] as string) ?? ""}
      onInput={(v: string) => {
        if (disabled) return;
        setFieldValue(name, v);
        onInput?.(v);
      }}
      onChange={(v: string) => {
        if (disabled) return;
        setFieldValue(name, v);
        onChange?.(v);
      }}
      onSubmit={onSubmit}
      {...props}
      focused={disabled ? false : props.focused}
      textColor={disabled ? "#555" : props.textColor}
    />
  );
}
