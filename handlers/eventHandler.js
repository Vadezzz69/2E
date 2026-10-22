const fs = require("fs");
const path = require("path");

const EVENTIT_KANSIO = path.join(__dirname, "..", "events");

module.exports = (client) => {

    const eventFiles = fs
        .readdirSync(EVENTIT_KANSIO)
        .filter(file => file.endsWith(".js"));

    let count = 0;

    for (const file of eventFiles) {

        const event = require(path.join(EVENTIT_KANSIO, file));

        if (!event?.name || !event?.execute) {
            console.warn(`⚠️  Eventistä ${file} puuttuu "name" tai "execute" — ohitetaan.`);
            continue;
        }

        // Virhe yhdessä event-käsittelijässä ei saa kaataa koko prosessia
        // käsittelemättömänä Promise-hylkäyksenä.
        const suorita = async (...args) => {
            try {
                await event.execute(...args, client);
            } catch (err) {
                console.error(`❌ Virhe eventissä ${event.name}:`, err);
            }
        };

        if (event.once) {
            client.once(event.name, suorita);
        } else {
            client.on(event.name, suorita);
        }

        count++;

    }

    console.log(`📡 Ladattu ${count} eventtiä.`);

};
