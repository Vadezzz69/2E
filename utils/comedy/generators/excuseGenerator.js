const { TEKOSYYT } = require("../data/tekosyyt");
const { satunnainen } = require("./random");

function generoiTekosyy() {
    return satunnainen(TEKOSYYT);
}

module.exports = { generoiTekosyy };
