import { getDb } from "../server/db";
import * as dot from "dotenv";

dot.config();
const passwordHash = "dlfhdlfjdofhosdkjfkdjfohodsfjd";

async function main() {
  console.log("🌱 Seeding database...");
  const prisma = getDb({ connectionString: process.env.NUXT_DATABASE_URL! });
  console.time("Seeding complete 🌱");

  // Create roles
  console.log("Creating admin user...");
  const adminUser = await prisma.user.upsert({
    where: { email: "gado@gmail.com" },
    update: {},
    create: {
      name: "Kratosgado",
      email: "gado@gmail.com",
      passwordHash,
      bio: "Platform administrator",
      emailVerified: true,
      isAdmin: true,
    },
  });

  // Create author users
  console.log("Creating author users...");
  const usersData = [
    {
      name: "Prince Essilfie",
      email: "mbeahessilfieprince@gmail.com",
      avatarUrl: "https://avatars.githubusercontent.com/u/93322394?v=4",
      bio: "Technology enthusiast and software developer",
      passwordHash,
    },
    {
      name: "Sarah Johnson",
      email: "sarah@blogplatform.com",
      avatarUrl: "https://i.pravatar.cc/150?img=7",
      bio: "Design expert and UX researcher",
      passwordHash,
    },
    {
      name: "Mike Chen",
      email: "mike@blogplatform.com",
      avatarUrl: "https://i.pravatar.cc/150?img=9",
      bio: "Data scientist and machine learning expert",
      passwordHash,
    },
  ];

  const createdUsers: any[] = [];
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    });
    createdUsers.push(user);
  }

  // Create categories
  console.log("Creating categories...");
  const categoriesData = [
    {
      name: "Technology",
      id: "technology",
      description: "Latest technology trends and innovations",
    },
    {
      name: "Design",
      id: "design",
      description: "UI/UX design principles and best practices",
    },
    {
      name: "Development",
      id: "development",
      description: "Programming tutorials and development guides",
    },
    {
      name: "Business",
      id: "business",
      description: "Business strategies and entrepreneurship",
    },
    {
      name: "Lifestyle",
      id: "lifestyle",
      description: "Work-life balance and productivity tips",
    },
  ];

  const createdCategories: any[] = [];
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    });
    createdCategories.push(c);
  }

  // Create tags
  console.log("Creating tags...");
  const tagsData = [
    { name: "JavaScript", id: "javascript", color: "#f7df1e" },
    { name: "TypeScript", id: "typescript", color: "#3178c6" },
    { name: "React", id: "react", color: "#61dafb" },
    { name: "Vue", id: "vue", color: "#4fc08d" },
    { name: "Node.js", id: "nodejs", color: "#339933" },
    { name: "CSS", id: "css", color: "#1572b6" },
    { name: "HTML", id: "html", color: "#e34f26" },
    { name: "UI/UX", id: "ui-ux", color: "#ff6b6b" },
    { name: "Tutorial", id: "tutorial", color: "#4ecdc4" },
    { name: "Best Practices", id: "best-practices", color: "#45b7d1" },
  ];

  const createdTags: any[] = [];
  for (const t of tagsData) {
    const tag = await prisma.tag.upsert({
      where: { id: t.id },
      update: {},
      create: t,
    });
    createdTags.push(tag);
  }

  // Create Media
  console.log("Creating media...");
  const mediaImages = [
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
    "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
    "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800&q=80",
    "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80",
    "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80",
    "https://images.unsplash.com/photo-1503437313881-503a91226402?w=800&q=80",
    "https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=800&q=80",
    "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&q=80",
  ];

  const createdMedia: any[] = [];
  for (let i = 0; i < mediaImages.length; i++) {
    const key = `seed-image-${i}.jpg`;
    const media = await prisma.media.upsert({
      where: { key },
      update: {},
      create: {
        key,
        url: mediaImages[i],
        filename: `seed-image-${i}.jpg`,
        mimeType: "image/jpeg",
        size: 102400 + i * 1024,
        altText: `Sample image ${i} for blog posts`,
        caption: `A beautiful sample image ${i}`,
      },
    });
    createdMedia.push(media);
  }

  // Create sample posts (25 posts)
  console.log("Creating 25 sample posts...");
  const authors = [adminUser, ...createdUsers];

  const markdownTemplate = (title: string, imgUrl: string, topic: string) => `
# ${title}

Welcome to this comprehensive guide on **${topic}**. In modern web development and digital creation, understanding the core concepts of ${topic} can elevate your projects from good to extraordinary.

![Featured image for ${title}](${imgUrl})

## Introduction

Technology is evolving at a rapid pace. As we continue to push the boundaries of what's possible, ${topic} remains a cornerstone of best practices. Whether you're a seasoned professional or a beginner, mastering these fundamentals is crucial.

### Why It Matters

- **Scalability**: Build solutions that grow with your user base.
- **Maintainability**: Write code that you and your team can easily understand months down the line.
- **Performance**: Ensure blazingly fast load times and smooth interactions.

> "The only way to do great work is to love what you do." – Steve Jobs

## Deep Dive into the Architecture

Let's look at a quick example of how you might set this up in a modern application.

\`\`\`typescript
import { createServer } from 'http';

const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Hello, World!',
    topic: '${topic}'
  }));
});

server.listen(3000, () => console.log('Server is running...'));
\`\`\`

As you can see, the API is incredibly straightforward. It encapsulates the complex logic while exposing a simple, declarative interface.

## Conclusion

To wrap things up, investing time in ${topic} yields exponential returns over the lifecycle of your software. Start small, refactor often, and never stop learning!

*Have thoughts on this? Leave a comment below!*
`;

  const titles = [
    "Getting Started with TypeScript",
    "Modern CSS Layout Techniques",
    "Building Scalable React Applications",
    "The Future of Web Development",
    "Mastering Nuxt 3",
    "Tailwind CSS Best Practices",
    "Understanding Vue Reactivity",
    "Node.js Performance Tuning",
    "A Guide to PostgreSQL",
    "Prisma ORM Deep Dive",
    "Web Accessibility Essentials",
    "State Management in 2024",
    "Deploying on Vercel",
    "Building Beautiful UIs with Nuxt UI",
    "The Rise of Edge Computing",
    "Serverless Architecture Explained",
    "GraphQL vs REST",
    "Understanding Docker",
    "CI/CD Pipelines",
    "Next.js App Router",
    "SvelteKit Innovations",
    "Animations in Web Apps",
    "Microservices vs Monoliths",
    "Secure Authentication",
    "Optimizing Web Fonts",
  ];

  for (let i = 0; i < 25; i++) {
    const title = titles[i];
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const author = authors[i % authors.length];
    const categoryId = createdCategories[i % createdCategories.length].id;
    const tag1 = createdTags[i % createdTags.length].id;
    const tag2 = createdTags[(i + 1) % createdTags.length].id;
    const featuredImage = createdMedia[i % createdMedia.length].url;

    const content = markdownTemplate(
      title,
      featuredImage,
      title.split(" ").slice(0, 2).join(" "),
    );

    const post = await prisma.post.upsert({
      where: { slug },
      update: {},
      create: {
        title,
        slug,
        featuredImage,
        excerpt: `A deep dive into ${title.toLowerCase()} and why it matters in today's digital landscape.`,
        content: content,
        status: "published",
        visibility: "public",
        readingTime: Math.floor(Math.random() * 10) + 3,
        publishedAt: new Date(Date.now() - i * 86400000), // sequential past dates
        seoTitle: `${title} - Complete Guide`,
        seoDescription: `Learn about ${title} in this comprehensive guide.`,
        authorId: author.id,
        categories: { connect: [{ id: categoryId }] },
        tags: { connect: [{ id: tag1 }, { id: tag2 }] },
        viewCount: Math.floor(Math.random() * 1000) + 100,
        commentEnabled: true,
      },
    });

    // Create initial revision
    const existingRevision = await prisma.postRevision.findFirst({
      where: { postId: post.id, version: 1 },
    });

    if (!existingRevision) {
      await prisma.postRevision.create({
        data: {
          postId: post.id,
          content: content,
          title: title,
          excerpt: post.excerpt,
          version: 1,
          authorId: author.id,
          note: "Initial version",
        },
      });
    }
  }

  console.log("✅ Database seeded successfully with 25 posts and media!");
  console.log("\n📋 Sample Users Created:");
  console.log("Admin: gado@gmail.com / 28935617Aa@");
  console.log("User: mbeahessilfieprince@gmail.com / 28935617Aa@");
  console.timeEnd("Seeding complete 🌱");
}

main().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});
