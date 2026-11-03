import type { CategoryKey } from "../../types";
import type { PlaceCopy } from "./types";

export const srCategory: Record<CategoryKey, PlaceCopy> = {
  dresses: {
    title: "Haljine koje već imaju jedno veče",
    description:
      "Pamuk iz pedesetih i šifon koji se zavrti, od prodavaca u Beogradu i Novom Sadu. Cene u dinarima, svaka haljina sa svojom merom.",
    kicker: "Polica · haljine",
    heading: "Haljine",
    emphasis: "s tuđim večerom u šavu",
    lead: "Ovde haljina ne stiže iz izloga. Stiže iz ormara, s lavandom među naborima i s pozivnicom koja je već prošla.",
    paragraphs: [
      "Put je kratak: sašije se ili kupi za svadbu, nosi se jednom, sklopi se. Na policu stanu pamuk sa sitnim cvetom, maksi koji se zavrti u koraku, i krojevi koje prodavac meri rečima.",
      "Beograd i Novi Sad drže oglase odvojeno, ispod ove strane. Cena je u dinarima. Stanje — sašiveno dugme, zamenjena postava, ceo šav — stoji na komadu.",
    ],
  },
  coats: {
    title: "Kaputi za vetar koji ne pita za sezonu",
    description:
      "Vuneni kaputi i jakne iz druge ruke u Srbiji. Prodavci iz Beograda i Novog Sada, cene u dinarima.",
    kicker: "Polica · kaputi",
    heading: "Kaputi",
    emphasis: "koji se još zakopčavaju",
    lead: "Kaput na ovoj polici ima iza sebe zime, ne kampanju. Pušta se kad vešalica kod kuće ne drži još jedan.",
    paragraphs: [
      "Beogradski vetar sa Save hoće nešto što se veže u struku dok se čeka tramvaj. Novi Sad drži kaput duže uz Dunav i kasnije ga skida u podne. Zato gradovi ne dele kuku.",
      "Kopče, postavu i boju kože ili vune piše prodavac. Nema ocene kaputa od ljudi koji ga nisu obukli.",
    ],
  },
  knitwear: {
    title: "Trikotaža s vidljivom petljom",
    description:
      "Ponča i pleteni komadi iz druge ruke, iz Beograda i Novog Sada. Ručna vuna, cene u dinarima.",
    kicker: "Polica · trikotaža",
    heading: "Trikotaža",
    emphasis: "s jednom kraćom resom",
    lead: "Pleteno se poznaje po grešci koju neko nije hteo da sakrije: kraća resa, red ponovljen uveče, inicijali s unutrašnje strane.",
    paragraphs: [
      "Pončo ide preko haljine kad dorćolsko veče ohladi brže od prognoze, ili kad novosadsko jutro još drži vlagu s Dunava. Greje koliko šal i džemper zajedno.",
      "Moljci se pominju samo ako ih je prodavac pomenuo. Izaberite grad — beogradska resa i novosadska vuna ne vise na istoj vešalici.",
    ],
  },
  denim: {
    title: "Farmerke koje su prestale da škripe",
    description:
      "Denim iz druge ruke u Srbiji, sa strukom i dužinom kao na staroj etiketi. Beograd, Novi Sad, cene u dinarima.",
    kicker: "Polica · farmerke",
    heading: "Farmerke",
    emphasis: "omekšale, ne pocepane za izlog",
    lead: "Novi denim drži formu na polici. Ovaj je već sedeo na stolici, u tramvaju i pod kaputom, i koleno je celo ako tako piše.",
    paragraphs: [
      "Na kartici stoje struk i dužina, ponekad kroj s imenom, ponekad bleda mrlja sa zadnjeg džepa. Mrlja se ne briše iz opisa da bi komad delovao novije.",
      "Beograd i Novi Sad imaju svoje strane. Ako broja nema jutros, polica ne obećava da će stići.",
    ],
  },
  accessories: {
    title: "Dodaci koji dovršavaju kaput",
    description:
      "Kape i sitni komadi iz druge ruke u Beogradu i Novom Sadu. Vuna koja ne grebe, cene u dinarima.",
    kicker: "Polica · dodaci",
    heading: "Dodaci",
    emphasis: "za glavu i za džep",
    lead: "Kad je kaput već izabran, ostaju kapa, šal i sitnica koja se vadi iz džepa na stanici.",
    paragraphs: [
      "Ovde dodatak ne stiže u kompletu od tri boje. To je vuna koja ne grebe čelo, konac druge boje iznutra, komad kupljen na pijaci a ne u izlogu.",
      "Beograd i Novi Sad su odvojene adrese ispod ove strane. Cene su u dinarima, a prazan štand ostaje prazan.",
    ],
  },
};

