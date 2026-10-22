const { SlashCommandBuilder } = require("discord.js");
const { report, formatDuration, formatLevel } = require("../../utils/ui");
const { analyzeUserStats } = require("../../utils/statsEngine");
const { analyzeRoastFromStats } = require("../../utils/roastEngine");
const { valitseRoast } = require("../../utils/roastdata");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("roast")
        .setDescription("Komitea kommentoi kohteen oikeaa palvelinhistoriaa.")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Kuka tarkastetaan").setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const user = interaction.options.getUser("kayttaja");

        const analysis = await analyzeUserStats(interaction.guildId, user.id);
        const stats = analysis.roastContext;
        const roast = analyzeRoastFromStats(analysis.roastContext);

        const embed = report({
            title: `🔥 Komitean huomio — ${user.username}`,
            description: roast.text,
            thumbnail: user.displayAvatarURL(),
            fields: [
                { name: "Riskitaso", value: formatLevel(analysis.risk), inline: true },
                { name: "Aktiivisuus", value: formatLevel(analysis.activityLevel), inline: true },
                { name: "Merkinnät", value: analysis.badges.join(" • ") || "Ei erityisiä merkintöjä" },
                { name: "Lisähavainto", value: valitseRoast({ viestitYhteensa: stats.messages.total, aaniSekunnitYhteensa: stats.voice.totalSeconds }) },
                { name: "Viestejä yhteensä", value: `${stats.messages.total}`, inline: true },
                { name: "Äänikanavalla yhteensä", value: formatDuration(stats.voice.totalSeconds), inline: true },
                { name: "Komentoja", value: `${stats.commandUsage}`, inline: true }
            ]
        });

        await interaction.editReply({ embeds: [embed] });
    }
};
