const express = require("express");
const path = require("path");
const crypto = require("crypto");

const {
    viestiListaAikavalilla,
    aaniListaAikavalilla,
    komentoListaAikavalilla,
    haeAktiivisetSessiotPalvelimelta
} = require("../utils/tilastot");

const {
    haeAktiivisetEpaillyt,
    haeSyyllisinLista,
    haeAvoimetTutkinnat
} = require("../utils/tutkintadata");

// Yksinkertainen välimuisti käyttäjätietojen hakuun, ettei jokainen
// dashboard-päivitys tee kymmeniä erillisiä Discord API -kutsuja.
const kayttajaCache = new Map(); // userId -> { data, haettu }
const CACHE_MS = 5 * 60 * 1000;
const CACHE_MAX_KOKO = 1000;

const SALLITUT_KATEGORIAT = new Set(["viestit", "aani", "komennot"]);
const SALLITUT_AIKAVALIT = new Set(["tanaan", "viikko", "kuukausi", "kaikki"]);

const TOKEN_EVASTE = "dashboard_token";

/** Vertaa merkkijonoja vakioajassa (ei vuoda eroa vastausajassa). */
function samaToken(annettu, odotettu) {
    const a = crypto.createHash("sha256").update(String(annettu)).digest();
    const b = crypto.createHash("sha256").update(String(odotettu)).digest();
    return crypto.timingSafeEqual(a, b);
}

function lueEvaste(req, nimi) {
    const otsikko = req.headers.cookie;
    if (!otsikko) return null;

    for (const osa of otsikko.split(";")) {
        const [avain, ...arvo] = osa.trim().split("=");
        if (avain === nimi) return decodeURIComponent(arvo.join("="));
    }

    return null;
}

/**
 * Valinnainen suojaus: jos DASHBOARD_TOKEN on asetettu, kaikki dashboardin
 * sivut ja rajapinnat vaativat sen (`?token=...` kerran → tallentuu evästeeseen,
 * tai `x-dashboard-token`-otsake). Ilman asetusta dashboard on avoin kuten ennen.
 */
function tokenSuojaus(req, res, next) {
    const odotettu = process.env.DASHBOARD_TOKEN;
    if (!odotettu) return next();

    const annettu = req.query.token ?? req.get("x-dashboard-token") ?? lueEvaste(req, TOKEN_EVASTE);

    if (annettu && samaToken(annettu, odotettu)) {
        if (req.query.token) {
            res.setHeader("Set-Cookie", `${TOKEN_EVASTE}=${encodeURIComponent(odotettu)}; HttpOnly; SameSite=Strict; Path=/`);
        }
        return next();
    }

    res.status(401).type("text").send("Pääsy evätty. Komitea ei tunne sinua.");
}

/** Express 4 ei nappaa async-käsittelijöiden virheitä — ilman tätä DB-virhe kaataisi koko botin. */
const turvallinen = (kasittelija) => (req, res) => {
    Promise.resolve(kasittelija(req, res)).catch((err) => {
        console.error(`❌ Dashboard-virhe (${req.path}):`, err?.message ?? err);
        if (!res.headersSent) res.status(500).json({ error: "Palvelinvirhe." });
    });
};

