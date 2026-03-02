// ─── Centralized Demo Data ──────────────────────────────────
// Used across all pages until DB is connected.

// ─── Categories ──────────────────────────────────────────────

export interface Category {
    id: string;
    slug: string;
    nameEn: string;
    nameFr: string;
    nameAr: string;
    descEn: string;
    descFr: string;
    descAr: string;
    productCount: number;
    icon?: string;
    sortOrder: number;
}

export const CATEGORIES: Category[] = [
    {
        id: "c1", slug: "roots", nameEn: "Roots & Rhizomes", nameFr: "Racines & Rhizomes", nameAr: "جذور وريزومات",
        descEn: "Powerful roots for energy and immunity", descFr: "Racines puissantes pour l'énergie et l'immunité", descAr: "جذور قوية للطاقة والمناعة", productCount: 8,
        sortOrder: 1, icon: "Leaf",
    },
    {
        id: "c2", slug: "teas", nameEn: "Herbal Teas", nameFr: "Thés & Infusions", nameAr: "شاي الأعشاب",
        descEn: "Soothing blends for daily wellness", descFr: "Mélanges apaisants pour le bien-être quotidien", descAr: "خلطات مهدئة للعافية اليومية", productCount: 12,
        sortOrder: 2, icon: "Coffee",
    },
    {
        id: "c3", slug: "extracts", nameEn: "Extracts & Powders", nameFr: "Extraits & Poudres", nameAr: "مستخلصات ومساحيق",
        descEn: "Concentrated formulas for targeted benefits", descFr: "Formules concentrées pour des bienfaits ciblés", descAr: "تركيبات مركزة لفوائد محددة", productCount: 10,
        sortOrder: 3, icon: "FlaskConical",
    },
    {
        id: "c4", slug: "flowers", nameEn: "Flowers & Blossoms", nameFr: "Fleurs", nameAr: "زهور",
        descEn: "Dried flowers for teas and remedies", descFr: "Fleurs séchées pour infusions et remèdes", descAr: "زهور مجففة للشاي والعلاج", productCount: 6,
        sortOrder: 4, icon: "Flower2",
    },
    {
        id: "c5", slug: "blends", nameEn: "TCM Blends", nameFr: "Mélanges MTC", nameAr: "خلطات الطب الصيني",
        descEn: "Traditional formulas curated by experts", descFr: "Formules traditionnelles sélectionnées par des experts", descAr: "تركيبات تقليدية منتقاة من خبراء", productCount: 5,
        sortOrder: 5, icon: "Zap",
    },
];

// ─── Products ────────────────────────────────────────────────

export interface Product {
    id: string;
    slug: string;
    categoryId: string;
    nameEn: string;
    nameFr: string;
    nameAr: string;
    descEn: string;
    descFr: string;
    descAr: string;
    benefitEn: string;
    benefitFr: string;
    benefitAr: string;
    price: number; // centimes DZD
    stock: number;
    rating: number;
    badge?: "new" | "bestseller" | "limited";
    ingredientsEn?: string;
    ingredientsFr?: string;
    ingredientsAr?: string;
    usageEn?: string;
    usageFr?: string;
    usageAr?: string;
    warningsEn?: string;
    warningsFr?: string;
    warningsAr?: string;
    origin?: string;
    tags?: string[];
    images?: string[];
}

