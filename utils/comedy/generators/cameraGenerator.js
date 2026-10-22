const { KAMERATAPAHTUMAT } = require("../data/kameratapahtumat");
const { satunnaisetMonta, satunnaisVali } = require("./random");

function muotoileKellonaika(minuutit) {
    const h = Math.floor(minuutit / 60) % 24;
    const m = minuutit % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Rakentaa 5-8 tapahtuman aikajanan, jossa kellonajat etenevät
 * loogisesti (1-40 minuutin hyppäyksin) alkaen satunnaisesta aamuhetkestä.
 * Palauttaa taulukon { time, event } -olioita.
 */
function generoiKamerat() {
    const tapahtumaMaara = satunnaisVali(5, 8);
    const tapahtumat = satunnaisetMonta(KAMERATAPAHTUMAT, tapahtumaMaara);

    let minuutit = satunnaisVali(6 * 60, 10 * 60); // alkaa jossain klo 06-10 välillä

    return tapahtumat.map(tapahtuma => {
        const rivi = { time: muotoileKellonaika(minuutit), event: tapahtuma };
        minuutit += satunnaisVali(1, 40);
        return rivi;
    });
}

module.exports = { generoiKamerat };
