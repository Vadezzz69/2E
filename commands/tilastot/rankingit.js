const { SlashCommandBuilder } = require("discord.js");
const { viestiListaAikavalilla, aaniListaAikavalilla, komentoListaAikavalilla, AIKAVALI_NIMET } = require("../../utils/tilastot");
const { ranking, renderLeaderboard } = require("../../utils/ui");
const { satunnainen } = require("../../utils/satunnainen");
const { RANKING_KOMMENTIT, RANKING_TYHJAT } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rankingit")
        .setDescription("Ennätyslista — valittavalla aikavälillä (tänään, 7 pv, 30 pv tai koko historia).")
        .addStringOption(option =>
            option.setName("kategoria").setDescription("Minkä perusteella listataan").setRequired(true)
                .addChoices(
                    { name: "Viestit", value: "viestit" },
                    { name: "Äänikanava", value: "aani" },
                    { name: "Komentojen käyttö", value: "komennot" }
                )
        )
        .addStringOption(option =>
            option.setName("aikavali").setDescription("Miltä aikaväliltä (oletus: koko historia)").setRequired(false)
                .addChoices(
                    { name: "Tänään", value: "tanaan" },
                    { name: "Viimeiset 7 päivää", value: "viikko" },
                    { name: "Viimeiset 30 päivää", value: "kuukausi" },
                    { name: "Koko historia", value: "kaikki" }
                )
        ),

    async execute(interaction) {
        const kategoria = interaction.options.getString("kategoria");
        const aikavali = interaction.options.getString("aikavali") ?? "kaikki";

        let rivit;
        let otsikkoEmoji;
        let muotoile;

        if (kategoria === "viestit") {
            rivit = await viestiListaAikavalilla(interaction.guildId, aikavali);
            otsikkoEmoji = "💬";
            muotoile = r => `**${r.count}** viestiä`;
        } else if (kategoria === "aani") {
            rivit = await aaniListaAikavalilla(interaction.guildId, aikavali);
            otsikkoEmoji = "🔊";
            muotoile = r => `**${Math.round(r.seconds / 60)}** minuuttia`;
        } else {
            rivit = await komentoListaAikavalilla(interaction.guildId, aikavali);
            otsikkoEmoji = "⚙️";
            muotoile = r => `**${r.count}** komentoa`;
        }

        if (!rivit.length) {
            return interaction.reply(satunnainen(RANKING_TYHJAT));
        }

        const embed = ranking({
            title: `${otsikkoEmoji} Rankingit — ${AIKAVALI_NIMET[aikavali]}`,
            description: renderLeaderboard(rivit, muotoile),
            footer: satunnainen(RANKING_KOMMENTIT[kategoria])
        });

        await interaction.reply({ embeds: [embed] });
    }
};
