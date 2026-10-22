const { SlashCommandBuilder } = require("discord.js");
const { report } = require("../../utils/ui");
const { generoiRatsiaSaalis } = require("../../utils/comedy");
const { satunnainen } = require("../../utils/satunnainen");
const { RATSIA_TULOKSET } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ratsia")
        .setDescription("Komitea suorittaa yllätysratsian kohteen omaisuuteen.")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Ratsian kohde").setRequired(true)
        ),

    async execute(interaction) {

        const kohde = interaction.options.getUser("kayttaja");
        const saalis = generoiRatsiaSaalis();

        const embed = report({
            title: "🚨 RATSIAPÖYTÄKIRJA",
            description: `Komitea suoritti yllätysratsian kohteeseen ${kohde}.`,
            thumbnail: kohde.displayAvatarURL(),
            fields: [
                { name: "Takavarikoitu omaisuus", value: saalis.map(esine => `• ${esine}`).join("\n") },
                { name: "Ratsian tulos", value: satunnainen(RATSIA_TULOKSET) }
            ]
        });

        await interaction.reply({ embeds: [embed] });

    }
};
