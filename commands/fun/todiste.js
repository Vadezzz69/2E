const { SlashCommandBuilder } = require("discord.js");
const { report } = require("../../utils/ui");
const { generoiTodiste } = require("../../utils/comedy");
const { satunnainen } = require("../../utils/satunnainen");
const { TODISTE_ALATUNNISTEET } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("todiste")
        .setDescription("Esittää väärennetyn todisteen kohdetta vastaan.")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Ketä todiste koskee").setRequired(true)
        ),

    async execute(interaction) {

        const kohde = interaction.options.getUser("kayttaja");
        const todiste = generoiTodiste();

        const embed = report({
            title: "🗂️ Todistusaineisto",
            description: `Esitetään todisteena käyttäjää ${kohde} vastaan:`,
            fields: [{ name: "Todiste", value: todiste }],
            footer: satunnainen(TODISTE_ALATUNNISTEET)
        });

        await interaction.reply({ embeds: [embed] });

    }
};
