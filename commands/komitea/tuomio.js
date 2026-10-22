const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { RANGAISTUKSET } = require("../../utils/komiteadata");
const { satunnainen, satunnaisVali } = require("../../utils/satunnainen");
const { VARIT } = require("../../utils/tyyli");
const { kirjaaTuomio, lisaaSyyllisyytta } = require("../../utils/tutkintadata");
const { tayta, TUOMIO_OTSIKOT, TUOMIO_JOHDANNOT, TUOMIO_FOOTERIT } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("tuomio")
        .setDescription("Komitea antaa virallisen tuomion.")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Tuomittava käyttäjä").setRequired(true)
        ),

    async execute(interaction) {

        const kayttaja = interaction.options.getUser("kayttaja");
        const tuomio = satunnainen(RANGAISTUKSET);
        const asianumero = satunnaisVali(1000, 9999);

        await kirjaaTuomio(interaction.guildId, kayttaja.id, tuomio, "/tuomio", false);
        await lisaaSyyllisyytta(interaction.guildId, kayttaja.id, 3, `/tuomio: ${tuomio}`);

        const embed = new EmbedBuilder()
            .setColor(VARIT.AKSENTTI)
            .setTitle(tayta(satunnainen(TUOMIO_OTSIKOT), { nro: asianumero }))
            .setDescription(
                `${tayta(satunnainen(TUOMIO_JOHDANNOT), { k: `${kayttaja}` })}\n\n` +
                `**Tuomio:**\n${tuomio}`
            )
            .setFooter({ text: satunnainen(TUOMIO_FOOTERIT) });

        await interaction.reply({ embeds: [embed] });

    }
};
