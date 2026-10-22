const { Events } = require("discord.js");
const { kirjaaKomento } = require("../utils/tilastot");
const { satunnainen } = require("../utils/satunnainen");
const { VIRHEVIESTIT, VANHAT_KOMENNOT } = require("../utils/comedy/data/viestit");

/**
 * Kertoo käyttäjälle virheestä niin, ettei virheilmoituksen lähetys itse voi
 * heittää uutta käsittelemätöntä virhettä (esim. jos vuorovaikutus on jo
 * vanhentunut tai komento ehti vastata ennen kaatumista).
 */
async function ilmoitaVirhe(interaction, teksti) {
    try {
        if (interaction.deferred && !interaction.replied) {
            await interaction.editReply({ content: teksti, embeds: [], components: [] });
        } else if (interaction.replied) {
            await interaction.followUp({ content: teksti, ephemeral: true });
        } else {
            await interaction.reply({ content: teksti, ephemeral: true });
        }
    } catch (err) {
        console.error("❌ Virheilmoituksen lähetys epäonnistui:", err?.message ?? err);
    }
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, client) {

        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);

        if (!command) {
            // Discord muistaa vielä vanhan komennon, jota ei enää ole koodissa.
            console.warn(`⚠️ Tuntematon komento: /${interaction.commandName}`);
            return ilmoitaVirhe(interaction, satunnainen(VANHAT_KOMENNOT));
        }

        try {

            await command.execute(interaction, client);

        } catch (err) {

            console.error(`❌ Virhe komennossa /${interaction.commandName}:`, err);
            return ilmoitaVirhe(interaction, satunnainen(VIRHEVIESTIT));

        }

        if (interaction.guildId) {
            kirjaaKomento(interaction.guildId, interaction.user.id, interaction.commandName)
                .catch(err => console.error("❌ Komentotilaston kirjaus epäonnistui:", err?.message ?? err));
        }

    }
};
