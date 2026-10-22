const { KYSYMYKSET, VASTAUKSET, JOHTOPAATOKSET } = require("../data/kuulustelu");
const { satunnaisetMonta, satunnainen } = require("./random");

/** 3 kysymys-vastaus-paria + yksi johtopäätös. */
function generoiKuulustelu() {
    const kysymykset = satunnaisetMonta(KYSYMYKSET, 3);
    const vastaukset = satunnaisetMonta(VASTAUKSET, 3);

    return {
        parit: kysymykset.map((kysymys, i) => ({ kysymys, vastaus: vastaukset[i] })),
        johtopaatos: satunnainen(JOHTOPAATOKSET)
    };
}

module.exports = { generoiKuulustelu };
