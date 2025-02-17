// Importando o axios para realizar a requisição HTTP
const axios = require('axios');

// Sua chave de API da Steam (substitua com sua chave de API)
const API_KEY = '50183D01814E8EC9520609229422CB67';

// URL base da API da Steam
const BASE_URL = 'https://api.steampowered.com/ISteamApps/GetAppList/v2';

// Função para pegar a lista de jogos da Steam
async function getSteamGames() {
  try {
    // Requisição para obter a lista de aplicativos (jogos) na Steam
    const response = await axios.get(BASE_URL);
    
    // Exibindo os jogos obtidos da API
    console.log('Lista de Jogos na Steam:', response.data.applist.apps);
  } catch (error) {
    console.error('Erro ao obter a lista de jogos:', error);
  }
}

// Função para pegar os jogos mais jogados (você pode explorar a Steam API mais profundamente)
async function getTopGames() {
  const TOP_GAMES_URL = 'https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1';
  
  try {
    const response = await axios.get(TOP_GAMES_URL);
    console.log('Jogos mais jogados na Steam:', response.data.response);
  } catch (error) {
    console.error('Erro ao obter os jogos mais jogados:', error);
  }
}

// Chama a função de exemplo
getSteamGames();
getTopGames();
