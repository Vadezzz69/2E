const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { warning } = require("../../utils/ui");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lukitse")
        .setDescription("Lukitsee nykyisen kanavan — @everyone ei voi enää lähettää viestejä.")
        .addStringOption(option =>
            option.setName("syy").setDescription("Syy lukitukselle").setRequired(false).setMaxLength(300)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    async execute(interaction) {
        const reason = interaction.options.getString("syy") ?? "Syytä ei annettu";

        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: false
        });

        await interaction.reply({
            embeds: [warning({
                description: `🔒 Kanava lukittu.\n**Syy:** ${reason}`
            })]
        });
    }
};
