import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import App from "./App.tsx";
import { PokemonList } from "./components/PokemonList";
// import { Detail } from "./components/Detail";
import { BrowserRouter, Routes, Route } from "react-router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PokemonList />} />
        {/* <Route path="/pokemon/:id" element={<Detail />} /> */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
