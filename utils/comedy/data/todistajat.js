// Todistajapooli. Sisältää sekä nimettyjä "vakiotodistajia" (jotka
// esiintyvät toistuvasti komitean pöytäkirjoissa, tuttuja hahmoja
// palvelimen omasta huumorista) että yleisiä anonyymejä todistajatyyppejä.
// Jaettu /syyte ja /kuulustelu -komentojen kesken.

const NIMETYT_TODISTAJAT = [
    "MasanGulli",
    "Maire",
    "Shellin juorukerho",
    "Booboo",
    "Mummot",
    "Naapurin Wi-Fi-reititin (ei halua kommentoida)",
    "henkilön oma viimeinen aivosolu",
    "paikalla ollut pölyhiukkanen",
    "latauspalkki, joka todisti kaiken",
    "komitean epävirallinen peruna",
    "henkilö, joka sanoi \"mä näin kaiken\" mutta katsoi toiseen suuntaan",
    "tyhjä energiajuomatölkki",
    "Discordin ilmoitusääni",
    "tuoli, joka narisi ratkaisevalla hetkellä",
    "anonyymi käyttäjä nimeltä \"en minä\"",
    "komitean tauolla nukkunut vahtimestari",
    "kahvinkeittimen vanha suodatinpussi",
    "epäilyttävä varjo huoneen nurkassa",
    "peili, joka ei ole vielä kommentoinut",
    "kuuluisa \"joku muu\"",
    "naapurin kana, joka näki kaiken ja kuuli vielä enemmän",
    "mikrofoni, josta kuuluu vain hengitystä",
    "komitean oma muisti (epäluotettava)",
    "Mummot-ryhmän varajäsen",
    "hiljainen ikkunalauta",
    "se yksi kaveri, jonka nimeä kukaan ei muista",
    "Shellin juorukerhon uusi vierailija",
];

const YLEISET_TODISTAJAT = [
    "Anonyymi naapuri",
    "Ohikulkija joka ei halunnut nimeään julki",
    "Toinen komitean jäsen, joka ei muista yksityiskohtia",
    "Kassajonossa seissyt vieras henkilö",
    "Joku joka \"vain sattui olemaan paikalla\"",
    "Kahvikoneen ääressä seissyt työtoveri",
    "Naapurin kissa, epäluotettava mutta läsnä",
    "Ryhmächatissa hiljaa seurannut jäsen",
    "Bussipysäkillä odottanut silminnäkijä",
    "Joku joka kuuli asiasta \"luotettavalta taholta\"",
    "Aiempi epäilty, joka nyt todistaa muita vastaan",
    "Someen kuvan ladannut anonyymi käyttäjä",
    "Ravintolan tarjoilija, joka muisti tilauksen muttei tapahtumaa",
    "Naapuriston valvontakamera (ei virallisesti todistaja, mutta yritti)",
    "Joku joka väittää nähneensä \"kaiken\"",
    "Toimistotyöntekijä joka oli \"vain kahvitauolla\"",
    "Puiston penkillä istunut vanhus, ei liity Mummot-ryhmään",
    "Discordin #yleinen-kanavan hiljainen tarkkailija",
    "Joku joka muisti asian väärin mutta varmasti",
    "Kaupan kassajonossa seissyt silminnäkijä",
    "Ex-kumppani joka \"ei halua sekaantua, mutta silti kertoo kaiken\"",
    "Naapurin lapsi joka näki kaiken ikkunasta",
    "Bussikuski joka huomasi jotain epäilyttävää reitillä",
    "Joku joka oli paikalla \"ihan sattumalta\" kolmatta kertaa tällä viikolla",
    "Kirjaston hiljainen kulma, jolla oli yllättäen näkyvyys tapahtumapaikalle"
];

const TODISTAJAT = [...NIMETYT_TODISTAJAT, ...YLEISET_TODISTAJAT];

/** Lyhyt, vaihteleva "todistajan kommentti" jota generaattorit voivat liittää nimen perään. */
const TODISTAJAKOMMENTIT = [
    "kertoi nähneensä kaiken, muttei suostunut tarkentamaan.",
    "vahvisti tapahtuman, muttei muistanut yksityiskohtia.",
    "kieltäytyi kommentoimasta, mikä tulkittiin myöntämiseksi.",
    "antoi ristiriitaisen mutta vakuuttavan lausunnon.",
    "oli paikalla \"ihan sattumalta\".",
    "vaati nimettömyyttä, sai sen osittain.",
    "kertoi tarinan kolme kertaa, joka kerta hieman eri tavalla.",
    "vahvisti asian nyökkäämällä merkitsevästi.",
    "totesi vain: \"en ole yllättynyt\".",
    "kieltäytyi allekirjoittamasta lausuntoa, mutta seisoi sen takana suullisesti.",
    "kertoi kuulleensa asiasta \"luotettavalta taholta\".",
    "vahvisti tapahtuma-ajan, muttei paikkaa.",
    "totesi nähneensä \"jotain vastaavaa\" aiemminkin.",
    "kertoi nähneensä kaiken, mutta vain kulmasta jossa ei näkynyt mitään.",
    "kuvaili tapahtumia kolmessa eri aikamuodossa.",
    "kohotti kulmakarvaa merkitsevästi ja poistui.",
    "vaati korvausta todistamisesta ja sai kahvikupin.",
    "sanoi \"en halua sekaantua\" ja sekaantui heti.",
    "pyysi anonyymiyttä ja kertoi sen jälkeen kaikille nimensä.",
    "ei muistanut yksityiskohtia, mutta muisti tunnelman, ja se oli paha.",
    "todisti vilpittömästi ja täysin väärin.",
    "puhui koko ajan yleisesti mutta tarkoitti selvästi sinua.",
    "esitti lausuntonsa runomuodossa. Runo oli syyttävä.",
    "vakuutti, ettei kukaan kuunnellut. Kaikki kuuntelivat.",
    "tunnisti epäillyn äänestä, vaikka epäilty oli hiljaa.",
];

module.exports = { TODISTAJAT, NIMETYT_TODISTAJAT, YLEISET_TODISTAJAT, TODISTAJAKOMMENTIT };
