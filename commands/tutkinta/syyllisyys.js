const { SlashCommandBuilder } = require("discord.js");
const { haeSyyllisyysprosentti, haeSyyllisyysHistoria, haeSyyllisinLista, haeTuomioidenMaara } = require("../../utils/tutkintadata");
const { ranking, createEmbed, formatProgressBar, renderLeaderboard } = require("../../utils/ui");
const { VARIT } = require("../../utils/tyyli");
const { satunnainen } = require("../../utils/satunnainen");
const { SYYLLISYYS_TYHJA } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("syyllisyys")
        .setDescription("Näyttää käyttäjän pysyvän syyllisyysprosentin (kertyy koko historian ajalta).")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Kenen syyllisyys tarkistetaan (jätä tyhjäksi = koko listan kärki)").setRequired(false)
        ),

    async execute(interaction) {

        const kayttaja = interaction.options.getUser("kayttaja");

        if (!kayttaja) {
            const lista = await haeSyyllisinLista(interaction.guildId);

            if (!lista.length) {
                return interaction.reply(satunnainen(SYYLLISYYS_TYHJA));
            }

            const embed = ranking({
                title: "⚖️ Syyllisimmät — koko historia",
                description: renderLeaderboard(lista, r => `**${Math.max(0, Math.min(100, r.summa))}%**`)
            });

            return interaction.reply({ embeds: [embed] });
        }

        const [prosentti, historia, tuomioita] = await Promise.all([
            haeSyyllisyysprosentti(interaction.guildId, kayttaja.id),
            haeSyyllisyysHistoria(interaction.guildId, kayttaja.id, 5),
            haeTuomioidenMaara(interaction.guildId, kayttaja.id)
        ]);

        const fields = [
            { name: "Syyllisyys", value: formatProgressBar(prosentti) },
            { name: "Tuomioita yhteensä", value: `${tuomioita}`, inline: true }
        ];

        if (historia.length) {
            fields.push({
                name: "Viimeisimmät tapahtumat",
                value: historia.map(h => `${h.delta >= 0 ? "🔺" : "🔻"} ${h.delta >= 0 ? "+" : ""}${h.delta} — ${h.syy}`).join("\n")
            });
        }

        const embed = createEmbed({
            color: prosentti > 60 ? VARIT.AKSENTTI : prosentti > 30 ? VARIT.HARMAA : VARIT.PERUS,
            title: `⚖️ ${kayttaja.username}n syyllisyysprosentti`,
            thumbnail: kayttaja.displayAvatarURL(),
            fields,
            footer: "Syyllisyysprosentti kertyy tutkinnoista, äänestyksistä ja tuomioista — pysyvästi."
        });

        await interaction.reply({ embeds: [embed] });
    }
};
