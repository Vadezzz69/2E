const { SlashCommandBuilder } = require("discord.js");
const { report, formatNumber, formatDuration } = require("../../utils/ui");
const { generoiRikosrekisteri } = require("../../utils/comedy");
const { ehkaKaannaKutsujaksi } = require("../../utils/trolli");
const { satunnainen } = require("../../utils/satunnainen");
const { REKISTERI_ALATUNNISTEET } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rikosrekisteri")
        .setDescription("Näyttää kohteen rikosrekisterin — oikea data + keksityt rikokset.")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Kenen rekisteri haetaan").setRequired(true)
        ),

    async execute(interaction) {

        await interaction.deferReply();

        const pyydetty = interaction.options.getUser("kayttaja");
        const { kohde, kaannetty, kommentti } = ehkaKaannaKutsujaksi(interaction, pyydetty, 0.15);

        const rekisteri = await generoiRikosrekisteri(interaction.guildId, kohde.id);
        const d = rekisteri.oikeaData;

        const embed = report({
            title: `📁 RIKOSREKISTERI — ${kohde.username}`,
            description: (kaannetty ? `${kommentti}\n\n` : "") + rekisteri.komitean_mielipide,
            thumbnail: kohde.displayAvatarURL(),
            fields: [
                { name: "💬 Viestejä yhteensä", value: formatNumber(d.viestitYhteensa), inline: true },
                { name: "🔊 Äänikanavalla", value: formatDuration(d.aaniSekunnitYhteensa), inline: true },
                { name: "💸 Sakkoja", value: `${d.sakkoja}`, inline: true },
                { name: "⚖️ Syyllisyys", value: `${d.syyllisyysprosentti}%`, inline: true },
                { name: "📁 Avoimia tutkintoja", value: `${d.avoimiaTutkintoja}`, inline: true },
                { name: "🧾 Tuomioita", value: `${d.tuomioitaYhteensa}`, inline: true },
                { name: "Lisäksi rekisteröidyt teot", value: rekisteri.keksitytRikokset.map(r => `• ${r}`).join("\n") }
            ],
            footer: satunnainen(REKISTERI_ALATUNNISTEET)
        });

        await interaction.editReply({ embeds: [embed] });

    }
};
