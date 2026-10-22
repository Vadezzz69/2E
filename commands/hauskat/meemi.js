const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { VARIT } = require("../../utils/tyyli");
const { satunnainen } = require("../../utils/satunnainen");
const { MEEMI_EI_LOYTYNYT, MEEMI_VIRHE } = require("../../utils/comedy/data/viestit");

// Rajataan turvallisiin, yleisesti tunnettuihin meemi-subreddiiteihin.
const LAHTEET = "memes+wholesomememes+ProgrammerHumor+me_irl";

async function haeMeemi() {
    const vastaus = await fetch(`https://meme-api.com/gimme/${LAHTEET}`);
    if (!vastaus.ok) throw new Error(`Meemi-API vastasi statuksella ${vastaus.status}`);
    return vastaus.json();
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("meemi")
        .setDescription("Hakee satunnaisen meemin."),

    async execute(interaction) {

        await interaction.deferReply();

        try {

            let data = await haeMeemi();
            let yritykset = 0;

            // Ohitetaan NSFW-leimatut tulokset, yritetään uudelleen muutaman kerran.
            while (data?.nsfw && yritykset < 3) {
                data = await haeMeemi();
                yritykset++;
            }

            if (!data || data.nsfw) {
                return interaction.editReply(satunnainen(MEEMI_EI_LOYTYNYT));
            }

            const embed = new EmbedBuilder()
                .setColor(VARIT.PERUS)
                .setTitle(data.title ?? "Satunnainen meemi")
                .setImage(data.url)
                .setFooter({ text: `r/${data.subreddit ?? "?"} — 👍 ${data.ups ?? "?"}` });

            if (data.postLink) embed.setURL(data.postLink);

            await interaction.editReply({ embeds: [embed] });

        } catch (err) {

            console.error("❌ Meemin haku epäonnistui:", err?.message ?? err);
            await interaction.editReply(satunnainen(MEEMI_VIRHE));

        }

    }
};
