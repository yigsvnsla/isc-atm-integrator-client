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

export interface LoginFormState {
  values: { email: string; password: string };

}

export function App() {
  return (
    <box
      title=" ISC ATM INTEGRATOR "
      id="panel"
      flexGrow={1}
      borderStyle="rounded"
      justifyContent={"center"}
      alignItems={"center"}
    >
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
        <text marginY={1}>SERVICIO DE INTEGRACION FINANCIERO</text>

        <box flexDirection="row">
          {/* --- email input --- */}
          <box flexDirection="column">
            <box flexDirection="row" gap={1}>
              <text fg={RGBA.fromHex("#2c62b3")}>
                <b>e-mail</b>
              </text>
              <text fg={RGBA.fromHex("#df2121")}>*</text>
            </box>
            <box>
              <input
                id="styled-input"
                width={30}
                placeholder="Type here..."
                backgroundColor="#1a1a1a"
                focusedBackgroundColor="#2a2a2a"
                textColor="#FFFFFF"
                cursorColor="#00FF00"
              />
            </box>
          </box>


        </box>
      </box>
    </box>
  );
}

// <box flexDirection="column">
//   <box flexDirection="row" gap={0}>
//     <text fg={RGBA.fromHex("#2c62b3")}>
//       <b>{"QWERTY"}</b>
//     </text>
//     {true && <text fg={RGBA.fromHex("#df2121")}>{" *"}</text>}
//   </box>
//   <box>children</box>
//   {true && !true && <text fg="#666">{true}</text>}
//   {true && (
//     <text fg={RGBA.fromHex("#df2121")}>
//       {"✗"} {"error"}
//     </text>
//   )}
// </box>
