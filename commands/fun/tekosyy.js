const { SlashCommandBuilder } = require("discord.js");
const { info } = require("../../utils/ui");
const { generoiTekosyy } = require("../../utils/comedy");
const { satunnainen } = require("../../utils/satunnainen");
const { TEKOSYY_OTSIKOT } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tekosyy")
        .setDescription("Generoi käyttökelpoisen (?) tekosyyn."),

    async execute(interaction) {

        const embed = info({
            title: satunnainen(TEKOSYY_OTSIKOT),
            description: generoiTekosyy()
        });

        await interaction.reply({ embeds: [embed] });

    }
};
