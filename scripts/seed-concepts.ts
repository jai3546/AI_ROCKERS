import { prisma } from "../lib/prisma";
import { CONCEPT_DEFINITIONS } from "../data/concepts";

async function main() {
  console.log("Seeding concepts...");

  // 1. Create concepts
  for (const def of CONCEPT_DEFINITIONS) {
    await prisma.concept.upsert({
      where: { id: def.id },
      update: {
        name: def.name,
        subject: def.subject,
        description: def.description,
        domainType: "SCHOOL", // Default to SCHOOL for current definitions
      },
      create: {
        id: def.id,
        name: def.name,
        subject: def.subject,
        description: def.description,
        domainType: "SCHOOL",
      },
    });
  }

  // 2. Create relationships
  for (const def of CONCEPT_DEFINITIONS) {
    for (const prereqId of def.prerequisites) {
      await prisma.conceptRelationship.upsert({
        where: {
          fromConceptId_toConceptId: {
            fromConceptId: prereqId,
            toConceptId: def.id,
          },
        },
        update: {},
        create: {
          fromConceptId: prereqId,
          toConceptId: def.id,
          relationType: "STRICT_PREREQUISITE",
        },
      });
    }
  }

  console.log("Concepts and relationships seeded successfully.");
}

main()
  .catch((e) => {
    console.error("Error seeding concepts:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
