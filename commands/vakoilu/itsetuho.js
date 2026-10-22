const { SlashCommandBuilder } = require("discord.js");
const { odota } = require("../../utils/async");
const { satunnainen } = require("../../utils/satunnainen");
const { tayta, ITSETUHO_ALUT, ITSETUHO_LASKU, ITSETUHO_LOPUT } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("itsetuho")
        .setDescription("Käynnistää dramaattisen (ja täysin harmittoman) itsetuholaskennan.")
        .addStringOption(option =>
            option.setName("viesti").setDescription("Viimeiset sanasi").setRequired(false).setMaxLength(300)
        ),

    async execute(interaction) {

        const viimeisetSanat = interaction.options.getString("viesti");
        // Sama laskumuoto koko laskennan ajan, jotta näkymä ei hyppele.
        const laskuMuoto = satunnainen(ITSETUHO_LASKU);

        await interaction.reply(satunnainen(ITSETUHO_ALUT));
        await odota(1200);

        for (let i = 5; i >= 1; i--) {
            await interaction.editReply(tayta(laskuMuoto, { i }));
            await odota(1000);
        }

        await interaction.editReply(
            satunnainen(ITSETUHO_LOPUT) +
            (viimeisetSanat ? `\n\n*Viimeiset sanat: "${viimeisetSanat}"*` : "")
        );

    }
};
