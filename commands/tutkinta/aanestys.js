const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const {
    aloitaAanestys,
    annaAani,
    haeAanestysTulos,
    suljeAanestys,
    lisaaSyyllisyytta,
    kirjaaTuomio
} = require("../../utils/tutkintadata");
const { VARIT } = require("../../utils/tyyli");
const { satunnainen } = require("../../utils/satunnainen");
const {
    tayta,
    AANESTYS_EI_AANIA,
    AANESTYS_SYYLLINEN,
    AANESTYS_VIATON,
    AANESTYS_TASAPELI
} = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("aanestys")
        .setDescription("Käynnistää komitean syyllisyysäänestyksen kohteesta.")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Kenestä äänestetään").setRequired(true)
        )
        .addStringOption(option =>
            option.setName("kysymys").setDescription("Mistä äänestetään").setRequired(false).setMaxLength(200)
        )
        .addIntegerOption(option =>
            option
                .setName("kesto_sekuntia")
                .setDescription("Äänestyksen kesto sekunteina (oletus 60, max 600)")
                .setMinValue(15)
                .setMaxValue(600)
                .setRequired(false)
        ),

    async execute(interaction) {

        const kohde = interaction.options.getUser("kayttaja");
        const kysymys = interaction.options.getString("kysymys") ?? "Onko kohde syyllinen?";
        const kestoSekuntia = interaction.options.getInteger("kesto_sekuntia") ?? 60;

        const voteId = await aloitaAanestys(
            interaction.guildId,
            kohde.id,
            interaction.user.id,
            kysymys,
            kestoSekuntia * 1000
        );

        const rivi = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`aanestys_syyllinen_${voteId}`).setLabel("Syyllinen").setStyle(ButtonStyle.Danger).setEmoji("⚖️"),
            new ButtonBuilder().setCustomId(`aanestys_viaton_${voteId}`).setLabel("Viaton").setStyle(ButtonStyle.Success).setEmoji("🕊️")
        );

        const embed = new EmbedBuilder()
            .setColor(VARIT.VAROITUS)
            .setTitle(`⚖️ Äänestys #${voteId} käynnissä`)
            .setDescription(`**Kohde:** ${kohde}\n**Kysymys:** ${kysymys}\n\nÄänestysaikaa: ${kestoSekuntia} sekuntia.`)
            .setFooter({ text: "Yksi ääni per henkilö. Voit vaihtaa ääntäsi äänestyksen aikana." });

        const viesti = await interaction.reply({ embeds: [embed], components: [rivi], fetchReply: true });

        const kerays = viesti.createMessageComponentCollector({ time: kestoSekuntia * 1000 });

        // Tapahtumankäsittelijän virhe ei saa päätyä käsittelemättömäksi Promise-virheeksi.
        kerays.on("collect", async (napinPainaja) => {

            try {

                const valinta = napinPainaja.customId.startsWith("aanestys_syyllinen_") ? "syyllinen" : "viaton";

                await annaAani(voteId, napinPainaja.user.id, valinta);

                const tulokset = await haeAanestysTulos(voteId);
                const syyllisia = tulokset.find(t => t.choice === "syyllinen")?.maara ?? 0;
                const viattomia = tulokset.find(t => t.choice === "viaton")?.maara ?? 0;

                await napinPainaja.reply({
                    content: `Äänesi (**${valinta}**) rekisteröitiin. Tilanne juuri nyt: ⚖️ ${syyllisia} — 🕊️ ${viattomia}`,
                    ephemeral: true
                });

            } catch (err) {

                console.error(`❌ Äänestyksen #${voteId} äänen käsittely epäonnistui:`, err?.message ?? err);
                await napinPainaja.reply({ content: "Ääntä ei saatu rekisteröityä. Yritä uudelleen.", ephemeral: true }).catch(() => {});

            }

        });

        kerays.on("end", async () => {

          try {

            const tulokset = await haeAanestysTulos(voteId);
            const syyllisia = tulokset.find(t => t.choice === "syyllinen")?.maara ?? 0;
            const viattomia = tulokset.find(t => t.choice === "viaton")?.maara ?? 0;

            await suljeAanestys(voteId);

            let lopputulos;
            let deltaSyyllisyys;

            if (syyllisia === 0 && viattomia === 0) {
                lopputulos = satunnainen(AANESTYS_EI_AANIA);
                deltaSyyllisyys = 3;
            } else if (syyllisia > viattomia) {
                lopputulos = tayta(satunnainen(AANESTYS_SYYLLINEN), { a: syyllisia, b: viattomia });
                deltaSyyllisyys = 12;
            } else if (viattomia > syyllisia) {
                lopputulos = tayta(satunnainen(AANESTYS_VIATON), { a: viattomia, b: syyllisia });
                deltaSyyllisyys = -8;
            } else {
                lopputulos = tayta(satunnainen(AANESTYS_TASAPELI), { a: syyllisia });
                deltaSyyllisyys = 5;
            }

            await lisaaSyyllisyytta(
                interaction.guildId,
                kohde.id,
                deltaSyyllisyys,
                `Äänestys #${voteId}: ${kysymys}`
            );

            await kirjaaTuomio(interaction.guildId, kohde.id, lopputulos, `äänestys #${voteId}`, false);

            const lopetusEmbed = new EmbedBuilder()
                .setColor(VARIT.AKSENTTI)
                .setTitle(`⚖️ Äänestys #${voteId} päättyi`)
                .setDescription(
                    `**Kohde:** ${kohde}\n**Kysymys:** ${kysymys}\n\n` +
                    `⚖️ Syyllinen: **${syyllisia}**\n🕊️ Viaton: **${viattomia}**\n\n` +
                    `**Lopputulos:** ${lopputulos}`
                )
                .setFooter({ text: `Syyllisyysprosentti muuttui: ${deltaSyyllisyys >= 0 ? "+" : ""}${deltaSyyllisyys}` });

            const suljetutNapit = new ActionRowBuilder().addComponents(
                ButtonBuilder.from(rivi.components[0]).setDisabled(true),
                ButtonBuilder.from(rivi.components[1]).setDisabled(true)
            );

            await interaction.editReply({ embeds: [lopetusEmbed], components: [suljetutNapit] });

          } catch (err) {

            console.error(`❌ Äänestyksen #${voteId} päättäminen epäonnistui:`, err?.message ?? err);

          }

        });

    }
};
