const { TIEDOTTEET } = require("../data/tiedotteet");
const { PAATOKSET } = require("../data/paatokset");
const { satunnainen, paivanAlkio } = require("./random");

function generoiTiedote() {
    return satunnainen(TIEDOTTEET);
}

function generoiPaatos() {
    return satunnainen(PAATOKSET);
}

/** Päivän virallinen päätös — pysyy samana koko Helsingin kalenteripäivän. */
function paivanPaatos(pvm) {
    return paivanAlkio(pvm, PAATOKSET);
}

module.exports = { generoiTiedote, generoiPaatos, paivanPaatos };
