const { SlashCommandBuilder } = require("discord.js");
const { report, formatDuration, formatLevel } = require("../../utils/ui");
const { analyzeUserStats } = require("../../utils/statsEngine");
const { analyzeRoastFromStats } = require("../../utils/roastEngine");
const { hashKoodinimi } = require("../../utils/vakoiludata");
const { ehkaKaannaKutsujaksi } = require("../../utils/trolli");
const { satunnainen } = require("../../utils/satunnainen");
const { VAKOILU_FOOTERIT } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("report")
        .setDescription("Luo palvelinaktiivisuuteen perustuvan komitearaportin.")
        .addUserOption(option =>
            option.setName("kohde").setDescription("Kenestä raportoidaan").setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const requestedUser = interaction.options.getUser("kohde");
        const { kohde: user, kaannetty, kommentti } = ehkaKaannaKutsujaksi(interaction, requestedUser);

        // Yksi tilastokysely: Stats Enginen palauttama roastContext sisältää jo
        // kaiken, mitä roast-moottori tarvitsee (aiemmin data haettiin kolmesti).
        const analysis = await analyzeUserStats(interaction.guildId, user.id);
        const userStats = analysis.roastContext;
        const roast = analyzeRoastFromStats(analysis.roastContext);

        const embed = report({
            title: "📄 Komitean raportti",
            thumbnail: user.displayAvatarURL(),
            description: kaannetty ? kommentti : analysis.summary,
            fields: [
                { name: "Kohde", value: `${user} ("${hashKoodinimi(user.id)}")` },
                { name: "Viestejä tänään", value: `${userStats.messages.today}`, inline: true },
                { name: "Äänikanavalla", value: formatDuration(userStats.voice.todaySeconds), inline: true },
                { name: "Riskitaso", value: formatLevel(analysis.risk), inline: true },
                { name: "Komitean huomio", value: roast.text },
                { name: "Merkinnät", value: analysis.badges.join(" • ") || "Ei erityisiä merkintöjä" }
            ],
            footer: satunnainen(VAKOILU_FOOTERIT)
        });

        await interaction.editReply({ embeds: [embed] });
    }
};
