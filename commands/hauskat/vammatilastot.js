const { SlashCommandBuilder } = require("discord.js");
const { report, ranking, renderLeaderboard } = require("../../utils/ui");
const {
    arvonimi,
    haeLoukkaantumistenMaara,
    haeViimeisimmatLoukkaantumiset,
    haeLoukkaantumisLista
} = require("../../utils/vammadata");
const { satunnainen } = require("../../utils/satunnainen");
const { tayta, VAMMA_EI_YHTAAN, VAMMA_LISTA_TYHJA } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("vammatilastot")
        .setDescription("Näyttää loukkaantumistilastot — yksittäiselle käyttäjälle tai koko palvelimelle.")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Näytä tietyn käyttäjän tilastot (jätä tyhjäksi = ennätyslista)").setRequired(false)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser("kayttaja");

        if (target) {
            const count = await haeLoukkaantumistenMaara(interaction.guildId, target.id);

            if (count === 0) {
                return interaction.reply(tayta(satunnainen(VAMMA_EI_YHTAAN), { nimi: target.username }));
            }

            const recent = await haeViimeisimmatLoukkaantumiset(interaction.guildId, target.id, 5);

            const embed = report({
                title: `🩹 ${target.username}n loukkaantumistilastot`,
                thumbnail: target.displayAvatarURL(),
                fields: [
                    { name: "Loukkaantumisia yhteensä", value: `${count}`, inline: true },
                    { name: "Arvonimi", value: arvonimi(count), inline: true },
                    {
                        name: "Viimeisimmät tapaukset",
                        value: recent.map(r => `• ${r.reason} — <t:${Math.floor(r.timestamp / 1000)}:R>`).join("\n")
                    }
                ]
            });

            return interaction.reply({ embeds: [embed] });
        }

        const rows = await haeLoukkaantumisLista(interaction.guildId, 10);

        if (!rows.length) {
            return interaction.reply(satunnainen(VAMMA_LISTA_TYHJA));
        }

        const embed = ranking({
            title: "🏆 Palvelimen loukkaantumisten ennätyslista",
            description: renderLeaderboard(rows, r => `**${r.count}** loukkaantumista`)
        });

        await interaction.reply({ embeds: [embed] });
    }
};
