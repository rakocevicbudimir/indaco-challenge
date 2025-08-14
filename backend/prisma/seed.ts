import {
  PrismaClient,
  Role,
  MetaType,
  Status,
  EntityType,
  ReferenceEntityType,
} from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase() {
  // Order matters due to FK constraints
  await prisma.reference.deleteMany({});
  await prisma.entityMeta.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.blog.deleteMany({});
  await prisma.meta.deleteMany({});
  await prisma.user.deleteMany({});
}

function pick<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < count && copy.length > 0; i += 1) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

async function main() {
  await resetDatabase();

  // Users
  const [admin, alice, bob, charlie, diana] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        passwordHash: '$2b$10$orCpIF89j/ZZrHztvq9uQeypH5vWzKK79eVI/Ch3bvkhPINMnsCwu',
        roles: [Role.admin],
        isPremium: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        firstName: 'Alice',
        lastName: 'Doe',
        passwordHash: '$2b$10$orCpIF89j/ZZrHztvq9uQeypH5vWzKK79eVI/Ch3bvkhPINMnsCwu',
        roles: [Role.user],
        isPremium: true,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        firstName: 'Bob',
        lastName: 'Smith',
        passwordHash: '$2b$10$orCpIF89j/ZZrHztvq9uQeypH5vWzKK79eVI/Ch3bvkhPINMnsCwu',
        roles: [Role.user],
        isPremium: false,
      },
    }),
    prisma.user.create({
      data: {
        email: 'charlie@example.com',
        firstName: 'Charlie',
        lastName: 'Chen',
        passwordHash: '$2b$10$orCpIF89j/ZZrHztvq9uQeypH5vWzKK79eVI/Ch3bvkhPINMnsCwu',
        roles: [Role.user],
        isPremium: false,
      },
    }),
    prisma.user.create({
      data: {
        email: 'diana@example.com',
        firstName: 'Diana',
        lastName: 'Prince',
        passwordHash: '$2b$10$orCpIF89j/ZZrHztvq9uQeypH5vWzKK79eVI/Ch3bvkhPINMnsCwu',
        roles: [Role.user],
        isPremium: true,
      },
    }),
  ]);

  // Metas (tags and categories)
  await prisma.meta.createMany({
    data: [
      { name: 'Contract', type: MetaType.tag, slug: 'contract' },
      { name: 'NDA', type: MetaType.tag, slug: 'nda' },
      { name: 'Privacy', type: MetaType.tag, slug: 'privacy' },
      { name: 'Compliance', type: MetaType.tag, slug: 'compliance' },
      { name: 'Litigation', type: MetaType.tag, slug: 'litigation' },
      { name: 'Security', type: MetaType.tag, slug: 'security' },
      { name: 'M&A', type: MetaType.tag, slug: 'm-and-a' },
    ],
    skipDuplicates: true,
  });

  await prisma.meta.createMany({
    data: [
      { name: 'Corporate', type: MetaType.category, slug: 'corporate' },
      { name: 'Employment', type: MetaType.category, slug: 'employment' },
      { name: 'IP', type: MetaType.category, slug: 'ip' },
      { name: 'Tax', type: MetaType.category, slug: 'tax' },
      { name: 'Finance', type: MetaType.category, slug: 'finance' },
    ],
    skipDuplicates: true,
  });

  const allMetas = await prisma.meta.findMany({ where: { deletedAt: null } });

  // Blogs
  const blog1 = await prisma.blog.create({
    data: {
      title: 'Understanding NDAs: A Practical Guide',
      summary: 'When to use NDAs and what to include for enforceability.',
      content: 'Non-Disclosure Agreements (NDAs) are essential when... ',
      status: Status.DRAFT,
      isPremium: false,
      authorId: alice.id,
      entityMeta: {
        createMany: {
          data: pick(allMetas, 3).map((m) => ({
            metaId: m.id,
            entityType: EntityType.blog,
            content: '',
          })),
        },
      },
    },
  });

  const blog2 = await prisma.blog.create({
    data: {
      title: 'Data Processing Agreements Explained',
      summary: 'A look at DPAs and how they interact with GDPR obligations.',
      content: 'A Data Processing Agreement (DPA) outlines... ',
      status: Status.PUBLISHED,
      isPremium: true,
      authorId: alice.id,
      entityMeta: {
        createMany: {
          data: pick(allMetas, 2).map((m) => ({
            metaId: m.id,
            entityType: EntityType.blog,
            content: '',
          })),
        },
      },
    },
  });

  const blog3 = await prisma.blog.create({
    data: {
      title: 'Employee Handbook Essentials',
      summary: 'Key policies to include in your employee handbook.',
      content: 'An employee handbook sets expectations and... ',
      status: Status.DRAFT,
      isPremium: false,
      authorId: bob.id,
      entityMeta: {
        createMany: {
          data: pick(allMetas, 2).map((m) => ({
            metaId: m.id,
            entityType: EntityType.blog,
            content: '',
          })),
        },
      },
    },
  });

  const blog4 = await prisma.blog.create({
    data: {
      title: 'Merger Control Basics',
      summary: 'Overview of merger notification thresholds and timelines.',
      content: 'Merger control requires parties to notify transactions...',
      status: Status.PUBLISHED,
      isPremium: false,
      authorId: charlie.id,
      entityMeta: {
        createMany: {
          data: pick(allMetas, 2).map((m) => ({
            metaId: m.id,
            entityType: EntityType.blog,
            content: '',
          })),
        },
      },
    },
  });

  const blog5 = await prisma.blog.create({
    data: {
      title: 'IP Assignment Do’s and Don’ts',
      summary: 'Best practices for assigning intellectual property.',
      content: 'When assigning IP, ensure the assignor has clear title...',
      status: Status.DRAFT,
      isPremium: true,
      authorId: diana.id,
      entityMeta: {
        createMany: {
          data: pick(allMetas, 3).map((m) => ({
            metaId: m.id,
            entityType: EntityType.blog,
            content: '',
          })),
        },
      },
    },
  });

  const blog6 = await prisma.blog.create({
    data: {
      title: 'Tax Considerations in Equity Grants',
      summary: 'How ISOs, NSOs, and RSUs differ in tax treatment.',
      content: 'Equity compensation carries various tax implications...',
      status: Status.PUBLISHED,
      isPremium: false,
      authorId: diana.id,
      entityMeta: {
        createMany: {
          data: pick(allMetas, 2).map((m) => ({
            metaId: m.id,
            entityType: EntityType.blog,
            content: '',
          })),
        },
      },
    },
  });

  // Documents
  const doc1 = await prisma.document.create({
    data: {
      title: 'Mutual NDA Template',
      summary: 'A balanced NDA template suitable for mutual disclosures.',
      content: 'This Mutual NDA is made between...',
      status: Status.DRAFT,
      isPublic: true,
      creatorId: admin.id,
      entityMeta: {
        create: pick(allMetas, 2).map((m) => ({
          metaId: m.id,
          entityType: EntityType.document,
        })),
      },
    },
  });

  const doc2 = await prisma.document.create({
    data: {
      title: 'Standard Employment Agreement',
      summary: 'Employment agreement covering duties, compensation, IP.',
      content: 'This Employment Agreement is entered into by...',
      status: Status.PUBLISHED,
      isPublic: false,
      creatorId: admin.id,
      entityMeta: {
        create: pick(allMetas, 3).map((m) => ({
          metaId: m.id,
          entityType: EntityType.document,
        })),
      },
    },
  });

  const doc3 = await prisma.document.create({
    data: {
      title: 'DPA Addendum',
      summary: 'Supplementary clauses for data processing agreements.',
      content: 'This DPA Addendum complements the parties’ obligations...',
      status: Status.DRAFT,
      isPublic: true,
      creatorId: alice.id,
      entityMeta: {
        create: pick(allMetas, 2).map((m) => ({
          metaId: m.id,
          entityType: EntityType.document,
        })),
      },
    },
  });

  const doc4 = await prisma.document.create({
    data: {
      title: 'Consulting Agreement',
      summary: 'Independent contractor engagement terms.',
      content: 'This Consulting Agreement is made effective as of...',
      status: Status.PUBLISHED,
      isPublic: true,
      creatorId: bob.id,
      entityMeta: {
        create: pick(allMetas, 2).map((m) => ({
          metaId: m.id,
          entityType: EntityType.document,
        })),
      },
    },
  });

  const doc5 = await prisma.document.create({
    data: {
      title: 'Privacy Policy Template',
      summary: 'Template compliant with common privacy frameworks.',
      content: 'We value your privacy. This policy explains...',
      status: Status.PUBLISHED,
      isPublic: true,
      creatorId: diana.id,
      entityMeta: {
        create: pick(allMetas, 3).map((m) => ({
          metaId: m.id,
          entityType: EntityType.document,
        })),
      },
    },
  });

  // Sections for doc1
  const sec1 = await prisma.section.create({
    data: {
      documentId: doc1.id,
      title: 'Definitions',
      content: '“Confidential Information” means...',
      status: Status.DRAFT,
      isPublic: true,
      entityMeta: {
        createMany: {
          data: pick(allMetas, 1).map((m) => ({
            metaId: m.id,
            entityType: EntityType.section,
            content: '',
          })),
        },
      },
    },
  });

  const sec2 = await prisma.section.create({
    data: {
      documentId: doc1.id,
      title: 'Obligations',
      content: 'The Receiving Party shall...',
      status: Status.DRAFT,
      isPublic: true,
      entityMeta: {
        createMany: {
          data: pick(allMetas, 1).map((m) => ({
            metaId: m.id,
            entityType: EntityType.section,
            content: '',
          })),
        },
      },
    },
  });

  const sec2Child = await prisma.section.create({
    data: {
      documentId: doc1.id,
      parentId: sec2.id,
      title: 'Security Measures',
      content: 'Implement reasonable technical and organizational measures...',
      status: Status.DRAFT,
      isPublic: true,
      entityMeta: {
        createMany: {
          data: pick(allMetas, 1).map((m) => ({
            metaId: m.id,
            entityType: EntityType.section,
            content: '',
          })),
        },
      },
    },
  });

  // Sections for doc2
  const sec3 = await prisma.section.create({
    data: {
      documentId: doc2.id,
      title: 'Compensation',
      content: 'Base salary, bonus eligibility...',
      status: Status.DRAFT,
      isPublic: false,
    },
  });

  const sec4 = await prisma.section.create({
    data: {
      documentId: doc2.id,
      title: 'Intellectual Property',
      content: 'All work product shall be owned by the Company...',
      status: Status.DRAFT,
      isPublic: false,
    },
  });

  // Sections for doc3
  const d3s1 = await prisma.section.create({
    data: {
      documentId: doc3.id,
      title: 'Purpose',
      content: 'This addendum sets out additional terms...',
      status: Status.DRAFT,
      isPublic: true,
    },
  });
  const d3s2 = await prisma.section.create({
    data: {
      documentId: doc3.id,
      title: 'Sub-processors',
      content: 'Controller authorizes Processor to engage...',
      status: Status.DRAFT,
      isPublic: true,
    },
  });
  const d3s2a = await prisma.section.create({
    data: {
      documentId: doc3.id,
      parentId: d3s2.id,
      title: 'List of Sub-processors',
      content: 'Processor may use the following sub-processors...',
      status: Status.DRAFT,
      isPublic: true,
    },
  });

  // Sections for doc5
  const d5s1 = await prisma.section.create({
    data: {
      documentId: doc5.id,
      title: 'Scope',
      content: 'This policy applies to all products and services...',
      status: Status.PUBLISHED,
      isPublic: true,
    },
  });
  const d5s2 = await prisma.section.create({
    data: {
      documentId: doc5.id,
      title: 'Data Collection',
      content:
        'We collect data you provide and data collected automatically...',
      status: Status.PUBLISHED,
      isPublic: true,
    },
  });
  const d5s2a = await prisma.section.create({
    data: {
      documentId: doc5.id,
      parentId: d5s2.id,
      title: 'Cookies',
      content: 'Cookies are used to remember preferences...',
      status: Status.PUBLISHED,
      isPublic: true,
    },
  });

  // Cross-entity references
  await Promise.all([
    // Blog1 -> Document1
    prisma.reference.create({
      data: {
        content: 'Further reading: Mutual NDA Template',
        fromEntityType: ReferenceEntityType.blog,
        toEntityType: ReferenceEntityType.document,
        fromBlog: { connect: { id: blog1.id } },
        toDocument: { connect: { id: doc1.id } },
      },
    }),
    // Blog2 -> Section2
    prisma.reference.create({
      data: {
        content: 'Security best practices',
        fromEntityType: ReferenceEntityType.blog,
        toEntityType: ReferenceEntityType.section,
        fromBlog: { connect: { id: blog2.id } },
        toSection: { connect: { id: sec2.id } },
      },
    }),
    // Section1 -> Blog3
    prisma.reference.create({
      data: {
        content: 'See also employee policies',
        fromEntityType: ReferenceEntityType.section,
        toEntityType: ReferenceEntityType.blog,
        fromSection: { connect: { id: sec1.id } },
        toBlog: { connect: { id: blog3.id } },
      },
    }),
    // Document2 -> Blog1
    prisma.reference.create({
      data: {
        content: 'Background on NDAs',
        fromEntityType: ReferenceEntityType.document,
        toEntityType: ReferenceEntityType.blog,
        fromDocument: { connect: { id: doc2.id } },
        toBlog: { connect: { id: blog1.id } },
      },
    }),
    // Additional references
    prisma.reference.create({
      data: {
        content: 'See consulting agreement template',
        fromEntityType: ReferenceEntityType.blog,
        toEntityType: ReferenceEntityType.document,
        fromBlog: { connect: { id: blog4.id } },
        toDocument: { connect: { id: doc4.id } },
      },
    }),
    prisma.reference.create({
      data: {
        content: 'Cross-reference to Privacy Policy',
        fromEntityType: ReferenceEntityType.section,
        toEntityType: ReferenceEntityType.document,
        fromSection: { connect: { id: d3s1.id } },
        toDocument: { connect: { id: doc5.id } },
      },
    }),
    prisma.reference.create({
      data: {
        content: 'Cookie guidance',
        fromEntityType: ReferenceEntityType.document,
        toEntityType: ReferenceEntityType.section,
        fromDocument: { connect: { id: doc5.id } },
        toSection: { connect: { id: d5s2a.id } },
      },
    }),
    prisma.reference.create({
      data: {
        content: 'Related NDA section',
        fromEntityType: ReferenceEntityType.section,
        toEntityType: ReferenceEntityType.section,
        fromSection: { connect: { id: sec2Child.id } },
        toSection: { connect: { id: d3s2a.id } },
      },
    }),
  ]);

  console.log('Seed complete:', {
    users: [admin.email, alice.email, bob.email, charlie.email, diana.email],
    blogIds: [blog1.id, blog2.id, blog3.id, blog4.id, blog5.id, blog6.id],
    documentIds: [doc1.id, doc2.id, doc3.id, doc4.id, doc5.id],
    sectionIds: [
      sec1.id,
      sec2.id,
      sec2Child.id,
      sec3.id,
      sec4.id,
      d3s1.id,
      d3s2.id,
      d3s2a.id,
      d5s1.id,
      d5s2.id,
      d5s2a.id,
    ],
  });
}

main()
  .catch((e) => {
    console.error('Seed error', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
