import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Doctor } from "./pages/Doctor";
import { MotionRoot } from "./components/purna/motion-root";
import "./styles.css";

createRoot(document.getElementById("root")!).render(<StrictMode><MotionRoot><Doctor /></MotionRoot></StrictMode>);
