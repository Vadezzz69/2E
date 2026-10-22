const { all } = require("../../db");
const { viestiListaAikavalilla, aaniListaAikavalilla } = require("../../tilastot");
const { haeSyyllisinLista, haeSuurimmatSakot } = require("../../tutkintadata");

// Painot: kuinka paljon kukin mittari vaikuttaa lopulliseen pisteytykseen.
// Jokainen mittari normalisoidaan ensin 0-1 välille (jaetaan ehdokkaiden
// omalla maksimiarvolla), jotta esim. viestimäärä (voi olla kymmeniätuhansia)
// ei ylivoimaisesti dominoi sakkojen määrää (yleensä kymmeniä).
const PAINOT = {
    syyllisyys: 0.30,
    sakot: 0.25,
    tutkinnat: 0.20,
    aani: 0.15,
    viestit: 0.10
};

async function haeTutkintojenMaaratKaikille(guildId) {
    const rivit = await all(
        `SELECT userId, COUNT(*) AS maara FROM investigations WHERE guildId = ? GROUP BY userId`,
        [guildId]
    );
    return rivit;
}

function normalisoiKartaksi(rivit, arvoKentta) {
    const kartta = new Map();
    const maksimi = Math.max(1, ...rivit.map(r => r[arvoKentta] ?? 0));

    for (const rivi of rivit) {
        kartta.set(rivi.userId, (rivi[arvoKentta] ?? 0) / maksimi);
    }

    return kartta;
}

/**
 * Laskee palvelimen "vuoden rikollisen" painotetusti kaikesta olemassa
 * olevasta datasta: syyllisyysprosentti, sakot, tutkinnat, äänikanava-aika
 * ja viestimäärä. Palauttaa voittajan ja pisteytyksen erittelyn.
 */
async function generoiVuodenRikollinen(guildId) {
    const [syyllisyys, sakot, tutkinnat, viestit, aani] = await Promise.all([
        haeSyyllisinLista(guildId, 50),
        haeSuurimmatSakot(guildId, 50),
        haeTutkintojenMaaratKaikille(guildId),
        viestiListaAikavalilla(guildId, "kaikki", 50),
        aaniListaAikavalilla(guildId, "kaikki", 50)
    ]);

    const kartat = {
        syyllisyys: normalisoiKartaksi(syyllisyys, "summa"),
        sakot: normalisoiKartaksi(sakot, "sakkoja"),
        tutkinnat: normalisoiKartaksi(tutkinnat, "maara"),
        viestit: normalisoiKartaksi(viestit, "count"),
        aani: normalisoiKartaksi(aani, "seconds")
    };

    // Kaikki ehdokkaat = kaikki käyttäjät joilla on dataa vähintään yhdessä mittarissa.
    const ehdokkaat = new Set([
        ...kartat.syyllisyys.keys(),
        ...kartat.sakot.keys(),
        ...kartat.tutkinnat.keys(),
        ...kartat.viestit.keys(),
        ...kartat.aani.keys()
    ]);

    if (ehdokkaat.size === 0) return null;

    let voittaja = null;
    let parasPisteet = -1;
    const erittely = [];

    for (const userId of ehdokkaat) {
        const pisteet =
            (kartat.syyllisyys.get(userId) ?? 0) * PAINOT.syyllisyys +
            (kartat.sakot.get(userId) ?? 0) * PAINOT.sakot +
            (kartat.tutkinnat.get(userId) ?? 0) * PAINOT.tutkinnat +
            (kartat.viestit.get(userId) ?? 0) * PAINOT.viestit +
            (kartat.aani.get(userId) ?? 0) * PAINOT.aani;

        erittely.push({ userId, pisteet });

        if (pisteet > parasPisteet) {
            parasPisteet = pisteet;
            voittaja = userId;
        }
    }

    erittely.sort((a, b) => b.pisteet - a.pisteet);

    return {
        voittaja,
        pistemaara: Math.round(parasPisteet * 100),
        toiseksiTullut: erittely[1]?.userId ?? null,
        ehdokkaidenMaara: ehdokkaat.size
    };
}

module.exports = { generoiVuodenRikollinen };
