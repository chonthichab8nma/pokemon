export interface FavoritePokemon {
  id: number;
  name: string;
  image: string;
}

const KEY = "pokemon-favorites";

export function getFavorites(): FavoritePokemon[] {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export function isFavorite(id: number): boolean {
  return getFavorites().some(p => p.id === id);
}

export function addFavorite(pokemon: FavoritePokemon) {
  const favs = getFavorites();
  if (favs.some(p => p.id === pokemon.id)) return;
  localStorage.setItem(KEY, JSON.stringify([...favs, pokemon]));
}

export function removeFavorite(id: number) {
  const favs = getFavorites().filter(p => p.id !== id);
  localStorage.setItem(KEY, JSON.stringify(favs));
}
