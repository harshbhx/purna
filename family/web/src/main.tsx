import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import demo from "../public/demo/sessions.json";
import type { SessionJson } from "./lib/types";
import { MotionRoot } from "./components/purna/motion-root";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionRoot>
      <App demo={demo as unknown as SessionJson[]} />
    </MotionRoot>
  </StrictMode>,
);
