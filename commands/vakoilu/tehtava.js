const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { TEHTAVAT, hashKoodinimi } = require("../../utils/vakoiludata");
const { satunnainen } = require("../../utils/satunnainen");
const { VARIT } = require("../../utils/tyyli");
const { tayta, TEHTAVA_OTSIKOT, TEHTAVA_INTROT, TEHTAVA_FOOTERIT } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tehtava")
        .setDescription("Arpoo sinulle salaisen komiteatehtävän."),

    async execute(interaction) {

        const tehtava = satunnainen(TEHTAVAT);
        const koodinimi = hashKoodinimi(interaction.user.id);

        const embed = new EmbedBuilder()
            .setColor(VARIT.AKSENTTI)
            .setTitle(satunnainen(TEHTAVA_OTSIKOT))
            .setDescription(tayta(satunnainen(TEHTAVA_INTROT), { koodinimi }))
            .addFields(
                { name: "Operaation nimi", value: tehtava.nimi },
                { name: "Vaikeustaso", value: tehtava.vaikeus, inline: true },
                { name: "Palkkio onnistumisesta", value: tehtava.palkkio, inline: true }
            )
            .setFooter({ text: satunnainen(TEHTAVA_FOOTERIT) });

        await interaction.reply({ embeds: [embed] });

    }
};
