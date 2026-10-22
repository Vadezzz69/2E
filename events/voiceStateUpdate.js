const { Events } = require("discord.js");

const {
    aloitaAaniSessio,
    haeAaniSessio,
    poistaAaniSessio,
    lisaaAanaikaa
} = require("../utils/tilastot");

module.exports = {

    name: Events.VoiceStateUpdate,

    async execute(oldState, newState) {

        try {

            // Botit (esim. musiikkibotit) eivät kuulu aktiivisuustilastoihin —
            // samoin kuin ready.js:n käynnistystäydennyksessä.
            if ((newState.member ?? oldState.member)?.user?.bot) return;

            const guildId = newState.guild.id;
            const userId = newState.id ?? oldState.id;

            const oliAanessa = Boolean(oldState.channelId);
            const onAanessa = Boolean(newState.channelId);

            // Liittyi ensimmäistä kertaa
            if (!oliAanessa && onAanessa) {

                const sessio = await haeAaniSessio(guildId, userId);

                if (!sessio) {
                    await aloitaAaniSessio(guildId, userId, Date.now());
                }

                return;

            }

            // Vaihtoi kanavaa tai muutti mykistystä — sessio jatkuu
            if (oliAanessa && onAanessa) return;

            // Poistui äänikanavalta
            if (oliAanessa && !onAanessa) {

                const sessio = await haeAaniSessio(guildId, userId);

                if (!sessio) return;

                const sekunnit = Math.floor((Date.now() - sessio.joinedAt) / 1000);

                if (sekunnit > 0) {
                    await lisaaAanaikaa(guildId, userId, sekunnit);
                }

                await poistaAaniSessio(guildId, userId);

            }

        }
        catch (err) {

            console.error("❌ VoiceStateUpdate-virhe:", err);

        }

    }

};
