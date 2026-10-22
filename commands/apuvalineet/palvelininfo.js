const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { VARIT } = require("../../utils/tyyli");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("palvelininfo")
        .setDescription("Näyttää tietoa palvelimesta."),

    async execute(interaction) {

        const guild = interaction.guild;

        const embed = new EmbedBuilder()
            .setColor(VARIT.PERUS)
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: "Jäseniä", value: `${guild.memberCount}`, inline: true },
                { name: "Luotu", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
                { name: "Omistaja", value: `<@${guild.ownerId}>`, inline: true }
            );

        await interaction.reply({ embeds: [embed] });

    }
};
