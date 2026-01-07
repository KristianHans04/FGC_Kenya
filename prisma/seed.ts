import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')
  
  // Create test users for each role
  const testUsers = [
    {
      email: 'sadmin@example.com',
      firstName: 'Super',
      lastName: 'Admin',
      school: 'FGC Kenya HQ',
      role: 'SUPER_ADMIN',
      cohort: null
    },
    {
      email: 'admin@example.com',
      firstName: 'Regular', 
      lastName: 'Admin',
      school: 'FGC Kenya HQ',
      role: 'ADMIN',
      cohort: null
    },
    {
      email: 'mentor@example.com',
      firstName: 'John',
      lastName: 'Mentor',
      school: 'Nairobi School',
      role: 'MENTOR',
      cohort: 'FGC2026'
    },
    {
      email: 'student@example.com',
      firstName: 'Jane',
      lastName: 'Student',
      school: 'Mombasa High School',
      role: 'STUDENT',
      cohort: 'FGC2026'
    },
    {
      email: 'alumni@example.com',
      firstName: 'Alice',
      lastName: 'Alumni',
      school: 'Kisumu Girls',
      role: 'ALUMNI',
      cohort: 'FGC2024'
    },
    {
      email: 'user@example.com',
      firstName: 'Bob',
      lastName: 'User',
      school: 'Eldoret School',
      role: 'USER',
      cohort: null
    }
  ]

  for (const userData of testUsers) {
    // Create or update user
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        school: userData.school,
        role: userData.role as any,
        emailVerified: true,
        isActive: true
      },
      create: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        school: userData.school,
        role: userData.role as any,
        emailVerified: true,
        isActive: true
      }
    })

    console.log(`Created/Updated user: ${user.email}`)
  }

  // Clear existing data  
  await prisma.$transaction([
    prisma.externalLink.deleteMany(),
    prisma.quickStartGuide.deleteMany(),
    prisma.outreachProgram.deleteMany(),
    prisma.partner.deleteMany(),
    prisma.milestone.deleteMany(),
    prisma.impactStory.deleteMany(),
    prisma.resource.deleteMany(),
    prisma.competition.deleteMany(),
    prisma.newsArticle.deleteMany(),
    prisma.teamMember.deleteMany(),
    prisma.siteStat.deleteMany(),
  ])

  // Seed Site Statistics
  await prisma.siteStat.createMany({
    data: [
      { key: 'years_active', value: 8, suffix: '+', label: 'Years Active', icon: 'Calendar', order: 1 },
      { key: 'students_impacted', value: 500, suffix: '+', label: 'Students Impacted', icon: 'Users', order: 2 },
      { key: 'global_competitions', value: 8, label: 'Global Competitions', icon: 'Globe', order: 3 },
      { key: 'awards_won', value: 12, suffix: '+', label: 'Awards Won', icon: 'Trophy', order: 4 },
    ],
  })

  // Seed Competitions Timeline
  await prisma.competition.createMany({
    data: [
      {
        year: '2017',
        location: 'Washington D.C., USA',
        theme: 'H2O Flow',
        achievement: 'Inaugural participation, representing Kenya on the global stage',
        highlights: ['First Kenyan team', 'International exposure', 'Cultural exchange'],
      },
      {
        year: '2018',
        location: 'Mexico City, Mexico',
        theme: 'Energy Impact',
        achievement: 'Strengthened international partnerships',
        highlights: ['Improved ranking', 'Technical innovation', 'Team collaboration'],
      },
      {
        year: '2019',
        location: 'Dubai, UAE',
        theme: 'Ocean Opportunities',
        achievement: 'Excellence in Engineering Documentation Award',
        highlights: ['Award recognition', 'Middle East debut', 'Technical excellence'],
      },
      {
        year: '2020',
        location: 'Virtual Competition',
        theme: 'CONNECTING COMMUNITIES',
        achievement: 'Adapted to virtual format during COVID-19',
        highlights: ['Remote collaboration', 'Digital innovation', 'Resilience'],
      },
      {
        year: '2021',
        location: 'Virtual Competition',
        theme: 'DISCOVER & RECOVER',
        achievement: 'Continued excellence in virtual format',
        highlights: ['Improved virtual strategies', 'Community outreach', 'STEM advocacy'],
      },
      {
        year: '2022',
        location: 'Geneva, Switzerland',
        theme: 'Carbon Capture',
        achievement: 'Return to in-person competition',
        highlights: JSON.stringify(['Strong comeback', 'Environmental focus', 'Global networking']),
      },
      {
        year: '2023',
        location: 'Singapore',
        theme: 'Hydrogen Horizons',
        achievement: 'Top African team performance',
        highlights: ['Regional excellence', 'Innovation award', 'Future energy solutions'],
      },
      {
        year: '2024',
        location: 'Athens, Greece',
        theme: 'Feeding the Future',
        achievement: 'Outstanding performance in agricultural robotics',
        highlights: ['Sustainability focus', 'Cross-cultural collaboration', 'Technical advancement'],
      },
      {
        year: '2025',
        location: 'Panama City, Panama',
        theme: 'Eco Equilibrium',
        achievement: 'Upcoming competition focused on environmental balance',
        highlights: ['Environmental solutions', 'Ecosystem protection', 'Sustainable innovation'],
      },
    ],
  })

  // Seed Milestones
  await prisma.milestone.createMany({
    data: [
      { number: '500+', label: 'Students Trained', order: 1 },
      { number: '50+', label: 'Mentors & Volunteers', order: 2 },
      { number: '8', label: 'Global Competitions', order: 3 },
      { number: '12+', label: 'Awards & Recognitions', order: 4 },
      { number: '20+', label: 'Partner Organizations', order: 5 },
      { number: '100+', label: 'Outreach Programs', order: 6 },
      { number: '85%', label: 'Alumni in STEM Fields', description: 'Of our alumni pursuing higher education or careers', order: 7 },
      { number: '60+', label: 'Career Opportunities', description: 'Created through our network and partnerships', order: 8 },
      { number: '20+', label: 'Innovation Projects', description: 'Initiated by our alumni and current members', order: 9 },
    ],
  })

  // Seed Outreach Programs
  await prisma.outreachProgram.createMany({
    data: [
      {
        title: 'School Robotics Clubs',
        description: 'Establishing robotics clubs in schools across Kenya',
        beneficiaries: '50+ schools',
        icon: 'Users',
      },
      {
        title: 'Weekend Workshops',
        description: 'Free workshops for students interested in STEM',
        beneficiaries: '200+ students monthly',
        icon: 'GraduationCap',
      },
      {
        title: 'Mentorship Program',
        description: 'Pairing experienced members with newcomers',
        beneficiaries: '100+ mentees',
        icon: 'Heart',
      },
      {
        title: 'Rural Outreach',
        description: 'Bringing STEM education to underserved communities',
        beneficiaries: '15+ counties',
        icon: 'Star',
      },
    ],
  })

  // Seed Impact Stories
  await prisma.impactStory.createMany({
    data: [
      {
        name: 'Sarah Muthoni',
        role: 'Aerospace Engineering Student',
        year: '2019 Team Member',
        story: "Participating in <i>FIRST</i> Global Challenge opened my eyes to the possibilities in engineering. Today, I'm pursuing aerospace engineering at university, inspired by the problem-solving skills I developed with Team Kenya.",
        impact: 'Now studying at MIT',
        featured: true,
      },
      {
        name: 'David Ochieng',
        role: 'Software Developer',
        year: '2018 Team Member',
        story: "The coding skills I learned while programming our robot became the foundation of my career. FGC taught me that technology can solve real-world problems, and now I'm developing apps that help farmers in Kenya.",
        impact: 'Founded AgriTech startup',
        featured: true,
      },
      {
        name: 'Grace Wanjiru',
        role: 'Robotics Teacher',
        year: '2017 Team Member',
        story: "After experiencing the transformative power of robotics education, I knew I wanted to bring the same opportunities to more students. I now teach robotics at three schools in Nairobi.",
        impact: 'Teaching 200+ students',
      },
      {
        name: 'James Kamau',
        role: 'Mechanical Engineer',
        year: '2020 Team Member',
        story: "The virtual competition during COVID-19 taught us resilience and innovation. Despite the challenges, we learned to collaborate remotely and adapt. These skills have been invaluable in my engineering career.",
        impact: 'Working at Tesla',
      },
    ],
  })

  // Seed News Articles
  await prisma.newsArticle.createMany({
    data: [
      {
        title: 'Team Kenya Prepares for <i>FIRST</i> Global Challenge 2025: Eco Equilibrium',
        excerpt: 'Our team is intensively preparing for the Eco Equilibrium challenge in Panama City this October. With focus on environmental balance and sustainable solutions...',
        category: 'Competition',
        date: new Date('2025-09-15'),
        readTime: '5 min read',
        author: 'Team Kenya Admin',
        tags: ['FGC 2025', 'Panama', 'Eco Equilibrium', 'Preparation'],
        featured: true,
      },
      {
        title: 'Kenya STEM Outreach Program Reaches 100 Schools',
        excerpt: 'Our outreach initiative has successfully reached its milestone of engaging with 100 schools across Kenya, inspiring thousands of students...',
        category: 'Outreach',
        date: new Date('2025-09-10'),
        readTime: '4 min read',
        author: 'Outreach Team',
        tags: ['Outreach', 'Education', 'STEM'],
      },
      {
        title: 'Alumni Success: Former Team Member Wins International Engineering Award',
        excerpt: 'Jane Wanjiru, a 2019 team member, has been recognized with the prestigious Young Engineer Award for her innovative work in renewable energy...',
        category: 'Alumni',
        date: new Date('2025-09-05'),
        readTime: '3 min read',
        author: 'Alumni Relations',
        tags: ['Alumni', 'Success Story', 'Awards'],
        featured: true,
      },
      {
        title: 'New Partnership with Tech Company Boosts Team Resources',
        excerpt: 'We are excited to announce a new partnership that will provide our team with cutting-edge robotics equipment and mentorship opportunities...',
        category: 'Partnership',
        date: new Date('2025-08-28'),
        readTime: '6 min read',
        author: 'Team Kenya Admin',
        tags: ['Partnership', 'Sponsorship', 'Resources'],
      },
      {
        title: 'Workshop Series: Introduction to Robotics for Beginners',
        excerpt: 'Join us for our monthly workshop series designed to introduce young students to the exciting world of robotics and programming...',
        category: 'Workshop',
        date: new Date('2025-08-20'),
        readTime: '4 min read',
        author: 'Education Team',
        tags: ['Workshop', 'Education', 'Robotics'],
      },
      {
        title: 'Team Kenya Reflection: Lessons from Greece 2024 - Feeding the Future',
        excerpt: "Looking back at our participation in Athens for the Feeding the Future challenge, we share key insights from our agricultural robotics solutions and experiences that shaped our team's growth...",
        category: 'Competition',
        date: new Date('2025-08-15'),
        readTime: '7 min read',
        author: 'Team Captain',
        tags: ['FGC 2024', 'Greece', 'Feeding the Future', 'Reflection'],
      },
    ],
  })

  // Seed Quick Start Guides
  await prisma.quickStartGuide.createMany({
    data: [
      {
        title: 'Student Starter Pack',
        description: 'Everything you need to begin your robotics journey',
        icon: 'Sparkles',
        color: 'text-kenya-green',
        items: ['Basic robotics concepts', 'Programming fundamentals', 'Tool usage', 'Safety guidelines'],
        order: 1,
      },
      {
        title: 'Teacher Resources',
        description: 'Materials for educators and mentors',
        icon: 'BookMarked',
        color: 'text-kenya-red',
        items: ['Lesson plans', 'Workshop materials', 'Assessment tools', 'Best practices'],
        order: 2,
      },
      {
        title: 'Competition Prep',
        description: 'Get ready for FIRST Global Challenge',
        icon: 'Trophy',
        color: 'text-accent',
        items: ['Game analysis', 'Robot inspection', 'Team strategies', 'Judging criteria'],
        order: 3,
      },
    ],
  })

  // Seed External Links
  await prisma.externalLink.createMany({
    data: [
      {
        title: '<i>FIRST</i> Global Official',
        description: 'Official <i>FIRST</i> Global website with rules and updates',
        url: 'https://first.global',
        icon: 'Globe',
        order: 1,
      },
      {
        title: 'GitHub - Team Kenya',
        description: 'Our open-source code and projects',
        url: 'https://github.com/firstglobalkenya',
        icon: 'Github',
        order: 2,
      },
      {
        title: 'YouTube Channel',
        description: 'Video tutorials and competition footage',
        url: 'https://youtube.com/@firstglobalkenya',
        icon: 'Youtube',
        order: 3,
      },
      {
        title: 'Online Learning Platform',
        description: 'Interactive courses and certifications',
        url: '#',
        icon: 'GraduationCap',
        order: 4,
      },
    ],
  })

  console.log('Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })