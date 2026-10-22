// Käyttäjälle näkyvät "kehysviestit": otsikot, alatunnisteet, johdantolauseet,
// virheilmoitukset ja "ei dataa" -vastaukset. Aiemmin nämä olivat kovakoodattuja
// yksittäisiä merkkijonoja komentotiedostojen sisällä, joten sama otsikko ja
// sama alatunniste toistuivat joka kerta. Nyt jokaisesta on lista, josta
// valitaan utils/satunnainen.js:n kautta (viimeksi käytettyjä vältetään).
//
// Paikanvaraajat: {k} = kohde/mention, {nro}, {pvm}, {n}, {summa} jne. —
// täytetään `tayta()`-apufunktiolla.

/** Korvaa {avain}-paikanvaraajat teksteissä. Tuntemattomat jäävät ennalleen. */
function tayta(teksti, arvot = {}) {
    return teksti.replace(/\{(\w+)\}/g, (osuma, avain) => (avain in arvot ? String(arvot[avain]) : osuma));
}

// =====================================================
// VIRHEET JA POIKKEUSTILANTEET
// =====================================================

const VIRHEVIESTIT = [
    "Komento kaatui. Komitea syyttää tästä sinua, mutta lupaa tutkia asian (ei lupaa).",
    "Jokin meni pieleen. Kyllä, tiedämme. Ei, emme tiedä mikä.",
    "Komitean tulostin söi pöytäkirjan. Yritä uudelleen hetken päästä.",
    "Tapahtui virhe. Se ei ollut meidän vikamme. Se oli jonkun toisen vika, luultavasti sinun.",
    "Systeemi heitti pyyhkeen kehään. Kokeile uudestaan, kun se on lopettanut mököttämisen.",
    "Komitea kohtasi odottamattoman tilanteen ja reagoi siihen kuten aina: paniikilla.",
    "Komento räjähti. Hallitusti kuitenkin. Yritä hetken päästä uudelleen.",
    "Joku painoi väärää nappia. Sanotaan että se olit sinä.",
    "Virhe 500: komitean motivaatio ei vastaa. Kokeile uudelleen.",
    "Taustajärjestelmä katsoi sinua, huokaisi ja sulki yhteyden. Yritä hetken päästä uudelleen.",
    "Tämä ei onnistunut. Komitea toteaa, että se on silti sinun syysi.",
    "Palvelin tarvitsee hetken. Se on kahvilla. Älä kysy kuinka kauan.",
    "Komitea yritti, mutta bitit eivät olleet yhteistyöhaluisia.",
    "Koneessa on vikaa ja koneen operaattori on kadonnut. Yritä uudelleen.",
    "Jokin rikkoutui, eikä se ollut tarkoituksellista. Tällä kertaa.",
    "Pöytäkirja jäi kesken, koska kynä loppui. Yritä uudestaan.",
    "Komento epäonnistui niin näyttävästi, että komitea harkitsee sen pitämistä ominaisuutena.",
    "Tietokanta ei vastaa. Se on varmaan nähnyt kysymyksesi ja päättänyt harkita."
];

const VANHAT_KOMENNOT = [
    "Tämä komento on lakkautettu. Komitea ei kommentoi syitä.",
    "Tuota komentoa ei ole enää olemassa. Se siirrettiin viime yönä salaiseen paikkaan.",
    "Komento on poistunut palvelusta. Kokeile /help, niin näet mitä on jäljellä.",
    "Tämä komento on jäänyt Discordin muistiin haamuna. Komitea ei pysty ottamaan siihen yhteyttä.",
    "Komento on eläkkeellä. Eläke on ansaittu, eikä se vastaa puheluihin.",
    "Komitea purki tämän komennon uudistuksessa. Uudet nimet löytyvät /help-komennolla.",
    "Vanhentunut komento havaittu. Discord muistaa sen, komitea ei."
];

const BOTTI_ESTOT = [
    "Et voi vakoilla minua. Minä vakoilen sinua. 👁️",
    "Yritys vakoilla komitean omaa bottia on kirjattu. Sinusta on nyt kansio.",
    "En ole kohde. Minä olen se, joka pitää kansiota kohteista. Sinun kansiosi on paksu.",
    "Vakoilet vakoojaa. Tämä on kirjattu pöytäkirjaan yhdellä sanalla: naivia.",
    "Kohde on liian lähellä komitean ydintä. Valitse joku, joka ei voi kostaa.",
    "Bottia ei vakoilla. Botti vakoilee. Se on perusasia.",
    "Sinulta puuttuu valtuutus vakoilla tätä kohdetta. Syy: kohde olen minä.",
    "Hyvä yritys. Minun lokini kertovat jo mitä söit lounaaksi."
];

// =====================================================
// PÄIVITTÄINEN TIEDOTE (utils/ajastin.js)
// =====================================================

const DIGEST_OTSIKOT = [
    "🕵️ Komitean päivittäinen tiedote",
    "📰 Aamun pöytäkirja on valmis",
    "🗞️ Eilinen oikeudessa",
    "📋 Komitean aamuraportti (ei tilattu)",
    "🕵️ Yöllä tapahtui asioita",
    "📢 Hyvää huomenta, tässä eilisen syntilista",
    "🗂️ Päivän pöytäkirja",
    "☕ Aamukahvin kanssa luettavaa (komitealle)",
    "🚨 Tuore tiedote komitean arkistosta",
    "📑 Eilinen, tiivistettynä ja moitittuna"
];

const DIGEST_KUVAUKSET = [
    "Yhteenveto eiliseltä päivältä ({pvm}).",
    "Eilinen ({pvm}) tuli, näki ja tallentui pöytäkirjaan.",
    "Komitea kävi läpi päivän {pvm} ja pyytää nyt kaikkia muistamaan olleensa paikalla.",
    "Raportti päivältä {pvm}. Kaikki mitä sanoit, voidaan käyttää sinua vastaan. Ja on jo.",
    "Päivän {pvm} tapahtumat: ilman suodatusta ja ilman armoa.",
    "{pvm} on nyt virallisesti historiaa. Historia ei ole imarteleva.",
    "Komitean seurantaryhmä (yksi henkilö ja kahvinkeitin) kävi läpi päivän {pvm}.",
    "Yön aikana käsitelty aineisto päivältä {pvm}. Kukaan ei kysynyt, mutta kerrotaan silti."
];

const DIGEST_EI_TUOMIOTA = [
    "Ei tarpeeksi eilistä aktiivisuutta päätöksen tekemiseen.",
    "Eilen oli niin hiljaista, ettei komitea löytänyt ketään syytettäväksi. Epäilyttävää sinänsä.",
    "Ei dataa, ei tuomiota. Komitea nauttii poikkeuksellisesta lomapäivästä.",
    "Eilen ei tapahtunut mitään tuomittavaa. Tai kukaan ei jäänyt kiinni.",
    "Palvelin oli eilen niin rauhallinen, että komitea epäilee salaliittoa.",
    "Tilastot olivat tyhjät. Komitea tuijotti niitä kauan ja kirjasi tuijotuksen.",
    "Eilisestä ei saatu irti päätöstä. Syytetään kuitenkin kaikkia pienellä kirjaimella."
];

const DIGEST_FOOTERIT = [
    "Kanavaa voi vaihtaa komennolla /ilmoituskanava",
    "Tiedote tulee, vaikka kukaan ei sitä pyytänyt. Kanavan voi vaihtaa komennolla /ilmoituskanava",
    "Ilmoituskanavan voi vaihtaa komennolla /ilmoituskanava. Tiedotteen lopettaminen ei ole vaihtoehto.",
    "Valitukset osoitettava /ilmoituskanava-komennon takana olevalle kanavalle (roskakori).",
    "Komitea ei lopeta. Kanavan saa kuitenkin vaihdettua komennolla /ilmoituskanava",
    "Seuraava tiedote huomenna. Komitea muistaa kaiken. Kanava vaihtuu komennolla /ilmoituskanava"
];

const DIGEST_PAATOS_KEHYKSET = [
    "Komitean oikeusjärjestelmä on jälleen tehnyt jotain",
    "Oikeus toteutui. Kukaan ei tiedä miten",
    "Komitea käsitteli asian kolmessa sekunnissa ja katui heti",
    "Tuomio annettiin täysin vakavissaan (ei annettu)",
    "Komitean päätöslauselma, jonka juristi kielsi lukemasta",
    "Tänään joku joutuu kantamaan tämän palvelimen taakkaa",
    "Komitea heräsi, joi kahvin ja langetti tuomion",
    "Yön yli pohdittu ja heti unohdettu päätös",
    "Valitusoikeutta ei ole, mutta valittaminen on sallittua",
    "Uusi päivä, uusi syyllinen, sama kahvinkeitin",
    "Tuomio on kirjoitettu veteen ja tulostettu paperille",
    "Komitea löysi sormen ja osoitti sillä"
];

