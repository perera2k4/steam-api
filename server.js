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

        // Combina os dados dos jogos mais jogados com seus nomes
        const jogosComNomes = jogosMaisJogados.map(jogo => {
            const jogoDetalhado = listaJogos.find(jogoLista => jogoLista.appid === jogo.appid);
            return {
                rank: jogo.rank,
                name: jogoDetalhado ? jogoDetalhado.name : 'Nome não encontrado', // Usamos 'name' aqui
                peak_in_game: jogo.peak_in_game,
                appid: jogo.appid
            };
        });

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
