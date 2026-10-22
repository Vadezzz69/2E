const { Collection } = require("discord.js");
const { lataaKomennot } = require("./commandLoader");

module.exports = (client) => {

    client.commands = new Collection();

    const { komennot, ongelmat } = lataaKomennot();

    for (const { nimi, kategoria, komento } of komennot) {
        komento.kategoria = kategoria;
        client.commands.set(nimi, komento);
    }

    for (const ongelma of ongelmat) {
        console.warn(`⚠️ Komentoa ${ongelma.tiedosto} ei ladattu: ${ongelma.syy}`);
        if (ongelma.virhe) console.error(ongelma.virhe);
    }

    console.log(`📦 Ladattu ${client.commands.size} komentoa.`);
};
