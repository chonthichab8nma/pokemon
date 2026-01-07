import { NavLink } from "react-router-dom";

export default function Navbar() {
  const base =
    "px-4 py-2 rounded-xl font-semibold transition";

  const active =
    "bg-blue-500 text-white";

  const inactive =
    "text-gray-600 hover:bg-gray-100";

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm">
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