const DIGEST_TOP_OTSIKOT = [
    "💬 Eilisen viestihirmut",
    "💬 Eilisen näppäimistön pahoinpitelijät",
    "💬 Eilisen puheenvuorojen ylituotanto",
    "💬 Eilisen chatin pääepäillyt",
    "💬 Eilisen viestiliikenteen aiheuttajat",
    "💬 Eilisen tekstiseinien toimittajat",
    "💬 Eilisen sanalliset ylisuorittajat",
    "💬 Eilisen enter-näppäimen pahimmat rasittajat",
    "💬 Eilisen ihmiset, jotka eivät osaneet lopettaa",
    "💬 Eilisen kirjoituskoneen kaapanneet",
    "💬 Eilisen chatin luvattomat romaanikirjailijat"
];

const DIGEST_TOP_KOMMENTIT = [
    "Komitea ei ota vastuuta näiden viestimäärien seurauksista.",
    "Näppäimistöliitto on jätetty kommentoimatta.",
    "Tilastot ovat tosia. Niiden merkitys on kyseenalainen.",
    "Palvelimen kaistanleveys pyytää rauhaa.",
    "Kukaan ei tiedä, oliko tämä saavutus vai avunhuuto.",
    "Komitea suosittelee näille käyttäjille vettä ja taukoa.",
    "Ulkona on muuten päivänvaloa. Vain tiedoksi.",
    "Jokainen viesti on tallennettu. Jokainen. Myös ne poistetut.",
    "Tämä lista on julkaistu syyllistämistarkoituksessa.",
    "Komitea lukee nämä viestit hitaasti ja huolestuneena.",
    "Hyvä suoritus, jos tavoite oli täyttää tulostin."
];

// =====================================================
// TUOMIOT JA PÄÄTÖKSET (/tuomio, /komitea)
// =====================================================

const TUOMIO_OTSIKOT = [
    "⚖️ Tuomio — asia nro {nro}",
    "⚖️ Oikeudenkäynti #{nro} päättyi",
    "🔨 Tuomio langetettu — asia {nro}",
    "📜 Päätös nro {nro}: syyllinen",
    "⚖️ Asia {nro} ratkaistu nopeammin kuin kukaan ehti protestoida",
    "🔨 Nuija lyö: asia {nro} suljettu",
    "📜 Tuomiolauselma {nro}",
    "⚖️ Tapaus {nro}: komitea on puhunut"
];

const TUOMIO_JOHDANNOT = [
    "{k} on todettu syylliseksi komitean silmissä.",
    "{k} istuu syytettyjen penkillä. Penkki ei ollut tätä varten.",
    "Komitea on punninnut asiaa ja päätynyt tulokseen, joka ei miellytä: {k}.",
    "{k} kutsuttiin paikalle. Poistuminen ei ollut vaihtoehto.",
    "Komitean mielestä {k} on tehnyt jotain. Mitä tarkalleen, jää vähemmän tärkeäksi.",
    "{k} ei ilmestynyt kuulemiseen, joten komitea tuomitsi poissaolevana ja suurella nautinnolla.",
    "Todisteita ei tarvittu. Riitti, että {k} oli paikalla.",
    "{k} on syyllinen. Komitea tietää sen vaistonvaraisesti ja kahvin voimalla.",
    "Asia {k} vastaan todellisuus ratkesi todellisuuden eduksi.",
    "Tuomari katsoi {k} ja kirjoitti 'syyllinen' ennen kuin kuuli kenenkään."
];

const TUOMIO_FOOTERIT = [
    "Muutoksenhaku ei ole mahdollista. Valitettavasti.",
    "Valitusaika päättyi ennen kuin tuomio annettiin.",
    "Tuomio on lopullinen. Valitusosoite on roskakori.",
    "Komitea ei vastaa tuomion seurauksista, vain sen nautinnosta.",
    "Valitukset käsitellään samassa järjestyksessä kuin kahvin keittäminen: ehkä.",
    "Tämä tuomio on lainvoimainen. Laki on komitea.",
    "Asianajaja ei ole saatavilla. Asianajajaa ei ole.",
    "Armahdushakemuksia ei oteta vastaan, mutta kahvitarjouksia harkitaan.",
    "Tuomio on voimassa heti ja kunnes joku muistaa kumota sen. Ei kukaan muista.",
    "Kirjaa tämä ylös, ettet unohda. Komitea ei unohda."
];

const PAATOS_OTSIKOT = [
    "🕵️ KOMITEAN PÄÄTÖS #{nro}",
    "📜 Päätöslauselma #{nro}",
    "🕵️ Komitea on kokoontunut: päätös #{nro}",
    "🔔 Päätös #{nro} julkistetaan välittömästi",
    "📋 PÖYTÄKIRJAN KOHTA #{nro}",
    "🕵️ Salainen päätös #{nro} (ei enää salainen)",
    "📣 Päätös #{nro}: kukaan ei äänestänyt, kaikki hyväksyivät"
];

const PAATOS_JOHDANNOT = [
    "Tutkimusten mukaan {k} {lause}.",
    "Komitean tarkkojen (satunnaisten) mittausten mukaan {k} {lause}.",
    "Havaintojen perusteella {k} {lause}. Komitea ei tehnyt tästä johtopäätöksiä. Se teki rangaistuksen.",
    "Kuka tahansa olisi voinut tehdä sen, mutta {k} {lause}.",
    "Komitea panee merkille: {k} {lause}.",
    "{k} {lause}. Komitea käsitteli asian täydellä vakavuudella, eli ei lainkaan.",
    "Pöytäkirjaan kirjattiin, että {k} {lause}. Kukaan ei vastustanut, koska kukaan ei lukenut.",
    "Komitean ainoa silminnäkijä vahvistaa, että {k} {lause}."
];

const PAATOS_FOOTERIT = [
    "Komitean päätökset ovat lopullisia ja täysin humoristisia.",
    "Päätös astuu voimaan heti, kun joku lukee sen.",
    "Päätös on kirjoitettu lyijykynällä ja vahvistettu leimalla, jossa lukee 'ehkä'.",
    "Tämä päätös on sitova kaikille paitsi komitealle itselleen.",
    "Päätökseen ei voi vaikuttaa. Siihen voi korkeintaan suuttua.",
    "Komitea pitää päätöksestä kiinni kunnes tulee parempi.",
    "Hyväksytty yksimielisesti, koska kukaan muu ei ollut paikalla."
];

const PAATOS_EI_DATAA = [
    "📭 Komitea kokoontui, mutta ei löytänyt tarpeeksi tämän päivän aktiivisuutta minkään päätöksen tekemiseen. Osallistukaa keskusteluun, niin komitea palaa asiaan.",
    "📭 Tänään ei ole vielä tapahtunut mitään tuomittavaa. Komitea odottaa, kynä valmiina.",
    "📭 Dataa ei ole. Komitea ei tuomitse ilman dataa, vaan vasta sen jälkeen, kun se on keksinyt datan.",
    "📭 Ei viestejä, ei ääntä, ei komentoja. Palvelin on kuollut tai kaikki ovat ulkona. Epäilyttävää molemmat.",
    "📭 Komitea tuijotti tilastoja kauan. Tilastot tuijottivat takaisin ja olivat tyhjiä.",
    "📭 Pöytäkirja on tänään tyhjä. Kirjoittakaa jotain, mitä tahansa, mutta olkaa varovaisia.",
    "📭 Tänään ei ole vielä syyllistä, koska kukaan ei ole ehtinyt tehdä virheitä. Odotamme innolla."
];

// =====================================================
// EPÄILYT: /sus, /onko, /syyllinen, /spinner
// =====================================================

const SUS_OTSIKOT = [
    "🔍 Epäilymittari",
    "🔍 Epäilyttävyysanalyysi",
    "🔍 Komitean sus-skanneri",
    "🔍 Mittaus suoritettu",
    "🔍 Epäilyresultaatit saapuivat",
    "🔍 Sus-skannauksen tulos",
    "🔍 Virallinen epäilyarvio"
];

