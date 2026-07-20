import { render } from "ink";
import { App } from "./app.js";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { draculaTheme } from "@/lib/terminal-themes/dracula";

render(
  <ThemeProvider theme={draculaTheme}>
    <App />
  </ThemeProvider>,
);
