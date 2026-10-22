const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {
    aloitaTutkinta,
    lisaaTodiste,
    haeTodisteet,
    suljeTutkinta,
    haeTutkinta,
    haeAvoimetTutkinnat,
    lisaaSyyllisyytta,
    kirjaaTuomio
} = require("../../utils/tutkintadata");
const { VARIT } = require("../../utils/tyyli");
const { satunnainen } = require("../../utils/satunnainen");
const { TUTKINTA_TYHJA } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tutkinta")
        .setDescription("Hallinnoi komitean virallisia tutkintoja.")
        .addSubcommand(sub =>
            sub
                .setName("aloita")
                .setDescription("Avaa uuden tutkinnan käyttäjää vastaan.")
                .addUserOption(o => o.setName("kayttaja").setDescription("Tutkittava").setRequired(true))
                .addStringOption(o => o.setName("otsikko").setDescription("Tutkinnan aihe").setRequired(true).setMaxLength(200))
        )
        .addSubcommand(sub =>
            sub
                .setName("todiste")
                .setDescription("Lisää todisteen avoimeen tutkintaan.")
                .addIntegerOption(o => o.setName("tunnus").setDescription("Tutkinnan numero (#)").setRequired(true))
                .addStringOption(o => o.setName("todiste").setDescription("Todisteen sisältö").setRequired(true).setMaxLength(500))
        )
        .addSubcommand(sub =>
            sub
                .setName("sulje")
                .setDescription("Sulkee tutkinnan ja antaa lopullisen tuomion.")
                .addIntegerOption(o => o.setName("tunnus").setDescription("Tutkinnan numero (#)").setRequired(true))
                .addStringOption(o => o.setName("tuomio").setDescription("Lopullinen tuomio").setRequired(true).setMaxLength(500))
        )
        .addSubcommand(sub =>
            sub
                .setName("lista")
                .setDescription("Näyttää kaikki avoimet tutkinnat.")
        ),

    async execute(interaction) {

        const sub = interaction.options.getSubcommand();

        if (sub === "aloita") {

            const kayttaja = interaction.options.getUser("kayttaja");
            const otsikko = interaction.options.getString("otsikko");

            const id = await aloitaTutkinta(interaction.guildId, kayttaja.id, otsikko, interaction.user.id);

            const embed = new EmbedBuilder()
                .setColor(VARIT.AKSENTTI)
                .setTitle(`📁 Tutkinta #${id} avattu`)
                .setDescription(
                    `**Kohde:** ${kayttaja}\n` +
                    `**Aihe:** ${otsikko}\n\n` +
                    `Lisää todisteita: \`/tutkinta todiste tunnus:${id} todiste:"..."\`\n` +
                    `Sulje tutkinta: \`/tutkinta sulje tunnus:${id} tuomio:"..."\``
                );

            return interaction.reply({ embeds: [embed] });

        }

        if (sub === "todiste") {

            const tunnus = interaction.options.getInteger("tunnus");
            const todiste = interaction.options.getString("todiste");

            const tutkinta = await haeTutkinta(tunnus);

            if (!tutkinta || tutkinta.guildId !== interaction.guildId) {
                return interaction.reply({ content: `Tutkintaa #${tunnus} ei löytynyt.`, ephemeral: true });
            }

            if (tutkinta.status !== "open") {
                return interaction.reply({ content: `Tutkinta #${tunnus} on jo suljettu.`, ephemeral: true });
            }

            await lisaaTodiste(tunnus, interaction.user.id, todiste);

            return interaction.reply(`📎 Todiste lisätty tutkintaan #${tunnus}: *${todiste}*`);

        }

        if (sub === "sulje") {

            const tunnus = interaction.options.getInteger("tunnus");
            const tuomio = interaction.options.getString("tuomio");

            const tutkinta = await haeTutkinta(tunnus);

            if (!tutkinta || tutkinta.guildId !== interaction.guildId) {
                return interaction.reply({ content: `Tutkintaa #${tunnus} ei löytynyt.`, ephemeral: true });
            }

            if (tutkinta.status !== "open") {
                return interaction.reply({ content: `Tutkinta #${tunnus} on jo suljettu.`, ephemeral: true });
            }

            const todisteet = await haeTodisteet(tunnus);

            await suljeTutkinta(tunnus, tuomio);
            await lisaaSyyllisyytta(interaction.guildId, tutkinta.userId, 15, `Tutkinta #${tunnus} suljettu: ${tuomio}`);
            await kirjaaTuomio(interaction.guildId, tutkinta.userId, tuomio, `tutkinta #${tunnus}`, false);

            const embed = new EmbedBuilder()
                .setColor(VARIT.VAROITUS)
                .setTitle(`⚖️ Tutkinta #${tunnus} suljettu`)
                .setDescription(
                    `**Kohde:** <@${tutkinta.userId}>\n` +
                    `**Aihe:** ${tutkinta.title}\n` +
                    `**Todisteita kerätty:** ${todisteet.length}\n\n` +
                    `**Lopullinen tuomio:**\n${tuomio}`
                )
                .setFooter({ text: "Syyllisyysprosentti nousi +15 tämän tutkinnan seurauksena." });

            return interaction.reply({ embeds: [embed] });

        }

        if (sub === "lista") {

            const avoimet = await haeAvoimetTutkinnat(interaction.guildId);

            if (!avoimet.length) {
                return interaction.reply(satunnainen(TUTKINTA_TYHJA));
            }

            const embed = new EmbedBuilder()
                .setColor(VARIT.PERUS)
                .setTitle(`📁 Avoimet tutkinnat (${avoimet.length})`)
                .setDescription(
                    avoimet
                        .map(t => `**#${t.id}** — <@${t.userId}>: ${t.title}\n↳ Avattu <t:${Math.floor(t.openedAt / 1000)}:R>`)
                        .join("\n\n")
                );

            return interaction.reply({ embeds: [embed] });

        }

    }
};
