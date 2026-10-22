const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

const { haeAktiivisetSessiotPalvelimelta, kayttajanAaniTanaan } = require("../../utils/tilastot");
const { formatDuration } = require("../../utils/ui");
const { satunnainen } = require("../../utils/satunnainen");
const { VARIT } = require("../../utils/tyyli");
const { EI_OIKEUKSIA, DEBUGVOICE_TYHJA } = require("../../utils/comedy/data/viestit");

const MAX_RIVEJA = 25;

module.exports = {

    data: new SlashCommandBuilder()
        .setName("debugvoice")
        .setDescription("Ylläpitäjille: näyttää tämän palvelimen aktiiviset äänisessiot.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    async execute(interaction) {

        // Discordin oletusoikeus on vain oletus (palvelimen ylläpitäjä voi avata
        // komennon muillekin), joten oikeus tarkistetaan myös täällä.
        if (!interaction.inGuild() || !interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
            return interaction.reply({ content: satunnainen(EI_OIKEUKSIA), ephemeral: true });
        }

        // Vain TÄMÄN palvelimen sessiot — muiden palvelimien käyttäjiä ei paljasteta.
        const sessiot = await haeAktiivisetSessiotPalvelimelta(interaction.guildId);

        if (!sessiot.length) {
            return interaction.reply({ content: satunnainen(DEBUGVOICE_TYHJA), ephemeral: true });
        }

        const nayta = sessiot.slice(0, MAX_RIVEJA);
        const nyt = Date.now();

        const tallennetut = await Promise.all(
            nayta.map(sessio => kayttajanAaniTanaan(interaction.guildId, sessio.userId))
        );

        const rivit = nayta.map((sessio, i) => {
            const kaynnissa = Math.max(0, Math.floor((nyt - sessio.joinedAt) / 1000));
            return `🟢 <@${sessio.userId}> — käynnissä ${formatDuration(kaynnissa)}, tallennettu tänään ${formatDuration(tallennetut[i])}`;
        });

        if (sessiot.length > nayta.length) {
            rivit.push(`…ja ${sessiot.length - nayta.length} muuta.`);
        }

        const embed = new EmbedBuilder()
            .setTitle("🎤 Aktiiviset äänisessiot")
            .setColor(VARIT.PERUS)
            .setDescription(rivit.join("\n"));

        await interaction.reply({ embeds: [embed], ephemeral: true });

    }

};
