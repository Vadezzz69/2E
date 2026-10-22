const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { lisaaEpailty, haeAktiivisetEpaillyt, poistaEpailyistaAktiivisuus } = require("../../utils/tutkintadata");
const { VARIT } = require("../../utils/tyyli");
const { satunnainen } = require("../../utils/satunnainen");
const { EPAILY_TYHJA } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("epaily")
        .setDescription("Hallinnoi komitean pysyvää epäiltyjen listaa.")
        .addSubcommand(sub =>
            sub
                .setName("lisaa")
                .setDescription("Lisää käyttäjän epäiltyjen listalle.")
                .addUserOption(o => o.setName("kayttaja").setDescription("Epäilty").setRequired(true))
                .addStringOption(o => o.setName("syy").setDescription("Epäilyn syy").setRequired(true).setMaxLength(300))
        )
        .addSubcommand(sub =>
            sub
                .setName("lista")
                .setDescription("Näyttää tämänhetkisen epäiltyjen listan.")
        )
        .addSubcommand(sub =>
            sub
                .setName("poista")
                .setDescription("Poistaa käyttäjän epäiltyjen listalta.")
                .addUserOption(o => o.setName("kayttaja").setDescription("Poistettava käyttäjä").setRequired(true))
        ),

    async execute(interaction) {

        const sub = interaction.options.getSubcommand();

        if (sub === "lisaa") {

            const kayttaja = interaction.options.getUser("kayttaja");
            const syy = interaction.options.getString("syy");

            await lisaaEpailty(interaction.guildId, kayttaja.id, syy, interaction.user.id);

            const embed = new EmbedBuilder()
                .setColor(VARIT.AKSENTTI)
                .setTitle("🕵️ Uusi epäilty lisätty listalle")
                .setDescription(`${kayttaja} on nyt komitean epäiltyjen listalla.\n\n**Syy:** ${syy}`)
                .setFooter({ text: `Lisäsi: ${interaction.user.tag}` });

            return interaction.reply({ embeds: [embed] });

        }

        if (sub === "lista") {

            const epaillyt = await haeAktiivisetEpaillyt(interaction.guildId);

            if (!epaillyt.length) {
                return interaction.reply(satunnainen(EPAILY_TYHJA));
            }

            const embed = new EmbedBuilder()
                .setColor(VARIT.AKSENTTI)
                .setTitle(`🕵️ Epäiltyjen lista (${epaillyt.length})`)
                .setDescription(
                    epaillyt
                        .slice(0, 20)
                        .map(e => `<@${e.userId}> — ${e.reason}\n↳ <t:${Math.floor(e.timestamp / 1000)}:R>`)
                        .join("\n\n")
                )
                .setFooter({ text: "Käytä /epaily poista poistaaksesi käyttäjän listalta." });

            return interaction.reply({ embeds: [embed] });

        }

        if (sub === "poista") {

            const kayttaja = interaction.options.getUser("kayttaja");
            const muutettu = await poistaEpailyistaAktiivisuus(interaction.guildId, kayttaja.id);

            if (muutettu === 0) {
                return interaction.reply({
                    content: `${kayttaja.username} ei ollut listalla.`,
                    ephemeral: true
                });
            }

            return interaction.reply(`✅ ${kayttaja} poistettiin epäiltyjen listalta.`);

        }

    }
};
