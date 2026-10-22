const { SlashCommandBuilder } = require("discord.js");
const { warning } = require("../../utils/ui");
const { generoiFeikkisakko } = require("../../utils/comedy");
const { satunnainen } = require("../../utils/satunnainen");
const { FEIKKISAKKO_OTSIKOT, FEIKKISAKKO_FOOTERIT } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sakota")
        .setDescription("Tulostaa täysin kuvitteellisen sakkolapun. (Ei oikea — ei tallennu mihinkään.)")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Sakotettava").setRequired(true)
        ),

    async execute(interaction) {

        const kohde = interaction.options.getUser("kayttaja");
        const sakko = generoiFeikkisakko();

        const embed = warning({
            title: satunnainen(FEIKKISAKKO_OTSIKOT),
            description: `Asianumero: **#${sakko.asianumero}**`,
            fields: [
                { name: "Kohde", value: `${kohde}`, inline: true },
                { name: "Summa", value: `${sakko.summa} ${sakko.yksikko}`, inline: true },
                { name: "Syy", value: sakko.syy }
            ],
            footer: satunnainen(FEIKKISAKKO_FOOTERIT)
        });

        await interaction.reply({ embeds: [embed] });

    }
};
