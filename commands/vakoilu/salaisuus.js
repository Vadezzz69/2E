const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { SALAISUUDET } = require("../../utils/vakoiludata");
const { satunnainen } = require("../../utils/satunnainen");
const { VARIT } = require("../../utils/tyyli");
const { SALAISUUS_OTSIKOT, SALAISUUS_FOOTERIT } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("salaisuus")
        .setDescription("Paljastaa yhden komitean tiukasti vartioiduista salaisuuksista."),

    async execute(interaction) {

        const salaisuus = satunnainen(SALAISUUDET);

        const embed = new EmbedBuilder()
            .setColor(VARIT.PERUS)
            .setTitle(satunnainen(SALAISUUS_OTSIKOT))
            .setDescription(`||${salaisuus}||`)
            .setFooter({ text: satunnainen(SALAISUUS_FOOTERIT) });

        await interaction.reply({ embeds: [embed] });

    }
};
