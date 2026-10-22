const { SlashCommandBuilder } = require("discord.js");
const { report } = require("../../utils/ui");
const { generoiKuulustelu } = require("../../utils/comedy");
const { satunnainen } = require("../../utils/satunnainen");
const { KUULUSTELU_ALATUNNISTEET } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kuulustelu")
        .setDescription("Komitea kuulustelee kohdetta virallisen näköisesti.")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Kuulusteltava").setRequired(true)
        ),

    async execute(interaction) {

        const kohde = interaction.options.getUser("kayttaja");
        const kuulustelu = generoiKuulustelu();

        const fields = kuulustelu.parit.map((pari, i) => ({
            name: `Kysymys ${i + 1}: ${pari.kysymys}`,
            value: `*${kohde.username}: "${pari.vastaus}"*`
        }));

        fields.push({ name: "Komitean johtopäätös", value: kuulustelu.johtopaatos });

        const embed = report({
            title: `🎙️ KUULUSTELUPÖYTÄKIRJA — ${kohde.username}`,
            thumbnail: kohde.displayAvatarURL(),
            fields,
            footer: satunnainen(KUULUSTELU_ALATUNNISTEET)
        });

        await interaction.reply({ embeds: [embed] });

    }
};