export const PRODUCTS: Product[] = [
    {
        id: "1", slug: "ginseng-root", categoryId: "c1",
        nameEn: "Ginseng Root (6-year)", nameFr: "Racine de Ginseng (6 ans)", nameAr: "جذر الجنسنج (6 سنوات)",
        descEn: "Premium 6-year aged Korean Ginseng root. Known as the king of herbs, prized for its ability to boost energy, support cognitive function, and strengthen overall vitality.",
        descFr: "Racine de ginseng coréen vieillie 6 ans. Connue comme le roi des herbes, prisée pour stimuler l'énergie, soutenir les fonctions cognitives et renforcer la vitalité.",
        descAr: "جذر الجنسنغ الكوري عمر 6 سنوات. يُعرف بملك الأعشاب، يُقدّر لقدرته على تعزيز الطاقة ودعم الوظائف المعرفية وتقوية الحيوية.",
        benefitEn: "Energy & vitality", benefitFr: "Énergie & vitalité", benefitAr: "طاقة وحيوية",
        price: 450000, stock: 24, rating: 4.9, badge: "bestseller",
        ingredientsEn: "100% Panax Ginseng root, hand-harvested", ingredientsFr: "100% racine de Panax Ginseng, récoltée à la main", ingredientsAr: "100% جذر باناكس جنسنج، حصاد يدوي",
        usageEn: "Slice 3-5g, simmer in hot water for 15 min. Drink 2x daily.", usageFr: "Couper 3-5g, infuser dans l'eau chaude 15 min. Boire 2x/jour.", usageAr: "قطع 3-5 غرام، انقعها في ماء ساخن 15 دقيقة. اشرب مرتين يومياً.",
        warningsEn: "Not recommended during pregnancy. Consult a doctor if on medication.", warningsFr: "Déconseillé pendant la grossesse. Consultez un médecin si sous traitement.", warningsAr: "لا يُنصح به أثناء الحمل. استشر طبيباً إذا كنت تتناول أدوية.",
        origin: "Geumsan, South Korea", tags: ["energy", "immunity", "premium"],
    },
    {
        id: "2", slug: "chrysanthemum-tea", categoryId: "c2",
        nameEn: "Chrysanthemum Tea", nameFr: "Thé Chrysanthème", nameAr: "شاي الأقحوان",
        descEn: "Dried chrysanthemum flowers for soothing herbal tea. A beloved TCM staple for clearing heat, calming the mind, and supporting eye health.",
        descFr: "Fleurs de chrysanthème séchées pour une infusion apaisante. Un incontournable de la MTC pour éliminer la chaleur, apaiser l'esprit et soutenir la santé oculaire.",
        descAr: "أزهار الأقحوان المجففة لشاي الأعشاب المهدئ. عنصر أساسي في الطب الصيني لتصريف الحرارة وتهدئة العقل ودعم صحة العين.",
        benefitEn: "Calming & eye health", benefitFr: "Apaisant & santé oculaire", benefitAr: "مهدئ وصحة العين",
        price: 125000, stock: 56, rating: 4.7, badge: "new",
        ingredientsEn: "100% dried Chrysanthemum morifolium flowers", ingredientsFr: "100% fleurs séchées de Chrysanthemum morifolium", ingredientsAr: "100% أزهار مجففة من Chrysanthemum morifolium",
        usageEn: "Steep 5-8 flowers in boiling water for 3-5 min.", usageFr: "Infuser 5-8 fleurs dans l'eau bouillante 3-5 min.", usageAr: "انقع 5-8 زهرات في ماء مغلي لمدة 3-5 دقائق.",
        origin: "Hangzhou, China", tags: ["calming", "tea"],
    },
    {
        id: "3", slug: "astragalus-slices", categoryId: "c1",
        nameEn: "Astragalus Slices", nameFr: "Tranches d'Astragale", nameAr: "شرائح القتاد",
        descEn: "Wild harvested astragalus root slices. A cornerstone of TCM for strengthening the immune system, increasing energy, and promoting longevity.",
        descFr: "Tranches de racine d'astragale sauvage. Pilier de la MTC pour renforcer le système immunitaire, augmenter l'énergie et favoriser la longévité.",
        descAr: "شرائح جذر القتاد البري. ركيزة في الطب الصيني لتقوية الجهاز المناعي وزيادة الطاقة وتعزيز طول العمر.",
        benefitEn: "Immune support", benefitFr: "Soutien immunitaire", benefitAr: "دعم المناعة",
        price: 320000, stock: 18, rating: 4.8,
        ingredientsEn: "100% Astragalus membranaceus root", ingredientsFr: "100% racine d'Astragalus membranaceus", ingredientsAr: "100% جذر Astragalus membranaceus",
        usageEn: "Add 5-10 slices to soups or boil as tea.", usageFr: "Ajouter 5-10 tranches aux soupes ou bouillir en thé.", usageAr: "أضف 5-10 شرائح للحساء أو اغلها كشاي.",
        origin: "Inner Mongolia, China", tags: ["immunity", "energy"],
    },
    {
        id: "4", slug: "goji-berries", categoryId: "c3",
        nameEn: "Goji Berries (Organic)", nameFr: "Baies de Goji (Bio)", nameAr: "توت غوجي (عضوي)",
        descEn: "Sun-dried organic goji berries, rich in antioxidants and vitamin C. Used for centuries to support liver and kidney health and improve vision.",
        descFr: "Baies de goji biologiques séchées au soleil, riches en antioxydants et vitamine C. Utilisées depuis des siècles pour soutenir le foie et les reins et améliorer la vision.",
        descAr: "توت غوجي عضوي مجفف بالشمس، غني بمضادات الأكسدة وفيتامين C. يُستخدم منذ قرون لدعم صحة الكبد والكلى وتحسين الرؤية.",
        benefitEn: "Antioxidant powerhouse", benefitFr: "Puissant antioxydant", benefitAr: "قوة مضادات الأكسدة",
        price: 280000, stock: 42, rating: 4.6, badge: "bestseller",
        origin: "Ningxia, China", tags: ["antioxidant", "organic"],
    },
    {
        id: "5", slug: "reishi-mushroom", categoryId: "c3",
        nameEn: "Reishi Mushroom (Lingzhi)", nameFr: "Champignon Reishi (Lingzhi)", nameAr: "فطر ريشي (لينغزي)",
        descEn: "Wild lingzhi mushroom slices. The 'Mushroom of Immortality' — renowned for promoting calm, supporting immune function, and enhancing longevity.",
        descFr: "Tranches de champignon lingzhi sauvage. Le 'champignon de l'immortalité' — réputé pour favoriser le calme, soutenir l'immunité et améliorer la longévité.",
        descAr: "شرائح فطر لينغزي البري. 'فطر الخلود' — مشهور بتعزيز الهدوء ودعم المناعة وتحسين طول العمر.",
        benefitEn: "Calm & longevity", benefitFr: "Calme & longévité", benefitAr: "هدوء وطول عمر",
        price: 520000, stock: 3, rating: 4.9, badge: "limited",
        origin: "Fujian, China", tags: ["premium", "immunity", "calm"],
    },
    {
        id: "6", slug: "jasmine-pearl-tea", categoryId: "c2",
        nameEn: "Jasmine Pearl Tea", nameFr: "Thé Perle de Jasmin", nameAr: "شاي لؤلؤ الياسمين",
        descEn: "Hand-rolled jasmine pearl green tea from Fujian province. Each pearl unfurls to release a fragrant jasmine aroma with a smooth, sweet finish.",
        descFr: "Thé vert perles de jasmin roulées à la main de la province de Fujian. Chaque perle se déroule pour libérer un arôme de jasmin avec une finale douce.",
        descAr: "شاي أخضر بلؤلؤ الياسمين ملفوف يدوياً من مقاطعة فوجيان. كل لؤلؤة تنفتح لتطلق رائحة الياسمين العطرة بنهاية ناعمة.",
        benefitEn: "Relaxation & digestion", benefitFr: "Relaxation & digestion", benefitAr: "استرخاء وهضم",
        price: 380000, stock: 31, rating: 4.8,
        origin: "Fuzhou, Fujian, China", tags: ["tea", "premium"],
    },
    {
        id: "7", slug: "angelica-sinensis", categoryId: "c1",
        nameEn: "Angelica Root (Dang Gui)", nameFr: "Racine d'Angélique (Dang Gui)", nameAr: "جذر أنجليكا (دانغ قوي)",
        descEn: "The 'female ginseng' — a foundational herb in TCM women's health formulas, supporting blood circulation and hormonal balance.",
        descFr: "Le 'ginseng féminin' — une herbe fondamentale dans les formules de santé féminine MTC, soutenant la circulation sanguine et l'équilibre hormonal.",
        descAr: "جنسنج المرأة — عشبة أساسية في تركيبات صحة المرأة بالطب الصيني، تدعم الدورة الدموية والتوازن الهرموني.",
        benefitEn: "Women's health", benefitFr: "Santé féminine", benefitAr: "صحة المرأة",
        price: 290000, stock: 35, rating: 4.7, badge: "new",
        origin: "Gansu, China", tags: ["women", "circulation"],
    },
    {
        id: "8", slug: "longjing-green-tea", categoryId: "c2",
        nameEn: "Dragon Well Green Tea", nameFr: "Thé Vert Puits du Dragon", nameAr: "شاي التنين الأخضر",
        descEn: "Premium Longjing (Dragon Well) green tea. One of China's ten famous teas, known for its flat leaves, jade color, and sweet chestnut aroma.",
        descFr: "Thé vert Longjing (Puits du Dragon) premium. L'un des dix thés célèbres de Chine, connu pour ses feuilles plates, sa couleur jade et son arôme de châtaigne.",
        descAr: "شاي لونغ جينغ (بئر التنين) الأخضر الممتاز. أحد أشهر عشرة أنواع شاي في الصين، يتميز بأوراقه المسطحة ولونه اليشمي.",
        benefitEn: "Focus & metabolism", benefitFr: "Concentration & métabolisme", benefitAr: "تركيز وأيض",
        price: 420000, stock: 15, rating: 4.9,
        origin: "West Lake, Hangzhou, China", tags: ["tea", "premium", "focus"],
    },
    {
        id: "9", slug: "licorice-root", categoryId: "c1",
        nameEn: "Licorice Root (Gan Cao)", nameFr: "Racine de Réglisse (Gan Cao)", nameAr: "جذر العرق سوس (قان تساو)",
        descEn: "The great harmonizer — used in TCM to balance and enhance other herbs. Supports digestive health, soothes sore throats, and has natural anti-inflammatory properties.",
        descFr: "Le grand harmoniseur — utilisé en MTC pour équilibrer et renforcer d'autres herbes. Soutient la santé digestive et possède des propriétés anti-inflammatoires.",
        descAr: "المنسّق العظيم — يُستخدم في الطب الصيني لتوازن الأعشاب الأخرى وتعزيزها. يدعم صحة الجهاز الهضمي ويهدئ التهاب الحلق.",
        benefitEn: "Digestive harmony", benefitFr: "Harmonie digestive", benefitAr: "توازن الجهاز الهضمي",
        price: 150000, stock: 60, rating: 4.5,
        origin: "Xinjiang, China", tags: ["digestive", "balanced"],
    },
    {
        id: "10", slug: "immunity-blend", categoryId: "c5",
        nameEn: "Immunity Shield Blend", nameFr: "Mélange Bouclier Immunitaire", nameAr: "خلطة درع المناعة",
        descEn: "A curated TCM blend of astragalus, goji, reishi, and licorice root — designed to fortify natural defenses and support year-round immune health.",
        descFr: "Un mélange MTC d'astragale, goji, reishi et réglisse — conçu pour fortifier les défenses naturelles et soutenir l'immunité toute l'année.",
        descAr: "خلطة طب صيني من القتاد والغوجي والريشي والعرق سوس — مصممة لتعزيز الدفاعات الطبيعية ودعم المناعة على مدار السنة.",
        benefitEn: "Full-spectrum immunity", benefitFr: "Immunité complète", benefitAr: "مناعة شاملة",
        price: 680000, stock: 8, rating: 4.9, badge: "bestseller",
        origin: "HerbVault Formulation", tags: ["blend", "immunity", "premium"],
    },
];

