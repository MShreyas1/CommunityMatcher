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
  await prisma.match.deleteMany();
  await prisma.checklistResponse.deleteMany();
  await prisma.suggestionVote.deleteMany();
  await prisma.suggestion.deleteMany();
  await prisma.checklistItem.deleteMany();
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

  // Create profiles with photos
  const seedProfiles = [
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
      detailPreset: "indian",
      detailAnswers: {
        gothramNakshatram: "Bharadwaj / Rohini",
        education: "MS Computer Science, Stanford",
        raisedIn: "Chennai, Tamil Nadu",
        countryRaisedIn: "India and USA",
        height: "5'4\"",
        foodHabits: "Vegetarian",
        drinkingHabits: "I drink on rare occasion",
        smokingHabits: "I do not smoke",
        previouslyMarried: "No",
      },
      _photos: [
        { url: "https://randomuser.me/api/portraits/women/44.jpg", key: "seed-alice-1", order: 0, isPrimary: true },
        { url: "https://randomuser.me/api/portraits/women/45.jpg", key: "seed-alice-2", order: 1, isPrimary: false },
      ],
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
      _photos: [
        { url: "https://randomuser.me/api/portraits/men/32.jpg", key: "seed-bob-1", order: 0, isPrimary: true },
        { url: "https://randomuser.me/api/portraits/men/34.jpg", key: "seed-bob-2", order: 1, isPrimary: false },
      ],
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
      _photos: [
        { url: "https://randomuser.me/api/portraits/women/67.jpg", key: "seed-carol-1", order: 0, isPrimary: true },
        { url: "https://randomuser.me/api/portraits/women/68.jpg", key: "seed-carol-2", order: 1, isPrimary: false },
      ],
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
      detailPreset: "indian",
      detailAnswers: {
        gothramNakshatram: "Kaushika / Uthiram",
        education: "PhD Data Science, UC Berkeley",
        raisedIn: "Cupertino, CA",
        countryRaisedIn: "USA",
        height: "5'10\"",
        foodHabits: "Vegetarian",
        drinkingHabits: "I am a social drinker",
        smokingHabits: "I do not smoke",
        previouslyMarried: "No",
      },
      _photos: [
        { url: "https://randomuser.me/api/portraits/men/75.jpg", key: "seed-dave-1", order: 0, isPrimary: true },
        { url: "https://randomuser.me/api/portraits/men/76.jpg", key: "seed-dave-2", order: 1, isPrimary: false },
      ],
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
      _photos: [
        { url: "https://randomuser.me/api/portraits/women/21.jpg", key: "seed-emma-1", order: 0, isPrimary: true },
        { url: "https://randomuser.me/api/portraits/women/23.jpg", key: "seed-emma-2", order: 1, isPrimary: false },
      ],
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
      _photos: [
        { url: "https://randomuser.me/api/portraits/men/86.jpg", key: "seed-frank-1", order: 0, isPrimary: true },
        { url: "https://randomuser.me/api/portraits/men/88.jpg", key: "seed-frank-2", order: 1, isPrimary: false },
      ],
    },
  ];

  for (const { _photos, ...profileFields } of seedProfiles) {
    const created = await prisma.profile.create({ data: profileFields });
    await prisma.photo.createMany({
      data: _photos.map((p) => ({ ...p, profileId: created.id })),
    });
  }

  console.log("Created 6 profiles with photos");

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
  const daveFrankMember = await prisma.communityMember.create({
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

  // ─── Checklist Items ───
  // Alice defines qualities she cares about
  const clHumor = await prisma.checklistItem.create({
    data: { userId: alice.id, label: "Good sense of humor", order: 0 },
  });
  const clAmbitious = await prisma.checklistItem.create({
    data: { userId: alice.id, label: "Ambitious", order: 1 },
  });
  const clKind = await prisma.checklistItem.create({
    data: { userId: alice.id, label: "Kind to others", order: 2 },
  });
  const clOutdoorsy = await prisma.checklistItem.create({
    data: { userId: alice.id, label: "Enjoys the outdoors", order: 3 },
  });

  // Dave has a couple checklist items too
  await prisma.checklistItem.create({
    data: { userId: dave.id, label: "Creative", order: 0 },
  });
  await prisma.checklistItem.create({
    data: { userId: dave.id, label: "Adventurous", order: 1 },
  });

  console.log("Created checklist items");

  // ─── Suggestions ───

  // Bob and Carol both suggest Dave to Alice (APPROVE + comments) → consolidated Suggestion
  const suggestionDaveForAlice = await prisma.suggestion.create({
    data: {
      ownerId: alice.id,
      suggestedId: dave.id,
      status: "APPROVED",
      communityScore: 100,
    },
  });

  const bobVoteDave = await prisma.suggestionVote.create({
    data: {
      suggestionId: suggestionDaveForAlice.id,
      communityMemberId: aliceBobMember.id,
      vote: "APPROVE",
      comment: "Dave seems like a great guy, very thoughtful and smart!",
    },
  });

  // Bob checked: humor, kind, outdoorsy
  await prisma.checklistResponse.createMany({
    data: [
      { suggestionVoteId: bobVoteDave.id, checklistItemId: clHumor.id },
      { suggestionVoteId: bobVoteDave.id, checklistItemId: clKind.id },
      { suggestionVoteId: bobVoteDave.id, checklistItemId: clOutdoorsy.id },
    ],
  });

  const carolVoteDave = await prisma.suggestionVote.create({
    data: {
      suggestionId: suggestionDaveForAlice.id,
      communityMemberId: aliceCarolMember.id,
      vote: "APPROVE",
      comment: "I think you two would really hit it off. He's into similar stuff.",
    },
  });

  // Carol checked: ambitious, outdoorsy
  await prisma.checklistResponse.createMany({
    data: [
      { suggestionVoteId: carolVoteDave.id, checklistItemId: clAmbitious.id },
      { suggestionVoteId: carolVoteDave.id, checklistItemId: clOutdoorsy.id },
    ],
  });

  // Bob suggests Frank to Alice (NEUTRAL) → PENDING suggestion
  const suggestionFrankForAlice = await prisma.suggestion.create({
    data: {
      ownerId: alice.id,
      suggestedId: frank.id,
      status: "PENDING",
      communityScore: 50, // neutral = 50%
    },
  });

  await prisma.suggestionVote.create({
    data: {
      suggestionId: suggestionFrankForAlice.id,
      communityMemberId: aliceBobMember.id,
      vote: "NEUTRAL",
      comment: "He seems nice but I don't know him well enough to say.",
    },
  });

  // Frank suggests Carol to Dave (APPROVE) → PENDING suggestion
  const suggestionCarolForDave = await prisma.suggestion.create({
    data: {
      ownerId: dave.id,
      suggestedId: carol.id,
      status: "PENDING",
      communityScore: 100,
    },
  });

  await prisma.suggestionVote.create({
    data: {
      suggestionId: suggestionCarolForDave.id,
      communityMemberId: daveFrankMember.id,
      vote: "APPROVE",
      comment: "Carol is awesome - super smart and into outdoor stuff like you!",
    },
  });

  console.log("Created suggestions and votes");

  // ─── Alice approved the Dave suggestion → Match + Conversation ───

  const [u1, u2] = [alice.id, dave.id].sort();

  const matchAliceDave = await prisma.match.create({
    data: {
      user1Id: u1,
      user2Id: u2,
      status: "ACTIVE",
      communityScore: 100,
      suggestionId: suggestionDaveForAlice.id,
    },
  });

  const convo1 = await prisma.conversation.create({
    data: { matchId: matchAliceDave.id },
  });

  await prisma.conversationParticipant.createMany({
    data: [
      { conversationId: convo1.id, userId: alice.id },
      { conversationId: convo1.id, userId: dave.id },
    ],
  });

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

  console.log("Created match, conversation, and messages");

  console.log("\n--- Seed Complete ---");
  console.log("\nTest accounts (all passwords: password123):");
  console.log("  alice@example.com  - Has approved suggestion (Dave), pending suggestion (Frank), active match + messages");
  console.log("  bob@example.com    - Vetter in Alice's circle, suggested Dave and Frank");
  console.log("  carol@example.com  - Vetter in Alice's circle, suggested Dave");
  console.log("  dave@example.com   - Matched with Alice, has pending suggestion (Carol from Frank)");
  console.log("  emma@example.com   - Pending invite from Dave");
  console.log("  frank@example.com  - Vetter for Dave, suggested Carol");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
