const { TODISTEET } = require("../data/todisteet");
const { satunnainen } = require("./random");

function generoiTodiste() {
    return satunnainen(TODISTEET);
}

module.exports = { generoiTodiste };