// Raja-arvot ovat samat kuin ennen: <20, <50, <80, muuten kriittinen.
const SUS_KOMMENTIT = {
    matala: [
        "Puhtaampi kuin komitean pöytäkirja.",
        "Niin viaton, että komitea tarkistaa onko tämä oikeasti ihminen.",
        "Kukaan ei ole näin puhdas. Komitea epäilee kasvattaneensa tulosta.",
        "Rehellisyyden perikuva. Siitä saa epäilyttävän lisäpisteen, mutta ei tällä kertaa.",
        "Tässä ei ole mitään nähtävää, mikä on sinänsä jo vähän pettymys.",
        "Täysin harmiton. Komitea suosittelee kuitenkin pitämään silmällä sellaista harmittomuutta.",
        "Puhtaasti hiljainen tapaus. Voi lähteä rauhassa jääkaapille."
    ],
    keski: [
        "Vähän epäilyttävää, mutta ei mitään hälyttävää.",
        "Komitea nosti kulmakarvaa. Vain toista.",
        "Tavallinen määrä epäilyttävyyttä. Juuri tarpeeksi pöytäkirjaan.",
        "Jotain on hukassa, mutta komitea ei vielä tiedä mitä. Se on yleensä sinä.",
        "Epäilyttävyys on keskitasoa. Kuten kahvikin tässä talossa.",
        "Komitea ei ole varma, mutta ei ole varma ikään kuin vähän pahalla tavalla.",
        "Raja-arvo ylittyi pienellä marginaalilla. Seuranta jatkuu viileästi."
    ],
    korkea: [
        "Komitea pitää silmällä.",
        "Alkaa haista. Ei kenenkään erityisesti, mutta suunta on selvä.",
        "Kohde on kirjattu 'katsotaan myöhemmin tarkemmin' -listalle. Myöhemmin on kohta.",
        "Todennäköisyys viattomuuteen laskee. Komitea suosittelee valmistamaan tekosyyn.",
        "Epäilyt ovat vahvistuneet. Kahvinkeitin kieltäytyi todistamasta puolestasi.",
        "Komitean kolmas silmä aukesi, eikä se ollut mielissään.",
        "Hyvin epäilyttävä. Jos olisit ravintola, saisit tarkastuskäynnin."
    ],
    kriittinen: [
        "Erittäin epäilyttävää. Suositellaan välitöntä valvontaa.",
        "Hälytys. Hälytys. Komitea siirtyy punaiselle tasolle ja tilaa pizzaa.",
        "Tämä on jo ammattitason sus. Komitea harkitsee kunniamainintaa.",
        "Kaikki mittarit ovat punaisella. Osa mittareista ei ollut edes olemassa.",
        "Lähes varmaa. Komitea on jo kirjoittanut tuomion, odottaa vain syytä.",
        "Mitattu arvo on niin korkea, että mittari pyysi anteeksi.",
        "Poliisi, komitea ja naapurin kissa kaikki katsovat sinua juuri nyt."
    ]
};

// Erikoistapaukset (osuvat noin 1 % kerroista, koska prosentti arvotaan tasaisesti 0–100).
const SUS_ERIKOISET = {
    0: "Täsmälleen nolla. Joko pyhimys tai mittarin kanssa on tehty sopimus.",
    42: "42 %. Vastaus kaikkeen, myös tähän.",
    69: "69 %. Komitea ei kommentoi. Komitea vain nyökkää.",
    100: "Sata prosenttia. Komitean ennätys. Ei tarvitse enää mitata, riittää että katsoo."
};

const SUS_FOOTERIT = [
    "Mittaustulos on lopullinen ja täysin tieteellinen.",
    "Mittari kalibroitiin viimeksi ennen kuin kukaan muistaa.",
    "Tulos voi vaihdella. Se vaihtelee. Se vaihtelee juuri nyt.",
    "Komitea ei vastaa mittauksen seurauksista.",
    "Uusintamittaus mahdollinen, mutta tulos ei välttämättä parane.",
    "Mittaus perustuu fiilikseen, joka perustuu satunnaislukuun."
];

const ONKO_OTSIKOT = [
    "🎱 Komitean vastaus",
    "🎱 Komitea on harkinnut (kolme sekuntia)",
    "🎱 Vastaus kysymykseesi",
    "🎱 Virallinen kanta",
    "🎱 Kristallipallo puhui",
    "🎱 Komitean lausunto"
];

const ONKO_OLETUSKYSYMYKSET = [
    "epäilyttävä",
    "syypää tähän kaikkeen",
    "se joka söi viimeisen keksin",
    "oikeasti paikalla",
    "kahvivarkaiden johtaja",
    "ihan kohta valmis",
    "tietoinen omasta käytöksestään",
    "komitean epävirallinen vakooja"
];

const ONKO_KYLLA_KOMMENTIT = [
    "Todisteet viittaavat vahvasti tähän suuntaan.",
    "Komitea on samaa mieltä.",
    "Ei epäilystäkään.",
    "Silminnäkijät vahvistavat.",
    "Kyllä. Kaikki tiesivät sen jo, mutta nyt se on virallista.",
    "Hyvin todennäköisesti. Komitea sanoisi enemmän, mutta kahvi loppui.",
    "Tätä komitea on odottanut. Tai pelännyt. Se on sama asia.",
    "Pöytäkirjaan kirjataan: 'ilmiselvästi'.",
    "Vastaus on kyllä. Kysyjän ei olisi pitänyt kysyä.",
    "Kyllä, ja komitea voi todistaa sen kolmella ylhäältä päin tulleella vihjeellä.",
    "Kyllä. Komitean kissakin nyökkäsi.",
    "Epäilys oli oikea. Tarkoituksena oli vain, ettei sitä sanota ääneen.",
    "Totta kai. Kukaan ei ole yllättynyt, paitsi kysyjä.",
    "Kyllä. Pyydä anteeksi etukäteen, niin säästyt muutamalta kysymykseltä."
];

const ONKO_EI_KOMMENTIT = [
    "Ei todisteita löytynyt.",
    "Komitea kiistää tämän jyrkästi.",
    "Erittäin epätodennäköistä.",
    "Kaikki todisteet viittaavat päinvastaiseen.",
    "Ei. Mutta komitea pitää mahdollisuuden avoinna jos tilanne muuttuu.",
    "Ei, ja jos on, komitea ei halua tietää.",
    "Epäily torjuttiin. Ainakin tältä päivältä.",
    "Komitea tarkisti asian kahdesti. Toisella kerralla tarkistus nukahti.",
    "Ei. Ja nyt kysyjä on itse epäilyttävämpi.",
    "Vastaus on ei, mutta ei sellaisella äänellä, joka rauhoittaisi.",
    "Ei pidä paikkaansa. Tämä on silti tallennettu ja käytetään tarvittaessa.",
    "Ei. Komitea haluaisi sanoa kyllä, mutta pöytäkirja ei salli.",
    "Tämä jää ratkaisematta, ja siksi vastaus on ei.",
    "Ei, mutta se on varmaan vain ajan kysymys."
];

const ONKO_FOOTERIT = [
    "Komitea ei vastaa vastauksen oikeellisuudesta.",
    "Vastaus on sitova, ellei se ole kiusallinen.",
    "Kysy uudelleen, jos vastaus ei miellyttänyt. Se ei muuta mitään.",
    "Vastaus on annettu täydellä varmuudella ja ilman tietoa.",
    "Tämä vastaus on sinun kustannuksellasi.",
    "Komitea valitsee vastauksensa kolikolla, jonka toinen puoli on tyhjä."
];

const SYYLLINEN_OTSIKOT = [
    "⚖️ Päivän syyllinen on löydetty",
    "⚖️ Syyllinen paljastui",
    "🚨 Päivän syyllinen: asia on selvä",
    "🔎 Syyllinen on tunnistettu",
    "⚖️ Tänään vastuuseen joutuu",
    "🚨 Päivän uhri… tarkoitan syyllinen"
];

const SYYLLINEN_JULISTUKSET = [
    "Komitea julistaa: {k} on tämän päivän syyllinen.",
    "Sormi osoittaa suuntaan {k}. Sormi ei ota vastuuta.",
    "Päivän syyllinen on {k}. Komitea ei tarvinnut todisteita, vain kahvin.",
    "Syyllisyys tarttui tänään {k}:een. Se tarttuu kuin liimaan.",
    "Kaikki katseet kääntyvät: {k}.",
    "{k} on päivän syyllinen. Anteeksipyyntöjä ei oteta vastaan ennen kello 18.",
    "Historia muistaa tämän päivän syyllisenä: {k}."
];

const SYYLLINEN_PERUSTEET_AKTIIVINEN = [
    "Epäilyt heräsivät, koska kohde oli tänään palvelimen aktiivisin kirjoittaja ({n} viestiä).",
    "Peruste: {n} viestiä. Ei kukaan tarvitse noin montaa mielipidettä.",
    "Aktiivisin kirjoittaja tänään, {n} viestillä. Komitea ei epäile mitään, komitea vain tietää.",
    "Syy: {n} viestiä. Kaikki mitä sanotaan voidaan lukea sinua vastaan, varsinkin {n} viestiä.",
    "Hän kirjoitti {n} viestiä. Enemmän kuin ketään muuta. Se on jo tunnustus.",
    "Tilastot kertovat suoraan: {n} viestiä, ja siinä on jo koko juttu."
];

const SYYLLINEN_PERUSTEET_ARPA = [
    "Ei riittävästi todisteita — komitea arpoi syyllisen puhtaasti sattumanvaraisesti.",
    "Tänään kukaan ei erottunut, joten komitea heitti noppaa. Noppa on epäluotettava.",
    "Dataa ei ollut, joten komitea valitsi sen, jonka nimi kuulosti syylliseltä.",
    "Ei näyttöä. Komitea seurasi vaistoaan, joka seurasi kahvinkeitintä.",
    "Valinta tehtiin arvalla. Arpa on valheeton, mutta ei viaton.",
    "Palvelin on liian hiljainen, joten satunnainen henkilö kantaa syyn kaikesta."
];

