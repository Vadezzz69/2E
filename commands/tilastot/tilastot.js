const { SlashCommandBuilder } = require("discord.js");
const { viestiListaAikavalilla, aaniListaAikavalilla, komentoListaAikavalilla, AIKAVALI_NIMET } = require("../../utils/tilastot");
const { haeSuurimmatSakot } = require("../../utils/tutkintadata");
const { ranking, renderLeaderboard } = require("../../utils/ui");
const { satunnainen } = require("../../utils/satunnainen");
const { tayta, TILASTOT_OTSIKOT, TILASTOT_FOOTERIT, RANKING_TYHJAT } = require("../../utils/comedy/data/viestit");

const KARKIA = 3;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tilastot")
        .setDescription("Palvelimen tilastokatsaus: kolmen kärki viesteissä, äänessä, komennoissa ja sakoissa.")
        .addStringOption(option =>
            option.setName("aikavali").setDescription("Miltä aikaväliltä (oletus: tänään)").setRequired(false)
                .addChoices(
                    { name: "Tänään", value: "tanaan" },
                    { name: "Viimeiset 7 päivää", value: "viikko" },
                    { name: "Viimeiset 30 päivää", value: "kuukausi" },
                    { name: "Koko historia", value: "kaikki" }
                )
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const aikavali = interaction.options.getString("aikavali") ?? "tanaan";
        const guildId = interaction.guildId;

        const [viestit, aani, komennot, sakot] = await Promise.all([
            viestiListaAikavalilla(guildId, aikavali, KARKIA),
            aaniListaAikavalilla(guildId, aikavali, KARKIA),
            komentoListaAikavalilla(guildId, aikavali, KARKIA),
            haeSuurimmatSakot(guildId, KARKIA)
        ]);

        const osiot = [
            { name: "💬 Viestit", rivit: viestit, muotoile: r => `**${r.count}** viestiä` },
            { name: "🔊 Äänikanava", rivit: aani, muotoile: r => `**${Math.round(r.seconds / 60)}** min` },
            { name: "⚙️ Komennot", rivit: komennot, muotoile: r => `**${r.count}** komentoa` },
            // Sakkorekisteri ei ole päiväkohtainen, joten se näytetään aina koko historialta.
            { name: "💸 Sakot (koko historia)", rivit: sakot, muotoile: r => `**${r.sakkoja}** sakkoa` }
        ].filter(osio => osio.rivit.length);

        if (!osiot.length) {
            return interaction.editReply(satunnainen(RANKING_TYHJAT));
        }

        const embed = ranking({
            title: tayta(satunnainen(TILASTOT_OTSIKOT), { aika: AIKAVALI_NIMET[aikavali] }),
            fields: osiot.map(osio => ({ name: osio.name, value: renderLeaderboard(osio.rivit, osio.muotoile), inline: true })),
            footer: satunnainen(TILASTOT_FOOTERIT)
        });

        await interaction.editReply({ embeds: [embed] });
    }
};
