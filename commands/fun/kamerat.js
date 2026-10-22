const { SlashCommandBuilder } = require("discord.js");
const { report } = require("../../utils/ui");
const { generoiKamerat } = require("../../utils/comedy");
const { ehkaKaannaKutsujaksi } = require("../../utils/trolli");
const { satunnainen } = require("../../utils/satunnainen");
const { KAMERAT_ALATUNNISTEET } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kamerat")
        .setDescription("Näyttää kuvitteellisen valvontakameroiden aikajanan kohteesta.")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Kenen aikajana näytetään").setRequired(true)
        ),

    async execute(interaction) {

        const pyydetty = interaction.options.getUser("kayttaja");
        const { kohde, kaannetty, kommentti } = ehkaKaannaKutsujaksi(interaction, pyydetty, 0.15);

        const aikajana = generoiKamerat();
        const rivit = aikajana.map(r => `\`${r.time}\`  ${r.event}`).join("\n");

        const embed = report({
            title: `📹 VALVONTAKAMEROIDEN AIKAJANA — ${kohde.username}`,
            description: (kaannetty ? `${kommentti}\n\n` : "") + rivit,
            thumbnail: kohde.displayAvatarURL(),
            footer: satunnainen(KAMERAT_ALATUNNISTEET)
        });

        await interaction.reply({ embeds: [embed] });

    }
};