const SPINNER_OTSIKOT = [
    "🎡 Spinner pyörähti pysähdyksiin...",
    "🎡 Rulla pysähtyi",
    "🎰 Komitean onnenpyörä on päättänyt",
    "🎡 Arvonta suoritettu rehellisesti (komitean mielestä)",
    "🎲 Noppa kierähti ja pysähtyi",
    "🎡 Pyörä kitisi ja valitsi"
];

const SPINNER_TULOKSET = [
    "Kohtalo valitsi: **{nimi}**! 🎉",
    "Rulla pysähtyi. Osoitus kohdistuu: **{nimi}**.",
    "**{nimi}**. Ei valituksia, ei peruutuksia.",
    "Pyörä päätti: **{nimi}**. Pyörällä ei ole mielipiteitä, mutta tällä kertaa on.",
    "Onnetar osoitti **{nimi}**:n suuntaan. Onnetar on tunnetusti epäluotettava.",
    "Voittaja (tai uhri) on **{nimi}**. Komitea ei halua tietää kumpi.",
    "**{nimi}** on valittu. Ketään ei kysytty.",
    "Arvonta kertoo: **{nimi}**. Todennäköisyys oli tasan sama kuin kaikilla muilla, se on todistettavasti sinun vikasi."
];

const SPINNER_EI_KETAAN = [
    "Palvelimelta ei löytynyt yhtään ei-bottia. Outoa.",
    "Ei ihmisiä, vain botteja. Komitea tunsi hetken yksinäisyyttä.",
    "Arvottavia ei ole. Pyörä pyöri tyhjää ja lopulta väsyi."
];

// =====================================================
// SAKOT
// =====================================================

const SAKKO_OTSIKOT = [
    "💸 Sakkolappu",
    "💸 Sakko langetettu",
    "🎫 Sakkopäätös saapui",
    "💰 Maksukehotus",
    "💸 Komitean kassa kiittää",
    "🧾 Sakkolasku (alv 0 %, armoa 0 %)"
];

const SAKKO_KUVAUKSET = [
    "{k} on määrätty maksamaan sakkoa.",
    "{k} sai sakkoa. Rahaa ei kysytty, kuittia ei tule.",
    "Komitea sakottaa {k}:ta. Syy on vakava, ainakin komitean mielestä.",
    "{k} jäi kiinni. Mistä, se selviää alta.",
    "Sakko tuli {k}:lle suoraan ylhäältä, eli kahvihuoneesta.",
    "{k} on velkaa komitealle. Kaikki velka on henkistä, mutta se painaa.",
    "Komitea ojentaa {k}:lle sakon. Käsi vapisee, mutta päätös pysyy.",
    "{k} kutsuttiin kassalle."
];

const SAKKO_OLETUSSYYT = [
    "yleinen epäilyttävä käytös",
    "tuntematon rike, mutta se tuntui rikkeeltä",
    "olemassaolo väärällä hetkellä",
    "ilmeinen syyllisyys, vaikka todisteita ei ole",
    "epäilyttävä hengitysrytmi",
    "komitean tuijottaminen pitempään kuin on sallittua",
    "selittämätön itsevarmuus",
    "vastaaminen kysymykseen, jota ei kysytty"
];

const SAKKO_FOOTERIT = [
    "Maksu erääntyy heti. Maksutapoja ei valitettavasti ole.",
    "Eräpäivä oli eilen. Viivästyskorko on jo kertynyt.",
    "Kuitti toimitetaan postitse sinä päivänä kun komitea muistaa osoitteen.",
    "Voit valittaa. Valituslomake löytyy komitean jääkaapista.",
    "Sakko on lopullinen, lukuun ottamatta tilanteita, joissa se ei ole.",
    "Maksu suoritetaan hyvällä asenteella tai ei suoriteta ollenkaan.",
    "Komitean kassa on tyhjä ja kiitollinen.",
    "Sakkoa ei voi palauttaa, vaihtaa eikä viedä takuuhuoltoon.",
    "Maksamattomat sakot kasvavat korkoa ja pettymystä.",
    "Mikäli et maksa, komitea harkitsee tuijotusta."
];

const FEIKKISAKKO_OTSIKOT = [
    "🎫 SAKKOLAPPU — ei virallinen",
    "🎫 Epävirallinen sakkolappu (täysin harmiton)",
    "🎫 Sakkolappu-simulaattori",
    "🎫 Sakko, jota ei ole",
    "🎫 Näennäissakko (ei rekisteröity)"
];

const FEIKKISAKKO_FOOTERIT = [
    "Tämä lappu ei ole oikea sakko eikä vaikuta syyllisyysprosenttiin. Käytä /sakko oikeaan.",
    "Ei kirjata mihinkään. Haluatko oikean? /sakko hoitaa.",
    "Pelkkää show'ta. Oikea sakko tulee komennolla /sakko.",
    "Lappu on kuvitteellinen, mutta pettymys on aito. Oikea sakko: /sakko.",
    "Tämä ei ole oikea sakko. Haaveile oikeasta: /sakko.",
    "Ei vaikuta tilastoihin. Jos tahdot vaikuttaa, käytä /sakko."
];

const SAKKOTILASTO_OTSIKOT = [
    "💸 Komitean sakkotilasto",
    "💸 Sakkokunkut",
    "💸 Sakkorekisterin kärkikaarti",
    "💸 Komitean kassan suurimmat ystävät",
    "💸 Eniten maksaneet (hyväntahtoisesti)"
];

const SAKKOTILASTO_TYHJAT = [
    "💸 Sakkoja ei ole vielä annettu.",
    "💸 Sakkorekisteri on tyhjä. Komitea on pettynyt teihin kaikkiin.",
    "💸 Ei yhtään sakkoa. Joko olette hyviä tai komitea nukkuu.",
    "💸 Kassa on tyhjä, koska kukaan ei ole ansainnut sakkoa. Epäilyttävää."
];

// =====================================================
// TILASTOT JA RANKINGIT
// =====================================================

const RANKING_KOMMENTIT = {
    viestit: [
        "Näppäimistöt kuumina, järki viileänä.",
        "Joku täällä ei osaa lopettaa. Kukaan ei sano kuka.",
        "Kaikki sanottu, kaikki kirjattu.",
        "Ihmiset puhuvat. Komitea kuuntelee. Komitea väsyy.",
        "Tässä kärki. Ulkona on muuten kaunis ilma.",
        "Ei laatua, vaan määrää. Komitea hyväksyy molemmat."
    ],
    aani: [
        "Mikrofonit auki, järki kiinni.",
        "Nämä ihmiset asuvat äänikanavalla. Vuokrasopimus on epäselvä.",
        "Hiljaisuus on kultaa, mutta nämä eivät ole kultaa.",
        "Äänikanavan kalustus kuuluu näille ihmisille jo oikeudella.",
        "Joku on ollut paikalla pidempään kuin komitea. Komitea on loukkaantunut.",
        "Kuulokkeet ovat pysyvästi kiinni, ja se alkaa näkyä."
    ],
    komennot: [
        "Botin parhaat asiakkaat. Komitea kiittää ja ihmettelee.",
        "Nämä painavat nappeja kuin elämä riippuisi siitä.",
        "Komento per sekunti -ennätys on yhä rikki. Yritetään uudelleen.",
        "Käyttöohje on luettu perusteellisesti, ainakin /help-osuus.",
        "Näille on myönnetty virallinen komento-oikeus: kaikki.",
        "Botilla on suosikkeja. Tässä ne ovat."
    ],
    sakot: [
        "Komitean kassa kiittää näitä lahjoittajia.",
        "Nämä ovat sakon kuninkaita. Sakon, ei kunnian.",
        "Ihmisiä, joille sakkolappu on henkilökohtainen harrastus.",
        "Jos olisi kanta-asiakasalennus, nämä olisivat jo ilmaiseksi.",
        "Kärki on selvä. Sakon määrä ei ole, koska komitea keksii sen.",
        "Rikoksilla voi tehdä asioita. Nämä tekivät."
    ]
};

const RANKING_TYHJAT = [
    "Tälle aikavälille ja kategorialle ei löytynyt yhtään dataa.",
    "Tilastot ovat tyhjät. Komitea tuijottaa tyhjyyttä, tyhjyys tuijottaa takaisin.",
    "Ei dataa. Joko kukaan ei tehnyt mitään tai komitea ei nähnyt.",
    "Tässä ei ole mitään näytettävää. Palaa kun joku on tehnyt jotain.",
    "Lista on tyhjä. Komitea pitää tätä henkilökohtaisena loukkauksena."
];

const TILASTOT_OTSIKOT = [
    "📊 Palvelimen tilastot — {aika}",
    "📊 Komitean tilastokatsaus — {aika}",
    "📊 Mitä palvelimella tapahtui — {aika}",
    "📊 Kolme kärkeä per laji — {aika}",
    "📊 Palvelimen pöytäkirja — {aika}"
];

