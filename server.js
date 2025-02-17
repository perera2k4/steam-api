// server.js
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

// Servir arquivos estáticos (HTML, CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Rota para obter os jogos mais jogados
app.get('/api/jogos', async (req, res) => {
    try {
        const TOP_GAMES_URL = 'https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1';
        const response = await axios.get(TOP_GAMES_URL);
        res.json(response.data.response.ranks);
    } catch (error) {
        console.error("Erro ao obter dados da API:", error);
        res.status(500).send('Erro ao obter dados');
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
