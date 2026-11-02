import type { CategoryKey } from "../../types";
import type { PlaceCopy } from "./types";

export const sqCategory: Record<CategoryKey, PlaceCopy> = {
  dresses: {
    title: "Fustane që e kanë një mbrëmje pas",
    description:
      "Pambuk i viteve ’50 dhe shifon që rrotullohet, nga shitës në Tiranë dhe në Durrës. Çmime në lekë, secili me masën e vet.",
    kicker: "Raft · fustane",
    heading: "Fustane",
    emphasis: "me një mbrëmje tjetër në tegel",
    lead: "Këtu fustani nuk vjen nga vitrina. Vjen nga dollapi, me livando mes paleve dhe me një ftesë që ka kaluar.",
    paragraphs: [
      "Rruga është e shkurtër: qepet ose blihet për dasmë, vishet një herë, mbyllet. Në raft qëndrojnë pambuku me lule të vogla, maksi që rrotullohet kur ecën, dhe prerjet që shitësi i përshkruan me fjalë.",
      "Tirana dhe Durrësi i mbajnë njoftimet veç, poshtë kësaj faqeje. Çmimi është në lekë. Gjendja — një kopsë e qepur sërish, astar i ndërruar, tegela të plota — qëndron te copa.",
    ],
  },
  coats: {
    title: "Pallto për erë që nuk pyet për stinën",
    description:
      "Pallto leshi dhe xhaketa të dorës së dytë në Shqipëri. Shitës nga Tirana dhe Durrësi, çmime në lekë.",
    kicker: "Raft · pallto",
    heading: "Pallto",
    emphasis: "që ende kopsohen",
    lead: "Palltoja këtu ka dimra pas vetes, jo fushatë. Lihet kur varësja në shtëpi nuk mban dot një tjetër.",
    paragraphs: [
      "Era e Tiranës nga Dajti do diçka që lidhet në bel derisa të vijë autobusi te bulevardi. Durrësi e mban pallton më shkurt, sepse lagështia e detit dhe pranvera e kripur vijnë më herët. Prandaj qytetet nuk e ndajnë të njëjtën varëse.",
      "Kopsat, astarin dhe ngjyrën i shkruan shitësi. Nuk ka vlerësim të palltos nga njerëz që nuk e kanë veshur.",
    ],
  },
  knitwear: {
    title: "Trikotazh me sythe që duken",
    description:
      "Ponço dhe copa të thurura të dorës së dytë, nga Tirana dhe Durrësi. Lesh i punuar me dorë, çmime në lekë.",
    kicker: "Raft · trikotazh",
    heading: "Trikotazh",
    emphasis: "me një thekë më të shkurtër",
    lead: "E thurura njihet nga gabimi që dikush vendosi të mos e fshehë: një thekë më e shkurtër, një rresht i përsëritur në mbrëmje, iniciale nga brenda.",
    paragraphs: [
      "Ponçoja vihet mbi fustan kur mbrëmja në Tiranë ftohet më shpejt se parashikimi, ose kur mëngjesi në Durrës ende mban lagështi deti. Ngroh sa një shall dhe një triko bashkë.",
      "Tenja përmendet vetëm nëse e ka përmendur shitësi. Zgjidhni qytetin — thekët e Tiranës dhe leshi i Durrësit nuk varen në të njëjtin vend.",
    ],
  },
  denim: {
    title: "Xhins që nuk kërcasin më",
    description:
      "Denim i dorës së dytë në Shqipëri, me bel dhe gjatësi si në etiketën e vjetër. Tiranë, Durrës, çmime në lekë.",
    kicker: "Raft · xhins",
    heading: "Xhins",
    emphasis: "të zbutura, jo të shqyera për vitrinë",
    lead: "Denimi i ri mban formë në raft. Ky ka ndenjur në karrige, në autobus dhe nën pallto, dhe gjuri është i plotë nëse kështu shkruan.",
    paragraphs: [
      "Në kartë qëndrojnë beli dhe gjatësia, ndonjëherë prerja me emër, ndonjëherë një njollë e zbehtë xhepi. Njolla nuk fshihet nga përshkrimi që copa të duket më e re.",
      "Tirana dhe Durrësi kanë faqet e veta. Nëse numri nuk është këtë mëngjes, rafti nuk premton se do të vijë.",
    ],
  },
  accessories: {
    title: "Aksesorë që e mbyllin pallton",
    description:
      "Kapele dhe copa të vogla të dorës së dytë në Tiranë dhe në Durrës. Lesh që nuk gërvisht, çmime në lekë.",
    kicker: "Raft · aksesorë",
    heading: "Aksesorë",
    emphasis: "për kokë dhe për xhep",
    lead: "Kur palltoja është zgjedhur, mbeten kapelja, shalli dhe e vogla që nxirret nga xhepi në stacion.",
    paragraphs: [
      "Këtu aksesori nuk vjen në komplet me tri ngjyra. Është lesh që nuk gërvisht ballin, fill me ngjyrë tjetër nga brenda, copë e blerë në pazar dhe jo në vitrinë.",
      "Tirana dhe Durrësi janë adresa të ndara poshtë kësaj faqeje. Çmimet janë në lekë, dhe stenda bosh lihet bosh.",
    ],
  },
};