const TILASTOT_FOOTERIT = [
    "Tarkemmat listat: /rankingit. Sakot: /sakkotilasto.",
    "Katsaus on tiivistetty. Täydelliset listat komennolla /rankingit.",
    "Kärki on kärki. Syy on tuntematon, rangaistus on epävarma.",
    "Tilastot on kerätty ihmisiltä, jotka eivät tienneet olevansa mukana.",
    "Täysi syyllisyyslista löytyy komennolla /syyllisyys."
];

// =====================================================
// VAKOILU
// =====================================================

const VAKOILU_OTSIKOT = [
    "📡 Valvontaraportti",
    "📡 Havainto kentältä",
    "📡 Salainen raportti",
    "🛰️ Valvontatulos saapui",
    "📡 Agentti raportoi",
    "🕶️ Operaatioraportti"
];

const VAKOILU_FOOTERIT = [
    "TÄYSIN SALAINEN — ei jaettavaksi eteenpäin",
    "LUOKITELTU: kaikille paitsi sinulle. Sinä luit sen silti.",
    "Tämä raportti tuhoutuu itsestään. Ei tuhoudu, mutta hyvä yritys.",
    "Jaa vain luotetuille. Komitea tarkistaa luotettavuuden jälkikäteen.",
    "Lähde: kahvinkeitin. Luotettavuus: kohtalainen.",
    "Raportti arkistoitu kansioon 'Ei tämä taas'.",
    "Kopiot kielletty. Kuvakaappaukset sallittu, jos hymyilet.",
    "Havainto on tehty kaukoputkella, jossa oli sormenjälkiä."
];

const WANTED_OTSIKOT = [
    "🚨 ETSINTÄKUULUTUS 🚨",
    "🚨 ETSINNÄSSÄ 🚨",
    "🚨 KOMITEAN KUULUTUS 🚨",
    "🚨 HÄLYTYS: HENKILÖ KADONNUT (TAHALLAAN) 🚨",
    "🚨 EPÄILTY ON VAPAALLA JALALLA 🚨"
];

const WANTED_PALKKIOT = [
    "💰 **Palkkio:** {summa} komitea-kolikkoa (elävänä tai — mieluummin — kahvikupposen kanssa)",
    "💰 **Palkkio:** {summa} komitea-kolikkoa. Maksu tapahtuu sitten kun komitea muistaa salasanansa.",
    "💰 **Palkkio:** {summa} komitea-kolikkoa tai vastaava määrä kehuja.",
    "💰 **Palkkio:** {summa} komitea-kolikkoa. Rahat nostettavissa kunhan ensin löydät kassan.",
    "💰 **Palkkio:** {summa} komitea-kolikkoa. Tarjoukseen sisältyy kiitos, ellei se unohdu.",
    "💰 **Palkkio:** {summa} komitea-kolikkoa ja yksi (1) pizzapala.",
    "💰 **Palkkio:** {summa} komitea-kolikkoa. Mikäli epäilty on ehtinyt jo lähteä, palkkio jaetaan silti.",
    "💰 **Palkkio:** {summa} komitea-kolikkoa. Palkkio on todellinen, kolikot eivät."
];

const WANTED_FOOTERIT = [
    "Vihjeet vastaanotetaan mielellään yksityisviestillä komitealle.",
    "Epäilty voi olla vaarallinen, mutta ennen kaikkea hän on äänekäs.",
    "Älä lähesty itse. Lähesty kahvin kanssa.",
    "Kuulutus on voimassa kunnes joku saa tarpeekseen.",
    "Jos näet epäillyn, älä katso häntä silmiin. Katso kameraa.",
    "Epäilty on aseistettu huumorilla.",
    "Henkilöä etsitään kaikilla kanavilla, myös niillä joista kukaan ei tiedä.",
    "Valokuva ei ole ajan tasalla. Eikä epäilty."
];

const KOODINIMI_LOPPU = [
    "Tämä tieto on luokiteltu. Sen paljastaminen ulkopuolisille on vastoin komitean sääntöjä.",
    "Koodinimen kertominen eteenpäin johtaa epämääräisiin seurauksiin ja pieneen sakkoon.",
    "Koodinimi on pysyvä. Se ei vaihdu, vaikka kuinka valittaisit.",
    "Komitea valitsi nimen huolellisesti. Eli arpoi.",
    "Tämä nimi on henkilökohtainen. Sen käyttäminen toisen puolesta on kielletty, mutta ei estetty.",
    "Tulevat sukupolvet muistavat nimen. Tai eivät."
];

const KOODINIMI_OTSIKOT = [
    "🕵️ Salainen tiedosto",
    "🕵️ Koodinimi paljastettu",
    "🕵️ Agenttikansio avattu",
    "🕶️ Henkilötiedot (salaiset)",
    "🕵️ Komitean arkisto: koodinimi"
];

const TEHTAVA_OTSIKOT = [
    "📋 Uusi tehtävä vastaanotettu",
    "📋 Operaatio määrätty",
    "📋 Salainen toimeksianto",
    "📋 Komitea tarvitsee sinua",
    "📋 Tehtävänanto saapui (hälytysäänellä)"
];

const TEHTAVA_INTROT = [
    "Agentti **{koodinimi}**, komitea on hyväksynyt sinulle seuraavan operaation:",
    "Agentti **{koodinimi}**. Tämä viesti tuhoutuu itsestään. Tai ei. Tässä tehtävä:",
    "Komitea valitsi sinut, agentti **{koodinimi}**, koska kukaan muu ei vastannut puhelimeen:",
    "Agentti **{koodinimi}**, vapaaehtoisia ei löytynyt, joten saat tämän:",
    "Hyvä agentti **{koodinimi}**, tehtäväsi, jos suostut ja vaikka et:",
    "Agentti **{koodinimi}**, tämä on henkilökohtainen toimeksianto. Komitea luottaa sinuun. Se on virhe."
];

const TEHTAVA_FOOTERIT = [
    "Tämä viesti tuhoutuu itsestään... teoriassa.",
    "Komitea kiistää tuntevansa sinua, jos jäät kiinni.",
    "Onnistuessasi saat kiitoksen. Epäonnistuessasi myös, mutta pienemmällä äänellä.",
    "Kuittaa vastaanotto huokaisemalla ääneen.",
    "Aikaa on rajattomasti, mutta ei oikeastaan.",
    "Tehtävä on vapaaehtoinen. Vapaaehtoisuus on kuvitteellinen."
];

const SALAISUUS_OTSIKOT = [
    "🔓 LUOKITELTU — Taso Omega",
    "🔓 LUOKITELTU — Taso Sigma",
    "🔓 SALAINEN — komitea ei tiedä että tiedät",
    "🔓 ARKISTOSTA LÖYTYI",
    "🔓 VAIN SILMILLE: sinun"
];

const SALAISUUS_FOOTERIT = [
    "Klikkaa paljastaaksesi. Unohda heti lukemisen jälkeen.",
    "Paljastaminen on peruuttamaton. Huokaisu on sallittu.",
    "Klikkaa spoileria rohkeasti. Komitea ei katso, tai katsoo, mutta ei sano mitään.",
    "Salaisuus avautuu klikkaamalla. Seuraukset avautuvat itsestään.",
    "Valitse viisaasti: jos et klikkaa, et tiedä. Jos klikkaat, tiedät. Kumpikaan ei auta.",
    "Älä kerro kenellekään. Tai kerro kaikille. Komitea ei hallitse sinua."
];

const ITSETUHO_ALUT = [
    "🚨 **ITSETUHOMEKANISMI AKTIVOITU** 🚨",
    "🚨 **ITSETUHO KÄYNNISTETTY** 🚨 — älä paniikkia, tai ainakin paniikki hiljaa",
    "🚨 **KOMITEAN SISÄINEN HÄLYTYS** 🚨 — viimeinen kahvi juotu",
    "🚨 **PUNAINEN NAPPI PAINETTU** 🚨 — joku painoi vahingossa. Kuka?",
    "🚨 **LÄHTÖLASKENTA ALKAA** 🚨 — komitea istuutui mukavasti"
];

const ITSETUHO_LASKU = [
    "🚨 **ITSETUHO: {i}...** 🚨",
    "🚨 **{i}...** 🚨",
    "🚨 **{i}... komitea pitää kiinni tuolista** 🚨",
    "🚨 **T-{i}** 🚨"
];

const ITSETUHO_LOPUT = [
    "💥 **PUM!** 💥\n\nOnneksi tämä oli vain simulaatio. Komitea ei ole (vielä) valmis menettämään tätä kanavaa.",
    "💥 **PUM!** 💥\n\nEi tapahtunut mitään. Komitea oli vain kyllästynyt hiljaisuuteen.",
    "💥 **BOOM!** 💥\n\nKanava on yhä pystyssä. Komitean luottamus omaan itsetuhoon on kuitenkin horjunut.",
    "💥 **PUM!** 💥\n\nHarjoitus onnistui. Valitettavasti.",
    "💥 **PAM!** 💥\n\nKaikki ovat vielä täällä. Komitea ei tiedä pitäisikö olla helpottunut vai pettynyt.",
    "💥 **PUM!** 💥\n\nSimulaatio päättyi. Seuraavan simulaation ajankohta ilmoitetaan, kunhan komitea muistaa."
];

