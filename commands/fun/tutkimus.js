const { SlashCommandBuilder } = require("discord.js");
const { ajaSatunnainenJasen } = require("../../utils/ryhmakomento");

// Samaan perheeseen kuuluvat itsenäiset komennot (kaikki ottavat "kayttaja"-kohteen).
const JASENET = ["ratsia", "takavarikko", "kuulustelu", "rikosrekisteri", "kamerat", "psykoanalyysi"];

module.exports = {
    JASENET,

    data: new SlashCommandBuilder()
        .setName("tutkimus")
        .setDescription("Komitea valitsee itse miten kohdetta tutkitaan: ratsia, kuulustelu, kamerat tms.")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Tutkimuksen kohde").setRequired(true)
        ),

    async execute(interaction, client) {
        return ajaSatunnainenJasen(interaction, client, JASENET);
    }
};
