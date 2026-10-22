const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { hashKoodinimi } = require("../../utils/vakoiludata");
const { satunnainen } = require("../../utils/satunnainen");
const { VARIT } = require("../../utils/tyyli");
const { KOODINIMI_OTSIKOT, KOODINIMI_LOPPU } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("koodinimi")
        .setDescription("Paljastaa sinun (tai jonkun muun) virallisen vakoojan koodinimen.")
        .addUserOption(option =>
            option
                .setName("kayttaja")
                .setDescription("Kenen koodinimi paljastetaan (oletus: sinä)")
                .setRequired(false)
        ),

    async execute(interaction) {

        const user = interaction.options.getUser("kayttaja") ?? interaction.user;
        const koodinimi = hashKoodinimi(user.id);

        const embed = new EmbedBuilder()
            .setColor(VARIT.PERUS)
            .setTitle(satunnainen(KOODINIMI_OTSIKOT))
            .setDescription(
                `**${user.username}** tunnetaan komiteassa koodinimellä:\n\n` +
                `## "${koodinimi}"\n\n` +
                `*${satunnainen(KOODINIMI_LOPPU)}*`
            )
            .setThumbnail(user.displayAvatarURL());

        await interaction.reply({ embeds: [embed] });

    }
};
