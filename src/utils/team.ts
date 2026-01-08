interface PokemonTeamItem {
  id: number;
  name: string;
  image: string;
  types: string[];
}

const TEAM_KEY = "pokemon_team";

export const getTeam = (): PokemonTeamItem[] => {
  const team = localStorage.getItem(TEAM_KEY);
  return team ? JSON.parse(team) : [];
};

export const isInTeam = (id: number): boolean => {
  const team = getTeam();
  return team.some((p) => p.id === id);
};

export const addToTeam = (pokemon: PokemonTeamItem): boolean => {
  const team = getTeam();

  if (team.some((p) => p.id === pokemon.id)) return true;

  if (team.length >= 6) {
    return false;
  }

  team.push(pokemon);
  localStorage.setItem(TEAM_KEY, JSON.stringify(team));
  return true;
};

// export const removeFromTeam = (id: number) => {
//   const team = getTeam();
//   const newTeam = team.filter((p) => p.id !== id);
//   localStorage.setItem(TEAM_KEY, JSON.stringify(newTeam));
// };

export const removeFromTeam = (id: number) => {
  const team = getTeam();

  team.some((p, index) => {
    if (p.id === id) {
      team.splice(index, 1);
      return true;
    }
    return false;
  });

  localStorage.setItem(TEAM_KEY, JSON.stringify(team));
};