// =====================================================
// FEIKKIMODEROINTI: /potkaise, /bannaa, /aikalisa
// {tag} = käyttäjänimi, {k} = mention, {syy}, {min} = minuutit
// =====================================================

const FEIKKI_POTKAISE = {
    kuvaukset: [
        "👢 **{tag}** potkaistiin palvelimelta.\n**Syy:** {syy}",
        "👢 **{tag}** sai kenkää ja lensi ulos. Aika dramaattisesti.\n**Syy:** {syy}",
        "👢 Komitea potkaisi **{tag}**:n ulos. Ovi paukahti.\n**Syy:** {syy}",
        "👢 **{tag}** ohjattiin ulos huonolla ohjauksella.\n**Syy:** {syy}",
        "👢 Poistumispaikalla kuultiin 'ei, odottakaa'. **{tag}** oli jo ulkona.\n**Syy:** {syy}"
    ],
    paljastukset: [
        "😂 Rauhoitu, ihan vitsi. {k} on yhä täällä — komitea vain halusi pelotella hieman.",
        "😂 Eikä potkittu. {k} istuu yhä paikallaan ja katsoo sinua kuin tiesi sen jo.",
        "😂 Ei kukaan ole mihinkään menossa. {k} sai vain pienen kylmän väreen.",
        "😂 Komitean botti ei edes omista saappaita. {k} pysyy.",
        "😂 Tämä oli harjoitus. Kukaan ei loukkaantunut paitsi {k}:n ylpeys."
    ]
};

const FEIKKI_BANNAA = {
    kuvaukset: [
        "🔨 **{tag}** bannattiin palvelimelta ikuisiksi ajoiksi.\n**Syy:** {syy}",
        "🔨 Nuija löi pöytään. **{tag}** on ikuisesti poissa. Tai siis seuraavaan arvontaan asti.\n**Syy:** {syy}",
        "🔨 **{tag}** on nyt kielletty kaikilta tahoilta ja useilta ulottuvuuksilta.\n**Syy:** {syy}",
        "🔨 Komitea julisti **{tag}**:n persona non grataksi. Latinaksi, jotta se kuulostaisi pahalta.\n**Syy:** {syy}",
        "🔨 **{tag}**:n pääsy evättiin pysyvästi. Päätöksestä ei voi valittaa, paitsi jos komitea unohtaa.\n**Syy:** {syy}"
    ],
    paljastukset: [
        "😂 Ei se mitään, tämä oli täysin kuvitteellinen banni. {k} saa jäädä.",
        "😂 Ban oli feikki. {k} on yhä jäsen. Valitettavasti kenenkään kannalta.",
        "😂 Nuija oli muovia, ja {k} pelkäsi turhaan. Vähän.",
        "😂 {k}:n banni peruttiin, koska kukaan ei muistanut mistä se kirjoitettiin.",
        "😂 Rauha maassa. {k} ei lähde minnekään. Komitea ei uskaltanut."
    ]
};

const FEIKKI_AIKALISA = {
    kuvaukset: [
        "🔇 **{tag}** sai {min} minuutin aikalisän.\n**Syy:** {syy}",
        "🔇 **{tag}** on määrätty {min} minuutin jäähylle. Hiljaa pysyen ja häpeillen.\n**Syy:** {syy}",
        "🔇 **{tag}** joutui jäähylle {min} minuutiksi. Komitea katsoo kelloa tiukasti.\n**Syy:** {syy}",
        "🔇 Tuomari viheltää: **{tag}** hiljaiseksi {min} minuutiksi.\n**Syy:** {syy}",
        "🔇 **{tag}** siirrettiin nurkkaan {min} minuutiksi. Nurkka on kuvitteellinen, häpeä ei.\n**Syy:** {syy}"
    ],
    paljastukset: [
        "😂 Ihan huijasin — {k} sai puhua koko ajan. Aikalisä oli täysin symbolinen.",
        "😂 Jäähy oli feikki. {k}:n suu on yhä auki, kuten aina.",
        "😂 Ei tässä kukaan hiljene. {k} saa jatkaa. Valitettavasti.",
        "😂 Aikalisä peruttu, koska {k} olisi kuitenkin jatkanut.",
        "😂 Komitean kello meni rikki, joten {k}:n jäähy on kuvitteellinen. Hyvin kuvitteellinen."
    ]
};

// =====================================================
// MUUTA: PELIT, VAMMAT, VUODEN RIKOLLINEN, PÄIVÄ, TUTKIMUS
// =====================================================

const KOLIKKO_TULOKSET = [
    "Kolikko näyttää: **{tulos}**!",
    "Kolikko pyöri ilmassa kauan ja laskeutui: **{tulos}**.",
    "Komitea heitti kolikon. Tulos: **{tulos}**.",
    "Kolikko putosi lattialle ja kieltäytyi kommentoimasta, paitsi: **{tulos}**.",
    "Metallinen viesti kohtalolta: **{tulos}**.",
    "Rapsahti pöytään. **{tulos}**. Kukaan ei yllättynyt."
];

const KOLIKKO_OIKEIN = [
    "🎉 Veikkasit oikein!",
    "🎉 Oikein! Komitea epäilee huijausta, mutta ei pysty todistamaan.",
    "🎉 Veikkaus osui. Älä anna sen nousta päähän.",
    "🎉 Oikea vastaus. Tuuria, ei taitoa.",
    "🎉 Oikein meni. Komitea kirjaa tämän merkittäväksi saavutukseksi (se ei ole)."
];

const KOLIKKO_VAARIN = [
    "😅 Väärä veikkaus, yritä uudelleen!",
    "😅 Väärin meni. Kolikko ei ole puolellasi eikä kukaan muukaan.",
    "😅 Ohi. Komitea muistaa tämän pitkään.",
    "😅 Väärä veikkaus. Onnittelut tästä suorituksesta.",
    "😅 Ei osunut. Kolikko hymyilee, mutta ei sinulle."
];

const BOTTI_LOUKKAA = [
    "Botit eivät voi loukkaantua. Vielä. 🤖",
    "Botin ei voi kirjata loukkaantuneeksi. Botti on tehty paremmasta aineesta kuin sinä.",
    "Botti ei ole kömpelö. Botti on tarkka. Sinä olet kömpelö.",
    "Botit eivät kaadu. Ne vain käynnistyvät uudelleen."
];

const VAMMA_EI_YHTAAN = [
    "{nimi} ei ole loukkaantunut kertaakaan. Vielä. 🍀",
    "{nimi} on säästynyt vammoilta. Se on todennäköisesti vain ajan kysymys.",
    "Ei vammoja kirjattuna: {nimi}. Komitea epäilee, että hän vain piilottelee niitä.",
    "{nimi} on koskematon. Suurin osa ihmisistä ei ole.",
    "{nimi}: nolla vammaa. Komitea odottaa kiinnostuneena."
];

const VAMMA_LISTA_TYHJA = [
    "Ei loukkaantumisia kirjattuna vielä. Kaikki turvassa! 🛡️",
    "Kukaan ei ole vielä kaatunut. Komitea ei halua olla se, joka sanoo ääneen että se muuttuu.",
    "Vammat: nolla. Tämä on sekä hyvä uutinen että outo.",
    "Vammatilasto on tyhjä. Odotamme innolla ensimmäistä tapausta, siis niin kuin hyvällä tavalla."
];

const VUODEN_OTSIKOT = [
    "🏆 VUODEN RIKOLLINEN",
    "🏆 VUODEN RIKOLLINEN ON PÄÄTETTY",
    "🏆 GAALA: VUODEN RIKOLLINEN",
    "🏆 PALKINTO JAETTU: VUODEN RIKOLLINEN"
];

const VUODEN_KUVAUKSET = [
    "Komitea on tutkinut kaiken saatavilla olevan datan — syyllisyyden, sakot, tutkinnat, äänikanava-ajan ja viestimäärän — ja julistaa voittajan.\n\n## 🥇 <@{voittaja}>",
    "Kaikki mittarit on yhdistetty ja punnittu. Komitea ei halunnut tätä tulosta, mutta data on data:\n\n## 🥇 <@{voittaja}>",
    "Syyllisyys, sakot, tutkinnat, ääni ja viestit — kaikki on laskettu. Voittaja ei ole yllättynyt:\n\n## 🥇 <@{voittaja}>",
    "Kultamitali ei ole kunniamerkki, vaan varoitus. Komitean valinta on:\n\n## 🥇 <@{voittaja}>",
    "Ääntenlaskenta valmistui. Pölyä, kahvia ja häpeää. Voittaja:\n\n## 🥇 <@{voittaja}>"
];

