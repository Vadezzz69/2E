const { ESINEET } = require("../data/esineet");
const { satunnaisetMonta, satunnaisVali } = require("./random");

/** Poimii 5-8 satunnaista, uniikkia esinettä ratsian saaliiksi. */
function generoiRatsiaSaalis() {
    return satunnaisetMonta(ESINEET, satunnaisVali(5, 8));
}

/** Poimii 6-12 satunnaista, uniikkia takavarikoitua esinettä. */
function generoiTakavarikko() {
    return satunnaisetMonta(ESINEET, satunnaisVali(6, 12));
}

module.exports = { generoiRatsiaSaalis, generoiTakavarikko };
