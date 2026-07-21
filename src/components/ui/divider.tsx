import { useTheme } from "@/components/ui/theme-provider";

export interface DividerProps {
  variant?: "single" | "double" | "bold";
  orientation?: "horizontal" | "vertical";
  color?: string;
  label?: string;
  labelColor?: string;
  dividerChar?: string;
  titlePadding?: number;
  padding?: number;
  height?: number;
  width?: number | "auto";
}

const DIVIDER_CHARS: Record<NonNullable<DividerProps["variant"]>, string> = {
  bold: "┃",
  double: "║",
  single: "│",
};

export const Divider = ({
  variant = "single",
  orientation = "horizontal",
  color,
  label,
  labelColor,
  dividerChar,
  titlePadding = 1,
  padding = 0,
  height = 1,
  width = "auto",
}: DividerProps) => {
  const theme = useTheme();
  const resolvedColor = color ?? theme.colors.border;
  const vChar = dividerChar ?? DIVIDER_CHARS[variant];

  if (orientation === "vertical") {
    const lines = Array.from({ length: height }, (_, i) => i);
    return (
      <box flexDirection="column">
        {lines.map((i) => (
          <text key={i} fg={resolvedColor}>
            {vChar}
          </text>
        ))}
      </box>
    );
  }

  const paddingStr = "".repeat(padding);
  const titlePad = "".repeat(titlePadding);
  const hrAttrs = {
    flexGrow: 1,
    border: ["top"] as const,
    borderStyle: "single" as const,
    borderColor: resolvedColor,
  } as const;

  if (label) {
    const resolvedLabelColor = labelColor ?? resolvedColor;
    return (
      <box flexDirection="row" width={width === "auto" ? undefined : width}>
        {padding > 0 && <text>{paddingStr}</text>}
        <box flexGrow={1} borderStyle="single" borderColor={resolvedColor} border={["top"]} />
        <text fg={resolvedLabelColor}>{`${titlePad}${label}${titlePad}`}</text>
        <box flexGrow={1} borderStyle="single" borderColor={resolvedColor} border={["top"]} />
        {padding > 0 && <text>{paddingStr}</text>}
      </box>
    );
  }

  return (
    <box flexDirection="row" width={width === "auto" ? undefined : width}>
      {padding > 0 && <text>{paddingStr}</text>}
      <box flexGrow={1} borderStyle="single" borderColor={resolvedColor} border={["top"]} />
    </box>
  );
};
