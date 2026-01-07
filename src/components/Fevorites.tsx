import { useState } from "react";
import { getFavorites, removeFavorite } from "../utils/favorites";
import { Link } from "react-router-dom";

export default function Favorites() {
  const [favorites, setFavorites] = useState(getFavorites());


  if (favorites.length === 0) {
    return (
      <p className="text-center mt-10 text-gray-500">
        ยังไม่มี Pokémon ตัวโปรด
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
      {favorites.map(p => (
        <div key={p.id} className="bg-white rounded-xl shadow p-4">
          <Link to={`/pokemon/${p.id}`}>
            <img src={p.image} className="mx-auto" />
            <p className="capitalize text-center">{p.name}</p>
          </Link>

          <button
            onClick={() => {
              removeFavorite(p.id);
              setFavorites(getFavorites());
            }}
            className="text-red-500 text-sm w-full mt-2"
          >
            ลบออก
          </button>
        </div>
      ))}
    </div>
  );
}
