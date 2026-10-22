const { SlashCommandBuilder } = require("discord.js");
const { report } = require("../../utils/ui");
const {
    arvonimi,
    satunnainenKommentti,
    lisaaLoukkaantuminen,
    haeLoukkaantumistenMaara
} = require("../../utils/vammadata");
const { satunnainen } = require("../../utils/satunnainen");
const { BOTTI_LOUKKAA } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("loukkaa")
        .setDescription("Kirjaa käyttäjän loukkaantumisen tilastoihin.")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Kuka loukkaantui").setRequired(true)
        )
        .addStringOption(option =>
            option.setName("syy").setDescription("Miten loukkaantuminen tapahtui").setRequired(true).setMaxLength(200)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("kayttaja");
        const reason = interaction.options.getString("syy");

        if (user.bot) {
            return interaction.reply({ content: satunnainen(BOTTI_LOUKKAA), ephemeral: true });
        }

        await lisaaLoukkaantuminen(interaction.guildId, user.id, reason, interaction.user.id);
        const count = await haeLoukkaantumistenMaara(interaction.guildId, user.id);

        const embed = report({
            title: "🤕 Loukkaantumisraportti",
            thumbnail: user.displayAvatarURL(),
            description: `${user} loukkaantui!\n**Syy:** ${reason}`,
            fields: [
                { name: "Loukkaantumisia yhteensä", value: `${count}`, inline: true },
                { name: "Arvonimi", value: arvonimi(count), inline: true }
            ],
            footer: satunnainenKommentti()
        });

        await interaction.reply({ embeds: [embed] });
    }
};