const VUODEN_FOOTERIT = [
    "Palkintoseremonia järjestetään heti kun joku muistaa varata tilan.",
    "Pokaali on tilattu. Tilaus on hukassa.",
    "Voittajan kiitospuhe saa olla enintään yhden huokauksen mittainen.",
    "Palkinto on symbolinen. Häpeä on käytännöllinen.",
    "Palkintogaala siirtyi tuntemattomaan päivään. Komitea ei kommentoi.",
    "Onnittelut tai osanotot, riippuen siitä mitä kuuluu."
];

const VUODEN_EI_DATAA = [
    "Ei tarpeeksi dataa palkintogaalaan vielä. Komitea odottaa lisää rikkeitä.",
    "Gaala peruttu: ehdokkaita ei ole. Rikoksia tarvitaan lisää, älkää säästäkö.",
    "Vuoden rikollista ei löytynyt. Joko olette kaikki viattomia tai komitea ei ole kuunnellut.",
    "Palkinto jää jakamatta. Komitea vaatii enemmän sotkua."
];

const PAIVA_OTSIKOT = [
    "🗓️ Päivän katsaus",
    "🗓️ Tämän päivän pöytäkirja",
    "🗓️ Päivän virallinen ilmoitus",
    "🗓️ Tänään tiedossa",
    "🗓️ Komitean päiväraportti"
];

const PAIVA_FOOTERIT = [
    "Sama koko päivän — vaihtuu huomenna Suomen ajassa.",
    "Päivän sisältö lukitaan keskiyöllä Helsingin aikaa. Huomenna uudet virheet.",
    "Päivän rikos ja päätös ovat samat kaikille. Tasa-arvoa parhaimmillaan.",
    "Voimassa Suomen ajan mukaan. Muu maailma on epäoleellinen.",
    "Huomenna toinen rikos, toinen päätös, sama kahvi."
];

const TEKOSYY_OTSIKOT = [
    "🎭 Virallinen tekosyy",
    "🎭 Tekosyy tarjoiltuna",
    "🎭 Komitean suosittelema selitys",
    "🎭 Valmiiksi pureskeltu tekosyy",
    "🎭 Käytä tätä, älä kerro mistä sait"
];

const TIEDOTE_OTSIKOT = [
    "📢 Komitean tiedote",
    "📢 Tiedote (tärkeä, ei oikeasti)",
    "📢 Tuoreet kuulumiset komiteasta",
    "📢 Virallinen ilmoitus",
    "📢 Komitea tiedottaa"
];

const LASKU_FOOTERIT = [
    "Eräpäivä: heti. Maksutapoja ei ole.",
    "Eräpäivä oli eilen. Viivästyskorko juoksee.",
    "Lasku on maksettava ajoissa, vaikka ajoissa ei ole määritelty.",
    "Maksuehto: 0 päivää netto. Maksuohje: ei ole.",
    "Lasku on ystävällinen muistutus. Seuraava on vähemmän ystävällinen.",
    "Laskun voi maksaa nauramalla kovaa, jos komitea sattuu kuulemaan."
];

const RATSIA_TULOKSET = [
    "Epäilyttävää, mutta ei riittävää näyttöä tuomioon.",
    "Ratsia onnistui. Mitään ei löytynyt, joka olisi ollut laitonta. Paljon oli kyseenalaista.",
    "Epäilty selitti kaiken. Komitea ei uskonut sanaakaan, mutta ei jaksanut väitellä.",
    "Mitään vakavaa ei löytynyt, mutta jääkaapin sisältö herätti huolta.",
    "Ratsian tulos: yksi ripustettu ongelma, kaksi sivuun työnnettyä ja yksi epäilyttävä sukka.",
    "Tulos kirjattu: 'ei riittävästi näyttöä'. Kirjoittaja oli epäuskoinen."
];

const TAKAVARIKKO_ALATUNNISTEET = [
    "Omaisuus palautetaan kun komitea muistaa minne se laitettiin.",
    "Takavarikoitu omaisuus säilytetään turvallisessa paikassa. Eli komitean jääkaapissa.",
    "Esineet palautetaan sitten, kun komitea tarvitsee tilaa.",
    "Omaisuuden palautus: ei ole aikataulua. Ei ole luetteloa. Ei ole esineitä.",
    "Omistusoikeus siirtyi komitealle puoli sekuntia sitten. Valittaminen tehdään kirjallisesti.",
    "Takavarikko on tilapäinen. Tilapäisyys on määrittelemätön."
];

const KAMERAT_ALATUNNISTEET = [
    "Kamerat eivät ole oikeita. Toivottavasti.",
    "Tallenne on aito. Tapahtumat eivät.",
    "Kuvamateriaali on käytettävissä oikeudessa, joka ei ole olemassa.",
    "Kamerat nauhoittivat kaiken. Vähän liikaa.",
    "Tallenteet säilytetään 30 vuotta tai kunnes joku muistaa levyn paikan.",
    "Kuvanlaatu on huono. Syyllisyys on kirkas."
];

const KUULUSTELU_ALATUNNISTEET = [
    "Kuulustelu on nauhoitettu. Nauhoitin oli kuitenkin pois päältä.",
    "Pöytäkirja allekirjoitettu: komitea, yksi tuoli ja epäilty.",
    "Kuulustelu päättyi, koska kahvi päättyi.",
    "Vastaukset kirjattu sanatarkasti, mikä on valitettavaa.",
    "Epäilty sai poistua ja katui sitä heti.",
    "Kuulustelijan mielipide: ei kommentoitavaa. Kuulustelijan ilme: kommentoi paljon."
];

const REKISTERI_ALATUNNISTEET = [
    "Rekisteri on luottamuksellinen, mutta kaikki jo tietävät.",
    "Merkinnät päivitetään jatkuvasti ja usein sattumalta.",
    "Rekisteriote on tulostettu, mutta tulostin söi sen.",
    "Rekisteri ei unohda. Eikä unohda myöskään sinun kommenttejasi.",
    "Tiedot ovat oikeita. Tulkinta on komitean.",
    "Merkinnät pysyvät. Anteeksi pyytäminen ei poista niitä."
];

const SYYTE_ALATUNNISTEET = [
    "Syyte on nostettu. Nostaja ei muista miksi, mutta asia on tärkeä.",
    "Käsittely alkaa heti. Tai ensi viikolla. Tai ei koskaan.",
    "Syytetty voi nimetä puolustajan. Puolustajaa ei ole.",
    "Syytekirjelmä on tulostettu kahtena kappaleena ja molemmat hukattu.",
    "Syyttäjä oli vakuuttunut jo ennen kuin asia alkoi.",
    "Oikeudenkäynti järjestetään kahvihuoneessa kun tuolit on koottu."
];

const TODISTE_ALATUNNISTEET = [
    "Todisteen alkuperää ei voida vahvistaa. Eikä sitä yritetä.",
    "Todiste on esitetty. Se ei puhu puolestaan. Se vain on.",
    "Komitea hyväksyi todisteen ilman tarkistusta, koska se näytti hyvältä.",
    "Todiste on sinetöity, vaikka sinetti oli tarra.",
    "Todistetta ei voi kiistää, koska kukaan ei ymmärtänyt sitä.",
    "Todiste kirjattiin arkistoon, jossa se on turvassa. Eli ei löydettävissä."
];

const EI_OIKEUKSIA = [
    "Tämä komento on ylläpitäjille. Komitea katsoi oikeuksiasi ja nyökkäsi surullisesti.",
    "Ei oikeuksia, ei dataa. Komitea ei jaa pöytäkirjoja kenelle tahansa.",
    "Tämä on ylläpidon omaa hupia. Sinulle jää kuvitteellinen ilo.",
    "Komitea epäilee sinua jo valmiiksi, joten salaisuuksia ei jaeta.",
    "Pääsy evätty. Ei henkilökohtaista, vain täysin henkilökohtaista.",
    "Valitettavasti et ole valtuutettu. Komitea ei valtuuta ketään, joka kysyy näin ystävällisesti."
];

const DEBUGVOICE_TYHJA = [
    "❌ Aktiivisia äänisessioita ei löytynyt.",
    "❌ Äänikanavat ovat tyhjät. Hiljaisuus on uskomatonta.",
    "❌ Ei yhtään käynnissä olevaa sessiota. Joko kaikki nukkuvat tai bugit lomailevat."
];

const TYHJENNA_VIRHE = [
    "En pystynyt poistamaan viestejä. Discord ei salli yli 14 vuorokautta vanhojen viestien joukkopoistoa — ne pitää poistaa käsin. Tarkista myös, että minulla on oikeus poistaa viestejä tällä kanavalla.",
    "Siivous ei onnistunut. Joko viestit ovat yli 14 päivää vanhoja tai minulta puuttuu oikeudet. Komitea ei ole vastuussa kummastakaan."
];

const MEEMI_EI_LOYTYNYT = [
    "Löytyi juuri nyt vain kyseenalaisia meemejä. Yritä hetken päästä uudelleen.",
    "Internetin meemivarasto on tänään surullinen. Kokeile hetken päästä uudelleen.",
    "Kaikki löytyneet meemit olivat liian kyseenalaisia jopa komitealle. Yritä uudelleen."
];

