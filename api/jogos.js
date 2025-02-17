const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));

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

async function getPlayersOnline(appid) {
    const PLAYER_COUNT_URL = `https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1?appid=${appid}`;
    try {
        const response = await axios.get(PLAYER_COUNT_URL);
        if (response.data && response.data.response && response.data.response.player_count !== undefined) {
            return response.data.response.player_count;
        } else {
            console.log(`Não foi possível obter jogadores online para o jogo com appid ${appid}`);
            return 0;
        }
    } catch (error) {
        console.error('Erro ao obter jogadores online:', error);
        return 0;
    }
}

async function getGameDetails(appid) {
    const GAME_DETAILS_URL = `https://store.steampowered.com/api/appdetails?appids=${appid}`;
    try {
        const response = await axios.get(GAME_DETAILS_URL);
        if (response.data[appid] && response.data[appid].success) {
            return response.data[appid].data.name;
        } else {
            return null;
        }
    } catch (error) {
        console.error(`Erro ao obter detalhes do jogo ${appid}:`, error);
        return null;
    }
}

app.get('/api/jogos', async (req, res) => {
    try {
        const TOP_GAMES_URL = 'https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1';
        const response = await axios.get(TOP_GAMES_URL);

        const jogosMaisJogados = response.data.response.ranks;
        if (!jogosMaisJogados || jogosMaisJogados.length === 0) {
            return res.status(404).send('Não foram encontrados jogos mais jogados');
        }

        const listaJogos = await getSteamGames();

        const jogosComNomes = await Promise.all(jogosMaisJogados.map(async (jogo) => {
            const jogoDetalhado = listaJogos.find(jogoLista => jogoLista.appid === jogo.appid);
            let nomeJogo = jogoDetalhado ? jogoDetalhado.name : 'Nome não encontrado';

            if (nomeJogo === 'Nome não encontrado') {
                nomeJogo = await getGameDetails(jogo.appid) || 'Nome não encontrado';
            }

            const playersOnline = await getPlayersOnline(jogo.appid); // Obtém jogadores online em tempo real

            return {
                rank: jogo.rank,
                name: nomeJogo,
                peak_in_game: jogo.peak_in_game,
                players_online: playersOnline,
                appid: jogo.appid
            };
        }));

        res.json(jogosComNomes);
    } catch (error) {
        console.error("Erro ao obter dados da API:", error);
        res.status(500).send('Erro ao obter dados');
    }
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});