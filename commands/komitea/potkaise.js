const { SlashCommandBuilder } = require("discord.js");
const { suoritaFeikkiToiminto } = require("../../utils/feikkitoiminto");
const { satunnainen } = require("../../utils/satunnainen");
const { tayta, FEIKKI_POTKAISE } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("potkaise")
        .setDescription("\"Potkaisee\" käyttäjän palvelimelta. (Pelkkä trolli — ei tee oikeasti mitään.)")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Potkaistava käyttäjä").setRequired(true)
        )
        .addStringOption(option =>
            option.setName("syy").setDescription("Syy potkulle").setRequired(false).setMaxLength(300)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("kayttaja");
        const reason = interaction.options.getString("syy") ?? "Syytä ei annettu";

        await suoritaFeikkiToiminto(interaction, {
            kuvaus: tayta(satunnainen(FEIKKI_POTKAISE.kuvaukset), { tag: user.tag, syy: reason }),
            paljastus: tayta(satunnainen(FEIKKI_POTKAISE.paljastukset), { k: `${user}` }),
            viiveMs: 2500
        });
    }
};
