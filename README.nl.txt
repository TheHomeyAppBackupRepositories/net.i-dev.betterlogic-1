Welkom bij de Better Logic Library.

Een geavanceerde logische app met variabel en bibliotheekbeheer voor Homey.

Deze app voorziet je Homey van betere logica en bibliotheken:
* Beheer van variabelen op een slimme, geïntegreerde manier.
* Geavanceerde actie- en conditiekaarten met Better Logic, zoals Math.js.
* Apparaten om de variabelen direct te beheren.
* Datumtijd-opmaak, volledig aanpasbaar, gedeeld met andere apps.
* BLL-codering en BLL-expressies om rechtstreeks te gebruiken in flowkaarten van andere apps.
* Aanpasbare functies om te gebruiken binnen BLL-codering en BLL-expressies.
* Bibliotheken om te gebruiken binnen BLL-codering en BLL-expressies, zoals Math.js en Lodash.
* Een File Server die gebruikt kan worden door andere apps, zoals de Simple (Sys) LOG, om bestanden op je LAN te delen of om ze te downloaden op de Homey Mobiele App of de Developertools.
* Bibliotheken voor andere apps om te gebruiken, waardoor app-groottes en redundanties worden verkleind en het beheer wordt verbeterd.
* API's voor variabel beheer, met behulp van de bestandsserver of andere BLL-functies.
* Flowkaarten om een JSON-object/array om te zetten in CSV of Excel.

Bekijk de (nieuwe) app-instellingen voor alle functies en uitleg, zoals BLL-codering in ondersteunde apps!

Voorbeeld BLL-codering: Wanneer u dit in een tekstargument plaatst: - Hallo, vandaag is {[date("dddd")]} -, zal BLL automatisch die expressies in de teksten vinden en decoderen, resulterend in - Hallo, vandaag is maandag - .

Verder: Beheer variabelen direct in flows!

Typ gewoon een variabelenaam binnen een wanneer- en dankaart en selecteer deze in de lijst: de variabele wordt automatisch aangemaakt.
Als u de tag wilt gebruiken, drukt u eerst op opslaan.
Variabelen die automatisch zijn gemaakt vanuit flows, worden ook automatisch verwijderd wanneer ze niet langer worden gebruikt in flowkaarten.
Variabelen kunnen ook nog steeds worden beheerd vanuit het instellingenscherm. Deze variabelen worden niet automatisch verwijderd als ze niet worden gebruikt, maar moeten handmatig worden verwijderd.

En de knop Alles verwijderen heeft nu een bevestiging!


* Toegevoegd: API-ondersteuning toegevoegd voor GET, GET alle variabelen en SET (post) een waarde.
* GET: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME
* GET: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/ALL (alle variabelen ophalen)
* PUT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/VALUE // Zorg ervoor dat de waarde overeenkomt met het type, anders wordt deze niet ingesteld.
* Toegevoegd: trigger naar API. call.
* PUT voor increment: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/trigger/VARIABLENAME Dit activeert de gegeven variabele
* Toegevoegd: verhoging of verlaging toevoegen aan API. call
* PUT voor increment: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/i/VALUE Verhoogt de variabele met de opgegeven waarde
* PUT voor verlaging: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/d/VALUE Verlaagt de variabele met de gegeven waarde
* Toegevoegd: schakelaar van boolean (true->false of false->true) toegevoegd aan API.
    * PUT: HTTP://HOMEYADDRES/api/app/net.i-dev.betterlogic/VARIABLENAME/toggle Dit zal de Booleaanse waarde omdraaien

* Toegevoegd: voeg $timenow$ toe als een speciale variabele voor mathjs. Hiermee wordt de huidige tijd in seconden sinds epoch opgehaald. Deze variabele wordt niet in het overzicht opgeslagen, maar gebruikt in uitdrukkingen.
* Toegevoegd: #DD (dag), #MM (maand), #JJJJ (jaar), #HH (uren), #mm (minuten) #SS (seconden) toegevoegd als gereserveerde woorden naast timenow in de wiskundestromen. U kunt nu bijvoorbeeld #HH toekennen aan een variabele om de uren te krijgen. Ook heb ik timenow veranderd in #timenow voor consistentie.