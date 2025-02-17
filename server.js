const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Função para obter a lista de jogos
async function getSteamGames() {
    const BASE_URL = 'https://api.steampowered.com/ISteamApps/GetAppList/v2';
    try {
        const response = await axios.get(BASE_URL);
        return response.data.applist.apps;
    } catch (error) {
        console.error('Erro ao obter lista de jogos:', error);
        return [];
    }
}

// Função para obter o número de jogadores online em tempo real
async function getPlayersOnline(appid) {
    const PLAYER_COUNT_URL = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1?appid=${appid}`;
    try {
        const response = await axios.get(PLAYER_COUNT_URL);

        // Verifica se a resposta existe e contém o número de jogadores online
        if (response.data && response.data.response && response.data.response.player_count !== undefined) {
            return response.data.response.player_count;
        } else {
            console.log(`Não foi possível obter jogadores online para o jogo com appid ${appid}`);
            return 0; // Retorna 0 caso não tenha a informação de jogadores online
        }
    } catch (error) {
        console.error('Erro ao obter jogadores online:', error);
        return 0; // Caso haja erro na API, retorna 0
    }
}

// Função para obter detalhes de um jogo com base no appid
async function getGameDetails(appid) {
    const GAME_DETAILS_URL = `https://store.steampowered.com/api/appdetails?appids=${appid}`;
    try {
        const response = await axios.get(GAME_DETAILS_URL);
        if (response.data[appid] && response.data[appid].success) {
            return response.data[appid].data.name;
        } else {
            return null; // Caso o nome não seja encontrado
        }
    } catch (error) {
        console.error(`Erro ao obter detalhes do jogo ${appid}:`, error);
        return null;
    }
}

// Rota para obter os jogos mais jogados
app.get('/api/jogos', async (req, res) => {
    try {
        // Obtém a lista de jogos mais jogados
        const TOP_GAMES_URL = 'https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1';
        const response = await axios.get(TOP_GAMES_URL);

        // Verifica se a resposta contém dados de ranking
        const jogosMaisJogados = response.data.response.ranks;
        if (!jogosMaisJogados || jogosMaisJogados.length === 0) {
            return res.status(404).send('Não foram encontrados jogos mais jogados');
        }

        // Obtém a lista de jogos (aplicativos) para correlacionar com o ranking
        const listaJogos = await getSteamGames();

        // Combina os dados dos jogos mais jogados com seus nomes, pico de jogadores e jogadores online
        const jogosComNomes = await Promise.all(jogosMaisJogados.map(async (jogo) => {
            const jogoDetalhado = listaJogos.find(jogoLista => jogoLista.appid === jogo.appid);
            let nomeJogo = jogoDetalhado ? jogoDetalhado.name : 'Nome não encontrado';

            // Se o nome não foi encontrado, tenta buscar na Steam diretamente
            if (nomeJogo === 'Nome não encontrado') {
                nomeJogo = await getGameDetails(jogo.appid) || 'Nome não encontrado';
            }

            const playersOnline = await getPlayersOnline(jogo.appid); // Obtém jogadores online em tempo real

            return {
                rank: jogo.rank,
                name: nomeJogo,
                peak_in_game: jogo.peak_in_game, // Número de jogadores no pico
                players_online: playersOnline,  // Número de jogadores online no momento
                appid: jogo.appid
            };
        }));

        // Retorna os dados combinados como resposta
        res.json(jogosComNomes);
    } catch (error) {
        console.error("Erro ao obter dados da API:", error);
        res.status(500).send('Erro ao obter dados');
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
