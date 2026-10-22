const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const { VARIT } = require("../../utils/tyyli");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("avaa")
        .setDescription("Avaa aiemmin lukitun kanavan uudelleen.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {

        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: null
        });

        const embed = new EmbedBuilder()
            .setColor(VARIT.ONNISTUI)
            .setDescription("🔓 Kanava avattu — viestien lähetys sallittu jälleen.");

        await interaction.reply({ embeds: [embed] });

    }
};
