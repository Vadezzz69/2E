const { SlashCommandBuilder } = require("discord.js");
const { ajaSatunnainenJasen } = require("../../utils/ryhmakomento");

// Samaan perheeseen kuuluvat itsenäiset komennot (kaikki ottavat "kayttaja"-kohteen).
const JASENET = ["syyte", "todiste", "lasku"];

module.exports = {
    JASENET,

    data: new SlashCommandBuilder()
        .setName("oikeus")
        .setDescription("Komitea valitsee itse oikeustoimen kohdetta vastaan: syyte, todiste tai lasku.")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Oikeustoimen kohde").setRequired(true)
        ),

    async execute(interaction, client) {
        return ajaSatunnainenJasen(interaction, client, JASENET);
    }
};
