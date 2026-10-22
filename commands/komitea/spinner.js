const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { satunnainen } = require("../../utils/satunnainen");
const { VARIT } = require("../../utils/tyyli");
const { tayta, SPINNER_OTSIKOT, SPINNER_TULOKSET, SPINNER_EI_KETAAN } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("spinner")
        .setDescription("Pyörittää ruletin ja valitsee satunnaisen jäsenen palvelimelta."),

    async execute(interaction) {

        await interaction.deferReply();

        const jasenet = await interaction.guild.members.fetch();
        const ehdokkaat = [...jasenet.filter(m => !m.user.bot).values()];

        if (ehdokkaat.length === 0) {
            return interaction.editReply(satunnainen(SPINNER_EI_KETAAN));
        }

        // Ehdokaslista koostetaan joka kerta uudelleen, joten valinta on tasainen
        // kaikkien jäsenten kesken (toiston esto koskee vain tekstipooleja).
        const valittu = satunnainen(ehdokkaat);

        const embed = new EmbedBuilder()
            .setColor(VARIT.PERUS)
            .setTitle(satunnainen(SPINNER_OTSIKOT))
            .setDescription(tayta(satunnainen(SPINNER_TULOKSET), { nimi: valittu.displayName }))
            .setThumbnail(valittu.displayAvatarURL());

        await interaction.editReply({ embeds: [embed] });

    }
};