// ─── Demo Orders ─────────────────────────────────────────────

export type OrderStatus = "pending" | "confirmed" | "shipping" | "delivered";

export interface Order {
    id: string;
    orderNumber: number;
    customerName: string;
    customerPhone: string;
    wilaya: string;
    commune: string;
    address: string;
    items: { productId: string; name: string; qty: number; price: number }[];
    subtotal: number;
    shippingFee: number;
    total: number;
    status: OrderStatus;
    createdAt: string;
    confirmedAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
}

export const ORDERS: Order[] = [
    {
        id: "o1", orderNumber: 1001, customerName: "أحمد بن محمد", customerPhone: "0551234567",
        wilaya: "Alger", commune: "Bab El Oued", address: "12 Rue Arbadji Abderrahmane",
        items: [
            { productId: "1", name: "Ginseng Root", qty: 1, price: 450000 },
            { productId: "4", name: "Goji Berries", qty: 2, price: 280000 },
        ],
        subtotal: 1010000, shippingFee: 40000, total: 1050000,
        status: "confirmed", createdAt: "2026-02-23T10:00:00Z", confirmedAt: "2026-02-23T11:30:00Z",
    },
    {
        id: "o2", orderNumber: 1002, customerName: "Fatima Zahra Benmoussa", customerPhone: "0661234567",
        wilaya: "Blida", commune: "Blida Centre", address: "45 Rue Ben Boulaïd",
        items: [{ productId: "6", name: "Jasmine Pearl Tea", qty: 1, price: 380000 }],
        subtotal: 380000, shippingFee: 40000, total: 420000,
        status: "shipping", createdAt: "2026-02-22T14:00:00Z", confirmedAt: "2026-02-22T16:00:00Z", shippedAt: "2026-02-23T08:00:00Z",
    },
    {
        id: "o3", orderNumber: 1003, customerName: "Karim Bousaad", customerPhone: "0771234567",
        wilaya: "Oran", commune: "Oran Centre", address: "8 Bd Emir Abdelkader",
        items: [{ productId: "5", name: "Reishi Mushroom", qty: 1, price: 520000 }],
        subtotal: 520000, shippingFee: 70000, total: 590000,
        status: "pending", createdAt: "2026-02-24T09:00:00Z",
    },
    {
        id: "o4", orderNumber: 1004, customerName: "نورية عيسى", customerPhone: "0551112233",
        wilaya: "Constantine", commune: "El Khroub", address: "22 Cité des Oliviers",
        items: [
            { productId: "10", name: "Immunity Blend", qty: 1, price: 680000 },
            { productId: "9", name: "Licorice Root", qty: 2, price: 150000 },
        ],
        subtotal: 980000, shippingFee: 70000, total: 1050000,
        status: "confirmed", createdAt: "2026-02-22T11:00:00Z", confirmedAt: "2026-02-23T09:00:00Z",
    },
    {
        id: "o5", orderNumber: 1005, customerName: "Yacine Djamel", customerPhone: "0661223344",
        wilaya: "Sétif", commune: "Sétif Ville", address: "3 Rue du 8 Mai 1945",
        items: [{ productId: "3", name: "Astragalus Slices", qty: 1, price: 320000 }],
        subtotal: 320000, shippingFee: 70000, total: 390000,
        status: "pending", createdAt: "2026-02-24T15:00:00Z",
    },
    {
        id: "o6", orderNumber: 1006, customerName: "سمية بلعيد", customerPhone: "0771223344",
        wilaya: "Alger", commune: "Hussein Dey", address: "15 Rue Hassiba Ben Bouali",
        items: [
            { productId: "2", name: "Chrysanthemum Tea", qty: 3, price: 125000 },
            { productId: "8", name: "Dragon Well Tea", qty: 1, price: 420000 },
        ],
        subtotal: 795000, shippingFee: 40000, total: 835000,
        status: "delivered", createdAt: "2026-02-20T10:00:00Z", confirmedAt: "2026-02-20T12:00:00Z",
        shippedAt: "2026-02-21T08:00:00Z", deliveredAt: "2026-02-22T14:00:00Z",
    },
];

