import { PrismaClient, AdminRole, Gender, ProductStatus } from '@prisma/client';
import argon2 from 'argon2';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting İLLURÊ database seed process...');

  const seedEmail = (process.env.SEED_ADMIN_EMAIL || 'admin@illurefragrance.com').trim().toLowerCase();
  const seedPassword = process.env.SEED_ADMIN_PASSWORD || 'SuperAdmin@Illure2026!';
  const seedName = process.env.SEED_ADMIN_NAME || 'Illure Super Admin';

  const passwordHash = await argon2.hash(seedPassword, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1,
  });

  // 1. Seed Super Admin User
  const adminUser = await prisma.adminUser.upsert({
    where: { email: seedEmail },
    update: {
      passwordHash,
      name: seedName,
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
    create: {
      email: seedEmail,
      passwordHash,
      name: seedName,
      role: AdminRole.SUPER_ADMIN,
      isActive: true,
    },
  });

  console.log(`✅ Super Admin created/updated: ${adminUser.email} (${adminUser.role})`);

  // 2. Seed Reference Brands (Inspiration/Reference Brands ONLY — not manufacturers of Illure products)
  const brands = [
    { name: 'Tom Ford', slug: 'tom-ford', description: 'Designer luxury fragrance house' },
    { name: 'Giorgio Armani', slug: 'giorgio-armani', description: 'Italian high-end fragrance house' },
    { name: 'Creed', slug: 'creed', description: 'Niche luxury heritage fragrance house' },
    { name: 'Dior', slug: 'dior', description: 'French haute couture fragrance house' },
    { name: 'Parfums de Marly', slug: 'parfums-de-marly', description: 'French niche luxury fragrance house' },
  ];

  const brandRecords: Record<string, string> = {};
  for (const b of brands) {
    const brand = await prisma.referenceBrand.upsert({
      where: { slug: b.slug },
      update: { name: b.name, description: b.description },
      create: b,
    });
    brandRecords[b.slug] = brand.id;
  }
  console.log(`✅ Seeded ${brands.length} Reference Brands.`);

  // 3. Seed Categories
  const categories = [
    { name: 'Woody & Smoky', slug: 'woody-smoky', description: 'Opulent woods, oud, incense, and warm spice.' },
    { name: 'Fresh & Aquatic', slug: 'fresh-aquatic', description: 'Crisp citrus, sea breeze, and vibrant green accords.' },
    { name: 'Amber & Oriental', slug: 'amber-oriental', description: 'Rich amber, sweet vanilla, exotic resins, and spices.' },
    { name: 'Floral & Powdery', slug: 'floral-powdery', description: 'Elegant jasmine, rose, iris, and soft musk.' },
    { name: 'Niche Editions', slug: 'niche-editions', description: 'Rare extraction artisanal masterworks.' },
  ];

  const categoryRecords: Record<string, string> = {};
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: c,
    });
    categoryRecords[c.slug] = cat.id;
  }
  console.log(`✅ Seeded ${categories.length} Categories.`);

  // 4. Seed Gift Packaging
  const giftBox = await prisma.giftPackaging.upsert({
    where: { id: 'illure-royal-velvet-box' },
    update: {
      name: 'İLLURÊ Royal Velvet Gift Box',
      description: 'Custom embossed black velvet luxury box with gold foil stamping and signature silk ribbon.',
      price: 499.00,
      isActive: true,
    },
    create: {
      id: 'illure-royal-velvet-box',
      name: 'İLLURÊ Royal Velvet Gift Box',
      description: 'Custom embossed black velvet luxury box with gold foil stamping and signature silk ribbon.',
      price: 499.00,
      isActive: true,
    },
  });
  console.log(`✅ Seeded Optional Paid Packaging: ${giftBox.name}`);

  // 5. Seed Initial Fragrance Products
  const seedProducts = [
    {
      name: 'Aqua Edge',
      slug: 'aqua-edge',
      shortDescription: 'Fresh marine citrus with sun-bleached driftwood and rosemary.',
      description: 'An invigorating oceanic masterpiece inspired by Mediterranean sea spray and sunlit coastal citrus orchards.',
      inspiredByName: 'Acqua di Giò',
      referenceBrandSlug: 'giorgio-armani',
      gender: Gender.MEN,
      fragranceFamily: 'Fresh & Aquatic',
      topNotes: ['Bergamot', 'Calabrian Lemon', 'Neroli'],
      heartNotes: ['Marine Accord', 'Rosemary', 'Jasmine'],
      baseNotes: ['White Musk', 'Cedarwood', 'Patchouli'],
      occasion: 'Daily Luxury / Summer Evenings',
      season: 'Spring / Summer',
      longevity: '8-10 Hours',
      projection: 'Moderate to Strong',
      featured: true,
      bestseller: true,
      newArrival: false,
      status: ProductStatus.ACTIVE,
      variants: [
        { sizeLabel: '3 ML Sample', sku: 'AQE-3ML', price: 299, stockQuantity: 100 },
        { sizeLabel: '6 ML Attar', sku: 'AQE-6ML', price: 549, stockQuantity: 80 },
        { sizeLabel: '12 ML Pocket Luxury', sku: 'AQE-12ML', price: 999, stockQuantity: 50 },
        { sizeLabel: '100 ML Extrait de Parfum', sku: 'AQE-100ML', price: 2499, stockQuantity: 30 },
      ],
      images: [
        { url: '/images/sauvage.jpg', altText: 'Aqua Edge Extrait de Parfum Bottle', isPrimary: true, sortOrder: 0 }
      ],
      categorySlug: 'fresh-aquatic',
    },
    {
      name: 'Oud Silk Royal',
      slug: 'oud-silk-royal',
      shortDescription: 'Smoky rare agarwood blended with cardamom and exotic rosewood.',
      description: 'A deeply meditative, mysterious scent embodying dark precious woods and warm spice.',
      inspiredByName: 'Oud Wood',
      referenceBrandSlug: 'tom-ford',
      gender: Gender.UNISEX,
      fragranceFamily: 'Woody & Smoky',
      topNotes: ['Rare Cardamom', 'Sichuan Pepper', 'Rosewood'],
      heartNotes: ['Smoky Oud Wood', 'Sandalwood', 'Vetiver'],
      baseNotes: ['Tonka Bean', 'Vanilla', 'Amber'],
      occasion: 'Evening Gala / Formal Winter',
      season: 'Fall / Winter',
      longevity: '12+ Hours',
      projection: 'Enveloping Aura',
      featured: true,
      bestseller: true,
      newArrival: false,
      status: ProductStatus.ACTIVE,
      variants: [
        { sizeLabel: '3 ML Sample', sku: 'OSR-3ML', price: 349, stockQuantity: 100 },
        { sizeLabel: '6 ML Attar', sku: 'OSR-6ML', price: 649, stockQuantity: 80 },
        { sizeLabel: '12 ML Pocket Luxury', sku: 'OSR-12ML', price: 1199, stockQuantity: 50 },
        { sizeLabel: '100 ML Extrait de Parfum', sku: 'OSR-100ML', price: 2999, stockQuantity: 25 },
      ],
      images: [
        { url: '/images/oud_wood.jpg', altText: 'Oud Silk Royal Extrait de Parfum Bottle', isPrimary: true, sortOrder: 0 }
      ],
      categorySlug: 'woody-smoky',
    },
    {
      name: 'Imperial Sovereign',
      slug: 'imperial-sovereign',
      shortDescription: 'Regal pineapple, smoky birch wood, and crisp French bergamot.',
      description: 'The epitome of power and prestige. A commanding opening of juicy pineapple transitioning into smoky leather and birch wood.',
      inspiredByName: 'Aventus',
      referenceBrandSlug: 'creed',
      gender: Gender.MEN,
      fragranceFamily: 'Niche Editions',
      topNotes: ['French Bergamot', 'Blackcurrant', 'Royal Pineapple'],
      heartNotes: ['Dry Birch', 'Moroccan Jasmine', 'Patchouli'],
      baseNotes: ['Oakmoss', 'Ambergris', 'Vanilla'],
      occasion: 'Executive / Special Occasions',
      season: 'All Seasons',
      longevity: '10-12 Hours',
      projection: 'Heavy Sillage',
      featured: true,
      bestseller: true,
      newArrival: true,
      status: ProductStatus.ACTIVE,
      variants: [
        { sizeLabel: '3 ML Sample', sku: 'IMS-3ML', price: 399, stockQuantity: 100 },
        { sizeLabel: '6 ML Attar', sku: 'IMS-6ML', price: 749, stockQuantity: 80 },
        { sizeLabel: '12 ML Pocket Luxury', sku: 'IMS-12ML', price: 1399, stockQuantity: 50 },
        { sizeLabel: '100 ML Extrait de Parfum', sku: 'IMS-100ML', price: 3499, stockQuantity: 20 },
      ],
      images: [
        { url: '/images/sauvage.jpg', altText: 'Imperial Sovereign Bottle', isPrimary: true, sortOrder: 0 }
      ],
      categorySlug: 'niche-editions',
    },
  ];

  for (const prodData of seedProducts) {
    const refBrandId = brandRecords[prodData.referenceBrandSlug];
    const catId = categoryRecords[prodData.categorySlug];

    const existingProduct = await prisma.product.findUnique({ where: { slug: prodData.slug } });
    if (!existingProduct) {
      const product = await prisma.product.create({
        data: {
          name: prodData.name,
          slug: prodData.slug,
          shortDescription: prodData.shortDescription,
          description: prodData.description,
          inspiredByName: prodData.inspiredByName,
          referenceBrandId: refBrandId,
          gender: prodData.gender,
          fragranceFamily: prodData.fragranceFamily,
          topNotes: prodData.topNotes,
          heartNotes: prodData.heartNotes,
          baseNotes: prodData.baseNotes,
          occasion: prodData.occasion,
          season: prodData.season,
          longevity: prodData.longevity,
          projection: prodData.projection,
          featured: prodData.featured,
          bestseller: prodData.bestseller,
          newArrival: prodData.newArrival,
          status: prodData.status,
          variants: {
            create: prodData.variants,
          },
          images: {
            create: prodData.images,
          },
          productCategories: {
            create: [
              { categoryId: catId }
            ]
          }
        },
      });
      console.log(`✅ Seeded Product: ${product.name} with ${prodData.variants.length} variants.`);
    }
  }

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Database seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
