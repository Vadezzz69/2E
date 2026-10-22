require("dotenv").config({ quiet: true });

const { Client, GatewayIntentBits } = require("discord.js");

const commandHandler = require("./handlers/commandHandler");
const eventHandler = require("./handlers/eventHandler");
const { kaynnistaAjastin } = require("./utils/ajastin");
const { kaynnistaDashboard } = require("./dashboard/server");

if (!process.env.TOKEN) {
    console.error("❌ TOKEN puuttuu ympäristömuuttujista. Bottia ei käynnistetä.");
    process.exit(1);
}

// Yksittäinen unohtunut Promise-virhe (esim. verkkokatko kesken kutsun) ei saa
// kaataa koko bottia. Virhe kirjataan lokiin ja botti jatkaa.
process.on("unhandledRejection", (syy) => {
    console.error("❌ Käsittelemätön Promise-virhe:", syy);
});

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
    // Botti saa pingata vain yksittäisiä käyttäjiä. Näin esim. `!add !x = @everyone`
    // tai komennon vapaatekstikenttä ei voi käyttää bottia massapingaukseen.
    allowedMentions: { parse: ["users"] }
});

client.on("error", (err) => console.error("❌ Discord-clientin virhe:", err));

// Ladataan komennot
commandHandler(client);

// Ladataan eventit
eventHandler(client);

// Käynnistetään dashboard heti, jotta hosting näkee HTTP-portin
// myös silloin, jos Discord-kirjautuminen kestää tai epäonnistuu.
kaynnistaDashboard(client, process.env.DASHBOARD_PORT || process.env.PORT || 10000);

// Kirjaudutaan Discordiin
client.login(process.env.TOKEN)
    .then(() => {
        console.log("✅ Kirjautuminen onnistui.");
        kaynnistaAjastin(client);
    })
    .catch(err => {
        // Virheviesti ei sisällä tokenia, mutta tulostetaan vain viesti — ei koko olioita.
        console.error("❌ Kirjautuminen epäonnistui:", err?.message ?? err);
    });
