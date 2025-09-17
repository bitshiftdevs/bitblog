import * as argon2 from "argon2";
import { getDb } from "../server/db";

async function main() {
  console.log("🌱 Seeding database...");
  const prisma = getDb({ connectionString: process.env.DATABASE_URL! });
  console.time("Seeding complete 🌱");

  // Create roles
  console.log("Creating roles...");
  const adminRole = await prisma.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: {
      name: "Admin",
      description: "Full system administrator access",
      permissions: {
        posts: ["read", "write", "publish", "delete"],
        users: ["read", "write", "delete", "manage"],
        media: ["read", "write", "delete"],
        comments: ["read", "write", "delete", "moderate"],
        settings: ["read", "write"],
        analytics: ["read"],
      },
    },
  });

  const editorRole = await prisma.role.upsert({
    where: { name: "Editor" },
    update: {},
    create: {
      name: "Editor",
      description: "Content editor and moderator",
      permissions: {
        posts: ["read", "write", "publish"],
        users: ["read"],
        media: ["read", "write"],
        comments: ["read", "write", "moderate"],
        analytics: ["read"],
      },
    },
  });

  const authorRole = await prisma.role.upsert({
    where: { name: "Author" },
    update: {},
    create: {
      name: "Author",
      description: "Content author",
      permissions: {
        posts: ["read", "write"],
        media: ["read", "write"],
        comments: ["read"],
      },
    },
  });

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
      emailVerifiedAt: new Date(),
    },
  });

  // Assign admin role
  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });

  // Create editor user
  console.log("Creating editor user...");
  const editorPassword = await argon2.hash("editor123");
  const editorUser = await prisma.user.upsert({
    where: { email: "editor@blogplatform.com" },
    update: {},
    create: {
      name: "Editor User",
      email: "editor@blogplatform.com",
      passwordHash: editorPassword,
      bio: "Content editor and moderator",
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: editorUser.id,
        roleId: editorRole.id,
      },
    },
    update: {},
    create: {
      userId: editorUser.id,
      roleId: editorRole.id,
    },
  });

  // Create author users
  console.log("Creating author users...");
  const authors = [
    {
      name: "John Smith",
      email: "john@blogplatform.com",
      avatarUrl: "https://i.pravatar.cc/150?img=3",
      bio: "Technology enthusiast and software developer",
    },
    {
      name: "Sarah Johnson",
      avatarUrl: "https://i.pravatar.cc/150?img=7",
      email: "sarah@blogplatform.com",
      bio: "Design expert and UX researcher",
    },
    {
      name: "Mike Chen",
      avatarUrl: "https://i.pravatar.cc/150?img=9",
      email: "mike@blogplatform.com",
      bio: "Data scientist and machine learning expert",
    },
  ];

  const authorUsers = [];
  for (const authorData of authors) {
    const authorPassword = await argon2.hash("author123");
    const author = await prisma.user.upsert({
      where: { email: authorData.email },
      update: {},
      create: {
        ...authorData,
        passwordHash: authorPassword,
        emailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: author.id,
          roleId: authorRole.id,
        },
      },
      update: {},
      create: {
        userId: author.id,
        roleId: authorRole.id,
      },
    });

    authorUsers.push(author);
  }

  // Create categories
  console.log("Creating categories...");
  const categories = [
    {
      name: "Technology",
      slug: "technology",
      description: "Latest technology trends and innovations",
    },
    {
      name: "Design",
      slug: "design",
      description: "UI/UX design principles and best practices",
    },
    {
      name: "Development",
      slug: "development",
      description: "Programming tutorials and development guides",
    },
    {
      name: "Business",
      slug: "business",
      description: "Business strategies and entrepreneurship",
    },
    {
      name: "Lifestyle",
      slug: "lifestyle",
      description: "Work-life balance and productivity tips",
    },
  ];

  const createdCategories = [];
  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: categoryData,
    });
    createdCategories.push(category);
  }

  // Create tags
  console.log("Creating tags...");
  const tags = [
    { name: "JavaScript", slug: "javascript", color: "#f7df1e" },
    { name: "TypeScript", slug: "typescript", color: "#3178c6" },
    { name: "React", slug: "react", color: "#61dafb" },
    { name: "Vue", slug: "vue", color: "#4fc08d" },
    { name: "Node.js", slug: "nodejs", color: "#339933" },
    { name: "CSS", slug: "css", color: "#1572b6" },
    { name: "HTML", slug: "html", color: "#e34f26" },
    { name: "UI/UX", slug: "ui-ux", color: "#ff6b6b" },
    { name: "Tutorial", slug: "tutorial", color: "#4ecdc4" },
    { name: "Best Practices", slug: "best-practices", color: "#45b7d1" },
  ];

  const createdTags = [];
  for (const tagData of tags) {
    const tag = await prisma.tag.upsert({
      where: { slug: tagData.slug },
      update: {},
      create: tagData,
    });
    createdTags.push(tag);
  }

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
      },
      status: "PUBLISHED",
      visibility: "PUBLIC",
      readingTime: 5,
      publishedAt: new Date("2024-01-15"),
      seoTitle: "Getting Started with TypeScript - Complete Guide",
      seoDescription:
        "Learn TypeScript basics, setup, and best practices in this comprehensive guide for JavaScript developers.",
      authorId: authorUsers[0].id,
      categoryIds: [createdCategories[2].id], // Development
      tagIds: [createdTags[1].id, createdTags[8].id], // TypeScript, Tutorial
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
      },
      status: "PUBLISHED",
      visibility: "PUBLIC",
      readingTime: 8,
      publishedAt: new Date("2024-01-20"),
      authorId: authorUsers[1].id,
      categoryIds: [createdCategories[1].id], // Design
      tagIds: [createdTags[5].id, createdTags[7].id], // CSS, UI/UX
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
      },
      status: "PUBLISHED",
      visibility: "PUBLIC",
      readingTime: 12,
      publishedAt: new Date("2024-01-25"),
      authorId: authorUsers[0].id,
      categoryIds: [createdCategories[2].id], // Development
      tagIds: [createdTags[2].id, createdTags[9].id], // React, Best Practices
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
      },
      status: "DRAFT",
      visibility: "PUBLIC",
      readingTime: 10,
      authorId: authorUsers[2].id,
      categoryIds: [createdCategories[0].id], // Technology
      tagIds: [createdTags[0].id], // JavaScript
    },
  ];

  for (const postData of posts) {
    const { categoryIds, tagIds, ...postInfo } = postData;

    const post = await prisma.post.upsert({
      where: { slug: postData.slug },
      update: {},
      create: {
        ...postInfo,
        viewCount: Math.floor(Math.random() * 1000) + 100, // Random view count
      },
    });

    // Add categories
    if (categoryIds) {
      for (const categoryId of categoryIds) {
        await prisma.postCategory.upsert({
          where: {
            postId_categoryId: {
              postId: post.id,
              categoryId,
            },
          },
          update: {},
          create: {
            postId: post.id,
            categoryId,
          },
        });
      }
    }

    // Add tags
    if (tagIds) {
      for (const tagId of tagIds) {
        await prisma.postTag.upsert({
          where: {
            postId_tagId: {
              postId: post.id,
              tagId,
            },
          },
          update: {},
          create: {
            postId: post.id,
            tagId,
          },
        });
      }
    }

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

  // Create site settings
  console.log("Creating site settings...");
  const siteSettings = [
    {
      key: "general",
      value: {
        title: "BitBlog",
        description: "Blog platform for BitShift",
        logo: null,
        favicon: null,
      },
    },
    {
      key: "seo",
      value: {
        defaultTitle: "BitBlog - Share Your Stories",
        defaultDescription:
          "Discover amazing stories, insights, and knowledge from our community of writers.",
        defaultImage: "/og-image.png",
      },
    },
    {
      key: "social",
      value: {
        twitter: "https://twitter.com/blogplatform",
        facebook: "https://facebook.com/blogplatform",
        instagram: "https://instagram.com/blogplatform",
        linkedin: "https://linkedin.com/company/blogplatform",
      },
    },
    {
      key: "comments",
      value: {
        enabled: true,
        requireApproval: true,
        allowGuestComments: true,
        enableNotifications: true,
      },
    },
  ];

  for (const setting of siteSettings) {
    await prisma.siteSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value,
        updatedById: adminUser.id,
      },
    });
  }

  console.log("✅ Database seeded successfully!");
  console.log("\n📋 Sample Users Created:");
  console.log("Admin: admin@blogplatform.com / admin123");
  console.log("Editor: editor@blogplatform.com / editor123");
  console.log(
    "Authors: john@blogplatform.com, sarah@blogplatform.com, mike@blogplatform.com / author123",
  );
  console.timeEnd("Seeding complete 🌱");
}

main().catch((e) => {
  console.error("❌ Seeding failed:", e);
  process.exit(1);
});
