const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { aktiivisinKirjoittaja, aktiivisinAanikanavassaElavana, aktiivisinKomennoissa } = require("../../utils/tilastot");
const { RANGAISTUKSET } = require("../../utils/komiteadata");
const { satunnainen, satunnaisVali } = require("../../utils/satunnainen");
const { VARIT } = require("../../utils/tyyli");
const { kirjaaTuomio, lisaaSyyllisyytta } = require("../../utils/tutkintadata");
const {
    tayta,
    PAATOS_OTSIKOT,
    PAATOS_JOHDANNOT,
    PAATOS_FOOTERIT,
    PAATOS_EI_DATAA
} = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("komitea")
        .setDescription("Komitea julkistaa tämän päivän päätöksen — oikeaan aktiivisuuteen perustuen."),

    async execute(interaction) {
        await interaction.deferReply();
        const guildId = interaction.guildId;

        const [kirjoittaja, aanessa, komentaja] = await Promise.all([
            aktiivisinKirjoittaja(guildId),
            aktiivisinAanikanavassaElavana(guildId),
            aktiivisinKomennoissa(guildId)
        ]);

        const vaihtoehdot = [];
        if (kirjoittaja && kirjoittaja.count > 0) {
            vaihtoehdot.push({ userId: kirjoittaja.userId, lause: `kirjoitti tänään **${kirjoittaja.count}** viestiä` });
        }
        if (aanessa && aanessa.seconds > 0) {
            const minuutit = Math.round(aanessa.seconds / 60);
            vaihtoehdot.push({ userId: aanessa.userId, lause: `vietti äänikanavalla tänään **${minuutit}** minuuttia` });
        }
        if (komentaja && komentaja.count > 0) {
            vaihtoehdot.push({ userId: komentaja.userId, lause: `käytti botin komentoja tänään **${komentaja.count}** kertaa` });
        }

        if (vaihtoehdot.length === 0) {
            return interaction.editReply(satunnainen(PAATOS_EI_DATAA));
        }

        const valittu = satunnainen(vaihtoehdot);
        const rangaistus = satunnainen(RANGAISTUKSET);
        const paatosnumero = satunnaisVali(100, 999);

        await kirjaaTuomio(guildId, valittu.userId, rangaistus, "/komitea", false);
        await lisaaSyyllisyytta(guildId, valittu.userId, 3, `/komitea: ${rangaistus}`);

        const johdanto = tayta(satunnainen(PAATOS_JOHDANNOT), { k: `<@${valittu.userId}>`, lause: valittu.lause });

        const embed = new EmbedBuilder()
            .setColor(VARIT.AKSENTTI)
            .setTitle(tayta(satunnainen(PAATOS_OTSIKOT), { nro: paatosnumero }))
            .setDescription(`${johdanto}\n\n**Rangaistus:**\n${rangaistus}`)
            .setFooter({ text: satunnainen(PAATOS_FOOTERIT) })
            .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    }
};
