const { PIIRTEET, DIAGNOOSIT, RISKILUOKAT } = require("../data/psykologia");
const { satunnainen, satunnaisetMonta, satunnaisVali } = require("./random");
const { palkki } = require("../../tyyli");

/**
 * Palauttaa 3-4 satunnaista piirrettä palkkiarvoineen, sekä satunnaisen
 * diagnoosin ja riskiluokan. Palkin arvo on aina 0-100 — samaa
 * apufunktiota (utils/tyyli.js:n palkki) käytetään kuin muuallakin botissa.
 */
function generoiPsykoanalyysi() {
    const valitutPiirteet = satunnaisetMonta(PIIRTEET, satunnaisVali(3, 4)).map(nimi => ({
        nimi,
        arvo: satunnaisVali(0, 100)
    }));

    return {
        piirteet: valitutPiirteet,
        palkit: valitutPiirteet.map(p => `**${p.nimi}**\n\`${palkki(p.arvo, 10)}\` ${p.arvo} %`),
        diagnoosi: satunnainen(DIAGNOOSIT),
        riskiluokka: satunnainen(RISKILUOKAT)
    };
}

module.exports = { generoiPsykoanalyysi };
