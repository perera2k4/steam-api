const fs = require("fs");

async function salvarJogos() {
    const API_KEY = "YOUR_STEAM_API_KEY"; // Substitua pela sua chave
    const API_URL = `https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1/?key=${API_KEY}`;

    try {
        const response = await globalThis.fetch(API_URL); // Forçando o uso da API nativa do Node.js
        if (!response.ok) {
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }
        const data = await response.json();

        fs.writeFileSync("jogos.json", JSON.stringify(data, null, 2));
        console.log("Arquivo jogos.json atualizado com sucesso!");
    } catch (error) {
        console.error("Erro ao buscar dados da Steam:", error);
    }
}

salvarJogos();
