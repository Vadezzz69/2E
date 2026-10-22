const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { satunnainen, satunnaisVali } = require("../../utils/satunnainen");
const { VARIT } = require("../../utils/tyyli");
const { SUS_OTSIKOT, SUS_KOMMENTIT, SUS_ERIKOISET, SUS_FOOTERIT } = require("../../utils/comedy/data/viestit");

function palkki(prosentti) {
    const tayta = Math.round(prosentti / 10);
    return "🟥".repeat(tayta) + "⬜".repeat(10 - tayta);
}

// Raja-arvot ovat ennallaan (<20, <50, <80, muuten kriittinen). Tasan 0, 42, 69
// ja 100 saavat lisäksi oman erikoiskommenttinsa.
function kommentti(prosentti) {
    if (SUS_ERIKOISET[prosentti]) return SUS_ERIKOISET[prosentti];
    if (prosentti < 20) return satunnainen(SUS_KOMMENTIT.matala);
    if (prosentti < 50) return satunnainen(SUS_KOMMENTIT.keski);
    if (prosentti < 80) return satunnainen(SUS_KOMMENTIT.korkea);
    return satunnainen(SUS_KOMMENTIT.kriittinen);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sus")
        .setDescription("Mittaa käyttäjän epäilyttävyysprosentin.")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Kuka mitataan").setRequired(true)
        ),

    async execute(interaction) {

        const kayttaja = interaction.options.getUser("kayttaja");
        const prosentti = satunnaisVali(0, 100);

        const embed = new EmbedBuilder()
            .setColor(prosentti > 70 ? VARIT.AKSENTTI : prosentti > 40 ? VARIT.HARMAA : VARIT.PERUS)
            .setTitle(satunnainen(SUS_OTSIKOT))
            .setDescription(
                `${kayttaja}\n\n` +
                `${palkki(prosentti)}  **${prosentti}%**\n\n` +
                `*${kommentti(prosentti)}*`
            )
            .setFooter({ text: satunnainen(SUS_FOOTERIT) });

        await interaction.reply({ embeds: [embed] });

    }
};
