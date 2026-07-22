// import { useState } from "react";
// import { useKeyboard } from "@opentui/react";
// import { Box } from "@/components/ui/box";
// import { Heading } from "@/components/ui/heading";
// import { Badge } from "@/components/ui/badge";
// import { LoginScreen } from "./screens/login.js";
// import { DashboardScreen } from "./screens/dashboard.js";
// import { TransactionsScreen } from "./screens/transactions.js";
// import { CreateTransactionScreen } from "./screens/create-transaction.js";
// import { TransferScreen } from "./screens/transfer.js";
// import { ConciliationScreen } from "./screens/conciliation.js";
// import { useAuth } from "./hooks/use-auth.js";

import { RGBA } from "@opentui/core";
import { useEffect, useState } from "react";
import { useCsrfToken } from "./hooks/use-get-crsf-token";
import { useRenderer } from "@opentui/react";

// // type Screen = "login" | "dashboard" | "transactions" | "create" | "transfer" | "conciliation";

// // const SCREEN_KEYS: Record<string, Screen> = {
// //   "1": "dashboard",
// //   "2": "transactions",
// //   "3": "create",
// //   "4": "transfer",
// //   "5": "conciliation",
// // };

// export function App() {
//   const { isLoggedIn, login } = useAuth();
//   const [screen, setScreen] = useState<Screen>(isLoggedIn ? "dashboard" : "login");
//   const [error, setError] = useState("");

//   useKeyboard((key) => {
//     if (!isLoggedIn) return;
//     if (key.name === "escape") {
//       setScreen("dashboard");
//       return;
//     }
//     if (key.ctrl && key.name === "q") {
//       process.exit(0);
//     }
//     const target = SCREEN_KEYS[key.name];
//     if (target) {
//       setScreen(target);
//     }
//   });

//   const handleLogin = async (email: string, password: string) => {
//     try {
//       setError("");
//       await login(email, password);
//       setScreen("dashboard");
//     } catch (e: unknown) {
//       setError((e as Error).message);
//     }
//   };

//   if (!isLoggedIn) {
//     return <LoginScreen onLogin={handleLogin} error={error} />;
//   }

//   return (
//     <box flexDirection="column">
//       <Box border borderVariant="muted" paddingX={1}>
//         <box flexDirection="row" gap={2} alignItems="center">
//           <Heading level={2} uppercase={false}>ISC ATM Integrator</Heading>
//           <Badge>1:Dash</Badge>
//           <Badge>2:Txns</Badge>
//           <Badge>3:New</Badge>
//           <Badge>4:Xfer</Badge>
//           <Badge>5:Concil</Badge>
//           <text> </text>
//           <text fg="#666">Esc:Home Ctrl+Q:Quit</text>
//         </box>
//       </Box>
//       <box flexGrow={1} padding={1}>
//         {screen === "dashboard" && <DashboardScreen />}
//         {screen === "transactions" && <TransactionsScreen />}
//         {screen === "create" && <CreateTransactionScreen />}
//         {screen === "transfer" && <TransferScreen />}
//         {screen === "conciliation" && <ConciliationScreen />}
//       </box>
//     </box>
//   );
// }

export const FORM_STATE = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const;

export type FormState = (typeof FORM_STATE)[keyof typeof FORM_STATE];

export const FORM_EVENTS = {
  SUBMIT: "submit",
  RESOLVE: "resolve",
  REJECT: "reject",
};

export type FormEvent = (typeof FORM_EVENTS)[keyof typeof FORM_EVENTS];

export const FORM_STATE_MACHINE: Partial<{
  [S in FormState]: Partial<{
    [E in FormEvent]: FormState;
  }>;
}> = {
  [FORM_STATE.IDLE]: {
    [FORM_EVENTS.SUBMIT]: FORM_STATE.LOADING,
  },
  [FORM_STATE.LOADING]: {
    [FORM_EVENTS.RESOLVE]: FORM_STATE.SUCCESS,
    [FORM_EVENTS.REJECT]: FORM_STATE.ERROR,
  },
};


export const transition = (state: FormState, event: FormEvent): FormState => {
  if (!FORM_STATE_MACHINE[state] || !FORM_STATE_MACHINE[state][event]) {
    return state;
  }

  return FORM_STATE_MACHINE[state][event];
};

export interface FormValue {
  email: string;
  password: string;
}

const isValidEmail = (email: string): boolean => {
  const atIdx = email.indexOf("@");
  if (atIdx < 1) {
    return false;
  }
  const domain = email.slice(atIdx + 1);
  return domain.includes(".");
};

export interface LoginFormState<T> {
  values: T;
  state: FormState;
  events: FormEvent;
}

export function App() {
  const renderer = useRenderer();

  useEffect(() => {
    renderer.console.show();
    console.log("Hello from console!");
  }, []);

  const csrf = useCsrfToken();

  const [formState, setFormState] = useState<FormState>(FORM_STATE.IDLE);


  const [emailInputError, setEmailInputError] = useState<boolean>(false)

  function handlerSubmit() {
    setFormState(transition(formState, FORM_EVENTS.SUBMIT));
  }

  return (
    <box
      title=" ISC ATM INTEGRATOR "
      id="panel"
      flexGrow={1}
      borderStyle="rounded"
      justifyContent={"center"}
      alignItems={"center"}
    >
      {csrf?.isSuccess && <text>{JSON.stringify(csrf.value)} {emailInputError}</text>}

      <box
        // backgroundColor="#424297"
        borderStyle="rounded"
        alignItems={"center"}
        padding={4}
        paddingY={1}
        paddingBottom={1}
      >
        <box flexDirection="row">
          <ascii-font
            id="title"
            text="BAN "
            font="block"
            color={RGBA.fromHex("#df2121")}
          />
          <ascii-font
            id="title"
            text="NET"
            font="block"
            color={RGBA.fromHex("#2c62b3")}
          />
        </box>
        <box alignItems={"center"} marginY={1}>
          <text>
            <strong>SERVICIO DE INTEGRACION FINANCIERO</strong>
          </text>
          {csrf?.isFailed && (
            <text bg={RGBA.fromHex("#df2121")}>{csrf.error.message}</text>
          )}
        </box>
        <box flexDirection="column">
          {/* --- email input --- */}
          <box flexDirection="column">
            <box
              title=" Usuario "
              borderStyle="rounded"
              borderColor={csrf?.isFailed ? "#2a2a2a" : "#FFF"}
              paddingX={1}
            >
              {csrf?.isFailed ? (
                <text />
              ) : (
                <input
                  id="styled-input"
                  width={30}
                  placeholder="Type here..."
                  textColor="#FFFFFF"
                  onInput={(value) => {
                    setEmailInputError(!isValidEmail(value))
                  }}
                />
              )}
            </box>
            <text  marginX={1} fg={RGBA.fromHex("#df2121")}>
              {(emailInputError && "✗ error message")}
            </text>
          </box>

          <box flexDirection="column">
            <box title=" Contraseña " borderStyle="rounded" paddingX={1}>
              <input
                id="styled-input"
                width={30}
                placeholder="Type here..."
                textColor="#FFFFFF"
              />
            </box>
            <text marginX={1} fg={RGBA.fromHex("#df2121")}>
              {"✗"} {"error message"}
            </text>
          </box>
        </box>
      </box>
    </box>
  );
}
