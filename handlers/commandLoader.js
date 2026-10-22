const fs = require("fs");
const path = require("path");

const KOMENNOT_KANSIO = path.join(__dirname, "..", "commands");

/**
 * Lataa kaikki komennot `commands/<kategoria>/*.js` -tiedostoista.
 *
 * Tätä käyttävät sekä botti (handlers/commandHandler.js) että Discord-
 * rekisteröinti (deploy-commands.js), jotta molemmat näkevät täsmälleen
 * saman komentolistan — aiemmin kummallakin oli oma kopionsa kansioiden
 * läpikäynnistä.
 *
 * Palauttaa:
 *   komennot — onnistuneesti ladatut komennot { nimi, kategoria, tiedosto, komento }
 *   ongelmat — ohitetut tiedostot syineen (virhe, puuttuva data/execute, nimitörmäys)
 */
function lataaKomennot() {
    const komennot = [];
    const ongelmat = [];
    const nimet = new Map(); // komennon nimi -> tiedosto jossa se jo on

    const kategoriat = fs
        .readdirSync(KOMENNOT_KANSIO, { withFileTypes: true })
        .filter(kohde => kohde.isDirectory())
        .map(kohde => kohde.name)
        .sort();

    for (const kategoria of kategoriat) {
        const tiedostot = fs
            .readdirSync(path.join(KOMENNOT_KANSIO, kategoria))
            .filter(tiedosto => tiedosto.endsWith(".js"))
            .sort();

        for (const tiedosto of tiedostot) {
            const sijainti = `${kategoria}/${tiedosto}`;
            let komento;

            try {
                komento = require(path.join(KOMENNOT_KANSIO, kategoria, tiedosto));
            } catch (err) {
                ongelmat.push({ tiedosto: sijainti, syy: `lataus epäonnistui: ${err.message}`, virhe: err });
                continue;
            }

            if (!komento?.data || typeof komento.execute !== "function") {
                ongelmat.push({ tiedosto: sijainti, syy: 'puuttuu "data" tai "execute"' });
                continue;
            }

            const nimi = komento.data.name;

            if (nimet.has(nimi)) {
                ongelmat.push({ tiedosto: sijainti, syy: `komennon /${nimi} nimi on jo käytössä tiedostossa ${nimet.get(nimi)}` });
                continue;
            }

            nimet.set(nimi, sijainti);
            komennot.push({ nimi, kategoria, tiedosto: sijainti, komento });
        }
    }

    return { komennot, ongelmat };
}

module.exports = { lataaKomennot, KOMENNOT_KANSIO };
