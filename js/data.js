/* ZEKRA — seed data
   All content is bilingual (ar / en). Imagery uses CSS gradients + icons
   so the app works fully offline with zero broken images. */

window.ZEKRA_DATA = (function () {
  // Event categories (the occasions ZEKRA plans)
  const categories = [
    { id: "weddings",    icon: "rings",   ar: "أفراح",        en: "Weddings",    grad: ["#3d1f63", "#a06cd5"] },
    { id: "engagements", icon: "heart",   ar: "خطوبة",        en: "Engagements", grad: ["#5b2a8c", "#c9a6ec"] },
    { id: "birthdays",   icon: "cake",    ar: "أعياد ميلاد",  en: "Birthdays",   grad: ["#6b2d8c", "#e0b3ff"] },
    { id: "henna",       icon: "henna",   ar: "حنة",          en: "Henna",       grad: ["#2a1745", "#b491d6"] },
    { id: "corporate",   icon: "case",    ar: "شركات",        en: "Corporate",   grad: ["#1a0f2e", "#7c3aab"] }
  ];

  // Service types (the vendors ZEKRA aggregates)
  const services = [
    { id: "venues",       icon: "venue",  ar: "قاعات",        en: "Venues" },
    { id: "photography",  icon: "camera", ar: "تصوير",        en: "Photography" },
    { id: "makeup",       icon: "makeup", ar: "ميكب",         en: "Makeup" },
    { id: "catering",     icon: "dish",   ar: "بوفيه",        en: "Catering" },
    { id: "planners",     icon: "star",   ar: "منظمي حفلات",  en: "Planners" },
    { id: "entertainment",icon: "music",  ar: "دي جي",        en: "DJ & Band" },
    { id: "decor",        icon: "flower", ar: "ديكور وزهور",  en: "Decor" },
    { id: "cakes",        icon: "cake",   ar: "تورت",         en: "Cakes" }
  ];

  // Budget tiers used for filtering
  const budgets = [
    { id: "low",     ar: "اقتصادي", en: "Budget" },
    { id: "medium",  ar: "متوسط",   en: "Medium" },
    { id: "premium", ar: "بريميم",  en: "Premium" }
  ];

  const areas = [
    { ar: "القاهرة",     en: "Cairo" },
    { ar: "الجيزة",      en: "Giza" },
    { ar: "الإسكندرية",  en: "Alexandria" },
    { ar: "المنصورة",    en: "Mansoura" }
  ];

  // Vendor catalogue
  const vendors = [
    {
      id: "v1", service: "venues", budget: "premium", area: 0,
      ar: "قاعة النور", en: "Al Noor Hall",
      descAr: "قاعة أفراح فاخرة تتسع لـ 500 ضيف بإطلالة على النيل وإضاءة رومانسية.",
      descEn: "Luxury wedding hall for up to 500 guests, Nile view and romantic lighting.",
      rating: 4.9, reviews: 214, price: 45000, grad: ["#3d1f63", "#a06cd5"],
      tags: ["weddings", "engagements", "corporate"]
    },
    {
      id: "v2", service: "venues", budget: "medium", area: 1,
      ar: "حديقة أزهار", en: "Azhar Garden",
      descAr: "حديقة مفتوحة مثالية للأفراح والخطوبة في الهواء الطلق.",
      descEn: "Open-air garden, perfect for outdoor weddings and engagements.",
      rating: 4.6, reviews: 132, price: 22000, grad: ["#5b2a8c", "#c9a6ec"],
      tags: ["weddings", "engagements", "birthdays"]
    },
    {
      id: "v3", service: "photography", budget: "premium", area: 0,
      ar: "استوديو لمسة", en: "Lamsa Studio",
      descAr: "فريق تصوير وفيديو سينمائي مع ألبوم فاخر وتسليم خلال أسبوع.",
      descEn: "Cinematic photo & video team, premium album, one-week delivery.",
      rating: 4.9, reviews: 301, price: 18000, grad: ["#2a1745", "#b491d6"],
      tags: ["weddings", "engagements", "birthdays", "corporate"]
    },
    {
      id: "v4", service: "photography", budget: "low", area: 2,
      ar: "عدسة سارة", en: "Sara Lens",
      descAr: "مصورة محترفة بأسعار مناسبة للمناسبات الصغيرة.",
      descEn: "Professional photographer with friendly prices for small events.",
      rating: 4.4, reviews: 88, price: 4500, grad: ["#6b2d8c", "#e0b3ff"],
      tags: ["birthdays", "engagements", "henna"]
    },
    {
      id: "v5", service: "makeup", budget: "premium", area: 0,
      ar: "ميك أب رنا", en: "Rana Makeup",
      descAr: "خبيرة تجميل للعرائس مع بروفة مجانية ومنتجات عالمية.",
      descEn: "Bridal makeup artist with a free trial and premium products.",
      rating: 4.8, reviews: 176, price: 6000, grad: ["#3d1f63", "#c9a6ec"],
      tags: ["weddings", "engagements", "henna"]
    },
    {
      id: "v6", service: "catering", budget: "medium", area: 1,
      ar: "مطبخ الضيافة", en: "Diyafa Kitchen",
      descAr: "بوفيه مفتوح شرقي وغربي يبدأ من 250 جنيه للفرد.",
      descEn: "Open buffet, oriental & western, starting 250 EGP per guest.",
      rating: 4.5, reviews: 143, price: 250, unitAr: "للفرد", unitEn: "/guest",
      grad: ["#5b2a8c", "#a06cd5"], tags: ["weddings", "engagements", "corporate"]
    },
    {
      id: "v7", service: "catering", budget: "premium", area: 0,
      ar: "شيف كوكب", en: "Chef Kawkab",
      descAr: "قوائم طعام فاخرة ومحطات حية للحفلات الكبيرة.",
      descEn: "Fine-dining menus and live stations for grand events.",
      rating: 4.7, reviews: 97, price: 480, unitAr: "للفرد", unitEn: "/guest",
      grad: ["#2a1745", "#b491d6"], tags: ["weddings", "corporate"]
    },
    {
      id: "v8", service: "planners", budget: "premium", area: 0,
      ar: "زفة تنظيم", en: "Zaffa Events",
      descAr: "تخطيط وتنظيم كامل من الألف للياء مع منسق ليلة الحفل.",
      descEn: "Full A-to-Z planning with an on-the-night coordinator.",
      rating: 5.0, reviews: 64, price: 25000, grad: ["#3d1f63", "#e0b3ff"],
      tags: ["weddings", "engagements", "corporate"]
    },
    {
      id: "v9", service: "entertainment", budget: "medium", area: 1,
      ar: "دي جي أمير", en: "DJ Amir",
      descAr: "دي جي وساوند احترافي مع إضاءة ليزر لكل المناسبات.",
      descEn: "Pro DJ and sound with laser lighting for all occasions.",
      rating: 4.6, reviews: 121, price: 8000, grad: ["#6b2d8c", "#c9a6ec"],
      tags: ["weddings", "birthdays", "corporate"]
    },
    {
      id: "v10", service: "entertainment", budget: "premium", area: 0,
      ar: "فرقة نغم", en: "Nagham Band",
      descAr: "فرقة موسيقية حية وزفة شرقي تقليدية للأفراح.",
      descEn: "Live band and traditional oriental zaffa for weddings.",
      rating: 4.8, reviews: 73, price: 15000, grad: ["#2a1745", "#a06cd5"],
      tags: ["weddings", "engagements"]
    },
    {
      id: "v11", service: "decor", budget: "medium", area: 2,
      ar: "لمسة ورد", en: "Ward Decor",
      descAr: "تنسيق زهور وديكور مسرح الكوشة بألوان تختارها بنفسك.",
      descEn: "Flower styling and stage decor in the colors you choose.",
      rating: 4.7, reviews: 158, price: 12000, grad: ["#5b2a8c", "#e0b3ff"],
      tags: ["weddings", "engagements", "birthdays", "henna"]
    },
    {
      id: "v12", service: "decor", budget: "low", area: 3,
      ar: "بالون فرح", en: "Farah Balloons",
      descAr: "ديكور بالونات وخلفيات تصوير لأعياد الميلاد والخطوبة.",
      descEn: "Balloon decor and photo backdrops for birthdays & engagements.",
      rating: 4.3, reviews: 205, price: 2500, grad: ["#6b2d8c", "#b491d6"],
      tags: ["birthdays", "engagements", "henna"]
    },
    {
      id: "v13", service: "cakes", budget: "medium", area: 0,
      ar: "تورتة حلوة", en: "Helwa Cakes",
      descAr: "تورت أفراح وأعياد ميلاد بتصميمات حسب الطلب.",
      descEn: "Custom wedding and birthday cakes made to order.",
      rating: 4.8, reviews: 189, price: 1800, grad: ["#3d1f63", "#c9a6ec"],
      tags: ["weddings", "birthdays", "engagements"]
    },
    {
      id: "v14", service: "makeup", budget: "low", area: 3,
      ar: "ميك أب مايا", en: "Maya Makeup",
      descAr: "ميك أب سواريه ومناسبات بأسعار الطالبات.",
      descEn: "Soirée and occasion makeup at student-friendly prices.",
      rating: 4.2, reviews: 61, price: 1200, grad: ["#5b2a8c", "#b491d6"],
      tags: ["engagements", "birthdays", "henna"]
    },
    {
      id: "v15", service: "venues", budget: "low", area: 3,
      ar: "قاعة الفرح", en: "Al Farah Hall",
      descAr: "قاعة اقتصادية للمناسبات العائلية حتى 150 ضيف.",
      descEn: "Budget hall for family occasions up to 150 guests.",
      rating: 4.1, reviews: 47, price: 8000, grad: ["#2a1745", "#a06cd5"],
      tags: ["engagements", "birthdays", "henna"]
    },
    {
      id: "v16", service: "planners", budget: "medium", area: 1,
      ar: "يوم مميز", en: "Special Day",
      descAr: "تنظيم مناسبات متوسطة الميزانية مع باقات جاهزة.",
      descEn: "Mid-budget event planning with ready-made packages.",
      rating: 4.5, reviews: 84, price: 9000, grad: ["#6b2d8c", "#e0b3ff"],
      tags: ["engagements", "birthdays", "henna", "corporate"]
    }
  ];

  // Checklist templates per occasion (generated by the planner + AI bot)
  const checklistTemplates = {
    weddings: [
      { ar: "تحديد الميزانية الكلية", en: "Set the total budget", months: 12 },
      { ar: "حجز قاعة أو مكان الفرح", en: "Book the venue", months: 10 },
      { ar: "اختيار مصور وفيديوجرافر", en: "Choose photographer & videographer", months: 8 },
      { ar: "حجز الكاترينج والبوفيه", en: "Book catering", months: 6 },
      { ar: "اختيار فستان الفرح والبدلة", en: "Pick the dress & suit", months: 6 },
      { ar: "حجز ميكب أرتست", en: "Book makeup artist", months: 4 },
      { ar: "تجهيز الدعوات وقائمة المدعوين", en: "Prepare invitations & guest list", months: 3 },
      { ar: "حجز الدي جي أو الفرقة", en: "Book DJ or band", months: 3 },
      { ar: "تنسيق الزهور والكوشة", en: "Arrange flowers & stage decor", months: 2 },
      { ar: "طلب تورتة الفرح", en: "Order the wedding cake", months: 1 },
      { ar: "بروفة نهائية وتأكيد الموردين", en: "Final rehearsal & confirm vendors", months: 0 }
    ],
    engagements: [
      { ar: "تحديد الميزانية", en: "Set the budget", months: 4 },
      { ar: "حجز المكان", en: "Book the place", months: 3 },
      { ar: "اختيار المصور", en: "Choose photographer", months: 2 },
      { ar: "حجز الميكب", en: "Book makeup", months: 2 },
      { ar: "طلب الدبل والتجهيزات", en: "Order rings & essentials", months: 1 },
      { ar: "تجهيز البوفيه والتورتة", en: "Arrange buffet & cake", months: 1 },
      { ar: "تأكيد قائمة المدعوين", en: "Confirm guest list", months: 0 }
    ],
    birthdays: [
      { ar: "تحديد الميزانية والثيم", en: "Set budget & theme", months: 2 },
      { ar: "حجز المكان أو تجهيز البيت", en: "Book venue or prep home", months: 1 },
      { ar: "طلب التورتة", en: "Order the cake", months: 1 },
      { ar: "ديكور وبالونات", en: "Decor & balloons", months: 1 },
      { ar: "تجهيز الدعوات", en: "Prepare invitations", months: 0 },
      { ar: "حجز مصور أو ترفيه", en: "Book photographer or entertainment", months: 0 }
    ],
    henna: [
      { ar: "تحديد الميزانية", en: "Set the budget", months: 2 },
      { ar: "حجز المكان", en: "Book the place", months: 1 },
      { ar: "حجز نقاشة الحنة", en: "Book henna artist", months: 1 },
      { ar: "تجهيز الميكب والزي", en: "Prepare makeup & outfit", months: 1 },
      { ar: "ديكور وإضاءة", en: "Decor & lighting", months: 0 },
      { ar: "بوفيه وحلويات", en: "Buffet & sweets", months: 0 }
    ],
    corporate: [
      { ar: "تحديد الأهداف والميزانية", en: "Define goals & budget", months: 3 },
      { ar: "حجز القاعة", en: "Book the venue", months: 2 },
      { ar: "الكاترينج والضيافة", en: "Catering & hospitality", months: 1 },
      { ar: "التصوير والتوثيق", en: "Photography & coverage", months: 1 },
      { ar: "الساوند والعرض التقديمي", en: "Sound & presentation", months: 0 },
      { ar: "تأكيد الحضور واللوجيستيات", en: "Confirm attendance & logistics", months: 0 }
    ]
  };

  // Default budget breakdown suggestions (% of total) per occasion
  const budgetBreakdown = {
    weddings:    [["venues",30],["catering",25],["photography",12],["decor",10],["entertainment",10],["makeup",5],["cakes",4],["planners",4]],
    engagements: [["venues",25],["catering",25],["photography",15],["makeup",12],["decor",12],["cakes",6],["entertainment",5]],
    birthdays:   [["venues",25],["catering",25],["decor",20],["cakes",15],["photography",8],["entertainment",7]],
    henna:       [["venues",25],["decor",25],["catering",20],["makeup",15],["photography",15]],
    corporate:   [["venues",30],["catering",30],["photography",15],["entertainment",15],["decor",10]]
  };

  return { categories, services, budgets, areas, vendors, checklistTemplates, budgetBreakdown };
})();
