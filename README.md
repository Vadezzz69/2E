# Komiteanvakoojabot

Discord-botti, rakennettu discord.js v14:llä. Tumma "OPIUM"-henkinen ilme
(musta + veren punainen), oikeaan palvelinaktiivisuuteen perustuva komitea,
vakoiluteema, trollikomennot, muutama peli ja perusmoderointi.

**Tekninen perusta:** Node.js ≥ 18, tiedot tallentuvat Cloudflare D1 -tietokantaan
`d1-worker/`-rajapinnan kautta (`utils/db.js`), hosting esim. Enzonicissa.

## Komennot

Kaikki komennot ovat lyhyitä ja itsenäisiä: ei pakollisia alikomentoja (`/sus`,
ei `/komitea sus`). Ainoa poikkeus ovat `/tutkinta` ja `/epaily`, jotka ovat
pysyviä hallintajoukkoja (aloita/todiste/sulje/lista, lisaa/lista/poista).

| Ryhmä | Komennot |
|---|---|
| **Komitea & epäilyt** | `/komitea` (päivän päätös oikeasta datasta), `/tuomio`, `/sus`, `/onko`, `/syyllinen`, `/spinner`, `/sakko` (oikea, kirjautuu), `/sakota` (feikki), `/potkaise`, `/bannaa`, `/aikalisa` (kolme feikkimoderointia — eivät tee mitään oikeasti) |
| **Vakoilu** | `/vakoilu` *(komitea valitsee itse: vakoile / report / wanted)*, `/vakoile`, `/report` *(oikea data)*, `/wanted`, `/koodinimi`, `/tehtava`, `/salaisuus`, `/itsetuho` |
| **Tutkimus** | `/tutkimus` *(komitea valitsee itse)*, `/ratsia`, `/takavarikko`, `/kuulustelu`, `/rikosrekisteri` *(oikea data)*, `/kamerat`, `/psykoanalyysi` |
| **Oikeus** | `/oikeus` *(komitea valitsee itse)*, `/syyte`, `/todiste`, `/lasku` |
| **Päivä** | `/paiva` (päivän rikos + päätös, sama koko päivän), `/tekosyy`, `/tiedote`, `/vuodenrikollinen` *(oikea data)* |
| **Tilastot** | `/tilastot` (kolmen kärki: viestit, ääni, komennot, sakot), `/rankingit`, `/sakkotilasto`, `/aktiivisuus`, `/syyllisyys`, `/vammatilastot`, `/kayttajainfo`, `/roast` |
| **Tutkinnat** | `/tutkinta`, `/epaily`, `/aanestys` |
| **Hauskat & pelit** | `/loukkaa`, `/meemi`, `/kolikko` |
| **Moderointi** | `/tyhjenna`, `/varoita`, `/varoitukset`, `/lukitse`, `/avaa`, `/ilmoituskanava`, `/debugvoice` *(vain ylläpitäjille)* |
| **Yleiset** | `/help`, `/ping`, `/palvelininfo` |

`/vakoilu`, `/tutkimus` ja `/oikeus` ovat "komitea päättää puolestasi" -oikopolkuja:
ne ajavat satunnaisesti yhden saman perheen itsenäisistä komennoista. Jäsenkomennot
(esim. `/ratsia`) toimivat edelleen suoraan.

Lisäksi viestikäsittelijä tukee `!add !avainsana = vastaus`, `!lista`, `!poista !avainsana`
ja tallennettuja `!avainsana`-vastauksia (vaatii Message Content Intentin).

## Käyttöönotto

1. Asenna riippuvuudet: `npm install`
2. Aseta ympäristömuuttujat (ks. `.env.example`; hostingissa suoraan hostin asetuksiin):

   | Muuttuja | Pakollinen | Käyttö |
   |---|---|---|
   | `TOKEN` | kyllä | Discord-botin token |
   | `CLIENT_ID` | kyllä (deploy) | Discord-sovelluksen ID |
   | `GUILD_ID` | kyllä (deploy) | Palvelin, jolle komennot rekisteröidään |
   | `D1_API_URL` | kyllä | Cloudflare Worker -rajapinnan osoite |
   | `D1_API_KEY` | kyllä | Workerin `API_KEY`-salaisuus (Bearer) |
   | `DASHBOARD_PORT` / `PORT` | ei | Dashboardin portti (oletus 10000) |
   | `DASHBOARD_TOKEN` | ei | Jos asetettu, dashboard vaatii tämän (`/?token=...`) |

   `BOT_SECRET` ei ole enää käytössä (ks. alla).

