import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Doctor } from "./pages/Doctor";
import "./styles.css";

createRoot(document.getElementById("root")!).render(<StrictMode><Doctor /></StrictMode>);
