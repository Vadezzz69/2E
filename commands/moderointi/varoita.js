const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { warning } = require("../../utils/ui");
const { lisaaVaroitus, haeVaroitustenMaara } = require("../../utils/varoitusdata");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("varoita")
        .setDescription("Antaa käyttäjälle virallisen varoituksen.")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Varoitettava käyttäjä").setRequired(true)
        )
        .addStringOption(option =>
            option.setName("syy").setDescription("Varoituksen syy").setRequired(true).setMaxLength(500)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

    async execute(interaction) {
        const kayttaja = interaction.options.getUser("kayttaja");
        const syy = interaction.options.getString("syy");

        await lisaaVaroitus(interaction.guildId, kayttaja.id, syy, interaction.user.id);
        const maara = await haeVaroitustenMaara(interaction.guildId, kayttaja.id);

        const embed = warning({
            title: "⚠️ Varoitus annettu",
            description: `${kayttaja} sai varoituksen.\n\n**Syy:** ${syy}\n**Varoituksia yhteensä:** ${maara}`,
            footer: `Antoi: ${interaction.user.tag}`
        });

        await interaction.reply({ embeds: [embed] });
    }
};