3. **Discord Developer Portal → Bot:** kytke päälle **Server Members Intent**
   (`/spinner`, `/syyllinen`) ja **Message Content Intent** (`!`-komennot).
4. Rekisteröi komennot: `npm run deploy`
5. Käynnistä: `npm start` (kehityksessä `npm run dev`)

### Komentojen rekisteröinti ja vanhojen komentojen poisto

`deploy-commands.js` rekisteröi komennot **vain palvelinkohtaisesti** (`GUILD_ID`) ja
käyttää Discordin bulk-korvausta, joten kaikki palvelimen aiemmat komennot, joita ei
enää ole koodissa, katoavat. Projekti ei käytä globaaleja komentoja; jos sellaisia
silti on jäänyt Discordiin (ne näkyvät palvelinkohtaisten rinnalla tuplina), skripti
kertoo niistä, ja ne poistetaan erikseen:

```
npm run deploy                          # rekisteröi (korvaa palvelimen komentolistan)
npm run deploy -- --puhdista-globaalit  # poistaa lisäksi globaalit komennot
npm run tarkista                        # kuiva-ajo: listaa komennot, ei kosketa Discordiin
```

Deploy keskeytyy, jos jokin komentotiedosto ei lataudu tai komennon nimi törmää
(muuten komento katoaisi Discordista huomaamatta). `--pakota` ohittaa tämän.

### Uusi komento

`npm run uusikomento` kysyy kategorian, nimen ja asetukset ja luo komentotiedoston
kansioon `commands/<kategoria>/`. Aja sen jälkeen `npm run deploy`. Pidä nimet
lyhyinä ja itsenäisinä.

### Itsetarkistus

`npm test` tarkistaa (ilman Discordia ja tietokantaa), että kaikki komennot latautuvat,
nimet eivät törmää, Discordin rajat täyttyvät, ryhmäkomentojen jäsenet löytyvät ja
sisältöpoolit ovat siistejä (ei duplikaatteja, ei kirjaimellisia `\n`-jäänteitä, ei
tuntemattomia `{paikanvaraajia}`).

## Rakenne

```
.
├── index.js                  # Käynnistää botin, dashboardin ja ajastimen
├── deploy-commands.js        # Slash-komentojen rekisteröinti (+ globaalien siivous)
├── handlers/
│   ├── commandLoader.js      # Lataa commands/-kansion (jaettu botin ja deployn kesken)
│   ├── commandHandler.js
│   └── eventHandler.js
├── commands/                 # yksi tiedosto = yksi komento, kansio = /help-kategoria
├── events/                   # ready, interactionCreate, messageCreate, voiceStateUpdate
├── utils/
│   ├── db.js                 # Cloudflare D1 -asiakas (Worker-rajapinta)
│   ├── tilastot.js           # viesti-/ääni-/komentotilastot
│   ├── tutkintadata.js       # tutkinnat, syyllisyys, sakot, tuomiot, asetukset
│   ├── time.js               # kaikki päivälaskenta Europe/Helsinki -ajassa
│   ├── satunnainen.js        # jaettu satunnaisuus + toiston esto
│   ├── ajastin.js            # päivittäinen tiedote
│   ├── comedy/               # huumorigeneraattorit ja sisältöpoolit (data/)
│   │   └── data/viestit.js   # otsikot, alatunnisteet, virheviestit, "ei dataa" -vastaukset
│   ├── statsEngine/, roastEngine/, ui/   # ks. kunkin README
│   └── database/migrations.js  # D1-skeema viitteenä (ei muutettu)
├── d1-worker/                # Cloudflare Worker (D1-rajapinta)
├── dashboard/                # Web-dashboard
└── scripts/                  # uusikomento.js, tarkista.js
```

## Huumorisisältö ja toiston esto

