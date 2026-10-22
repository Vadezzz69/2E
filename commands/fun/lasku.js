const { SlashCommandBuilder } = require("discord.js");
const { report } = require("../../utils/ui");
const { generoiLasku } = require("../../utils/comedy");
const { satunnainen } = require("../../utils/satunnainen");
const { LASKU_FOOTERIT } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lasku")
        .setDescription("Lähettää kohteelle täysin kuvitteellisen laskun.")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Laskun saaja").setRequired(true)
        ),

    async execute(interaction) {

        const kohde = interaction.options.getUser("kayttaja");
        const lasku = generoiLasku();

        const rivit = lasku.rivit.map(r => `${r.nimi} — ${r.summa} ${lasku.yksikko}`).join("\n");

        const embed = report({
            title: `🧾 LASKU — ${kohde.username}`,
            thumbnail: kohde.displayAvatarURL(),
            fields: [
                { name: "Laskutettavat erät", value: rivit },
                { name: "Yhteensä", value: `**${lasku.yhteensa} ${lasku.yksikko}**` }
            ],
            footer: satunnainen(LASKU_FOOTERIT)
        });

        await interaction.reply({ embeds: [embed] });

    }
};
