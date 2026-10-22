const { SlashCommandBuilder } = require("discord.js");
const { stats, formatDuration } = require("../../utils/ui");
const { analyzeUserStats } = require("../../utils/statsEngine");
const { analyzeRoastFromStats } = require("../../utils/roastEngine");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("aktiivisuus")
        .setDescription("Näyttää käyttäjän tämän päivän aktiivisuuden.")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Kenen aktiivisuus näytetään (oletus: sinä)").setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("kayttaja") ?? interaction.user;

        const analysis = await analyzeUserStats(interaction.guildId, user.id);
        const userStats = analysis.roastContext;
        const roast = analyzeRoastFromStats(analysis.roastContext);

        const embed = stats({
            title: `📊 ${user.username}n aktiivisuus tänään`,
            thumbnail: user.displayAvatarURL(),
            description: analysis.summary,
            fields: [
                { name: "Viestejä", value: `${userStats.messages.today}`, inline: true },
                { name: "Äänikanavalla", value: formatDuration(userStats.voice.todaySeconds), inline: true },
                { name: "Komentoja", value: `${userStats.commandUsage}`, inline: true },
                { name: "Komitean huomio", value: roast.text },
                { name: "Merkinnät", value: analysis.badges.join(" • ") || "Ei erityisiä merkintöjä" }
            ]
        });

        await interaction.reply({ embeds: [embed] });
    }
};
