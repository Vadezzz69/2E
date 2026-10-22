const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { VARIT } = require("../../utils/tyyli");
const { satunnainen, todennakoisyys } = require("../../utils/satunnainen");
const { tayta, KOLIKKO_TULOKSET, KOLIKKO_OIKEIN, KOLIKKO_VAARIN } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("kolikko")
        .setDescription("Heittää kolikkoa.")
        .addStringOption(option =>
            option
                .setName("veto")
                .setDescription("Veikkaa tulosta (valinnainen)")
                .setRequired(false)
                .addChoices(
                    { name: "Kruuna", value: "kruuna" },
                    { name: "Klaava", value: "klaava" }
                )
        ),

    async execute(interaction) {

        const veto = interaction.options.getString("veto");
        const tulos = todennakoisyys(0.5) ? "kruuna" : "klaava";
        const emoji = tulos === "kruuna" ? "🟡" : "⚪";

        let kuvaus = `${emoji} ${tayta(satunnainen(KOLIKKO_TULOKSET), { tulos })}`;

        if (veto) {
            kuvaus += "\n\n" + satunnainen(veto === tulos ? KOLIKKO_OIKEIN : KOLIKKO_VAARIN);
        }

        const embed = new EmbedBuilder()
            .setColor(VARIT.HARMAA)
            .setDescription(kuvaus);

        await interaction.reply({ embeds: [embed] });

    }
};
