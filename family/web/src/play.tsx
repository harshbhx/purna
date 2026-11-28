import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Play } from "./pages/Play";
import "./styles.css";

createRoot(document.getElementById("root")!).render(<StrictMode><Play /></StrictMode>);
