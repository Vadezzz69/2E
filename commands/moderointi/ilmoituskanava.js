const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType } = require("discord.js");
const { asetaIlmoituskanava } = require("../../utils/tutkintadata");
const { VARIT } = require("../../utils/tyyli");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ilmoituskanava")
        .setDescription("Asettaa kanavan, johon komitea postaa automaattiset päivätuomiot ja rankingit.")
        .addChannelOption(option =>
            option
                .setName("kanava")
                .setDescription("Kanava automaattisille postauksille")
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {

        const kanava = interaction.options.getChannel("kanava");

        await asetaIlmoituskanava(interaction.guildId, kanava.id);

        const embed = new EmbedBuilder()
            .setColor(VARIT.ONNISTUI)
            .setDescription(
                `✅ Automaattiset päivätuomiot ja -rankingit postataan nyt kanavaan ${kanava}.\n\n` +
                `Botti tarkistaa säännöllisin väliajoin onko tämän päivän postaus vielä tekemättä, ` +
                `ja lähettää sen automaattisesti kun uusi päivä alkaa (Suomen aika).`
            );

        await interaction.reply({ embeds: [embed] });

    }
};
