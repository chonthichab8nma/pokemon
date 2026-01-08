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
  return getFavorites().some((p) => p.id === id);
}

export function addFavorite(pokemon: FavoritePokemon) {
  // 1. ดึงรายการ favorite ปัจจุบันจาก localStorage
  const favs = getFavorites();
  // 2. เช็คว่า Pokémon ตัวนี้อยู่ใน favorites แล้วหรือยัง
  //    ถ้าอยู่แล้ว → return เลย ไม่เพิ่มซ้ำ
  if (favs.some((p) => p.id === pokemon.id)) return;
  // 3. ถ้ายังไม่มี Pokémon ตัวนี้ → เพิ่มลง array
  //    [...favs, pokemon] → สร้าง array ใหม่จาก favorite เก่า + Pokémon ใหม่
  // 4. แปลง array เป็น string ด้วย JSON.stringify แล้วเก็บลง localStorage
  localStorage.setItem(KEY, JSON.stringify([...favs, pokemon]));
}

export function removeFavorite(id: number) {
  const favs = getFavorites().filter((p) => p.id !== id);
  localStorage.setItem(KEY, JSON.stringify(favs));
}
