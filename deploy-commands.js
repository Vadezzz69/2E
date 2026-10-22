require("dotenv").config({ quiet: true });

const { REST, Routes } = require("discord.js");
const { lataaKomennot } = require("./handlers/commandLoader");

// Käyttö:
//   npm run deploy                         rekisteröi komennot GUILD_ID-palvelimelle (korvaa koko vanhan listan)
//   npm run deploy -- --kuiva              vain tarkistaa ja listaa komennot, ei kosketa Discordiin
//   npm run deploy -- --puhdista-globaalit poistaa lisäksi mahdolliset GLOBAALIT komennot
//   npm run deploy -- --pakota             rekisteröi vaikka jokin komentotiedosto jäi lataamatta
const liput = new Set(process.argv.slice(2));
const KUIVA = liput.has("--kuiva");
const PUHDISTA_GLOBAALIT = liput.has("--puhdista-globaalit");
const PAKOTA = liput.has("--pakota");

const DISCORDIN_KOMENTORAJA = 100;

function virheTeksti(err) {
    // Tulostetaan vain viesti ja Discordin oma virhekoodi — ei koko virheolioita.
    const lisatieto = err?.rawError?.message && err.rawError.message !== err.message ? ` (${err.rawError.message})` : "";
    return `${err?.message ?? err}${lisatieto}`;
}

async function main() {

    const { komennot, ongelmat } = lataaKomennot();
    const body = komennot.map(({ komento }) => komento.data.toJSON());

    const kategoriat = new Map();
    for (const { kategoria, nimi } of komennot) {
        if (!kategoriat.has(kategoria)) kategoriat.set(kategoria, []);
        kategoriat.get(kategoria).push(`/${nimi}`);
    }

    for (const [kategoria, nimet] of kategoriat) {
        console.log(`✅ ${kategoria}: ${nimet.join(" ")}`);
    }

    for (const ongelma of ongelmat) {
        console.error(`❌ ${ongelma.tiedosto}: ${ongelma.syy}`);
    }

    console.log(`📦 Rekisteröitäviä komentoja: ${body.length}`);

    if (body.length > DISCORDIN_KOMENTORAJA) {
        throw new Error(`Komentoja on ${body.length}, Discordin raja on ${DISCORDIN_KOMENTORAJA} per palvelin.`);
    }

    // Rekisteröinti korvaa koko palvelimen komentolistan. Jos jokin tiedosto jäi
    // lataamatta, sen komento katoaisi Discordista huomaamatta, joten keskeytetään.
    if (ongelmat.length && !PAKOTA) {
        throw new Error("Osa komentotiedostoista ei latautunut (ks. yllä). Korjaa ne tai aja uudelleen lipulla --pakota.");
    }

    if (KUIVA) {
        console.log("🧪 Kuiva-ajo: mitään ei lähetetty Discordiin.");
        return;
    }

    const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;
    const puuttuvat = ["TOKEN", "CLIENT_ID", "GUILD_ID"].filter(nimi => !process.env[nimi]);

    if (puuttuvat.length) {
        throw new Error(`Ympäristömuuttujat puuttuvat: ${puuttuvat.join(", ")}`);
    }

    const rest = new REST({ version: "10" }).setToken(TOKEN);

    // PALVELINKOHTAISET komennot: PUT korvaa koko listan, joten aiemmin
    // rekisteröidyt mutta nyt poistetut komennot katoavat Discordista.
    const rekisteroidyt = await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body }
    );
    console.log(`✅ Palvelimelle ${GUILD_ID} rekisteröitiin ${rekisteroidyt.length} komentoa (vanhat korvattiin).`);

    // GLOBAALIT komennot: tämä projekti ei käytä niitä. Jos sellaisia silti on
    // (esim. aiemmasta kokeilusta), ne näkyvät palvelimella palvelinkohtaisten
    // rinnalla ja näyttävät tuplakomennoilta.
    const globaalit = await rest.get(Routes.applicationCommands(CLIENT_ID));

    if (!globaalit.length) {
        console.log("✅ Globaaleja komentoja ei ole — ei tuplia.");
    } else if (PUHDISTA_GLOBAALIT) {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
        console.log(`🧹 Poistettiin ${globaalit.length} globaalia komentoa: ${globaalit.map(k => `/${k.name}`).join(" ")}`);
    } else {
        console.warn(
            `⚠️ Löytyi ${globaalit.length} globaalia komentoa (${globaalit.map(k => `/${k.name}`).join(" ")}). ` +
            `Ne näkyvät Discordissa palvelinkohtaisten komentojen rinnalla. ` +
            `Poista ne ajamalla: npm run deploy -- --puhdista-globaalit`
        );
    }

}

main().catch(err => {
    console.error(`❌ ${virheTeksti(err)}`);
    process.exit(1);
});
