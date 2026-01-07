import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./Navbar";
import { PokemonList } from "./components/PokemonList";
import { Detail } from "./components/Detail";
import Favorites from "./components/Fevorites";
import { Team } from "./components/Team";

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/pokemon" />} />
        <Route path="/pokemon" element={<PokemonList />} />
        <Route path="/pokemon/:id" element={<Detail />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/team" element={<Team />} />
      </Routes>
    </>
  );
}
