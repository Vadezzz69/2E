const { Events, ActivityType } = require("discord.js");
const { aloitaAaniSessio, haeAaniSessio } = require("../utils/tilastot");
const { satunnainen } = require("../utils/satunnainen");
const { STATUKSET } = require("../utils/comedy/data/viestit");

const STATUKSEN_VAIHTOVALI_MS = 30 * 60 * 1000;

function asetaStatus(client) {
    // Custom-statuksen tekstin Discord lukee `state`-kentästä; `name` annetaan
    // samana, koska aiempi toteutus käytti vain sitä.
    const teksti = satunnainen(STATUKSET);

    client.user.setPresence({
        activities: [{ name: teksti, state: teksti, type: ActivityType.Custom }],
        status: "idle"
    });
}

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {

        console.log(`✅ Kirjauduttu sisään käyttäjänä ${client.user.tag}`);

        asetaStatus(client);
        setInterval(() => asetaStatus(client), STATUKSEN_VAIHTOVALI_MS);

        // Täydennetään äänisessiot niille jotka olivat jo äänikanavalla
        // ENNEN kuin botti käynnistyi. Discord ei lähetä VoiceStateUpdate-
        // eventtiä heistä, koska mikään ei "muutu" botin näkökulmasta —
        // ilman tätä täydennystä heidän aikansa ei koskaan alkaisi laskea.
        let taydennetty = 0;

        for (const guild of client.guilds.cache.values()) {
            for (const channel of guild.channels.cache.values()) {

                if (!channel.isVoiceBased?.()) continue;

                for (const member of channel.members.values()) {

                    if (member.user.bot) continue;

                    const olemassaOleva = await haeAaniSessio(guild.id, member.id);

                    if (!olemassaOleva) {
                        await aloitaAaniSessio(guild.id, member.id, Date.now());
                        taydennetty++;
                    }

                }

            }
        }

        if (taydennetty > 0) {
            console.log(`🎤 Täydennettiin ${taydennetty} jo käynnissä ollutta äänisessiota.`);
        }

    }
};
