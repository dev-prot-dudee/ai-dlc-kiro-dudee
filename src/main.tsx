import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { ErrorBoundary } from "./shared/components/ErrorBoundary";
import { DataProvider } from "./shared/DataContext";
import "./styles/global.css";

const container = document.getElementById("root");
if (container === null) {
  throw new Error("ไม่พบ element #root ใน index.html");
}

// ErrorBoundary อยู่นอกสุดเพื่อดักข้อมูลที่เสียหายตอนอ่านครั้งแรก (FR6.3)
// ถ้าอยู่ในสุดกว่า DataProvider จะดักไม่ทันเพราะการอ่านเกิดก่อน render
createRoot(container).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <DataProvider>
          <App />
        </DataProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
