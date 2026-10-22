const { EmbedBuilder } = require("discord.js");
const { get, all } = require("./db");
const { tanaan } = require("./tilastot");
const { eilinenHelsingissa, paivanAlkuMs, paivanLoppuMs } = require("./time");
const { RANGAISTUKSET } = require("./komiteadata");
const { satunnainen, satunnaisVali } = require("./satunnainen");
const { haeKaikkiAsetuksetJoillaKanava, merkitseDigestLahetetyksi, kirjaaTuomio } = require("./tutkintadata");
const { VARIT } = require("./tyyli");
const { renderLeaderboard } = require("./ui/format");
const {
    tayta,
    DIGEST_OTSIKOT,
    DIGEST_KUVAUKSET,
    DIGEST_EI_TUOMIOTA,
    DIGEST_FOOTERIT,
    DIGEST_PAATOS_KEHYKSET,
    DIGEST_TOP_OTSIKOT,
    DIGEST_TOP_KOMMENTIT
} = require("./comedy/data/viestit");

const TARKISTUSVALI_MS = 10 * 60 * 1000; // 10 min

let tarkistusKaynnissa = false;
let ajastinKaynnistetty = false;

function eilinenPvm() {
    return eilinenHelsingissa();
}

async function eilisenParasKirjoittaja(guildId, pvm) {
    return get(
        `SELECT userId, count FROM message_stats WHERE guildId = ? AND date = ? ORDER BY count DESC LIMIT 1`,
        [guildId, pvm]
    );
}

async function eilisenParasAanessa(guildId, pvm) {
    return get(
        `SELECT userId, seconds FROM voice_stats WHERE guildId = ? AND date = ? ORDER BY seconds DESC LIMIT 1`,
        [guildId, pvm]
    );
}

async function eilisenParasKomentaja(guildId, pvm) {
    // Päivän rajat Helsingin keskiyöstä keskiyöhön (ei UTC-keskiyöstä).
    const alku = paivanAlkuMs(pvm);
    const loppu = paivanLoppuMs(pvm);
    return get(
        `SELECT userId, COUNT(*) as count FROM command_usage
         WHERE guildId = ? AND timestamp >= ? AND timestamp < ?
         GROUP BY userId ORDER BY count DESC LIMIT 1`,
        [guildId, alku, loppu]
    );
}

async function eilisenViestiTop3(guildId, pvm) {
    return all(
        `SELECT userId, count FROM message_stats WHERE guildId = ? AND date = ? ORDER BY count DESC LIMIT 3`,
        [guildId, pvm]
    );
}

async function rakennaAutomaattinenTuomio(guildId, pvm) {

    const [kirjoittaja, aanessa, komentaja] = await Promise.all([
        eilisenParasKirjoittaja(guildId, pvm),
        eilisenParasAanessa(guildId, pvm),
        eilisenParasKomentaja(guildId, pvm)
    ]);

    const vaihtoehdot = [];

    if (kirjoittaja && kirjoittaja.count > 0) {
        vaihtoehdot.push({ userId: kirjoittaja.userId, lause: `kirjoitti eilen **${kirjoittaja.count}** viestiä` });
    }
    if (aanessa && aanessa.seconds > 0) {
        vaihtoehdot.push({ userId: aanessa.userId, lause: `vietti eilen äänikanavalla **${Math.round(aanessa.seconds / 60)}** minuuttia` });
    }
    if (komentaja && komentaja.count > 0) {
        vaihtoehdot.push({ userId: komentaja.userId, lause: `käytti eilen komentoja **${komentaja.count}** kertaa` });
    }

    if (!vaihtoehdot.length) return null;

    return {
        valittu: satunnainen(vaihtoehdot),
        rangaistus: satunnainen(RANGAISTUKSET),
        paatosnumero: satunnaisVali(1000, 9999)
    };

}

