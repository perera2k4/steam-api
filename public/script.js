const axios = require('axios');

// Sua chave de API da Steam (substitua com sua chave de API)
const API_KEY = '50183D01814E8EC9520609229422CB67';

// URL base da API da Steam
const BASE_URL = 'https://api.steampowered.com/ISteamApps/GetAppList/v2';

// Função para pegar a lista de jogos da Steam
async function getSteamGames() {
  try {
    const response = await axios.get(BASE_URL);
    // Retorna a lista de jogos (aplicativos) da Steam
    return response.data.applist.apps;
  } catch (error) {
    console.error('Erro ao obter a lista de jogos:', error);
  }
}

// Função para pegar os jogos mais jogados
async function getTopGames() {
  const TOP_GAMES_URL = 'https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1';
  
  try {
    const response = await axios.get(TOP_GAMES_URL);
    
    // Verifica se a resposta contém o array 'ranks' e exibe
    console.log("Resposta dos jogos mais jogados:", response.data);
    if (response.data.response && Array.isArray(response.data.response.ranks)) {
      return response.data.response.ranks;
    } else {
      console.error("Erro: a propriedade 'ranks' não foi encontrada ou está vazia.");
      return [];
    }
  } catch (error) {
    console.error('Erro ao obter os jogos mais jogados:', error);
    return [];  // Retorna um array vazio em caso de erro
  }
}

// Função para combinar os dados de ranking com os nomes dos jogos
async function obterDados() {
  try {
    // Obtém os jogos mais jogados
    const jogosMaisJogados = await getTopGames();
    
    // Se não houver jogos mais jogados, retorne
    if (jogosMaisJogados.length === 0) {
      console.log("Não foi possível obter a lista dos jogos mais jogados.");
      return;
    }

    // Exibe os jogos mais jogados para verificar a estrutura
    console.log("Jogos mais jogados:", jogosMaisJogados);

    // Obtém a lista completa de jogos
    const listaJogos = await getSteamGames();

    // Combina os dados de ranking com os nomes dos jogos
    const jogosComNomes = jogosMaisJogados.map(jogo => {
      // Busca o nome do jogo a partir do appid
      const jogoDetalhado = listaJogos.find(jogoLista => jogoLista.appid === jogo.appid);
      return {
        rank: jogo.rank,
        nome: jogoDetalhado ? jogoDetalhado.name : 'Nome não encontrado',
        peak_in_game: jogo.peak_in_game,
        appid: jogo.appid
      };
    });

    // Exibe os dados de forma organizada
    console.log("Jogos mais jogados na Steam:");
    jogosComNomes.forEach(jogo => {
      console.log(`Rank: ${jogo.rank} | Jogo: ${jogo.nome} | Pico de jogadores: ${jogo.peak_in_game}`);
    });
  } catch (error) {
    console.error("Erro ao obter os dados:", error);
  }
}

// Chama a função para exibir os dados
obterDados();
