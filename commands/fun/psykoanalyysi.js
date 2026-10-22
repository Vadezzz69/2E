const { SlashCommandBuilder } = require("discord.js");
const { report } = require("../../utils/ui");
const { generoiPsykoanalyysi } = require("../../utils/comedy");
const { ehkaKaannaKutsujaksi } = require("../../utils/trolli");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("psykoanalyysi")
        .setDescription("Komitea laatii täysin epätieteellisen psykologisen arvion kohteesta.")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Analyysin kohde").setRequired(true)
        ),

    async execute(interaction) {

        const pyydetty = interaction.options.getUser("kayttaja");
        const { kohde, kaannetty, kommentti } = ehkaKaannaKutsujaksi(interaction, pyydetty, 0.15);

        const analyysi = generoiPsykoanalyysi();

        const embed = report({
            title: `🧠 PSYKOANALYYSI — ${kohde.username}`,
            description: kaannetty ? kommentti : undefined,
            thumbnail: kohde.displayAvatarURL(),
            fields: [
                ...analyysi.palkit.map(rivi => ({ name: "\u200B", value: rivi, inline: false })),
                { name: "Diagnoosi", value: analyysi.diagnoosi },
                { name: "Riskiluokka", value: analyysi.riskiluokka }
            ]
        });

        await interaction.reply({ embeds: [embed] });

    }
};
