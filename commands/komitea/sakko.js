const { SlashCommandBuilder } = require("discord.js");
const { report } = require("../../utils/ui");
const { SAKKO_YKSIKOT } = require("../../utils/komiteadata");
const { satunnainen, satunnaisVali } = require("../../utils/satunnainen");
const { kirjaaSakko } = require("../../utils/tutkintadata");
const {
    tayta,
    SAKKO_OTSIKOT,
    SAKKO_KUVAUKSET,
    SAKKO_OLETUSSYYT,
    SAKKO_FOOTERIT
} = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sakko")
        .setDescription("Antaa käyttäjälle kuvitteellisen sakon. Kirjautuu sakkorekisteriin.")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Sakotettava käyttäjä").setRequired(true)
        )
        .addStringOption(option =>
            option.setName("syy").setDescription("Sakon syy").setRequired(false).setMaxLength(300)
        ),

    async execute(interaction) {
        const kayttaja = interaction.options.getUser("kayttaja");
        const syy = interaction.options.getString("syy") ?? satunnainen(SAKKO_OLETUSSYYT);
        const summa = satunnaisVali(5, 500);
        const yksikko = satunnainen(SAKKO_YKSIKOT);

        await kirjaaSakko(interaction.guildId, kayttaja.id, summa, yksikko, syy, interaction.user.id);

        const embed = report({
            title: satunnainen(SAKKO_OTSIKOT),
            description: `${tayta(satunnainen(SAKKO_KUVAUKSET), { k: `${kayttaja}` })}\n\n**Summa:** ${summa} ${yksikko}\n**Syy:** ${syy}`,
            footer: satunnainen(SAKKO_FOOTERIT)
        });

        return interaction.reply({ embeds: [embed] });
    }
};
