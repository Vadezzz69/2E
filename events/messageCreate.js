const { Events } = require("discord.js");
const { kirjaaViesti } = require("../utils/tilastot");
const {
    lisaaMukautettuKomento,
    haeMukautettuKomento,
    poistaMukautettuKomento,
    haeKaikkiMukautetutKomennot,
    jasennaLisayskomento
} = require("../utils/mukautetutKomennot");

const POISTA_ETULIITE = "!poista ";
const LISTA_KOMENTO = "!lista";
const MAKSIMI_VASTAUS_PITUUS = 1500; // Discordin viestiraja huomioiden reilulla marginaalilla

/**
 * Käsittelee "!add !avainsana = vastaus" -viestit: luo uuden mukautetun
 * komennon, ellei samanniminen ole jo olemassa.
 */
async function kasitteleLisays(message) {
    const jasennetty = jasennaLisayskomento(message.content);

    if (!jasennetty) {
        await message.reply(
            "En ymmärtänyt muotoa. Käytä: `!add !avainsana = vastaus` " +
            "(esim. `!add !housu = Se on housu.`)"
        );
        return;
    }

    if (jasennetty.response.length > MAKSIMI_VASTAUS_PITUUS) {
        await message.reply(`Vastaus on liian pitkä (max ${MAKSIMI_VASTAUS_PITUUS} merkkiä).`);
        return;
    }

    const luotiinko = await lisaaMukautettuKomento(
        message.guild.id,
        jasennetty.keyword,
        jasennetty.response,
        message.author.id
    );

    if (!luotiinko) {
        await message.reply(
            `Komento \`!${jasennetty.keyword.toLowerCase()}\` on jo olemassa. ` +
            `Poista se ensin komennolla \`!poista !${jasennetty.keyword.toLowerCase()}\`, jos haluat korvata sen.`
        );
        return;
    }

    await message.reply(`✅ Komento \`!${jasennetty.keyword.toLowerCase()}\` luotu.`);
}

/** Käsittelee "!poista !avainsana" -viestit. */
async function kasittelePoisto(message) {
    let avain = message.content.slice(POISTA_ETULIITE.length).trim();
    if (avain.startsWith("!")) avain = avain.slice(1);

    if (!avain) {
        await message.reply("Kerro mikä komento poistetaan, esim. `!poista !housu`.");
        return;
    }

    const poistettiinko = await poistaMukautettuKomento(message.guild.id, avain);

    await message.reply(
        poistettiinko
            ? `🗑️ Komento \`!${avain.toLowerCase()}\` poistettu.`
            : `Komentoa \`!${avain.toLowerCase()}\` ei löytynyt.`
    );
}

/** Käsittelee "!lista" -viestin. */
async function kasitteleLista(message) {
    const komennot = await haeKaikkiMukautetutKomennot(message.guild.id);

    if (!komennot.length) {
        await message.reply("Ei yhtään mukautettua komentoa vielä. Lisää yksi: `!add !avainsana = vastaus`.");
        return;
    }

    const rivit = komennot.map(k => `\`!${k.keyword}\``).join(", ");
    await message.reply(`📋 Mukautetut komennot (${komennot.length}): ${rivit}`);
}

/**
 * Käsittelee tavallisen "!avainsana" -viestin: jos tallennettu komento
 * löytyy, botti vastaa sen tallennetulla vastauksella. Jos ei löydy,
 * ei tehdä mitään — viesti voi olla ihan mitä tahansa muuta huutomerkillä
 * alkavaa keskustelua.
 */
async function kasitteleHaku(message) {
    const avain = message.content.slice(1).trim();
    if (!avain || avain.includes(" ")) return;

    const komento = await haeMukautettuKomento(message.guild.id, avain);
    if (!komento) return;

    await message.reply(komento.response);
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {

        if (message.author.bot || !message.guild) return;

        try {
            await kirjaaViesti(message.guild.id, message.author.id);
        } catch (err) {
            console.error("❌ Viestitilaston kirjaus epäonnistui:", err);
        }

        const sisalto = message.content?.trim();
        if (!sisalto || !sisalto.startsWith("!")) return;

        try {

            if (sisalto.toLowerCase().startsWith("!add ")) {
                await kasitteleLisays(message);
            } else if (sisalto.toLowerCase().startsWith(POISTA_ETULIITE)) {
                await kasittelePoisto(message);
            } else if (sisalto.toLowerCase() === LISTA_KOMENTO) {
                await kasitteleLista(message);
            } else {
                await kasitteleHaku(message);
            }

        } catch (err) {
            console.error("❌ Mukautetun komennon käsittely epäonnistui:", err);
        }

    }
};
