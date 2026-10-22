const tila = {
    guildId: null,
    kategoria: "viestit",
    aikavali: "kaikki"
};

function kello() {
    const nyt = new Date();
    document.getElementById("clock").textContent = nyt.toLocaleTimeString("fi-FI", { hour12: false, timeZone: "Europe/Helsinki" });
}
setInterval(kello, 1000);
kello();

async function hae(polku) {
    const url = new URL(polku, window.location.origin);
    if (tila.guildId) url.searchParams.set("guildId", tila.guildId);
    const vastaus = await fetch(url);
    if (!vastaus.ok) throw new Error(`API-virhe: ${vastaus.status}`);
    return vastaus.json();
}

function tyhja(teksti) {
    return `<li class="empty-state">${teksti}</li>`;
}

function paivitaHeroCase() {
    const numero = Math.floor(Math.random() * 9000 + 1000);
    document.getElementById("heroCase").textContent = `#${numero}`;
}

async function lataaYleiskatsaus() {
    try {
        const data = await hae("/api/overview");
        document.getElementById("statMembers").textContent = data.memberCount ?? "—";
        document.getElementById("statVoice").textContent = data.activeVoiceCount ?? "0";
        document.getElementById("botTag").textContent = data.botTag ?? "—";
    } catch (err) {
        console.error("Yleiskatsauksen haku epäonnistui:", err);
    }
}

async function lataaGuildit() {
    try {
        const guildit = await hae("/api/guilds");
        const select = document.getElementById("guildSelect");
        select.innerHTML = guildit
            .map(g => `<option value="${g.id}">${g.name}</option>`)
            .join("");
        if (guildit.length) {
            tila.guildId = guildit[0].id;
            select.value = tila.guildId;
        }
        select.addEventListener("change", () => {
            tila.guildId = select.value;
            lataaKaikki();
        });
    } catch (err) {
        console.error("Palvelinlistan haku epäonnistui:", err);
    }
}

function muotoileArvo(kategoria, rivi) {
    if (kategoria === "aani") return `${Math.round(rivi.seconds / 60)} min`;
    return `${rivi.count} kpl`;
}

async function lataaLeaderboard() {
    const lista = document.getElementById("leaderboardList");
    lista.innerHTML = `<li class="empty-state">Ladataan...</li>`;

    try {
        const rivit = await hae(`/api/leaderboard?category=${tila.kategoria}&range=${tila.aikavali}`);

        if (!rivit.length) {
            lista.innerHTML = tyhja("Ei dataa tälle aikavälille. Osallistukaa, niin komitea saa jotain tutkittavaa.");
            return;
        }

        const maxArvo = Math.max(...rivit.map(r => r.count ?? r.seconds ?? 0));

        lista.innerHTML = rivit.map((rivi, i) => {
            const arvo = rivi.count ?? rivi.seconds ?? 0;
            const prosentti = maxArvo ? Math.round((arvo / maxArvo) * 100) : 0;
            const avatar = rivi.kayttaja.avatar ?? "";
            return `
                <li class="lb-row">
                    <span class="lb-rank ${i === 0 ? "top" : ""}">${String(i + 1).padStart(2, "0")}</span>
                    ${avatar ? `<img class="lb-avatar" src="${avatar}" alt="" loading="lazy">` : `<span class="lb-avatar"></span>`}
                    <span class="lb-name">${rivi.kayttaja.username}</span>
                    <span class="lb-bar-wrap">
                        <span class="lb-value mono">${muotoileArvo(tila.kategoria, rivi)}</span>
                        <span class="lb-bar-track"><span class="lb-bar-fill" style="width:${prosentti}%"></span></span>
                    </span>
                </li>`;
        }).join("");

    } catch (err) {
        lista.innerHTML = tyhja("Rankingien haku epäonnistui.");
        console.error(err);
    }
}

