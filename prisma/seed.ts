import * as argon2 from "argon2";
import { getDb } from "../server/db";

async function main() {
  console.log("🌱 Seeding database...");
  const prisma = getDb({ connectionString: process.env.DATABASE_URL! });
  console.time("Seeding complete 🌱");

  // Create roles
  console.log("Creating roles...");
  // Create admin user
  console.log("Creating admin user...");
  const adminPassword = await argon2.hash("28935617Aa@");
  const adminUser = await prisma.user.upsert({
    where: { email: "gado@gmail.com" },
    update: {},
    create: {
      name: "Kratosgado",
      email: "gado@gmail.com",
      passwordHash: adminPassword,
      bio: "Platform administrator",
      emailVerified: true,
      isAdmin: true,
    },
  });

  // Create author users
  console.log("Creating author users...");
  const users = [
    {
      name: "John Smith",
      email: "kratos@bgmail.com",
      avatarUrl: "https://i.pravatar.cc/150?img=3",
      bio: "Technology enthusiast and software developer",
      passwordHash: await argon2.hash("28935617Aa@"),
    },
    {
      name: "Sarah Johnson",
      avatarUrl: "https://i.pravatar.cc/150?img=7",
      email: "sarah@blogplatform.com",
      bio: "Design expert and UX researcher",
      passwordHash: await argon2.hash("28935617Aa@"),
    },
    {
      name: "Mike Chen",
      avatarUrl: "https://i.pravatar.cc/150?img=9",
      email: "mike@blogplatform.com",
      bio: "Data scientist and machine learning expert",
      passwordHash: await argon2.hash("28935617Aa@"),
    },
  ];

  const createdUsers = await prisma.user.createManyAndReturn({
    data: users,
    skipDuplicates: true,
  });
  // Create categories
  console.log("Creating categories...");
  const categories = [
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

  const createdCategories = await prisma.category.createManyAndReturn({
    data: categories,
    skipDuplicates: true,
  });

  // Create tags
  console.log("Creating tags...");
  const tags = [
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

  const createdTags = await prisma.tag.createManyAndReturn({
    data: tags,
    skipDuplicates: true,
  });
  // Create sample posts
  console.log("Creating sample posts...");
  const posts = [
    {
      title: "Getting Started with TypeScript",
      slug: "getting-started-with-typescript",
      featuredImage:
        "https://nuxt.com/assets/blog/nuxt-icon/icons-showcase.png",
      excerpt:
        "Learn the basics of TypeScript and how it can improve your JavaScript development experience.",
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [
              { type: "text", text: "Getting Started with TypeScript" },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "TypeScript is a superset of JavaScript that adds static typing to the language. In this guide, we'll explore the basics and benefits of using TypeScript in your projects.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "What is TypeScript?" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "TypeScript is an open-source programming language developed by Microsoft. It builds on JavaScript by adding static type definitions.",
              },
            ],
          },
        ],
      } as any,
      status: "PUBLISHED",
      visibility: "PUBLIC",
      readingTime: 5,
      publishedAt: new Date("2024-01-15"),
      seoTitle: "Getting Started with TypeScript - Complete Guide",
      seoDescription:
        "Learn TypeScript basics, setup, and best practices in this comprehensive guide for JavaScript developers.",
      authorId: adminUser.id,
      categories: [createdCategories[2].id], // Development
      tags: [createdTags[1].id, createdTags[8].id], // TypeScript, Tutorial
    },
    {
      title: "Modern CSS Layout Techniques",
      slug: "modern-css-layout-techniques",
      featuredImage:
        "https://nuxt.com/assets/blog/nuxt-icon/icons-showcase.png",
      excerpt:
        "Explore modern CSS layout methods including Grid, Flexbox, and Container Queries.",
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "Modern CSS Layout Techniques" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "CSS has evolved significantly over the years. Today we have powerful layout tools like CSS Grid, Flexbox, and Container Queries that make creating responsive layouts easier than ever.",
              },
            ],
          },
        ],
      } as any,
      status: "PUBLISHED",
      visibility: "PUBLIC",
      readingTime: 8,
      publishedAt: new Date("2024-01-20"),
      authorId: adminUser.id,
      categories: [createdCategories[1].id], // Design
      tags: [createdTags[5].id, createdTags[7].id], // CSS, UI/UX
    },
    {
      title: "Building Scalable React Applications",
      slug: "building-scalable-react-applications",
      featuredImage:
        "https://nuxt.com/assets/blog/nuxt-icon/icons-showcase.png",
      excerpt:
        "Best practices for structuring and scaling React applications in production environments.",
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [
              { type: "text", text: "Building Scalable React Applications" },
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "As React applications grow, maintaining code quality and performance becomes crucial. Here are proven strategies for building scalable React apps.",
              },
            ],
          },
        ],
      } as any,
      status: "PUBLISHED",
      visibility: "PUBLIC",
      readingTime: 12,
      publishedAt: new Date("2024-01-25"),
      authorId: adminUser.id,
      categories: [createdCategories[2].id], // Development
      tags: [createdTags[2].id, createdTags[9].id], // React, Best Practices
    },
    {
      title: "The Future of Web Development",
      slug: "the-future-of-web-development",
      excerpt:
        "Exploring upcoming trends and technologies that will shape the future of web development.",
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "The Future of Web Development" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Web development continues to evolve at a rapid pace. Let's explore the trends and technologies that will define the next era of web development.",
              },
            ],
          },
        ],
      } as any,
      status: "DRAFT",
      visibility: "PUBLIC",
      readingTime: 10,
      authorId: createdUsers[2].id,
      categories: [createdCategories[0].id], // Technology
      tags: [createdTags[0].id], // JavaScript
    },
  ];

  for (const postData of posts) {
    const { categories, tags, ...postInfo } = postData;

    const post = await prisma.post.upsert({
      where: { slug: postData.slug },
      update: {},
      create: {
        ...postInfo,
        viewCount: Math.floor(Math.random() * 1000) + 100,
        commentEnabled: true,
        categories: {
          connect: categories?.map((c) => {
            return { id: c };
          }),
        },
        tags: {
          connect: tags?.map((t) => {
            return { id: t };
          }),
        },
      },
    });

    // Create initial revision
    await prisma.postRevision.create({
      data: {
        postId: post.id,
        content: postData.content,
        title: postData.title,
        excerpt: postData.excerpt,
        version: 1,
        authorId: postData.authorId,
        note: "Initial version",
      },
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log("\n📋 Sample Users Created:");
  console.log("Admin: gado@gmail.com / 28935617Aa@");
  console.log("User: kratos@gmail.com / 28935617Aa@");
  console.timeEnd("Seeding complete 🌱");
}

main().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});
