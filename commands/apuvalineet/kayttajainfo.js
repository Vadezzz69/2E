const { SlashCommandBuilder } = require("discord.js");
const { analyzeUserStats } = require("../../utils/statsEngine");
const { analyzeRoastFromStats } = require("../../utils/roastEngine");
const {
    buildProfileEmbed,
    ICONS,
    formatNumber,
    formatDuration,
    formatDate,
    formatRanking,
    mentionUser
} = require("../../utils/ui");
const { ehkaKaannaKutsujaksi } = require("../../utils/trolli");

// Same probability as before the refactor — kept as a named constant instead
// of a bare literal at the call site.
const SELF_REDIRECT_CHANCE = 0.18;

/** Discord-account fields are unique to this command (not server activity
 *  data), so they stay here rather than moving into the Stats Engine. */
async function buildAccountFields(interaction, user) {
    const member = await interaction.guild.members.fetch(user.id).catch(() => null);

    const roles = member
        ? [...member.roles.cache.values()]
            .filter(role => role.id !== interaction.guild.id)
            .sort((a, b) => b.position - a.position)
        : [];

    return [
        { name: "Liittyi Discordiin", value: formatDate(user.createdTimestamp), inline: true },
        { name: "Liittyi palvelimelle", value: member ? formatDate(member.joinedTimestamp) : "Ei tiedossa", inline: true },
        { name: "Rooleja", value: roles.length ? `${roles.length}` : "Ei yhtään", inline: true }
    ];
}

/** Formats the "favorite command" fact from the Stats Engine's extended bundle. */
function formatFavoriteCommand(favoriteCommand) {
    if (!favoriteCommand) return "Ei vielä yhtään";
    return `/${favoriteCommand.command} (${favoriteCommand.count}x)`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kayttajainfo")
        .setDescription("Näyttää tietoa käyttäjästä — Discord-tiedot + oikea palvelinaktiivisuus.")
        .addUserOption(option =>
            option
                .setName("kayttaja")
                .setDescription("Käyttäjä jonka tiedot haetaan (oletus: sinä)")
                .setRequired(false)
        ),

    async execute(interaction) {

        await interaction.deferReply();

        const pyydetty = interaction.options.getUser("kayttaja") ?? interaction.user;

        // Komitea saattaa silloin tällöin kääntää tutkan takaisin kysyjään itseensä.
        const { kohde: user, kaannetty, kommentti } = ehkaKaannaKutsujaksi(interaction, pyydetty, SELF_REDIRECT_CHANCE);

        // One Stats Engine call collects everything: today/total messages,
        // voice time, command usage, fines, investigations, rankings, and the
        // member's favorite command. The Roast Engine then reuses that exact
        // same bundle (`profile.roastContext`) instead of re-querying it.
        const [accountFields, profile] = await Promise.all([
            buildAccountFields(interaction, user),
            analyzeUserStats(interaction.guildId, user.id)
        ]);

        const roast = analyzeRoastFromStats(profile.roastContext);
        const stats = profile.roastContext;

        const embed = buildProfileEmbed({
            title: `${ICONS.committee} Salainen tiedosto — ${user.tag}`,
            thumbnail: user.displayAvatarURL(),
            accountFields,
            statFields: [
                { name: `${ICONS.messages} Viestejä yhteensä`, value: formatNumber(stats.messages.total), inline: true },
                { name: `${ICONS.calendar} Viestejä tänään`, value: formatNumber(stats.messages.today), inline: true },
                { name: `${ICONS.voice} Aikaa äänikanavalla`, value: formatDuration(stats.voice.totalSeconds), inline: true },
                { name: `${ICONS.commands} Komentoja käytetty`, value: formatNumber(stats.commandUsage), inline: true },
                { name: "⭐ Suosikkikomento", value: formatFavoriteCommand(stats.favoriteCommand), inline: true },
                { name: `${ICONS.rank} Sija viestitilastossa`, value: formatRanking(stats.rankings.messages), inline: true }
            ],
            profile,
            roastText: roast.text
        });

        if (kaannetty) {
            embed.setDescription(`${kommentti}\n\n*(Pyysit tietoja käyttäjästä ${mentionUser(pyydetty.id)}, mutta komitea päätti toisin.)*`);
        }

        await interaction.editReply({ embeds: [embed] });

    }
};
