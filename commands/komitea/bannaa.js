const { SlashCommandBuilder } = require("discord.js");
const { suoritaFeikkiToiminto } = require("../../utils/feikkitoiminto");
const { satunnainen } = require("../../utils/satunnainen");
const { tayta, FEIKKI_BANNAA } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("bannaa")
        .setDescription("\"Bannaa\" käyttäjän palvelimelta. (Pelkkä trolli — ei tee oikeasti mitään.)")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Bannattava käyttäjä").setRequired(true)
        )
        .addStringOption(option =>
            option.setName("syy").setDescription("Syy bannille").setRequired(false).setMaxLength(300)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("kayttaja");
        const reason = interaction.options.getString("syy") ?? "Syytä ei annettu";

        await suoritaFeikkiToiminto(interaction, {
            kuvaus: tayta(satunnainen(FEIKKI_BANNAA.kuvaukset), { tag: user.tag, syy: reason }),
            paljastus: tayta(satunnainen(FEIKKI_BANNAA.paljastukset), { k: `${user}` }),
            viiveMs: 3000
        });
    }
};
