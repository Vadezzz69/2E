const { SlashCommandBuilder } = require("discord.js");
const { haeSuurimmatSakot } = require("../../utils/tutkintadata");
const { ranking, renderLeaderboard } = require("../../utils/ui");
const { satunnainen } = require("../../utils/satunnainen");
const { SAKKOTILASTO_OTSIKOT, SAKKOTILASTO_TYHJAT, RANKING_KOMMENTIT } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sakkotilasto")
        .setDescription("Näyttää palvelimen eniten sakkoja saaneet käyttäjät."),

    async execute(interaction) {

        const lista = await haeSuurimmatSakot(interaction.guildId, 10);

        if (!lista.length) {
            return interaction.reply(satunnainen(SAKKOTILASTO_TYHJAT));
        }

        const embed = ranking({
            title: satunnainen(SAKKOTILASTO_OTSIKOT),
            description: renderLeaderboard(lista, r => `**${r.sakkoja} sakkoa**`),
            footer: satunnainen(RANKING_KOMMENTIT.sakot)
        });

        await interaction.reply({ embeds: [embed] });

    }
};
