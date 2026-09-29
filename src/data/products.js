// ILLURE - Luxury Perfume Master Dataset

export const BRANDS = [
  {
    id: "tom-ford",
    name: "Tom Ford",
    origin: "New York, USA",
    founded: "2005",
    description: "Provocative, opulent, and uncompromisingly modern luxury fragrances crafted with rare ingredients.",
    heroImage: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200",
    featured: true
  },
  {
    id: "creed",
    name: "Creed",
    origin: "Paris, France",
    founded: "1760",
    description: "Seven generations of royal heritage creating timeless artisanal scents for kings, queens, and connoisseurs.",
    heroImage: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1200",
    featured: true
  },
  {
    id: "mfk",
    name: "Maison Francis Kurkdjian",
    origin: "Paris, France",
    founded: "2009",
    description: "Contemporary French olfactory art defined by precision, luminosity, and poetic elegance.",
    heroImage: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1200",
    featured: true
  },
  {
    id: "dior",
    name: "Dior Private Collection",
    origin: "Paris, France",
    founded: "1946",
    description: "The pinnacle of French haute parfumerie featuring intense extraits and noble floral extractions.",
    heroImage: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=1200",
    featured: true
  },
  {
    id: "parfums-de-marly",
    name: "Parfums de Marly",
    origin: "Château de Marly, France",
    founded: "2009",
    description: "Inspired by the splendour of the 18th century French Royal Court and noble equestrian lineage.",
    heroImage: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1200",
    featured: true
  },
  {
    id: "le-labo",
    name: "Le Labo",
    origin: "Grasse & New York",
    founded: "2006",
    description: "Soulful, slow perfumery born in Grasse, hand-formulated with raw soul and industrial elegance.",
    heroImage: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=1200",
    featured: true
  },
  {
    id: "kilian",
    name: "Kilian Paris",
    origin: "Paris, France",
    founded: "2007",
    description: "Cognac dynasty heir Kilian Hennessy crafts sensual night-time perfumes steeped in luxury.",
    heroImage: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=1200",
    featured: true
  },
  {
    id: "byredo",
    name: "Byredo",
    origin: "Stockholm, Sweden",
    founded: "2006",
    description: "European luxury brand translating memories, emotions, and abstract art into evocative scent profiles.",
    heroImage: "https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&q=80&w=1200",
    featured: true
  }
];

export const FRAGRANCE_FAMILIES = [
  {
    id: "woody",
    name: "WOODY",
    tagline: "Warm · Refined · Grounded",
    description: "Enveloping cedarwood, sandalwood, vetiver, and smoky rare woods that project quiet authority.",
    accentColor: "#9E6B38",
    bgGradient: "from-[#2A1808] to-[#0C1113]",
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "fresh",
    name: "FRESH",
    tagline: "Clean · Crisp · Energising",
    description: "Vibrant marine accords, iced citrus zest, green leaves, and mountain air that radiate clarity.",
    accentColor: "#3B82F6",
    bgGradient: "from-[#0F2942] to-[#0C1113]",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "amber",
    name: "AMBER",
    tagline: "Sensual · Golden · Opulent",
    description: "Rich resins, sweet tonka bean, Madagascar vanilla, and benzoin creating an addictive golden aura.",
    accentColor: "#D4AF37",
    bgGradient: "from-[#332200] to-[#0C1113]",
    image: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "floral",
    name: "FLORAL",
    tagline: "Radiant · Velvet · Captivating",
    description: "May Rose, Night-blooming Jasmine, Iris butter, and Tuberose distilled at peak bloom.",
    accentColor: "#E879F9",
    bgGradient: "from-[#2C0C24] to-[#0C1113]",
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "oud",
    name: "OUD",
    tagline: "Deep · Intense · Luxurious",
    description: "Precious agarwood harvested from ancient trees, laced with dark spices, leather, and smoke.",
    accentColor: "#B45309",
    bgGradient: "from-[#261205] to-[#0C1113]",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "citrus",
    name: "CITRUS",
    tagline: "Luminous · Zesty · Effervescent",
    description: "Calabrian Bergamot, Sicilian Lemon, Neroli blossom, and Pink Grapefruit bursting with vitality.",
    accentColor: "#F59E0B",
    bgGradient: "from-[#291B00] to-[#0C1113]",
    image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "musk",
    name: "MUSK",
    tagline: "Intimate · Velvety · Pure",
    description: "Second-skin warmth, cashmere accords, white amber, and crystalline musk that linger closely.",
    accentColor: "#94A3B8",
    bgGradient: "from-[#1E293B] to-[#0C1113]",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "spicy",
    name: "SPICY",
    tagline: "Bold · Exotic · Hypnotic",
    description: "Fiery cardamom, Madagascar clove, cinnamon bark, and saffron weaving an unforgettable trail.",
    accentColor: "#EF4444",
    bgGradient: "from-[#310A0A] to-[#0C1113]",
    image: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=800"
  }
];

