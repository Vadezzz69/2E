const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { VARIT } = require("../../utils/tyyli");
const { satunnainen } = require("../../utils/satunnainen");
const { TYHJENNA_VIRHE } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tyhjenna")
        .setDescription("Poistaa useita viimeisimpiä viestejä kanavalta.")
        .addIntegerOption(option =>
            option
                .setName("maara")
                .setDescription("Poistettavien viestien määrä (1-100)")
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {

        const maara = interaction.options.getInteger("maara");

        await interaction.deferReply({ ephemeral: true });

        try {

            const poistetut = await interaction.channel.bulkDelete(maara, true);

            const embed = new EmbedBuilder()
                .setColor(VARIT.ONNISTUI)
                .setDescription(`🧹 Poistettiin **${poistetut.size}** viestiä.`);

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {

            // Yleisin syy: Discord ei salli yli 14 vrk vanhojen viestien joukkopoistoa.
            // Kirjataan silti varsinainen syy lokiin (esim. puuttuvat oikeudet).
            console.error("❌ /tyhjenna epäonnistui:", err?.message ?? err);
            await interaction.editReply(satunnainen(TYHJENNA_VIRHE));

        }

    }
};
