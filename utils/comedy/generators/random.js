const { satunnainen, satunnaisVali, satunnaisetMonta } = require("../../satunnainen");

/** Korvaa "{n}"-paikanvaraajan satunnaisella luvulla (oletusväli 2-20). */
function taytaLukuPaikanvaraaja(teksti, min = 2, max = 20) {
    return teksti.replace(/\{n\}/g, () => satunnaisVali(min, max));
}

/**
 * Deterministinen "päivän" indeksi listaan — sama päivä (Helsingin ajassa)
 * antaa aina saman tuloksen, jotta esim. /paiva ei vaihdu joka
 * kutsulla. Käyttää yksinkertaista merkkijonohajautusta siemenenä.
 */
function paivanIndeksi(pvm, listanPituus) {
    let hash = 0;
    for (const merkki of pvm) {
        hash = (hash * 31 + merkki.charCodeAt(0)) >>> 0;
    }
    return hash % listanPituus;
}

function paivanAlkio(pvm, lista) {
    return lista[paivanIndeksi(pvm, lista.length)];
}

module.exports = {
    satunnainen,
    satunnaisVali,
    satunnaisetMonta,
    taytaLukuPaikanvaraaja,
    paivanIndeksi,
    paivanAlkio
};