async function postaaDigest(guild, kanava, pvm) {

    const [tuomio, topViestit] = await Promise.all([
        rakennaAutomaattinenTuomio(guild.id, pvm),
        eilisenViestiTop3(guild.id, pvm)
    ]);

    const embed = new EmbedBuilder()
        .setColor(VARIT.AKSENTTI)
        .setTitle(satunnainen(DIGEST_OTSIKOT))
        .setDescription(tayta(satunnainen(DIGEST_KUVAUKSET), { pvm }))
        .setTimestamp();

    if (tuomio) {
        embed.addFields({
            name: `⚖️ ${satunnainen(DIGEST_PAATOS_KEHYKSET)} #${tuomio.paatosnumero}`,
            value: `<@${tuomio.valittu.userId}> ${tuomio.valittu.lause}.\n**Rangaistus:** ${tuomio.rangaistus}`
        });
    } else {
        embed.addFields({ name: "⚖️ Päätös", value: satunnainen(DIGEST_EI_TUOMIOTA) });
    }

    if (topViestit.length) {
        embed.addFields({
            name: satunnainen(DIGEST_TOP_OTSIKOT),
            // Oikeat rivinvaihdot (aiemmin merkkijonoon jäi kirjaimellinen "\n\n").
            value: `${renderLeaderboard(topViestit, r => `${r.count} viestiä`)}\n\n_${satunnainen(DIGEST_TOP_KOMMENTIT)}_`
        });
    }

    embed.setFooter({ text: satunnainen(DIGEST_FOOTERIT) });

    await kanava.send({ embeds: [embed] });

    // Tuomio kirjataan vasta kun viesti on oikeasti lähtenyt. Aiemmin kirjaus
    // tehtiin ennen lähetystä, jolloin epäonnistunut lähetys tuotti uuden
    // tuomiorivin joka 10. minuutti kunnes lähetys onnistui.
    if (tuomio) {
        await kirjaaTuomio(guild.id, tuomio.valittu.userId, tuomio.rangaistus, "automaattinen päivätuomio", true);
    }

}

async function ajaTarkistus(client) {

    // Estää päällekkäiset ajot, jos edellinen tarkistus on vielä kesken.
    if (tarkistusKaynnissa) return;
    tarkistusKaynnissa = true;

    try {

        const asetukset = await haeKaikkiAsetuksetJoillaKanava();
        const tanaanPvm = tanaan();
        const eilinen = eilinenPvm();

        for (const asetus of asetukset) {

            if (asetus.lastDigestDate === tanaanPvm) continue; // jo lähetetty tänään

            const guild = client.guilds.cache.get(asetus.guildId);
            if (!guild) continue;

            const kanava = guild.channels.cache.get(asetus.announceChannelId);
            if (!kanava?.isTextBased?.()) continue;

            try {
                await postaaDigest(guild, kanava, eilinen);
                await merkitseDigestLahetetyksi(asetus.guildId, tanaanPvm);
                console.log(`📨 Päivittäinen tiedote postattu palvelimelle: ${guild.name}`);
            } catch (err) {
                console.error(`❌ Digestin postaus epäonnistui palvelimelle ${guild.name}:`, err?.message ?? err);
            }

        }

    } finally {
        tarkistusKaynnissa = false;
    }

}

function kaynnistaAjastin(client) {

    if (ajastinKaynnistetty) return;
    ajastinKaynnistetty = true;

    // Ensimmäinen ajo pienellä viiveellä, jotta guildit/kanavat ehtivät ladata cacheen.
    setTimeout(() => {
        ajaTarkistus(client).catch(err => console.error("❌ Ajastimen ensimmäinen ajo epäonnistui:", err?.message ?? err));
    }, 15000);

    setInterval(() => {
        ajaTarkistus(client).catch(err => console.error("❌ Ajastimen ajo epäonnistui:", err?.message ?? err));
    }, TARKISTUSVALI_MS);

    console.log("⏰ Automaattisten päivätuomioiden ajastin käynnistetty.");

}

module.exports = { kaynnistaAjastin, ajaTarkistus, postaaDigest, rakennaAutomaattinenTuomio };
