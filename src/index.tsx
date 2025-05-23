import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FrameScreen } from "./screens/FrameScreen/FrameScreen";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <FrameScreen />
  </StrictMode>,
);
