const { SlashCommandBuilder } = require("discord.js");
const { info } = require("../../utils/ui");
const { generoiTiedote } = require("../../utils/comedy");
const { satunnainen } = require("../../utils/satunnainen");
const { TIEDOTE_OTSIKOT } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tiedote")
        .setDescription("Komitean satunnainen (ja täysin merkityksetön) tiedote."),

    async execute(interaction) {

        const embed = info({
            title: satunnainen(TIEDOTE_OTSIKOT),
            description: generoiTiedote()
        });

        await interaction.reply({ embeds: [embed] });

    }
};
