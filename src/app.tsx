import { RGBA } from "@opentui/core";
import { useEffect, useState } from "react";
import { useKeyboard } from "@opentui/react";
import { useCsrfToken } from "./hooks/use-get-crsf-token";
import { useRenderer } from "@opentui/react";

const isValidEmail = (email: string): boolean => {
  const atIdx = email.indexOf("@");
  if (atIdx < 1) return false;
  return email.slice(atIdx + 1).includes(".");
};

const FORM_STATE = { IDLE: "idle", LOADING: "loading", SUCCESS: "success", ERROR: "error" } as const;
type FormState = (typeof FORM_STATE)[keyof typeof FORM_STATE];

export function App() {
  const renderer = useRenderer();

  useEffect(() => {
    renderer.console.show();
    console.log("Hello from console!");
  }, []);

  const csrf = useCsrfToken();
  const [formState, setFormState] = useState<FormState>(FORM_STATE.IDLE);
  const [emailErr, setEmailErr] = useState("");
  const [passwdErr, setPasswdErr] = useState("");

  const isDisabled = formState === FORM_STATE.LOADING || formState === FORM_STATE.SUCCESS || csrf === null;

  useKeyboard((key) => {
    if (key.name === "return" || (key.ctrl && key.name === "s")) {
      if (isDisabled) return;
    }
  });

  return (
    <box
      title=" ISC ATM INTEGRATOR "
      id="panel"
      flexGrow={1}
      borderStyle="rounded"
      justifyContent="center"
      alignItems="center"
    >
      {csrf?.isFailed && (
        <text bg={RGBA.fromHex("#df2121")} paddingX={1}>
          ✗ {csrf.error.message}
        </text>
      )}

      <box
        borderStyle="rounded"
        alignItems="center"
        padding={4}
        paddingY={1}
        paddingBottom={1}
      >
        <box flexDirection="row">
          <ascii-font id="title" text="BAN " font="block" color={RGBA.fromHex("#df2121")} />
          <ascii-font id="title" text="NET" font="block" color={RGBA.fromHex("#2c62b3")} />
        </box>

        <box alignItems="center" marginY={1}>
          <text>
            <strong>SERVICIO DE INTEGRACION FINANCIERO</strong>
          </text>
        </box>

        <box flexDirection="column">
          <box flexDirection="column">
            <box
              title=" Usuario "
              borderStyle="rounded"
              borderColor={emailErr ? RGBA.fromHex("#df2121") : undefined}
              paddingX={1}
            >
              <input
                id="styled-input"
                width={30}
                placeholder="correo@ejemplo.com"
                textColor={isDisabled ? "#555" : "#FFFFFF"}
                focused={isDisabled ? false : undefined}
                onInput={(v: string) => {
                  if (isDisabled) return;
                  setEmailErr(v && !isValidEmail(v) ? "Correo inválido" : "");
                }}
              />
            </box>
            {emailErr && (
              <text marginX={1} fg={RGBA.fromHex("#df2121")}>
                ✗ {emailErr}
              </text>
            )}
          </box>

          <box flexDirection="column">
            <box title=" Contraseña " borderStyle="rounded" paddingX={1}>
              <input
                id="styled-input"
                width={30}
                placeholder="••••••••"
                textColor={isDisabled ? "#555" : "#FFFFFF"}
                focused={isDisabled ? false : undefined}
                onInput={(v: string) => {
                  if (isDisabled) return;
                  setPasswdErr(v.length > 0 && v.length < 6 ? "Mínimo 6 caracteres" : "");
                }}
              />
            </box>
            {passwdErr && (
              <text marginX={1} fg={RGBA.fromHex("#df2121")}>
                ✗ {passwdErr}
              </text>
            )}
          </box>
        </box>

        {formState === FORM_STATE.LOADING && <text>Ingresando...</text>}
        {formState === FORM_STATE.ERROR && <text fg={RGBA.fromHex("#df2121")}>Error al iniciar sesión</text>}
        {csrf && <text fg="#666">Enter o Ctrl+S para ingresar</text>}
      </box>
    </box>
  );
}
