import { PrismaClient, NoteStatus } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create a sample user
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    },
  })

  console.log('👤 Created user:', user.name)

  // Create sample categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: 'Personal' } },
      update: {},
      create: {
        name: 'Personal',
        description: 'Personal notes and thoughts',
        color: '#10b981', // emerald
        userId: user.id,
      },
    }),
    prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: 'Work' } },
      update: {},
      create: {
        name: 'Work',
        description: 'Work-related notes and tasks',
        color: '#3b82f6', // blue
        userId: user.id,
      },
    }),
    prisma.category.upsert({
      where: { userId_name: { userId: user.id, name: 'Ideas' } },
      update: {},
      create: {
        name: 'Ideas',
        description: 'Creative ideas and inspiration',
        color: '#8b5cf6', // violet
        userId: user.id,
      },
    }),
  ])

  console.log('📁 Created categories:', categories.map(c => c.name).join(', '))

  // Create sample tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'important' },
      update: {},
      create: {
        name: 'important',
        color: '#ef4444', // red
      },
    }),
    prisma.tag.upsert({
      where: { name: 'urgent' },
      update: {},
      create: {
        name: 'urgent',
        color: '#f59e0b', // amber
      },
    }),
    prisma.tag.upsert({
      where: { name: 'meeting' },
      update: {},
      create: {
        name: 'meeting',
        color: '#06b6d4', // cyan
      },
    }),
    prisma.tag.upsert({
      where: { name: 'project' },
      update: {},
      create: {
        name: 'project',
        color: '#84cc16', // lime
      },
    }),
    prisma.tag.upsert({
      where: { name: 'learning' },
      update: {},
      create: {
        name: 'learning',
        color: '#6366f1', // indigo
      },
    }),
  ])

  console.log('🏷️ Created tags:', tags.map(t => t.name).join(', '))

  // Create sample notes
  const notes = [
    {
      title: 'Welcome to Your Note-Taking App',
      content: `# Welcome! 🎉

This is your first note in the app. Here are some features you can explore:

- **Rich text content** with markdown support
- **Categories** to organize your notes
- **Tags** for flexible labeling
- **Status tracking** (Draft, Published, Archived)

Start by creating your own notes and organizing them with categories and tags!`,
      status: NoteStatus.PUBLISHED,
      categoryId: categories[0].id, // Personal
      tagNames: ['important'],
    },
    {
      title: 'Project Planning Meeting Notes',
      content: `# Project Planning Meeting - ${new Date().toLocaleDateString()}

## Attendees
- John Doe
- Jane Smith
- Demo User

## Key Points
- Project deadline: End of next month
- Budget approved: $50,000
- Team size: 5 developers

## Action Items
- [ ] Set up development environment
- [ ] Create project timeline
- [ ] Schedule weekly check-ins

## Next Meeting
Next Friday at 2 PM`,
      status: NoteStatus.PUBLISHED,
      categoryId: categories[1].id, // Work
      tagNames: ['meeting', 'project', 'important'],
    },
    {
      title: 'Learning Goals for This Quarter',
      content: `# Learning Goals Q4 2024

## Technical Skills
1. **Next.js 15** - Master the latest features
2. **Prisma** - Advanced database modeling
3. **TypeScript** - Advanced types and patterns

## Soft Skills
- Public speaking
- Team leadership
- Project management

## Resources
- Online courses
- Tech conferences
- Mentorship program

## Progress Tracking
- Weekly reviews
- Monthly assessments
- Quarterly retrospectives`,
      status: NoteStatus.DRAFT,
      categoryId: categories[0].id, // Personal
      tagNames: ['learning', 'project'],
    },
    {
      title: 'App Feature Ideas',
      content: `# Feature Ideas 💡

## High Priority
- [ ] Dark mode toggle
- [ ] Search functionality
- [ ] Export notes to PDF
- [ ] Note templates

## Medium Priority
- [ ] Collaborative editing
- [ ] Note sharing
- [ ] Mobile app
- [ ] Offline support

## Nice to Have
- [ ] AI-powered suggestions
- [ ] Voice notes
- [ ] Integration with calendar
- [ ] Custom themes

## Implementation Notes
Start with search functionality as it will have the biggest impact on user experience.`,
      status: NoteStatus.DRAFT,
      categoryId: categories[2].id, // Ideas
      tagNames: ['project', 'important'],
    },
    {
      title: 'Quick Thoughts',
      content: `# Random Thoughts 🤔

Just some quick ideas I want to remember:

- Coffee shop on 5th street has amazing pastries
- Need to call mom this weekend
- Book recommendation: "The Pragmatic Programmer"
- Weather is perfect for hiking this weekend
- Remember to water the plants

Sometimes the best ideas come from the most random thoughts!`,
      status: NoteStatus.PUBLISHED,
      categoryId: categories[0].id, // Personal
      tagNames: [],
    },
  ]

  // Create notes with tags
  for (const noteData of notes) {
    const { tagNames, ...noteInfo } = noteData
    
    const note = await prisma.note.create({
      data: {
        ...noteInfo,
        userId: user.id,
      },
    })

    // Add tags to the note
    if (tagNames.length > 0) {
      const noteTags = tagNames.map(tagName => {
        const tag = tags.find(t => t.name === tagName)
        return {
          noteId: note.id,
          tagId: tag!.id,
        }
      })

      await prisma.noteTags.createMany({
        data: noteTags,
      })
    }

    console.log(`📝 Created note: "${note.title}" with ${tagNames.length} tags`)
  }

  console.log('✅ Seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
