export interface TimeFutebol {
  id: number;
  nome: string;
  logo: string;
}

export async function searchTeams(query: string): Promise<TimeFutebol[]> {
  if (!query || query.length < 2) return [];
  
  const apiKey = import.meta.env.VITE_FOOTBALL_API_KEY;
  if (!apiKey) {
    console.error("VITE_FOOTBALL_API_KEY não está definida no arquivo .env");
    return [];
  }

  try {
    const res = await fetch(`https://v3.football.api-sports.io/teams?search=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': apiKey
      }
    });

    const data = await res.json();
    
    if (data && data.response) {
      return data.response.map((item: any) => ({
        id: item.team.id,
        nome: item.team.name,
        logo: item.team.logo
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Erro ao buscar times da API-Football:', error);
    return [];
  }
}