function kaynnistaDashboard(client, port = 3000) {

    const app = express();
    app.disable("x-powered-by");
    app.use(tokenSuojaus);
    app.use(express.static(path.join(__dirname, "public")));

    async function resolveKayttaja(userId) {

        const valimuistissa = kayttajaCache.get(userId);
        if (valimuistissa && Date.now() - valimuistissa.haettu < CACHE_MS) {
            return valimuistissa.data;
        }

        let data;

        try {
            const user = await client.users.fetch(userId);
            data = {
                id: userId,
                username: user.username,
                avatar: user.displayAvatarURL({ size: 64 })
            };
        } catch {
            data = { id: userId, username: "Tuntematon agentti", avatar: null };
        }

        if (kayttajaCache.size >= CACHE_MAX_KOKO) kayttajaCache.clear();
        kayttajaCache.set(userId, { data, haettu: Date.now() });

        return data;

    }

    async function resolveMonta(rivit, idKentta = "userId") {
        return Promise.all(
            rivit.map(async (rivi) => ({ ...rivi, kayttaja: await resolveKayttaja(rivi[idKentta]) }))
        );
    }

    // Vain palvelimet, joissa botti oikeasti on — mielivaltaista guildId:tä ei kysellä tietokannasta.
    function valitseGuildId(req) {
        const pyydetty = req.query.guildId;
        if (pyydetty) return client.guilds.cache.has(pyydetty) ? pyydetty : null;
        return client.guilds.cache.first()?.id ?? null;
    }

    // ==========================
    // API
    // ==========================

    app.get("/api/guilds", (req, res) => {
        res.json(
            [...client.guilds.cache.values()].map(g => ({
                id: g.id,
                name: g.name,
                memberCount: g.memberCount
            }))
        );
    });

    app.get("/api/overview", turvallinen(async (req, res) => {

        const guildId = valitseGuildId(req);
        const guild = guildId ? client.guilds.cache.get(guildId) : null;

        if (!guild) {
            return res.status(404).json({ error: "Palvelinta ei löytynyt." });
        }

        const aktiivisetTallaGuildilla = await haeAktiivisetSessiotPalvelimelta(guildId);

        res.json({
            id: guild.id,
            name: guild.name,
            memberCount: guild.memberCount,
            icon: guild.iconURL(),
            activeVoiceCount: aktiivisetTallaGuildilla.length,
            botTag: client.user.tag
        });

    }));

    app.get("/api/leaderboard", turvallinen(async (req, res) => {

        const guildId = valitseGuildId(req);
        if (!guildId) return res.json([]);

        const kategoria = SALLITUT_KATEGORIAT.has(req.query.category) ? req.query.category : "viestit";
        const aikavali = SALLITUT_AIKAVALIT.has(req.query.range) ? req.query.range : "kaikki";

        let rivit;

        if (kategoria === "aani") {
            rivit = await aaniListaAikavalilla(guildId, aikavali, 10);
        } else if (kategoria === "komennot") {
            rivit = await komentoListaAikavalilla(guildId, aikavali, 10);
        } else {
            rivit = await viestiListaAikavalilla(guildId, aikavali, 10);
        }

        res.json(await resolveMonta(rivit));

    }));

    app.get("/api/suspects", turvallinen(async (req, res) => {
        const guildId = valitseGuildId(req);
        if (!guildId) return res.json([]);
        const rivit = await haeAktiivisetEpaillyt(guildId);
        res.json(await resolveMonta(rivit.slice(0, 15)));
    }));

    app.get("/api/guilt", turvallinen(async (req, res) => {
        const guildId = valitseGuildId(req);
        if (!guildId) return res.json([]);
        const rivit = await haeSyyllisinLista(guildId, 10);
        res.json(await resolveMonta(rivit));
    }));

    app.get("/api/investigations", turvallinen(async (req, res) => {
        const guildId = valitseGuildId(req);
        if (!guildId) return res.json([]);
        const rivit = await haeAvoimetTutkinnat(guildId);
        res.json(await resolveMonta(rivit));
    }));

    const palvelin = app.listen(port, () => {
        console.log(`🖥️  Dashboard käynnissä portissa ${port}`);
        if (!process.env.DASHBOARD_TOKEN) {
            console.warn("⚠️ DASHBOARD_TOKEN ei ole asetettu: dashboard on avoin kaikille jotka löytävät portin.");
        }
    });

    // Esim. portti varattu: kirjataan virhe, mutta botti itse jatkaa toimintaansa.
    palvelin.on("error", (err) => {
        console.error(`❌ Dashboardia ei voitu käynnistää (portti ${port}):`, err?.message ?? err);
    });

    return app;

}

module.exports = { kaynnistaDashboard };