export const sqCity: Record<CategoryKey, Record<string, PlaceCopy>> = {
  dresses: {
    Tiranë: {
      title: "Fustane të Tiranës pas ftesës",
      description:
        "Fustane të dorës së dytë nga shitës në Tiranë. Pambuk dhe shifon me çmim në lekë, veç nga rafti i Durrësit.",
      kicker: "Tiranë · fustane",
      heading: "Fustane të Tiranës",
      emphasis: "pas ftesës",
      lead: "Në Tiranë fustani del shpesh një herë: një sallë pas Bllokut, një darkë, pastaj varësja dhe livando në astar derisa bulevardi të jetë ende i ndezur.",
      paragraphs: [
        "Shitësit e qytetit shkruajnë prerjen dhe rregullimin. Lule të vogla të kuqe nga vitet ’50 mund të qëndrojnë pranë një maksi, por vetëm nëse e ka njoftuar dikush nga Tirana. Fustani i Durrësit nuk kalohet këtu për të mbushur rreshtin.",
        "Masa dhe lekët janë në kartë. I gjithë rafti i fustaneve në vend, bashkë me Durrësin, lidhet poshtë njoftimeve.",
      ],
    },
    Durrës: {
      title: "Fustane të Durrësit për dasmë pranë detit",
      description:
        "Fustane të dorës së dytë nga Durrësi. Pambuk dhe shifon për lagështinë e kripur, çmime në lekë.",
      kicker: "Durrës · fustane",
      heading: "Fustane të Durrësit",
      emphasis: "pranë detit",
      lead: "Durrësi e mat fustanin me një mbrëmje dasme ku era e detit hyn në pambuk, jo me ecjen e Bllokut. Livandoja në dollap konkurron me kripën.",
      paragraphs: [
        "Në këtë faqe janë vetëm njoftimet ku qyteti është Durrës. Një fustan lulesh i veshur në dasmë, pastaj i lënë me livando, shfaqet kur shitësi durrsak e lëshon, jo kur Tirana ka tepricë.",
        "Tirana ka adresë tjetër. Tegeli, masa dhe nëse një kopsë në bel është qepur sërish qëndrojnë te copa.",
      ],
    },
  },
  coats: {
    Tiranë: {
      title: "Pallto të Tiranës për erën e Dajtit",
      description:
        "Pallto dhe xhaketa të dorës së dytë nga Tirana. Lesh që lidhet në bel, çmime në lekë.",
      kicker: "Tiranë · pallto",
      heading: "Pallto për erën e Tiranës",
      emphasis: "nga një varëse tjetër",
      lead: "Nëntori në Tiranë nuk pyet nëse palltoja është e re. Pyet nëse rripi mban derisa të presësh autobus, dhe nëse xhepi i merr dorezat kur zbret era nga Dajti.",
      paragraphs: [
        "Këtu varen vetëm njoftimet e Tiranës. Palltoja e Durrësit, e mbajtur më shkurt për shkak të detit, ka faqe tjetër. Raft bosh do të thotë se këtë mëngjes nuk ka njoftim të ri nga qyteti.",
        "Astarin dhe kopsat i shkruan ai që e ka veshur. Lekët qëndrojnë në kartën e verdhë.",
      ],
    },
    Durrës: {
      title: "Pallto të Durrësit për pranverë që vjen me kripë",
      description:
        "Pallto të dorës së dytë nga Durrësi. Trench i rëndë dhe bomber sateni për një dimër më të shkurtër, çmime në lekë.",
      kicker: "Durrës · pallto",
      heading: "Pallto të Durrësit",
      emphasis: "për dimër të shkurtër",
      lead: "Në Durrës palltoja hiqet më herët se në Tiranë. Pranvera e kripur vjen në rrugët pranë murit, ndërsa në bulevardin tiranë jaka ende ngrihet.",
      paragraphs: [
        "Prandaj këtu mund të qëndrojnë edhe leshi i rëndë, edhe bomberi i satenit në ngjyrë ndryshku, për një mbrëmje pa borë. Të dyja janë të Durrësit vetëm nëse shitësi është nga qyteti.",
        "Palltot e Tiranës nuk përzihen në foto. Gjendja — zinxhir që ecën, elastik që ende mban — është fjali e njoftimit.",
      ],
    },
  },
  knitwear: {
    Tiranë: {
      title: "Ponço të Tiranës për mbrëmje që e ka gënjyer parashikimin",
      description:
        "Trikotazh i dorës së dytë nga Tirana. Ponço me thekë për një mbrëmje më të ftohtë në Bllok, çmime në lekë.",
      kicker: "Tiranë · trikotazh",
      heading: "Trikotazh i Tiranës",
      emphasis: "mbi fustan",
      lead: "Ponçoja e Tiranës vihet mbi fustan kur mbrëmja në Bllok ftohet më shpejt se sa e ka premtuar dita mbi Dajt.",
      paragraphs: [
        "Thekët, kremi dhe filli më i shkurtër i tregon shitësi i qytetit. E thurura e Durrësit, e mbajtur në një mëngjes më të butë, nuk shtohet këtu për një fotografi më shumë.",
        "Masa shpesh është një, për supin që e duron. Çmimi është në lekë, dhe tenja nuk merret si e mirëqenë nëse shitësi nuk e ka shkruar.",
      ],
    },
    Durrës: {
      title: "Trikotazh i Durrësit për mëngjes me lagështi deti",
      description:
        "Lesh i thurur i dorës së dytë nga Durrësi. Copa për mëngjes të lagësht pranë murit, çmime në lekë.",
      kicker: "Durrës · trikotazh",
      heading: "Trikotazh i Durrësit",
      emphasis: "para kafesë te muri",
      lead: "Në Durrës e thurura vishet në mëngjesin kur deti ende lë lagështi në rrugë, dhe hiqet më herët se në Tiranë, sapo dielli hap murin.",
      paragraphs: [
        "Kjo faqe mbledh njoftimet e qytetit. Ponçoja e Tiranës për bulevardin nuk vjen të mbushë një vend bosh. Leshi dhe inicialet nga brenda janë në përshkrim nëse i ka shkruar shitësi.",
        "Poshtë njoftimeve janë stendat e tjera në Durrës — kapele, pallto, xhins — dhe i gjithë rafti i thurur i vendit.",
      ],
    },
  },
  denim: {
    Tiranë: {
      title: "Xhins të Tiranës pas autobusit",
      description:
        "Xhins të dorës së dytë nga Tirana. Denim i zbutur me bel dhe gjatësi, çmime në lekë.",
      kicker: "Tiranë · xhins",
      heading: "Xhins të Tiranës",
      emphasis: "që kanë ndenjur",
      lead: "Në Tiranë xhinsi vishet derisa denimi ta harrojë raftin, pastaj dikush e mat edhe një herë në dyshemenë e kuzhinës dhe e lë.",
      paragraphs: [
        "Beli, gjatësia dhe gjurma e xhepit shkruhen nëse janë. Durrësi i mban çiftet e veta në faqe tjetër, edhe kur numri në letër përputhet. I njëjti numër nuk është i njëjti qytet.",
        "E shitura, nëse është shitur, mban vulën në kartë. Nuk numërohen xhins që askush nuk i ka shitur përmes këtij dollapi.",
      ],
    },
    Durrës: {
      title: "Xhins të Durrësit për pranverë pa pallto",
      description:
        "Xhins të dorës së dytë nga Durrësi. Denim i veshur kur era e detit e zëvendëson dimrin, çmime në lekë.",
      kicker: "Durrës · xhins",
      heading: "Xhins të Durrësit",
      emphasis: "pa pallton e Tiranës",
      lead: "Në Durrës xhinsi del nën pallto më herët. Zbutet nga ecja pranë detit dhe nga ndenja në mur, jo nga autobusi i bulevardit.",
      paragraphs: [
        "Rafti nuk merr hua një çift tiran për të duket plot. Kur një shitës durrsak njofton një çift, në kartë janë masa, epoka dhe lekët.",
        "Vrimat për stil nuk janë premtim i faqes. Nëse gjuri është i plotë, kështu do të shkruhet. Nëse nuk është, edhe kjo do të shkruhet.",
      ],
    },
  },
  accessories: {
    Tiranë: {
      title: "Kapele të Tiranës për një mbrëmje që është penduar",
      description:
        "Aksesorë të dorës së dytë nga Tirana. Kapele dhe copa të vogla me çmim në lekë, veç nga Durrësi.",
      kicker: "Tiranë · aksesorë",
      heading: "Aksesorë të Tiranës",
      emphasis: "për xhepin",
      lead: "Aksesori i Tiranës është ajo që nxirret nga xhepi kur palltoja ka mbetur në shtëpi dhe stacioni pranë bulevardit është ftohur pas nëntës.",
      paragraphs: [
        "Kapelë që nuk gërvisht dhe shall që nuk vjen në tri ngjyra qëndrojnë këtu vetëm nëse shitësi është nga Tirana. Leshi i pazarit të Durrësit ka faqen e vet.",
        "Nga këtu arrihet te palltot dhe fustanet e Tiranës, dhe te i gjithë rafti i aksesorëve në vend.",
      ],
    },
    Durrës: {
      title: "Kapele të Durrësit për mëngjes që s’është ende pranverë",
      description:
        "Aksesorë leshi të dorës së dytë nga Durrësi. Kapele që nuk gërvishtin, me kripë të lehtë në lesh, çmime në lekë.",
      kicker: "Durrës · aksesorë",
      heading: "Aksesorë të Durrësit",
      emphasis: "me fill të verdhë",
      lead: "Në Durrës kapelja mbahet në javët kur deti duket i ngrohtë dhe era ende nuk është. Hiqet më herët se në Tiranë, pastaj mbetet në dollap me kripë të lehtë në lesh.",
      paragraphs: [
        "Kjo faqe nuk i përzien këto kapele me ato të Tiranës. Ngjyra, gërvishtja dhe inicialet e qëndisura nga brenda janë pjesë e njoftimit vetëm nëse i ka shkruar shitësi.",
        "Çmimi është në lekë. Pranë kapeles, në stenda të tjera të së njëjtit qytet, qëndrojnë palltoja e dimrit të shkurtër dhe xhinsi që del menjëherë pas saj.",
      ],
    },
  },
};
