const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { satunnainen, satunnaisVali, todennakoisyys } = require("../../utils/satunnainen");
const { VARIT } = require("../../utils/tyyli");
const {
    ONKO_OTSIKOT,
    ONKO_OLETUSKYSYMYKSET,
    ONKO_KYLLA_KOMMENTIT,
    ONKO_EI_KOMMENTIT,
    ONKO_FOOTERIT
} = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("onko")
        .setDescription("Kysy komitealta kysymys tägätystä käyttäjästä.")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Kenestä kysytään").setRequired(true)
        )
        .addStringOption(option =>
            option.setName("kysymys").setDescription("Mitä kysytään (esim. \"syypää tähän kaikkeen\")").setRequired(false).setMaxLength(200)
        ),

    async execute(interaction) {

        const kayttaja = interaction.options.getUser("kayttaja");
        const kysymys = interaction.options.getString("kysymys") ?? satunnainen(ONKO_OLETUSKYSYMYKSET);

        const kylla = todennakoisyys(0.5);
        const varmuus = satunnaisVali(51, 99);
        const kommentti = satunnainen(kylla ? ONKO_KYLLA_KOMMENTIT : ONKO_EI_KOMMENTIT);

        const embed = new EmbedBuilder()
            .setColor(kylla ? VARIT.ONNISTUI : VARIT.AKSENTTI)
            .setTitle(satunnainen(ONKO_OTSIKOT))
            .setDescription(
                `**Kysymys:** Onko ${kayttaja} ${kysymys}?\n\n` +
                `**Vastaus:** ${kylla ? "KYLLÄ ✅" : "EI ❌"} (${varmuus}% varmuudella)\n` +
                `*${kommentti}*`
            )
            .setFooter({ text: satunnainen(ONKO_FOOTERIT) });

        await interaction.reply({ embeds: [embed] });

    }
};
