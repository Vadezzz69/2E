const { SYYTTEET, RANGAISTUSSUOSITUKSET } = require("../data/syytteet");
const { TODISTEET } = require("../data/todisteet");
const { TODISTAJAT, TODISTAJAKOMMENTIT } = require("../data/todistajat");
const { satunnainen } = require("./random");

/**
 * Yhdistää neljä eri poolia (syyte, todiste, todistaja, rangaistussuositus)
 * yhdeksi syyteasiakirjaksi. Käyttää TODISTEET- ja TODISTAJAT-poolia jotka
 * on määritelty vain kerran (jaettu /todiste ja /kuulustelu -komentojen
 * kanssa) — ei duplikoituja listoja.
 */
function generoiSyyte() {
    return {
        syyte: satunnainen(SYYTTEET),
        todiste: satunnainen(TODISTEET),
        todistaja: satunnainen(TODISTAJAT),
        todistajaKommentti: satunnainen(TODISTAJAKOMMENTIT),
        suositus: satunnainen(RANGAISTUSSUOSITUKSET)
    };
}

module.exports = { generoiSyyte };
