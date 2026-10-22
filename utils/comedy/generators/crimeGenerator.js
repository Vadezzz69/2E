const { RIKOKSET } = require("../data/rikokset");
const { TODISTUSETULIITTEET } = require("../data/todistusetuliitteet");
const { satunnainen, satunnaisetMonta, taytaLukuPaikanvaraaja, paivanAlkio } = require("./random");

/** Yksi täydellinen rikoslause, esim. "Valvontakameran mukaan epäilty avasi jääkaapin 14 kertaa." */
function generoiRikoslause() {
    const etuliite = satunnainen(TODISTUSETULIITTEET);
    const rikos = taytaLukuPaikanvaraaja(satunnainen(RIKOKSET));
    return `${etuliite} ${rikos}.`;
}

/** N eri rikoslausetta ilman toistoa peruslauseiden tasolla. */
function generoiRikoslauseet(maara) {
    // Huom: .map(taytaLukuPaikanvaraaja) välittäisi indeksin ja taulukon funktion
    // min/max-parametreiksi ja tuottaisi tekstiin "NaN" — siksi eksplisiittinen kutsu.
    const rikokset = satunnaisetMonta(RIKOKSET, maara).map(rikos => taytaLukuPaikanvaraaja(rikos));
    return rikokset.map(rikos => `${satunnainen(TODISTUSETULIITTEET)} ${rikos}.`);
}

/** Pelkkä rikoksen ydinlause ilman etuliitettä (esim. syytelistoihin, joissa muoto on jo muualla). */
function generoiPelkkaRikos() {
    return taytaLukuPaikanvaraaja(satunnainen(RIKOKSET));
}

/** Päivän rikos — sama tulos koko Helsingin kalenteripäivän ajan. */
function paivanRikos(pvm) {
    return taytaLukuPaikanvaraaja(paivanAlkio(pvm, RIKOKSET), 2, 20);
}

module.exports = { generoiRikoslause, generoiRikoslauseet, generoiPelkkaRikos, paivanRikos };