// ─── Algeria Wilayas (simplified) ────────────────────────────

export const WILAYAS = [
    { code: "01", name: "Adrar" }, { code: "02", name: "Chlef" }, { code: "03", name: "Laghouat" },
    { code: "04", name: "Oum El Bouaghi" }, { code: "05", name: "Batna" }, { code: "06", name: "Béjaïa" },
    { code: "07", name: "Biskra" }, { code: "08", name: "Béchar" }, { code: "09", name: "Blida" },
    { code: "10", name: "Bouira" }, { code: "11", name: "Tamanrasset" }, { code: "12", name: "Tébessa" },
    { code: "13", name: "Tlemcen" }, { code: "14", name: "Tiaret" }, { code: "15", name: "Tizi Ouzou" },
    { code: "16", name: "Alger" }, { code: "17", name: "Djelfa" }, { code: "18", name: "Jijel" },
    { code: "19", name: "Sétif" }, { code: "20", name: "Saïda" }, { code: "21", name: "Skikda" },
    { code: "22", name: "Sidi Bel Abbès" }, { code: "23", name: "Annaba" }, { code: "24", name: "Guelma" },
    { code: "25", name: "Constantine" }, { code: "26", name: "Médéa" }, { code: "27", name: "Mostaganem" },
    { code: "28", name: "M'Sila" }, { code: "29", name: "Mascara" }, { code: "30", name: "Ouargla" },
    { code: "31", name: "Oran" }, { code: "32", name: "El Bayadh" }, { code: "33", name: "Illizi" },
    { code: "34", name: "Bordj Bou Arréridj" }, { code: "35", name: "Boumerdès" },
    { code: "36", name: "El Tarf" }, { code: "37", name: "Tindouf" }, { code: "38", name: "Tissemsilt" },
    { code: "39", name: "El Oued" }, { code: "40", name: "Khenchela" }, { code: "41", name: "Souk Ahras" },
    { code: "42", name: "Tipaza" }, { code: "43", name: "Mila" }, { code: "44", name: "Aïn Defla" },
    { code: "45", name: "Naâma" }, { code: "46", name: "Aïn Témouchent" }, { code: "47", name: "Ghardaïa" },
    { code: "48", name: "Relizane" }, { code: "49", name: "El M'Ghair" }, { code: "50", name: "El Meniaa" },
    { code: "51", name: "Ouled Djellal" }, { code: "52", name: "Bordj Badji Mokhtar" },
    { code: "53", name: "Béni Abbès" }, { code: "54", name: "Timimoun" }, { code: "55", name: "Touggourt" },
    { code: "56", name: "Djanet" }, { code: "57", name: "In Salah" }, { code: "58", name: "In Guezzam" },
];

// Shipping fee zones (simplified to 3 tiers)
export function getShippingFee(wilayaCode: string): number {
    const zone1 = ["09", "16", "35", "42"]; // Alger metro
    const zone2 = ["02", "06", "10", "13", "15", "18", "19", "21", "23", "25", "26", "27", "29", "31", "34", "36", "43", "44", "46", "48"];
    if (zone1.includes(wilayaCode)) return 40000; // 400 DA
    if (zone2.includes(wilayaCode)) return 60000; // 600 DA
    return 80000; // 800 DA
}
