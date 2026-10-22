const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { warning } = require("../../utils/ui");
const { haeVaroitukset } = require("../../utils/varoitusdata");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("varoitukset")
        .setDescription("Näyttää käyttäjän varoitushistorian.")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Kenen varoitukset näytetään").setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const kayttaja = interaction.options.getUser("kayttaja");
        const rivit = await haeVaroitukset(interaction.guildId, kayttaja.id, 10);

        if (!rivit.length) {
            return interaction.reply(`${kayttaja.username} ei ole saanut yhtään varoitusta. Puhdas pöytä. ✅`);
        }

        const embed = warning({
            title: `⚠️ ${kayttaja.username}n varoitukset (${rivit.length} viimeisintä)`,
            thumbnail: kayttaja.displayAvatarURL(),
            description: rivit.map((r, i) => `**${i + 1}.** ${r.reason}\n↳ <@${r.moderatorId}> — <t:${Math.floor(r.timestamp / 1000)}:R>`).join("\n\n")
        });

        await interaction.reply({ embeds: [embed] });
    }
};