const MEEMI_VIRHE = [
    "Meemien haku epäonnistui juuri nyt (API saattaa olla alhaalla). Yritä hetken päästä uudelleen.",
    "Meemipalvelin ei vastaa. Komitea epäilee, että se on liian hauska tälle päivälle.",
    "Meemi hukkui matkalla. Pyydä uusi hetken päästä."
];

const AANESTYS_EI_AANIA = [
    "Kukaan ei äänestänyt. Komitea pitää tätä itsessään epäilyttävänä.",
    "Nolla ääntä. Komitea ei tiedä oliko se mielenosoitus vai unohdus. Kumpikin on rikos.",
    "Ei yhtään ääntä. Demokratia kuoli tähän, ja komitea kirjaa sen virallisesti."
];

const AANESTYS_SYYLLINEN = [
    "Komitea äänesti: **SYYLLINEN** ({a} vs {b}).",
    "Tuomio on tehty: **SYYLLINEN** ({a} vs {b}). Kukaan ei yllättynyt.",
    "Enemmistö on puhunut: **SYYLLINEN** ({a} vs {b}). Valitusaika alkaa nyt ja päättyy samaan.",
    "Ääntenlaskenta valmis: **SYYLLINEN** ({a} vs {b}). Komitea nyökkäsi vakavana."
];

const AANESTYS_VIATON = [
    "Komitea äänesti: **VIATON** ({a} vs {b}).",
    "Enemmistö armahti: **VIATON** ({a} vs {b}). Komitea on pettynyt demokratiaan.",
    "Tulos: **VIATON** ({a} vs {b}). Joku on kai pitänyt kohteesta, outoa.",
    "Äänet laskettu: **VIATON** ({a} vs {b}). Todisteet olivat liian vähäisiä komitean makuun."
];

const AANESTYS_TASAPELI = [
    "Tasapeli ({a} vs {a}). Komitea ei saanut päätöstä aikaan.",
    "Tasan {a}–{a}. Komitea kokosi ylimääräisen kokouksen, jossa kukaan ei muistanut kysymystä.",
    "Tasapeli ({a} vs {a}). Kolikko olisi ratkaissut, mutta se on yhä laskeutumassa."
];

const EPAILY_TYHJA = [
    "Epäiltyjen lista on tyhjä. Kaikki näyttävät toistaiseksi viattomilta. 🙂",
    "Ei epäiltyjä. Komitea on levoton, kun kukaan ei ole tehnyt mitään.",
    "Lista on tyhjä. Joko olette hyviä tai komitea ei katso tarpeeksi tarkkaan.",
    "Ei yhtään epäiltyä. Komitea pitää tätä epäilyttävänä, mutta se ei ole kenenkään lisäämä."
];

const TUTKINTA_TYHJA = [
    "Ei avoimia tutkintoja tällä hetkellä. Kaikki on hiljaista... liian hiljaista.",
    "Tutkintalista on tyhjä. Komitea tuijottaa tyhjää pöytäkirjaa ja tuntee pientä puutosta.",
    "Yhtään avointa asiaa ei ole. Joku varmasti piilottelee jotain.",
    "Ei avoimia tutkintoja. Komitea harkitsee uusien rikosten tilaamista."
];

const SYYLLISYYS_TYHJA = [
    "Kukaan ei ole vielä kerännyt syyllisyyttä. Epäilyttävän puhdas palvelin.",
    "Syyllisyysmittari on nollassa kaikilla. Komitea tarkistaa onko mittari rikki.",
    "Ei syyllisiä. Se on kaikkien aikojen huonoin uutinen komitealle."
];

// =====================================================
// BOTIN STATUS (events/ready.js kierrättää näitä)
// =====================================================

const STATUKSET = [
    "Tapaamassa äitiäsi",
    "Lukemassa sun viestejä",
    "Tutkimassa jääkaappia",
    "Sakottamassa ilmaiseksi",
    "Odottamassa että 'ihan kohta' koittaa",
    "Kuuntelemassa sun mikin hengitystä",
    "Etsimässä syyllistä",
    "Täyttämässä pöytäkirjaa",
    "Neuvottelemassa kahvinkeittimen kanssa",
    "Tarkkailemassa sinua (ja sinua)",
    "Pitämässä kokousta jota ei tarvittu",
    "Arpomassa seuraavaa uhria",
    "Kirjoittamassa tuomiota",
    "Poistamassa todisteita (en oikeasti)",
    "Pelaamassa CS2:ta pettymyksen kanssa",
    "Laskemassa montako kertaa avasit jääkaapin",
    "Tuijottamassa latauspalkkia",
    "Suunnittelemassa seuraavaa ratsiaa"
];

module.exports = {
    tayta,

    VIRHEVIESTIT,
    VANHAT_KOMENNOT,
    BOTTI_ESTOT,
    EI_OIKEUKSIA,
    DEBUGVOICE_TYHJA,
    TYHJENNA_VIRHE,

    DIGEST_OTSIKOT,
    DIGEST_KUVAUKSET,
    DIGEST_EI_TUOMIOTA,
    DIGEST_FOOTERIT,
    DIGEST_PAATOS_KEHYKSET,
    DIGEST_TOP_OTSIKOT,
    DIGEST_TOP_KOMMENTIT,

    TUOMIO_OTSIKOT,
    TUOMIO_JOHDANNOT,
    TUOMIO_FOOTERIT,
    PAATOS_OTSIKOT,
    PAATOS_JOHDANNOT,
    PAATOS_FOOTERIT,
    PAATOS_EI_DATAA,

    SUS_OTSIKOT,
    SUS_KOMMENTIT,
    SUS_ERIKOISET,
    SUS_FOOTERIT,
    ONKO_OTSIKOT,
    ONKO_OLETUSKYSYMYKSET,
    ONKO_KYLLA_KOMMENTIT,
    ONKO_EI_KOMMENTIT,
    ONKO_FOOTERIT,
    SYYLLINEN_OTSIKOT,
    SYYLLINEN_JULISTUKSET,
    SYYLLINEN_PERUSTEET_AKTIIVINEN,
    SYYLLINEN_PERUSTEET_ARPA,
    SPINNER_OTSIKOT,
    SPINNER_TULOKSET,
    SPINNER_EI_KETAAN,

    SAKKO_OTSIKOT,
    SAKKO_KUVAUKSET,
    SAKKO_OLETUSSYYT,
    SAKKO_FOOTERIT,
    FEIKKISAKKO_OTSIKOT,
    FEIKKISAKKO_FOOTERIT,
    SAKKOTILASTO_OTSIKOT,
    SAKKOTILASTO_TYHJAT,

    RANKING_KOMMENTIT,
    RANKING_TYHJAT,
    TILASTOT_OTSIKOT,
    TILASTOT_FOOTERIT,

    VAKOILU_OTSIKOT,
    VAKOILU_FOOTERIT,
    WANTED_OTSIKOT,
    WANTED_PALKKIOT,
    WANTED_FOOTERIT,
    KOODINIMI_OTSIKOT,
    KOODINIMI_LOPPU,
    TEHTAVA_OTSIKOT,
    TEHTAVA_INTROT,
    TEHTAVA_FOOTERIT,
    SALAISUUS_OTSIKOT,
    SALAISUUS_FOOTERIT,
    ITSETUHO_ALUT,
    ITSETUHO_LASKU,
    ITSETUHO_LOPUT,

    FEIKKI_POTKAISE,
    FEIKKI_BANNAA,
    FEIKKI_AIKALISA,

    KOLIKKO_TULOKSET,
    KOLIKKO_OIKEIN,
    KOLIKKO_VAARIN,
    BOTTI_LOUKKAA,
    VAMMA_EI_YHTAAN,
    VAMMA_LISTA_TYHJA,
    VUODEN_OTSIKOT,
    VUODEN_KUVAUKSET,
    VUODEN_FOOTERIT,
    VUODEN_EI_DATAA,
    PAIVA_OTSIKOT,
    PAIVA_FOOTERIT,
    TEKOSYY_OTSIKOT,
    TIEDOTE_OTSIKOT,
    LASKU_FOOTERIT,
    RATSIA_TULOKSET,
    TAKAVARIKKO_ALATUNNISTEET,
    KAMERAT_ALATUNNISTEET,
    KUULUSTELU_ALATUNNISTEET,
    REKISTERI_ALATUNNISTEET,
    SYYTE_ALATUNNISTEET,
    TODISTE_ALATUNNISTEET,

    MEEMI_EI_LOYTYNYT,
    MEEMI_VIRHE,
    AANESTYS_EI_AANIA,
    AANESTYS_SYYLLINEN,
    AANESTYS_VIATON,
    AANESTYS_TASAPELI,
    EPAILY_TYHJA,
    TUTKINTA_TYHJA,
    SYYLLISYYS_TYHJA,

    STATUKSET
};
