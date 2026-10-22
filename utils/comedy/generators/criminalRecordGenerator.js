const { analyzeUserStats } = require("../../statsEngine");
const { haeSyyllisyysprosentti, haeTuomioidenMaara } = require("../../tutkintadata");
const { generoiRikoslauseet } = require("./crimeGenerator");

/**
 * Yhdistää oikean palvelinaktiivisuuden (Stats Enginen kautta, ei
 * duplikoitua SQL:ää) ja 3-5 keksittyä "rikosta" yhdeksi rikosrekisteriksi.
 */
async function generoiRikosrekisteri(guildId, userId) {
    const [profiili, syyllisyysprosentti, tuomioita] = await Promise.all([
        analyzeUserStats(guildId, userId),
        haeSyyllisyysprosentti(guildId, userId),
        haeTuomioidenMaara(guildId, userId)
    ]);

    const stats = profiili.roastContext;

    return {
        oikeaData: {
            viestitYhteensa: stats.messages.total,
            aaniSekunnitYhteensa: stats.voice.totalSeconds,
            sakkoja: stats.fines,
            syyllisyysprosentti,
            avoimiaTutkintoja: stats.investigations.open,
            tuomioitaYhteensa: tuomioita
        },
        keksitytRikokset: generoiRikoslauseet(4),
        komitean_mielipide: profiili.committeeOpinion
    };
}

module.exports = { generoiRikosrekisteri };
