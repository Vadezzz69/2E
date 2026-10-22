const { SlashCommandBuilder } = require("discord.js");
const { report } = require("../../utils/ui");
const { paivanRikos, paivanPaatos } = require("../../utils/comedy");
const { tanaanHelsingissa } = require("../../utils/time");
const { satunnainen } = require("../../utils/satunnainen");
const { PAIVA_OTSIKOT, PAIVA_FOOTERIT } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("paiva")
        .setDescription("Päivän virallinen rikos ja päätös — sama koko päivän ajan (Suomen aika)."),

    async execute(interaction) {

        const pvm = tanaanHelsingissa();

        const embed = report({
            title: satunnainen(PAIVA_OTSIKOT),
            description: `Tänään (${pvm}) rekisteröity rikos:\n**"...${paivanRikos(pvm)}."**`,
            fields: [
                { name: "⚖️ Päivän päätös", value: paivanPaatos(pvm) }
            ],
            footer: satunnainen(PAIVA_FOOTERIT)
        });

        await interaction.reply({ embeds: [embed] });

    }
};
