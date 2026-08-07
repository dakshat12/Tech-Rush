require('dotenv').config();
const bcrypt = require('bcrypt');
const prisma = require('../config/db');

async function main() {
  console.log('Seeding database with initial data...');

  // 0. Clear tables that are re-created from scratch on every run.
  // Users, Badges, and Announcements use upsert()/unique keys below so they are
  // safe to re-run, but Events and Tasks were previously created with plain
  // create() calls (no unique key), which duplicated every row on every re-seed.
  // Deleting them first makes this script idempotent — safe to run any number
  // of times without producing duplicate events/tasks.
  console.log('Clearing existing events & tasks for a clean reseed...');
  await prisma.checkIn.deleteMany({});
  await prisma.registration.deleteMany({});
  await prisma.volunteerAssignment.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.event.deleteMany({});

  // 1. Create Badges
  const badgeData = [
    { icon: '🏆', name: 'Event Hero', desc: '50+ events organized' },
    { icon: '⚡', name: 'Speed Demon', desc: 'First to complete tasks' },
    { icon: '🤝', name: 'Team Player', desc: '100+ collaborations' },
    { icon: '🌟', name: 'Rising Star', desc: 'Top 10% volunteer' },
    { icon: '🎯', name: 'Precision', desc: '0 missed deadlines' },
    { icon: '🔥', name: 'On Fire', desc: '30-day streak' },
  ];

  for (const b of badgeData) {
    await prisma.badge.upsert({
      where: { name: b.name },
      update: b,
      create: b,
    });
  }

  const badges = await prisma.badge.findMany();
  const badgeMap = Object.fromEntries(badges.map(b => [b.name, b.id]));

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const usersToCreate = [
    {
      name: 'Alex Chen',
      email: 'alex@evently.com',
      passwordHash,
      role: 'ORGANIZER',
      roleTitle: 'Team Lead',
      avatarUrl: 'photo-1507003211169-0a1dd7228f2d',
      xp: 4820,
      level: 12,
      streak: 14,
    },
    {
      name: 'Priya Sharma',
      email: 'priya@evently.com',
      passwordHash,
      role: 'VOLUNTEER',
      roleTitle: 'Logistics',
      avatarUrl: 'photo-1494790108377-be9c29b29330',
      xp: 3940,
      level: 10,
      streak: 9,
    },
    {
      name: 'Marcus Jones',
      email: 'marcus@evently.com',
      passwordHash,
      role: 'VOLUNTEER',
      roleTitle: 'Tech Support',
      avatarUrl: 'photo-1472099645785-5658abf4ff4e',
      xp: 3620,
      level: 9,
      streak: 7,
    },
    {
      name: 'Jamie',
      email: 'jamie@evently.com',
      passwordHash,
      role: 'VOLUNTEER',
      roleTitle: 'Media',
      avatarUrl: 'photo-1535713875002-d1d0cf377fde',
      xp: 2650,
      level: 7,
      streak: 3,
    },
    {
      name: 'Jordan Smith',
      email: 'jordan@evently.com',
      passwordHash,
      role: 'ATTENDEE',
      roleTitle: 'Attendee',
      avatarUrl: 'photo-1438761681033-6461ffad8d80',
      xp: 450,
      level: 2,
      streak: 1,
    },
  ];

  const createdUsers = {};
  for (const u of usersToCreate) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: u,
      create: u,
    });
    createdUsers[u.name] = user;
  }

  // Assign Badges to Jamie & Alex
  if (badgeMap['Event Hero'] && createdUsers['Alex Chen']) {
    await prisma.userBadge.upsert({
      where: { id: 1 },
      update: {},
      create: { userId: createdUsers['Alex Chen'].id, badgeId: badgeMap['Event Hero'] },
    }).catch(() => {});
  }
  if (badgeMap['Speed Demon'] && createdUsers['Jamie']) {
    await prisma.userBadge.upsert({
      where: { id: 2 },
      update: {},
      create: { userId: createdUsers['Jamie'].id, badgeId: badgeMap['Speed Demon'] },
    }).catch(() => {});
  }

  // 3. Create Events
  const organizer = createdUsers['Alex Chen'];

  const eventsData = [
    {
      title: 'Global AI Summit 2025',
      category: 'Tech',
      description: 'The world premier artificial intelligence & machine learning summit.',
      venue: 'San Francisco Convention Center',
      location: 'San Francisco, CA',
      capacity: 3000,
      price: 'Free',
      trending: true,
      tags: ['AI', 'ML', 'Innovation'],
      color: '#7c3aed',
      startTime: new Date('2025-08-15T09:00:00Z'),
      endTime: new Date('2025-08-17T18:00:00Z'),
      organizerId: organizer.id,
      imageUrl: 'photo-1540575467063-178a50c2df87',
    },
    {
      title: 'Design Systems Conference',
      category: 'Design',
      description: 'Building cohesive UI component systems and design tokens at scale.',
      venue: 'Metropolitan Pavilion',
      location: 'New York, NY',
      capacity: 1200,
      price: '$149',
      trending: true,
      tags: ['Design', 'Systems', 'UI'],
      color: '#06b6d4',
      startTime: new Date('2025-09-03T10:00:00Z'),
      endTime: new Date('2025-09-04T17:00:00Z'),
      organizerId: organizer.id,
      imageUrl: 'photo-1558618666-fcd25c85cd64',
    },
    {
      title: 'Climate Action Hackathon',
      category: 'Social',
      description: 'Hack for sustainability, carbon reduction, and green energy solutions.',
      venue: 'Austin Innovation Center',
      location: 'Austin, TX',
      capacity: 500,
      price: 'Free',
      trending: false,
      tags: ['Climate', 'Hack', 'SDGs'],
      color: '#10b981',
      startTime: new Date('2025-08-28T08:00:00Z'),
      endTime: new Date('2025-08-29T20:00:00Z'),
      organizerId: organizer.id,
      imageUrl: 'photo-1497366216548-37526070297c',
    },
    {
      title: 'Startup Founders Retreat',
      category: 'Business',
      description: 'Exclusive networking retreat for high-growth tech founders & VCs.',
      venue: 'Biscayne Bay Hotel',
      location: 'Miami, FL',
      capacity: 250,
      price: '$299',
      trending: false,
      tags: ['Founders', 'VC', 'Networking'],
      color: '#f59e0b',
      startTime: new Date('2025-09-12T09:00:00Z'),
      endTime: new Date('2025-09-14T15:00:00Z'),
      organizerId: organizer.id,
      imageUrl: 'photo-1559136555-9303baea8ebd',
    },
    {
      title: 'Community Clean-Up Drive',
      category: 'Volunteer',
      description: 'Join local volunteers to restore park trails and waterfront areas.',
      venue: 'Lincoln Park',
      location: 'Chicago, IL',
      capacity: 300,
      price: 'Free',
      trending: false,
      tags: ['Community', 'Environment'],
      color: '#ef4444',
      startTime: new Date('2025-08-20T08:00:00Z'),
      endTime: new Date('2025-08-20T14:00:00Z'),
      organizerId: organizer.id,
      imageUrl: 'photo-1593113598332-cd288d649433',
    },
    {
      title: 'Web3 & DeFi Expo',
      category: 'Tech',
      description: 'Exploring decentralized finance, smart contracts, and Web3 infrastructure.',
      venue: 'LA Convention Center',
      location: 'Los Angeles, CA',
      capacity: 2000,
      price: '$79',
      trending: true,
      tags: ['Web3', 'DeFi', 'Crypto'],
      color: '#8b5cf6',
      startTime: new Date('2025-10-05T09:00:00Z'),
      endTime: new Date('2025-10-06T18:00:00Z'),
      organizerId: organizer.id,
      imageUrl: 'photo-1639762681485-074b7f938ba0',
    },
  ];

  const createdEvents = [];
  for (const e of eventsData) {
    const event = await prisma.event.create({ data: e });
    createdEvents.push(event);
  }

  // 4. Create Kanban Tasks for Volunteers
  const jamie = createdUsers['Jamie'];
  const firstEvent = createdEvents[0];

  const tasksData = [
    { title: 'Set up registration booth', priority: 'high', stage: 'todo', due: 'Aug 14', assigneeId: jamie.id, assigneeName: 'Jamie', eventId: firstEvent.id },
    { title: 'Print volunteer badges', priority: 'medium', stage: 'todo', due: 'Aug 14', assigneeId: jamie.id, assigneeName: 'Jamie', eventId: firstEvent.id },
    { title: 'Coordinate speaker transport', priority: 'high', stage: 'inProgress', due: 'Aug 15', assigneeId: jamie.id, assigneeName: 'Jamie', eventId: firstEvent.id },
    { title: 'Test A/V equipment', priority: 'medium', stage: 'inProgress', due: 'Aug 15', assigneeId: jamie.id, assigneeName: 'Jamie', eventId: firstEvent.id },
    { title: 'Create event program PDF', priority: 'low', stage: 'done', due: 'Aug 10', assigneeId: jamie.id, assigneeName: 'Jamie', eventId: firstEvent.id },
    { title: 'Confirm catering order', priority: 'medium', stage: 'done', due: 'Aug 12', assigneeId: jamie.id, assigneeName: 'Jamie', eventId: firstEvent.id },
  ];

  for (const t of tasksData) {
    await prisma.task.create({ data: t });
  }

  // 5. Create Announcements
  const announcementsData = [
    { title: 'Venue update for AI Summit', body: 'The main hall has been upgraded to accommodate 500 more attendees.', urgent: true, time: '2h ago', eventId: firstEvent.id },
    { title: 'Volunteer training session', body: 'Mandatory briefing scheduled for Aug 14 at 9 AM in Room B.', urgent: false, time: '5h ago', eventId: firstEvent.id },
    { title: 'New sponsor confirmed', body: 'TechCorp joining as Diamond Sponsor — branded booths incoming.', urgent: false, time: '1d ago', eventId: firstEvent.id },
  ];

  for (const a of announcementsData) {
    await prisma.announcement.create({ data: a });
  }

  // 6. Create Attendee Registration & Ticket
  const attendee = createdUsers['Jordan Smith'];
  const qrToken = `TICKET-AI-SUMMIT-2025-${attendee.id}-${Date.now()}`;
  await prisma.registration.create({
    data: {
      eventId: firstEvent.id,
      userId: attendee.id,
      qrToken,
      status: 'registered',
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
