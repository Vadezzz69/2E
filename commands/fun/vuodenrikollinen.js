const { SlashCommandBuilder } = require("discord.js");
const { report } = require("../../utils/ui");
const { generoiVuodenRikollinen } = require("../../utils/comedy");
const { satunnainen } = require("../../utils/satunnainen");
const {
    tayta,
    VUODEN_OTSIKOT,
    VUODEN_KUVAUKSET,
    VUODEN_FOOTERIT,
    VUODEN_EI_DATAA
} = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("vuodenrikollinen")
        .setDescription("Julkistaa palvelimen vuoden rikollisen — lasketaan oikeasta datasta."),

    async execute(interaction) {

        await interaction.deferReply();

        const tulos = await generoiVuodenRikollinen(interaction.guildId);

        if (!tulos) {
            return interaction.editReply(satunnainen(VUODEN_EI_DATAA));
        }

        const embed = report({
            title: satunnainen(VUODEN_OTSIKOT),
            description: tayta(satunnainen(VUODEN_KUVAUKSET), { voittaja: tulos.voittaja }),
            fields: [
                { name: "Yhdistetty pistemäärä", value: `${tulos.pistemaara} / 100`, inline: true },
                { name: "Ehdokkaita yhteensä", value: `${tulos.ehdokkaidenMaara}`, inline: true },
                ...(tulos.toiseksiTullut
                    ? [{ name: "Kunniamaininta (2. sija)", value: `<@${tulos.toiseksiTullut}>` }]
                    : [])
            ],
            footer: satunnainen(VUODEN_FOOTERIT)
        });

        await interaction.editReply({ embeds: [embed] });

    }
};