Kaikki satunnaisvalinnat kulkevat `utils/satunnainen.js`:n kautta. Jokainen lista muistaa
viimeksi arvotut kohtansa (kolmasosa listan pituudesta, max 10), joten sama vitsi ei
toistu heti; arvonta on silti tasainen kaikkien muiden vaihtoehtojen kesken. Lennossa
koottavat listat (esim. palvelimen jäsenet `/spinner`issä) arvotaan puhtaasti tasaisesti.

Uutta sisältöä lisätään suoraan taulukoihin tiedostoissa `utils/comedy/data/`,
`utils/komiteadata.js`, `utils/vakoiludata.js` ja `utils/roastdata.js`. Älä muuta
`utils/vakoiludata.js`:n `KOODINIMI_*`-listoja: koodinimet lasketaan käyttäjä-ID:stä ja
listojen pituuden muuttaminen vaihtaisi kaikkien koodinimet.

## Aikavyöhyke

"Päivä" tarkoittaa aina Suomen (Europe/Helsinki) kalenteripäivää, kesä-/talviaika
huomioiden (`utils/time.js`). Tämä koskee päivätilastoja, `/paiva`-komentoa,
komentotilastojen päivärajoja ja päivittäistä tiedotetta. Äänikanava-aika kirjataan
sille päivälle, jona käyttäjä poistuu kanavalta.

## Päivittäinen tiedote

Ajastin tarkistaa 10 minuutin välein jokaisen palvelimen, jolle on asetettu
`/ilmoituskanava`, onko tämän päivän tiedote jo lähetetty. Jos ei, se postaa eilisen
päätöksen ja viestikärjen, kirjaa tuomion `verdicts_log`-tauluun (vasta onnistuneen
lähetyksen jälkeen) ja merkitsee päivän hoidetuksi.

## Moderointi — mikä toimii oikeasti

| Komento | Toimiiko oikeasti? | Oikeus (oletus) |
|---|---|---|
| `/tyhjenna` | ✅ poistaa viestejä | ManageMessages |
| `/varoita`, `/varoitukset` | ✅ oikea varoitushistoria | ModerateMembers |
| `/lukitse`, `/avaa` | ✅ muuttaa kanavan oikeuksia | ManageChannels |
| `/ilmoituskanava` | ✅ | ManageGuild |
| `/debugvoice` | ✅ näyttää vain **tämän palvelimen** äänisessiot, vain sinulle (ephemeral) | ManageGuild (tarkistetaan myös koodissa) |
| `/potkaise`, `/bannaa`, `/aikalisa` | ❌ feikki — dramaattinen viesti, ei tee mitään | kaikki |

`/tutkinta`, `/epaily`, `/aanestys`, `/sakko`, `/tuomio` ja `!`-komennot ovat tarkoituksella
kaikille avoimia (osa leikkiä). Rajaus onnistuu lisäämällä komentoon
`.setDefaultMemberPermissions(...)`.

Botti ei voi pingata `@everyone`/`@here`/rooleja (`allowedMentions: { parse: ["users"] }`),
joten vapaatekstikentät tai `!add` eivät kelpaa massapingaukseen.

## Dashboard

Botti käynnistää samassa prosessissa web-dashboardin (`dashboard/`). Sen rajapinta
näyttää palvelimen aktiivisuusdataa (käyttäjänimet, syyllisyysprosentit, epäillyt).
**Aseta `DASHBOARD_TOKEN`, jos portti on näkyvissä internetiin** — ilman sitä kuka
tahansa osoitteen tuntava näkee datan. Avaa token-suojattu dashboard kerran
osoitteella `/?token=...` (token tallentuu HttpOnly-evästeeseen).

## Salaisuudet

Lähdekoodissa ei ole tokeneita eikä API-avaimia; kaikki tulee ympäristömuuttujista.
Lokeihin ei tulosteta tokenia eikä avaimia. `.env` on `.gitignore`ssa.
Aiemmin `index.js` sisälsi kovakoodatun `BOT_SECRET`-tarkistuksen (`Komitea2026SalainenAvain`);
se on poistettu, eikä muuttujaa tarvita. Jos samaa merkkijonoa on käytetty muualla, vaihda se.
