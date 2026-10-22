const { SlashCommandBuilder } = require("discord.js");
const { suoritaFeikkiToiminto } = require("../../utils/feikkitoiminto");
const { satunnainen } = require("../../utils/satunnainen");
const { tayta, FEIKKI_AIKALISA } = require("../../utils/comedy/data/viestit");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("aikalisa")
        .setDescription("Antaa käyttäjälle \"aikalisän\". (Pelkkä trolli — ei tee oikeasti mitään.)")
        .addUserOption(option =>
            option.setName("kayttaja").setDescription("Käyttäjä").setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("minuutit").setDescription("Kesto minuutteina").setMinValue(1).setMaxValue(40320).setRequired(true)
        )
        .addStringOption(option =>
            option.setName("syy").setDescription("Syy").setRequired(false).setMaxLength(300)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("kayttaja");
        const minutes = interaction.options.getInteger("minuutit");
        const reason = interaction.options.getString("syy") ?? "Syytä ei annettu";

        await suoritaFeikkiToiminto(interaction, {
            kuvaus: tayta(satunnainen(FEIKKI_AIKALISA.kuvaukset), { tag: user.tag, min: minutes, syy: reason }),
            paljastus: tayta(satunnainen(FEIKKI_AIKALISA.paljastukset), { k: `${user}` }),
            viiveMs: 2000
        });
    }
};
