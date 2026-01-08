import { NavLink } from "react-router-dom";
import "./App.css"

export default function Navbar() {
  const base =
    "font-pixel text-[12px] px-4 py-2 rounded-xl font-semibold transition";

  const active =
    " text-green border-b-2 border-green rounded-none";

  const inactive =
    " text-gray-400 hover:text-green";

  return (
    <nav className="sticky top-0 z-50 bg-black ">
      <div className="max-w-5xl mx-auto flex justify-center gap-4 p-4">
       <NavLink
  to="/pokemon"
  className={({ isActive }) =>
    `${base} ${isActive ? active : inactive}`
  }
>
  Pokémon
</NavLink>

        <NavLink
          to="/favorites"
          className={({ isActive }) =>
            `${base} ${isActive ? active : inactive}`
          }
        >
          Favorites
        </NavLink>

        <NavLink
          to="/team"
          className={({ isActive }) =>
            `${base} ${isActive ? active : inactive}`
          }
        >
          Team
        </NavLink>
      </div>
    </nav>
  );
}
