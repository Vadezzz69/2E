const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { aktiivisinKirjoittaja } = require("../../utils/tilastot");
const { RIKOKSET } = require("../../utils/komiteadata");
const { satunnainen } = require("../../utils/satunnainen");
const { VARIT } = require("../../utils/tyyli");
const {
    tayta,
    SYYLLINEN_OTSIKOT,
    SYYLLINEN_JULISTUKSET,
    SYYLLINEN_PERUSTEET_AKTIIVINEN,
    SYYLLINEN_PERUSTEET_ARPA
} = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("syyllinen")
        .setDescription("Arpoo päivän syyllisen — painottaen tämän päivän aktiivisimpia."),

    async execute(interaction) {

        await interaction.deferReply();

        const kirjoittaja = await aktiivisinKirjoittaja(interaction.guildId);

        let kohdeId;
        let peruste;

        if (kirjoittaja && kirjoittaja.count > 0) {
            kohdeId = kirjoittaja.userId;
            peruste = tayta(satunnainen(SYYLLINEN_PERUSTEET_AKTIIVINEN), { n: kirjoittaja.count });
        } else {
            const jasenet = await interaction.guild.members.fetch();
            const ehdokkaat = [...jasenet.filter(m => !m.user.bot).values()];

            if (!ehdokkaat.length) {
                return interaction.editReply("Palvelimelta ei löytynyt yhtään ei-bottia. Syyllistä ei voi arpoa. Komitea on hämmentynyt.");
            }

            kohdeId = satunnainen(ehdokkaat).id;
            peruste = satunnainen(SYYLLINEN_PERUSTEET_ARPA);
        }

        const rikos = satunnainen(RIKOKSET);

        const embed = new EmbedBuilder()
            .setColor(VARIT.AKSENTTI)
            .setTitle(satunnainen(SYYLLINEN_OTSIKOT))
            .setDescription(
                `${tayta(satunnainen(SYYLLINEN_JULISTUKSET), { k: `<@${kohdeId}>` })}\n\n` +
                `**Epäilty rikos:** ${rikos}\n` +
                `**Peruste:** ${peruste}`
            );

        await interaction.editReply({ embeds: [embed] });

    }
};