export const PRODUCTS = [
  {
    id: "tf-oud-wood",
    name: "Oud Wood",
    slug: "tom-ford-oud-wood",
    brand: "Tom Ford",
    brandId: "tom-ford",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    fragranceFamily: "Woody",
    price: 23500,
    compareAtPrice: 26000,
    rating: 4.9,
    reviewCount: 184,
    shortDescription: "A rare, exotic, and distinctive composition featuring smoky Agarwood, Rosewood, and Cardamom.",
    description: "One of the most rare, precious, and expensive ingredients in a perfumer's arsenal, oud wood is often burned in incense-filled temples of Bhutan. Exotic rosewood and cardamom give way to a smoky blend of rare oud wood, sandalwood and vetiver. Tonka bean and amber add warmth and sensuality.",
    bestseller: true,
    featured: true,
    newArrival: false,
    niche: true,
    exclusive: true,
    badge: "BESTSELLER",
    liquidColor: "#3B2314",
    accentGlow: "rgba(158, 107, 56, 0.4)",
    sizes: [
      { size: "50 ML", price: 18500 },
      { size: "100 ML", price: 23500 },
      { size: "250 ML", price: 42000 }
    ],
    topNotes: ["Cardamom", "Rare Rosewood", "Sichuan Pepper"],
    heartNotes: ["Smoky Oud Wood", "Sandalwood", "Vetiver"],
    baseNotes: ["Tonka Bean", "Golden Amber", "Vanilla"],
    characterScales: {
      freshDark: 78,
      subtleIntense: 82,
      dayNight: 88
    },
    attributes: {
      season: "Autumn / Winter",
      occasion: "Evening / Formal",
      longevity: "10–12 Hours",
      projection: "Enveloping & Distinctive"
    },
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "mfk-baccarat-rouge-540",
    name: "Baccarat Rouge 540",
    slug: "baccarat-rouge-540",
    brand: "Maison Francis Kurkdjian",
    brandId: "mfk",
    concentration: "Extrait de Parfum",
    gender: "Unisex",
    fragranceFamily: "Amber",
    price: 38500,
    compareAtPrice: 42000,
    rating: 5.0,
    reviewCount: 310,
    shortDescription: "A luminous, dense fragrance with breeze of jasmine, radiant saffron, and cedarwood warmth.",
    description: "Luminous and sophisticated, Baccarat Rouge 540 lays on the skin like an amber floral and woody breeze. A poetic alchemy where the aerial notes of jasmine and the radiance of saffron carry mineral facets of ambergris and woody tones of freshly-cut cedar wood.",
    bestseller: true,
    featured: true,
    newArrival: false,
    niche: true,
    exclusive: true,
    badge: "ICONIC",
    liquidColor: "#7A1C1C",
    accentGlow: "rgba(212, 175, 55, 0.5)",
    sizes: [
      { size: "35 ML", price: 24500 },
      { size: "70 ML", price: 38500 },
      { size: "200 ML", price: 72000 }
    ],
    topNotes: ["Grandiflorum Jasmine", "Saffron"],
    heartNotes: ["Bitter Almond", "Cedarwood"],
    baseNotes: ["Woody Musk", "Ambergris Accord"],
    characterScales: {
      freshDark: 45,
      subtleIntense: 95,
      dayNight: 75
    },
    attributes: {
      season: "All Seasons",
      occasion: "Signature / Special Occasions",
      longevity: "14+ Hours",
      projection: "Hypnotic Room-Filling Sillage"
    },
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "creed-aventus",
    name: "Aventus",
    slug: "creed-aventus",
    brand: "Creed",
    brandId: "creed",
    concentration: "Eau de Parfum",
    gender: "Him",
    fragranceFamily: "Fresh",
    price: 34500,
    compareAtPrice: 37000,
    rating: 4.9,
    reviewCount: 420,
    shortDescription: "Sensual, audacious, and contemporary scent celebrating strength, power, and success.",
    description: "Inspired by the dramatic life of a historic emperor, Aventus celebrates strength, power, vision and success. Hand-crafted with royal millesime quality, top notes of Italian Bergamot and pineapple lead to a rich heart of birch and patchouli, anchored by oakmoss and ambergris.",
    bestseller: true,
    featured: true,
    newArrival: false,
    niche: true,
    exclusive: false,
    badge: "BESTSELLER",
    liquidColor: "#2A3A4A",
    accentGlow: "rgba(59, 130, 246, 0.4)",
    sizes: [
      { size: "50 ML", price: 26000 },
      { size: "100 ML", price: 34500 },
      { size: "250 ML", price: 61000 }
    ],
    topNotes: ["Blackcurrant", "Italian Bergamot", "Calville Blanc Apple", "Pineapple"],
    heartNotes: ["Rose", "Dry Birch", "Moroccan Jasmine", "Patchouli"],
    baseNotes: ["Oakmoss", "Musk", "Ambergris", "Vanilla"],
    characterScales: {
      freshDark: 30,
      subtleIntense: 88,
      dayNight: 40
    },
    attributes: {
      season: "Spring / Summer / Autumn",
      occasion: "Executive / Signature",
      longevity: "10–12 Hours",
      projection: "Commanding & Radiating"
    },
    images: [
      "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "dior-sauvage-elixir",
    name: "Sauvage Elixir",
    slug: "dior-sauvage-elixir",
    brand: "Dior Private Collection",
    brandId: "dior",
    concentration: "Parfum",
    gender: "Him",
    fragranceFamily: "Spicy",
    price: 16500,
    compareAtPrice: 18500,
    rating: 4.8,
    reviewCount: 215,
    shortDescription: "An extraordinarily concentrated fragrance steeped in the iconic freshness of Sauvage with a wild heart of spices.",
    description: "Sauvage Elixir is an extraordinarily concentrated fragrance steeped in the iconic freshness of Sauvage with an intoxicating heart of spices, a 'tailor-made' lavender essence and a blend of rich woods forming the signature of its powerful, lavish and captivating trail.",
    bestseller: true,
    featured: true,
    newArrival: false,
    niche: false,
    exclusive: false,
    badge: "BESTSELLER",
    liquidColor: "#0F1A2A",
    accentGlow: "rgba(30, 58, 138, 0.5)",
    sizes: [
      { size: "60 ML", price: 16500 },
      { size: "100 ML", price: 21500 }
    ],
    topNotes: ["Cinnamon", "Nutmeg", "Cardamom", "Grapefruit"],
    heartNotes: ["Custom Nyons Lavender Essence"],
    baseNotes: ["Licorice", "Sandalwood", "Amber", "Haitian Vetiver"],
    characterScales: {
      freshDark: 65,
      subtleIntense: 98,
      dayNight: 85
    },
    attributes: {
      season: "Autumn / Winter",
      occasion: "Evening / Nightclub",
      longevity: "14+ Hours",
      projection: "Magnetic Room Filler"
    },
    images: [
      "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "pdm-delina",
    name: "Delina Exclusif",
    slug: "parfums-de-marly-delina-exclusif",
    brand: "Parfums de Marly",
    brandId: "parfums-de-marly",
    concentration: "Extrait de Parfum",
    gender: "Her",
    fragranceFamily: "Floral",
    price: 29500,
    compareAtPrice: 32000,
    rating: 4.9,
    reviewCount: 156,
    shortDescription: "A sensual floral bouquet dominated by Turkish rose, lily of the valley, and peony, shrouded in amber velvet.",
    description: "This bouquet of rose, lily of the valley and peony is embellished with notes of lychee, rhubarb and nutmeg. Vanilla accentuates the sensuality of the composition at the base, blending with white musk, cashmeran, cedarwood and incense.",
    bestseller: true,
    featured: true,
    newArrival: false,
    niche: true,
    exclusive: true,
    badge: "EXCLUSIVE",
    liquidColor: "#4A1B28",
    accentGlow: "rgba(232, 121, 249, 0.4)",
    sizes: [
      { size: "75 ML", price: 29500 }
    ],
    topNotes: ["Bergamot", "Nutmeg", "Lychee", "Rhubarb"],
    heartNotes: ["Turkish Rose", "Peony", "Musk", "Petalia"],
    baseNotes: ["Cashmeran", "Cedarwood", "Incense", "Haitian Vetiver"],
    characterScales: {
      freshDark: 25,
      subtleIntense: 80,
      dayNight: 50
    },
    attributes: {
      season: "Spring / Summer",
      occasion: "Romantic / Gala",
      longevity: "10–12 Hours",
      projection: "Elegantly Enchanting"
    },
    images: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "le-labo-santal-33",
    name: "Santal 33",
    slug: "le-labo-santal-33",
    brand: "Le Labo",
    brandId: "le-labo",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    fragranceFamily: "Woody",
    price: 24000,
    compareAtPrice: 26500,
    rating: 4.8,
    reviewCount: 290,
    shortDescription: "An intoxicating touch of cardamom, iris, violet, ambrox which crackle in the formula and bring to this smoking wood alloy.",
    description: "Imagine sitting in solitude on the rugged, wide plains of the American West, firelight on your face, indigo night sky above. Santal 33 touches of cardamom, iris, violet, ambrox which crackle in the formula and bring to this smoking wood alloy (australian sandalwood, papyrus, cedarwood) spicy, leathery, musky notes.",
    bestseller: true,
    featured: true,
    newArrival: false,
    niche: true,
    exclusive: false,
    badge: "CULT CLASSIC",
    liquidColor: "#332B1E",
    accentGlow: "rgba(163, 158, 147, 0.4)",
    sizes: [
      { size: "50 ML", price: 18500 },
      { size: "100 ML", price: 24000 }
    ],
    topNotes: ["Violet Accord", "Cardamom"],
    heartNotes: ["Iris", "Ambrox", "Papyrus"],
    baseNotes: ["Cedarwood", "Leather", "Australian Sandalwood"],
    characterScales: {
      freshDark: 50,
      subtleIntense: 75,
      dayNight: 50
    },
    attributes: {
      season: "All Seasons",
      occasion: "Daily Signature",
      longevity: "12+ Hours",
      projection: "Instant Brand Identity"
    },
    images: [
      "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "kilian-angels-share",
    name: "Angels' Share",
    slug: "kilian-angels-share",
    brand: "Kilian Paris",
    brandId: "kilian",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    fragranceFamily: "Amber",
    price: 22500,
    compareAtPrice: 24500,
    rating: 4.9,
    reviewCount: 178,
    shortDescription: "Contains the essence of Cognac derived from the liquor to lend it a natural caramel color.",
    description: "Much like a Master Perfumer who crafts accords and essences in a perfume, a Master Blender combines the eaux-de-vie in perfect proportions for an exceptional cognac. Angels' Share contains Cognac oil opening upon a blend of oak absolute, cinnamon essence and Tonka bean absolute.",
    bestseller: true,
    featured: true,
    newArrival: true,
    niche: true,
    exclusive: true,
    badge: "NEW",
    liquidColor: "#8C4A1C",
    accentGlow: "rgba(212, 175, 55, 0.6)",
    sizes: [
      { size: "50 ML", price: 22500 },
      { size: "100 ML", price: 32000 }
    ],
    topNotes: ["Cognac Essence"],
    heartNotes: ["Cinnamon", "Oak Absolute", "Tonka Bean"],
    baseNotes: ["Sandalwood", "Praline", "Vanilla"],
    characterScales: {
      freshDark: 80,
      subtleIntense: 90,
      dayNight: 95
    },
    attributes: {
      season: "Autumn / Winter",
      occasion: "Evening / Cozy Luxury",
      longevity: "10–12 Hours",
      projection: "Warm Gourmet Sillage"
    },
    images: [
      "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "byredo-gypsy-water",
    name: "Gypsy Water",
    slug: "byredo-gypsy-water",
    brand: "Byredo",
    brandId: "byredo",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    fragranceFamily: "Citrus",
    price: 21000,
    compareAtPrice: 23000,
    rating: 4.7,
    reviewCount: 142,
    shortDescription: "An ode to the beauty of Romani culture, its unique customs, intimate beliefs and distinguished way of living.",
    description: "Gypsy Water is an ode to the beauty of Romani culture, its unique customs, intimate beliefs and distinguished way of living. The scent wakens a dream of a colorful lifestyle made of innate nomadism. Woody notes of pine needle and sandalwood associated to intense amber and fresh citrus evoke the fever of gypsy nights spent in the forest.",
    bestseller: false,
    featured: true,
    newArrival: true,
    niche: true,
    exclusive: false,
    badge: "NEW",
    liquidColor: "#1E2A28",
    accentGlow: "rgba(245, 158, 11, 0.4)",
    sizes: [
      { size: "50 ML", price: 15500 },
      { size: "100 ML", price: 21000 }
    ],
    topNotes: ["Bergamot", "Lemon", "Pepper", "Juniper Berries"],
    heartNotes: ["Incense", "Pine Needles", "Orris"],
    baseNotes: ["Amber", "Vanilla", "Sandalwood"],
    characterScales: {
      freshDark: 35,
      subtleIntense: 55,
      dayNight: 40
    },
    attributes: {
      season: "Spring / Summer / Autumn",
      occasion: "Bohemian / Everyday",
      longevity: "7–9 Hours",
      projection: "Subtle & Intimate"
    },
    images: [
      "https://images.unsplash.com/photo-1583445013765-46c20c4a6772?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "tf-tobacco-vanille",
    name: "Tobacco Vanille",
    slug: "tom-ford-tobacco-vanille",
    brand: "Tom Ford",
    brandId: "tom-ford",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    fragranceFamily: "Spicy",
    price: 24500,
    compareAtPrice: 27000,
    rating: 4.9,
    reviewCount: 260,
    shortDescription: "Opulent, warm, and iconic. Tom Ford’s affection for London inspired this fragrance, reminiscent of an English gentlemen’s club.",
    description: "Opulent, warm and iconic, Tom Ford Tobacco Vanille is a sumptuous oriental spice scent featuring rich accords of tobacco leaf and spicy notes. Heart notes unfold into creamy tonka bean, vanilla, cocoa, dry fruit accords and sweet wood sap.",
    bestseller: true,
    featured: false,
    newArrival: false,
    niche: true,
    exclusive: false,
    badge: "ICONIC",
    liquidColor: "#3D1F0D",
    accentGlow: "rgba(212, 175, 55, 0.5)",
    sizes: [
      { size: "50 ML", price: 19000 },
      { size: "100 ML", price: 24500 }
    ],
    topNotes: ["Tobacco Leaf", "Spicy Accords"],
    heartNotes: ["Tonka Bean", "Tobacco Blossom", "Vanilla", "Cacao"],
    baseNotes: ["Dry Fruit Accord", "Wood Sap"],
    characterScales: {
      freshDark: 85,
      subtleIntense: 90,
      dayNight: 90
    },
    attributes: {
      season: "Autumn / Winter",
      occasion: "Formal Black Tie / Club",
      longevity: "12+ Hours",
      projection: "Opulent & Enveloping"
    },
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "creed-silver-mountain",
    name: "Silver Mountain Water",
    slug: "creed-silver-mountain-water",
    brand: "Creed",
    brandId: "creed",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    fragranceFamily: "Fresh",
    price: 32000,
    compareAtPrice: 35000,
    rating: 4.7,
    reviewCount: 118,
    shortDescription: "Captures the purity of Swiss alpine streams with crisp green tea, blackcurrant, and galbanum.",
    description: "Inspired by the exhilarating crispness of alpine air, Silver Mountain Water is a fresh and contemporary fragrance. Opening with bergamot and mandarin, followed by a heart of green tea and blackcurrant, the base is rich with galbanum, musk, sandalwood and petitgrain.",
    bestseller: false,
    featured: false,
    newArrival: true,
    niche: true,
    exclusive: false,
    badge: "LIMITED",
    liquidColor: "#1B2F38",
    accentGlow: "rgba(59, 130, 246, 0.4)",
    sizes: [
      { size: "100 ML", price: 32000 }
    ],
    topNotes: ["Bergamot", "Mandarin", "Neroli"],
    heartNotes: ["Green Tea", "Blackcurrant Bud"],
    baseNotes: ["Sandalwood", "Musk", "Galbanum", "Petitgrain"],
    characterScales: {
      freshDark: 15,
      subtleIntense: 65,
      dayNight: 20
    },
    attributes: {
      season: "Spring / Summer",
      occasion: "Daytime / Sport Luxury",
      longevity: "8–10 Hours",
      projection: "Crystalline & Crisp"
    },
    images: [
      "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "mfk-grand-soir",
    name: "Grand Soir",
    slug: "maison-francis-kurkdjian-grand-soir",
    brand: "Maison Francis Kurkdjian",
    brandId: "mfk",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    fragranceFamily: "Amber",
    price: 26500,
    compareAtPrice: 28500,
    rating: 4.9,
    reviewCount: 164,
    shortDescription: "Dress in your finest attire and polish your looks. Experience vibrant night energy in Paris.",
    description: "Grand Soir invites you to dress in your finest attire and polish your looks. Experience the vibrant energy of a magical Paris evening with warm Spanish cistus labdanum, Brazilian tonka bean, and deep amber accord fused with benzoin from Siam.",
    bestseller: false,
    featured: true,
    newArrival: false,
    niche: true,
    exclusive: true,
    badge: "EXCLUSIVE",
    liquidColor: "#8C541C",
    accentGlow: "rgba(212, 175, 55, 0.6)",
    sizes: [
      { size: "70 ML", price: 26500 },
      { size: "200 ML", price: 48000 }
    ],
    topNotes: ["Spanish Cistus Labdanum"],
    heartNotes: ["Benzoin from Siam", "Brazilian Tonka Bean"],
    baseNotes: ["Deep Golden Amber", "Vanilla Accord"],
    characterScales: {
      freshDark: 80,
      subtleIntense: 88,
      dayNight: 95
    },
    attributes: {
      season: "Autumn / Winter",
      occasion: "Grand Opera / Black Tie",
      longevity: "12+ Hours",
      projection: "Golden Warm Radiance"
    },
    images: [
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1000"
    ]
  },
  {
    id: "tf-lost-cherry",
    name: "Lost Cherry",
    slug: "tom-ford-lost-cherry",
    brand: "Tom Ford",
    brandId: "tom-ford",
    concentration: "Eau de Parfum",
    gender: "Unisex",
    fragranceFamily: "Amber",
    price: 31000,
    compareAtPrice: 34000,
    rating: 4.8,
    reviewCount: 204,
    shortDescription: "A full-bodied journey into the once-forbidden; a contrasting scent that reveals a tempting candy-like gleam.",
    description: "Innocence intersects indulgence with an opening that captures the classic perfection of the exotic cherry fruit – Black Cherry's ripe flesh dripping in cherry liqueur sparkles with a teasing touch of Bitter Almond.",
    bestseller: true,
    featured: false,
    newArrival: false,
    niche: true,
    exclusive: true,
    badge: "EXCLUSIVE",
    liquidColor: "#6B0F24",
    accentGlow: "rgba(239, 68, 68, 0.5)",
    sizes: [
      { size: "50 ML", price: 31000 }
    ],
    topNotes: ["Black Cherry", "Cherry Liqueur", "Bitter Almond"],
    heartNotes: ["Griotte Syrup", "Turkish Rose", "Jasmine Sambac"],
    baseNotes: ["Peru Balsam", "Roasted Tonka", "Sandalwood", "Vetiver", "Cedar"],
    characterScales: {
      freshDark: 60,
      subtleIntense: 85,
      dayNight: 80
    },
    attributes: {
      season: "Autumn / Winter",
      occasion: "Intimate Evening / Romantic",
      longevity: "9–11 Hours",
      projection: "Decadent & Tempting"
    },
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1000"
    ]
  }
];

export const EDITORIAL_ARTICLES = [
  {
    id: "language-of-fragrance",
    title: "THE LANGUAGE OF FRAGRANCE",
    subtitle: "How scent shapes memory and presence",
    content: "A fragrance is more than something you wear. It becomes part of how people remember you. At İLLURÊ FRAGRANCE, every fragrance is selected for its craftsmanship, character and ability to leave an unforgettable lasting impression.",
    quote: "Leave an impression before you say a word.",
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1200"
  }
];

export const GIFT_SETS = [
  {
    id: "the-royal-trio",
    title: "The Royal Oud Trio",
    brand: "Curated by İLLURÊ",
    price: 45000,
    originalPrice: 52000,
    includes: ["Tom Ford Oud Wood 50ml", "Maison Francis Kurkdjian Baccarat Rouge 35ml", "Kilian Angels' Share 50ml"],
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1000",
    description: "Three legendary benchmark extraits presented in custom hand-crafted matte black velvet casing."
  },
  {
    id: "his-signature-vault",
    title: "His Signature Vault",
    brand: "Curated by İLLURÊ",
    price: 39500,
    originalPrice: 46000,
    includes: ["Creed Aventus 100ml", "Dior Sauvage Elixir 60ml", "Travel Atomizer in Gold Plated Finish"],
    image: "https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&q=80&w=1000",
    description: "The ultimate power statement collection for the modern leader."
  }
];
