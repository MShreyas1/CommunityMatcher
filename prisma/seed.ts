import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.vettingVote.deleteMany();
  await prisma.swipe.deleteMany();
  await prisma.match.deleteMany();
  await prisma.communityMember.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 12);

  // Create users
  const alice = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@example.com",
      password,
      image: null,
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Smith",
      email: "bob@example.com",
      password,
      image: null,
    },
  });

  const carol = await prisma.user.create({
    data: {
      name: "Carol Davis",
      email: "carol@example.com",
      password,
      image: null,
    },
  });

  const dave = await prisma.user.create({
    data: {
      name: "Dave Wilson",
      email: "dave@example.com",
      password,
      image: null,
    },
  });

  const emma = await prisma.user.create({
    data: {
      name: "Emma Martinez",
      email: "emma@example.com",
      password,
      image: null,
    },
  });

  const frank = await prisma.user.create({
    data: {
      name: "Frank Lee",
      email: "frank@example.com",
      password,
      image: null,
    },
  });

  console.log("Created 6 users");

  // Create profiles
  await prisma.profile.createMany({
    data: [
      {
        userId: alice.id,
        displayName: "Alice",
        bio: "Software engineer who loves hiking and board games. Looking for someone to explore coffee shops with!",
        dateOfBirth: new Date("1995-03-15"),
        gender: "female",
        location: "San Francisco, CA",
        occupation: "Software Engineer",
        lookingFor: "men",
        ageMin: 25,
        ageMax: 35,
        maxDistance: 30,
        relationshipGoal: "long-term",
      },
      {
        userId: bob.id,
        displayName: "Bob",
        bio: "Chef by day, musician by night. I make a mean pasta and play guitar poorly but enthusiastically.",
        dateOfBirth: new Date("1993-07-22"),
        gender: "male",
        location: "San Francisco, CA",
        occupation: "Chef",
        lookingFor: "women",
        ageMin: 24,
        ageMax: 34,
        maxDistance: 25,
        relationshipGoal: "long-term",
      },
      {
        userId: carol.id,
        displayName: "Carol",
        bio: "Architect with a passion for sustainable design. Weekend warrior - you'll find me rock climbing or at a farmers market.",
        dateOfBirth: new Date("1996-11-08"),
        gender: "female",
        location: "Oakland, CA",
        occupation: "Architect",
        lookingFor: "men",
        ageMin: 26,
        ageMax: 38,
        maxDistance: 40,
        relationshipGoal: "long-term",
      },
      {
        userId: dave.id,
        displayName: "Dave",
        bio: "Data scientist and amateur astronomer. I'll bore you with space facts and make up for it with great cocktails.",
        dateOfBirth: new Date("1992-01-30"),
        gender: "male",
        location: "Berkeley, CA",
        occupation: "Data Scientist",
        lookingFor: "women",
        ageMin: 25,
        ageMax: 35,
        maxDistance: 35,
        relationshipGoal: "long-term",
      },
      {
        userId: emma.id,
        displayName: "Emma",
        bio: "Product designer who paints on weekends. Dog mom to a golden retriever named Pixel. Always up for trying new restaurants.",
        dateOfBirth: new Date("1994-06-12"),
        gender: "female",
        location: "San Francisco, CA",
        occupation: "Product Designer",
        lookingFor: "everyone",
        ageMin: 24,
        ageMax: 36,
        maxDistance: 30,
        relationshipGoal: "short-term",
      },
      {
        userId: frank.id,
        displayName: "Frank",
        bio: "Teacher and marathon runner. I believe in lifelong learning and early morning runs. Let's grab brunch after a 10K?",
        dateOfBirth: new Date("1991-09-05"),
        gender: "male",
        location: "San Jose, CA",
        occupation: "High School Teacher",
        lookingFor: "women",
        ageMin: 25,
        ageMax: 38,
        maxDistance: 50,
        relationshipGoal: "long-term",
      },
    ],
  });

  console.log("Created 6 profiles");

  // Create community circles
  // Alice's circle: Bob and Carol are her vetters
  const aliceBobMember = await prisma.communityMember.create({
    data: {
      ownerId: alice.id,
      vetterId: bob.id,
      role: "FRIEND",
      status: "ACCEPTED",
    },
  });

  const aliceCarolMember = await prisma.communityMember.create({
    data: {
      ownerId: alice.id,
      vetterId: carol.id,
      role: "FRIEND",
      status: "ACCEPTED",
    },
  });

  // Bob's circle: Alice is his vetter
  await prisma.communityMember.create({
    data: {
      ownerId: bob.id,
      vetterId: alice.id,
      role: "FRIEND",
      status: "ACCEPTED",
    },
  });

  // Dave's circle: Frank is his vetter, Emma is pending
  await prisma.communityMember.create({
    data: {
      ownerId: dave.id,
      vetterId: frank.id,
      role: "COLLEAGUE",
      status: "ACCEPTED",
    },
  });

  await prisma.communityMember.create({
    data: {
      ownerId: dave.id,
      vetterId: emma.id,
      role: "FRIEND",
      status: "PENDING",
    },
  });

  console.log("Created community circles");

  // Create swipes and matches
  // Alice and Dave: mutual match
  const [u1_ad, u2_ad] = [alice.id, dave.id].sort();
  await prisma.swipe.create({
    data: { swiperId: alice.id, swipedId: dave.id, action: "ACCEPT" },
  });
  await prisma.swipe.create({
    data: { swiperId: dave.id, swipedId: alice.id, action: "ACCEPT" },
  });

  const matchAliceDave = await prisma.match.create({
    data: {
      user1Id: u1_ad,
      user2Id: u2_ad,
      status: "ACTIVE",
      communityScore: 75,
    },
  });

  // Alice and Frank: mutual match
  const [u1_af, u2_af] = [alice.id, frank.id].sort();
  await prisma.swipe.create({
    data: { swiperId: alice.id, swipedId: frank.id, action: "ACCEPT" },
  });
  await prisma.swipe.create({
    data: { swiperId: frank.id, swipedId: alice.id, action: "ACCEPT" },
  });

  const matchAliceFrank = await prisma.match.create({
    data: {
      user1Id: u1_af,
      user2Id: u2_af,
      status: "PENDING_VETTING",
      communityScore: 0,
    },
  });

  // Bob passed on Carol
  await prisma.swipe.create({
    data: { swiperId: bob.id, swipedId: carol.id, action: "PASS" },
  });

  console.log("Created swipes and matches");

  // Create conversations for matches
  const convo1 = await prisma.conversation.create({
    data: { matchId: matchAliceDave.id },
  });

  await prisma.conversationParticipant.createMany({
    data: [
      { conversationId: convo1.id, userId: alice.id },
      { conversationId: convo1.id, userId: dave.id },
    ],
  });

  // No conversation for Alice-Frank match — it's PENDING_VETTING

  // Add messages to Alice-Dave conversation
  await prisma.message.create({
    data: {
      conversationId: convo1.id,
      senderId: dave.id,
      content: "Hey Alice! I saw you're into hiking - have you done any trails in Marin recently?",
      createdAt: new Date(Date.now() - 3600000 * 5),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: convo1.id,
      senderId: alice.id,
      content: "Hi Dave! Yes, I did the Dipsea Trail last weekend - it was gorgeous! Do you hike much?",
      createdAt: new Date(Date.now() - 3600000 * 4),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: convo1.id,
      senderId: dave.id,
      content: "I love Dipsea! I usually do it as a loop with Steep Ravine. We should go together sometime!",
      createdAt: new Date(Date.now() - 3600000 * 3),
    },
  });

  await prisma.message.create({
    data: {
      conversationId: convo1.id,
      senderId: alice.id,
      content: "That sounds amazing! How about this Saturday if the weather holds up?",
      createdAt: new Date(Date.now() - 3600000 * 2),
    },
  });

  console.log("Created conversations and messages");

  // Create vetting votes on Alice-Dave match
  await prisma.vettingVote.create({
    data: {
      communityMemberId: aliceBobMember.id,
      matchId: matchAliceDave.id,
      vote: "APPROVE",
      comment: "Dave seems like a great guy, very thoughtful and smart!",
    },
  });

  await prisma.vettingVote.create({
    data: {
      communityMemberId: aliceCarolMember.id,
      matchId: matchAliceDave.id,
      vote: "APPROVE",
      comment: "I think you two would really hit it off. He's into similar stuff.",
    },
  });

  console.log("Created vetting votes");

  console.log("\n--- Seed Complete ---");
  console.log("\nTest accounts (all passwords: password123):");
  console.log("  alice@example.com  - Has matches, messages, community circle");
  console.log("  bob@example.com    - Vetter in Alice's circle");
  console.log("  carol@example.com  - Vetter in Alice's circle");
  console.log("  dave@example.com   - Matched with Alice, has community circle");
  console.log("  emma@example.com   - Pending invite from Dave");
  console.log("  frank@example.com  - Matched with Alice, vetter for Dave");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