export const srCity: Record<CategoryKey, Record<string, PlaceCopy>> = {
  dresses: {
    Beograd: {
      title: "Beogradske haljine posle pozivnice",
      description:
        "Haljine iz druge ruke od prodavaca u Beogradu. Pamuk i šifon s cenom u dinarima, odvojeno od Novog Sada.",
      kicker: "Beograd · haljine",
      heading: "Beogradske haljine",
      emphasis: "posle pozivnice",
      lead: "U Beogradu haljina često izađe jednom: sala, večera, pa vešalica i lavanda u postavi dok tramvaj još ide niz Bulevar.",
      paragraphs: [
        "Prodavci iz grada pišu kroj i popravku. Sitni cvet iz pedesetih može da stoji pored maksi haljine koja se zavrti, ali samo ako je neko iz Beograda objavio. Novosadska haljina se ne prebacuje ovde da bi se red napunio.",
        "Mera i dinari su na kartici. Cela polica haljina u zemlji, zajedno s Novim Sadom, vezana je ispod oglasa.",
      ],
    },
    "Novi Sad": {
      title: "Novosadske haljine za dunavsko veče",
      description:
        "Haljine iz druge ruke iz Novog Sada. Šifon i pamuk za vetar s Dunava, cene u dinarima.",
      kicker: "Novi Sad · haljine",
      heading: "Novosadske haljine",
      emphasis: "za dunavsko veče",
      lead: "Novi Sad meri haljinu korakom kroz Dunavsku, ne beogradskim tramvajem. Vlažan vetar s reke ulazi u šifon drugačije nego savski.",
      paragraphs: [
        "Na ovoj strani su samo oglasi čiji je grad Novi Sad. Maksi sa zamenjenom postavom ili pamuk koji je čekao u ormaru pojavljuju se kad novosadski prodavac odluči da ih pusti.",
        "Beograd ima drugu adresu. Šav, mera i to da li je postava menjana stoje u opisu komada.",
      ],
    },
  },
  coats: {
    Beograd: {
      title: "Beogradski kaputi za savski vetar",
      description:
        "Kaputi i jakne iz druge ruke iz Beograda. Koža i vuna s cenom u dinarima, odvojeno od Novog Sada.",
      kicker: "Beograd · kaputi",
      heading: "Kaputi za beogradski vetar",
      emphasis: "s tuđe vešalice",
      lead: "Novembar u Beogradu ne pita da li je kaput nov. Pita da li se kopča dok vetar ide preko Kalemegdana i niz savski kej.",
      paragraphs: [
        "Ovde vise samo beogradski oglasi. Kožna jakna koja miriše na kišu, ne na naftalin, stoji ako je prodavac iz grada tako opisao. Novosadski kaput, nošen duže uz vlažan kej, ima svoju stranu.",
        "Postavu i šavove piše čovek koji ih je nosio. Dinari su na kartici. Niko ne broji koliko je puta stranica otvorena.",
      ],
    },
    "Novi Sad": {
      title: "Novosadski kaputi za maglu koja ostaje do podneva",
      description:
        "Kaputi iz druge ruke iz Novog Sada. Vuna za dunavsku maglu u podnožju Petrovaradina, cene u dinarima.",
      kicker: "Novi Sad · kaputi",
      heading: "Novosadski kaputi",
      emphasis: "za maglu do podneva",
      lead: "U Novom Sadu se kaput skida kasnije nego u Beogradu. Magla s Dunava ostane pod Petrovaradinom i kad je na Limanu već vedro.",
      paragraphs: [
        "Stranica je za novosadske prodavce. Beogradska kožna jakna se ne meša u slike da bi štand delovao punije. Ako jutros nema oglasa, polica to i kaže.",
        "Kopče, postava i džep dovoljno dubok za rukavice stoje u tekstu oglasa, ako ih prodavac pominje.",
      ],
    },
  },
  knitwear: {
    Beograd: {
      title: "Beogradska ponča za veče koje je prevarilo prognozu",
      description:
        "Trikotaža iz druge ruke iz Beograda. Pončo s resama za hladnije dorćolsko veče, cene u dinarima.",
      kicker: "Beograd · trikotaža",
      heading: "Beogradska trikotaža",
      emphasis: "preko haljine",
      lead: "Beogradsko pončo ide preko haljine kad dorćolsko veče ohladi brže nego što je jutro obećalo iznad krošnji.",
      paragraphs: [
        "Rese, krem i kraću nit priča prodavac iz grada. Novosadski pleteni komad, nošen kroz vlažnije jutro, ne dopisuje se ovde radi još jedne fotografije.",
        "Mera je često jedna, za rame kome pristaje. Cena je u dinarima, a moljci se ne pretpostavljaju ako ih prodavac nije napisao.",
      ],
    },
    "Novi Sad": {
      title: "Novosadska trikotaža za jutro pre pijace",
      description:
        "Pletena vuna iz druge ruke iz Novog Sada. Komadi za vlažno jutro pre prelaska mosta, cene u dinarima.",
      kicker: "Novi Sad · trikotaža",
      heading: "Novosadska trikotaža",
      emphasis: "pre pijace",
      lead: "U Novom Sadu se pleteno nosi do pijace i nazad, i ostaje samo ako posle trećeg nošenja ne grebe vrat dok se ide preko mosta.",
      paragraphs: [
        "Ova adresa skuplja oglase iz grada. Beogradsko pončo za Dorćol ne dolazi da popuni prazninu. Vuna i inicijali iznutra su u opisu kad ih je prodavac napisao.",
        "Ispod oglasa su drugi štandovi u Novom Sadu — kape, kaputi, farmerke — i cela pletena polica u zemlji.",
      ],
    },
  },
  denim: {
    Beograd: {
      title: "Beogradske farmerke posle tramvaja",
      description:
        "Farmerke iz druge ruke iz Beograda. Omekšao denim sa strukom i dužinom, cene u dinarima.",
      kicker: "Beograd · farmerke",
      heading: "Beogradske farmerke",
      emphasis: "koje već sede",
      lead: "U Beogradu se farmerke nose dok denim ne zaboravi policu, pa ih neko izmeri još jednom na kuhinjskom podu i pusti dalje.",
      paragraphs: [
        "Struk, dužina i trag džepa pišu se ako postoje. Novi Sad drži svoje parove na drugoj strani, čak i kad broj na papiru liči. Isti broj nije isti grad.",
        "Prodato, ako jeste prodato, nosi pečat na kartici. Ne broje se farmerke koje niko nije prodao kroz ovaj ormar.",
      ],
    },
    "Novi Sad": {
      title: "Novosadske farmerke za kej, ne za izlog",
      description:
        "Farmerke iz druge ruke iz Novog Sada. Denim nošen uz Dunav i preko Limana, cene u dinarima.",
      kicker: "Novi Sad · farmerke",
      heading: "Novosadske farmerke",
      emphasis: "za dunavski kej",
      lead: "U Novom Sadu farmerke omekšaju od sedenja na keju i od bicikla preko Limana, ne od beogradskog tramvajskog stuba.",
      paragraphs: [
        "Polica ne pozajmljuje beogradski par da bi izgledala puna. Kad novosadski prodavac objavi par, na kartici su mera, epoha i dinari.",
        "Rupe za izgled nisu obećanje ove strane. Ako je koleno celo, tako će pisati. Ako nije, i to će pisati.",
      ],
    },
  },
  accessories: {
    Beograd: {
      title: "Beogradske kape za stanicu koja se predomislila",
      description:
        "Dodaci iz druge ruke iz Beograda. Kape i sitni komadi s cenom u dinarima, odvojeno od Novog Sada.",
      kicker: "Beograd · dodaci",
      heading: "Beogradski dodaci",
      emphasis: "za džep",
      lead: "Beogradski dodatak je ono što se vadi iz džepa kad je kaput ostao kod kuće, a stanica na Bulevaru ipak zahladnela.",
      paragraphs: [
        "Kapa koja ne grebe i šal koji ne stiže u tri boje stoje ovde samo ako je prodavac iz Beograda. Novosadska pijačna vuna ima svoju stranu i svoj vlažniji vetar.",
        "Odavde se stiže do beogradskih kaputa i haljina, i do cele police dodataka u zemlji.",
      ],
    },
    "Novi Sad": {
      title: "Novosadske kape s koncem s unutrašnje strane",
      description:
        "Vuneni dodaci iz druge ruke iz Novog Sada. Kape koje ne grebu, s inicijalima iznutra, cene u dinarima.",
      kicker: "Novi Sad · dodaci",
      heading: "Novosadski dodaci",
      emphasis: "sa žutim koncem",
      lead: "U Novom Sadu se kapa uzme kad uši već odluče, obično pre nego što se pređe most. Vuna je debela, a iznutra ponekad ostanu inicijali drugim koncem.",
      paragraphs: [
        "Ova stranica ne meša te kape s beogradskim. Boja rđe i to da li grebe deo su priče samo ako ih je prodavac napisao.",
        "Cena je u dinarima. Pored kape, na drugim štandovima istog grada, stoje kaputi za maglu i farmerke nošene ispod njih.",
      ],
    },
  },
};
