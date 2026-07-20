import { useInput } from 'ink';
import { useFormContext, type FormField } from '@/components/ui/form';

export function useCtrlEnterSubmit(
  fields: FormField[],
  onSubmit?: (values: Record<string, unknown>) => void,
) {
  const formCtx = useFormContext();

  useInput((input, key) => {
    if (!key.ctrl || !key.return) return;

    const newErrors: Record<string, string> = {};
    for (const field of fields) {
      const err = field.validate ? field.validate(formCtx.values[field.name]) : null;
      if (err) {
        newErrors[field.name] = err;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      for (const [name, err] of Object.entries(newErrors)) {
        formCtx.setFieldError(name, err);
      }
      return;
    }

    for (const name of fields.map((f) => f.name)) {
      formCtx.setFieldError(name, '');
    }

    onSubmit?.(formCtx.values);
  });
}
