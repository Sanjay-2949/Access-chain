import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding AccessChain database with initial Indian spatial nodes & edges...');

  // Create Sample Users
  const travelerUser = await prisma.user.upsert({
    where: { email: 'traveler@accesschain.in' },
    update: {},
    create: {
      email: 'traveler@accesschain.in',
      name: 'Rohan Sharma',
      role: 'TRAVELER',
      profiles: {
        create: {
          title: 'Manual Wheelchair Profile',
          is_default: true,
          requires_step_free: true,
          requires_accessible_vehicle: true,
          requires_accessible_toilet: true,
          max_slope_percent: 5.0,
          max_walking_distance_m: 300,
        },
      },
    },
  });

  // Create Place Nodes
  const homeNode = await prisma.placeNode.upsert({
    where: { id: 'node-chennai-home' },
    update: {},
    create: {
      id: 'node-chennai-home',
      name: 'Chennai T. Nagar Residence',
      node_type: 'HOME',
      city: 'Chennai',
      latitude: 13.0418,
      longitude: 80.2341,
      address: 'T. Nagar, Chennai, Tamil Nadu',
      step_free_access: true,
      has_accessible_toilet: true,
      verification_status: 'COMMUNITY_CONFIRMED',
      knowledge_status: 'VERIFIED',
      confidence_score: 100,
    },
  });

  const metroNode = await prisma.placeNode.upsert({
    where: { id: 'node-chennai-metro' },
    update: {},
    create: {
      id: 'node-chennai-metro',
      name: 'Chennai Central Metro Station',
      node_type: 'STATION',
      city: 'Chennai',
      latitude: 13.0827,
      longitude: 80.2707,
      address: 'Puratchi Thalaivar Dr. M.G. Ramachandran Central Metro',
      step_free_access: true,
      has_accessible_toilet: true,
      has_elevator: true,
      verification_status: 'OPERATOR_VERIFIED',
      knowledge_status: 'VERIFIED',
      confidence_score: 95,
    },
  });

  const stadiumNode = await prisma.placeNode.upsert({
    where: { id: 'node-stadium-seating' },
    update: {},
    create: {
      id: 'node-stadium-seating',
      name: 'M. Chinnaswamy Stadium Stand B Seat W-12',
      node_type: 'SEATING',
      city: 'Bengaluru',
      latitude: 12.9788,
      longitude: 77.5996,
      address: 'Cubbon Road, Bengaluru, Karnataka',
      step_free_access: true,
      has_accessible_toilet: true,
      has_wheelchair_seating: true,
      verification_status: 'AUDITOR_VERIFIED',
      knowledge_status: 'VERIFIED',
      confidence_score: 98,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