async function lataaSyyllisyys() {
    const lista = document.getElementById("guiltList");
    lista.innerHTML = `<li class="empty-state">Ladataan...</li>`;

    try {
        const rivit = await hae("/api/guilt");

        if (!rivit.length) {
            lista.innerHTML = tyhja("Ei syyllisyyttä kirjattuna. Epäilyttävän puhdas palvelin.");
            return;
        }

        lista.innerHTML = rivit.map(rivi => {
            const prosentti = Math.max(0, Math.min(100, rivi.summa ?? 0));
            return `
                <li class="guilt-row">
                    <span class="guilt-top">
                        <span>${rivi.kayttaja.username}</span>
                        <span class="guilt-pct">${prosentti}%</span>
                    </span>
                    <span class="guilt-track"><span class="guilt-fill" style="width:${prosentti}%"></span></span>
                </li>`;
        }).join("");

    } catch (err) {
        lista.innerHTML = tyhja("Syyllisyystietojen haku epäonnistui.");
        console.error(err);
    }
}

async function lataaEpaillyt() {
    const lista = document.getElementById("suspectList");
    lista.innerHTML = `<li class="empty-state">Ladataan...</li>`;

    try {
        const rivit = await hae("/api/suspects");

        if (!rivit.length) {
            lista.innerHTML = tyhja("Epäiltyjen lista on tyhjä.");
            return;
        }

        lista.innerHTML = rivit.map(rivi => `
            <li class="suspect-row">
                <span class="suspect-top">
                    <span class="suspect-name">${rivi.kayttaja.username}</span>
                    <span class="suspect-case mono">#${rivi.id}</span>
                </span>
                <span class="redacted" tabindex="0">
                    <span class="redacted-bar"></span>${rivi.reason}
                </span>
            </li>`
        ).join("");

    } catch (err) {
        lista.innerHTML = tyhja("Epäiltyjen haku epäonnistui.");
        console.error(err);
    }
}

async function lataaTutkinnat() {
    const kontti = document.getElementById("caseFiles");
    kontti.innerHTML = `<span class="empty-state">Ladataan...</span>`;

    try {
        const rivit = await hae("/api/investigations");

        if (!rivit.length) {
            kontti.innerHTML = `<span class="empty-state">Ei avoimia tutkintoja tällä hetkellä.</span>`;
            document.getElementById("statCases").textContent = "0";
            return;
        }

        document.getElementById("statCases").textContent = rivit.length;

        kontti.innerHTML = rivit.map(rivi => `
            <div class="case-file">
                <span class="case-file-id">TAPAUS #${rivi.id}</span>
                <div class="case-file-title">${rivi.title}</div>
                <div class="case-file-meta">${rivi.kayttaja.username}</div>
            </div>`
        ).join("");

    } catch (err) {
        kontti.innerHTML = `<span class="empty-state">Tutkintojen haku epäonnistui.</span>`;
        console.error(err);
    }
}

async function lataaEpaillytMaara() {
    try {
        const rivit = await hae("/api/suspects");
        document.getElementById("statSuspects").textContent = rivit.length;
    } catch {
        // hiljainen epäonnistuminen, ei kriittinen
    }
}

function alustaKontrollit() {
    document.querySelectorAll(".tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            tila.kategoria = tab.dataset.category;
            lataaLeaderboard();
        });
    });

    document.getElementById("rangeSelect").addEventListener("change", (e) => {
        tila.aikavali = e.target.value;
        lataaLeaderboard();
    });
}

function lataaKaikki() {
    lataaYleiskatsaus();
    lataaLeaderboard();
    lataaSyyllisyys();
    lataaEpaillyt();
    lataaTutkinnat();
    lataaEpaillytMaara();
}

(async function init() {
    paivitaHeroCase();
    alustaKontrollit();
    await lataaGuildit();
    lataaKaikki();
    // Automaattinen päivitys 60s välein, jotta terminaali tuntuu "elävältä".
    setInterval(lataaKaikki, 60000);
})();
