const { LASKURIVIT } = require("../data/laskurivit");
const { SAKKO_YKSIKOT } = require("../../komiteadata");
const { satunnaisetMonta, satunnainen, satunnaisVali } = require("./random");

/**
 * Rahayksiköt haetaan komiteadata.js:stä (samaa poolia käyttää myös
 * /sakko), jotta valuuttaa ei tarvitse keksiä kahteen kertaan.
 */
function generoiLasku() {
    const rivit = satunnaisetMonta(LASKURIVIT, satunnaisVali(3, 6)).map(nimi => ({
        nimi,
        summa: satunnaisVali(3, 90)
    }));

    const yksikko = satunnainen(SAKKO_YKSIKOT);
    const yhteensa = rivit.reduce((summa, rivi) => summa + rivi.summa, 0);

    return { rivit, yksikko, yhteensa };
}

module.exports = { generoiLasku };
