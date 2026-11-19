export interface Article {
  id: string;
  slug: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  summary: string;
  author: string;
  authorRole: string;
  image: string;
  content: string[];
}

export const articles: Article[] = [
  {
    id: "1",
    slug: "sub-second-nextjs-enterprise-software-portals",
    title: "How to Build Super-Fast Web Portals with Next.js",
    category: "Web Engineering",
    readTime: "5 min read",
    date: "Nov 2026",
    summary:
      "A practical guide on how we get sub-second load times and 99/100 Google Lighthouse speed scores on large business websites and portals.",
    author: "Danyal Khan",
    authorRole: "VP of Software Engineering",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
    content: [
      "Nothing frustrates a customer faster than a slow website. When pages take several seconds to open, visitors leave, bounce rates skyrocket, and your Google search rankings drop. Fast websites are not just a technical luxury—they directly drive sales and user trust.",
      "With Next.js, we keep page loads under a single second by doing the heavy computing on the server before sending clean, ready-to-display HTML to the visitor's browser. Visitors get instant text and images without waiting for heavy scripts to load.",
      "We also set up smart caching so frequently visited pages stay lightning fast even during massive traffic spikes. The result is consistently high Google Lighthouse performance scores (95+) and happier visitors who stay longer on your site."
    ]
  },
  {
    id: "2",
    slug: "obsidian-kinetic-design-system-high-voltage-dark-mode",
    title: "The Obsidian Design System: Crafting Premium Dark Mode Experiences",
    category: "Product Design",
    readTime: "6 min read",
    date: "Oct 2026",
    summary:
      "How we design high-contrast, modern dark themes with clean typography, soft glows, and crisp lines that users love.",
    author: "Ayesha Qureshi",
    authorRole: "Principal Product Designer & Partner",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    content: [
      "Too many dark mode websites look dull, muddy, and hard to read. Low contrast makes text difficult to see, and flat gray boxes make important buttons fade into the background.",
      "Our Obsidian design system solves this by using deep, elegant charcoal tones paired with soft crimson glows and bright, readable typography. Every card and button has subtle translucent borders so visitors always know where to click.",
      "The result is a clean, modern aesthetic that feels like a luxury product while remaining comfortable to read on both desktop monitors and mobile phones."
    ]
  },
  {
    id: "3",
    slug: "practical-autonomous-ai-agents-in-enterprise-operations",
    title: "Practical AI Agents: Automating Daily Business Operations",
    category: "Applied AI",
    readTime: "6 min read",
    date: "Oct 2026",
    summary:
      "How businesses are using smart AI assistants to answer customer questions 24/7, organize tickets, and save hours of manual work.",
    author: "Marcus Vance",
    authorRole: "Head of AI Automation & ML",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop",
    content: [
      "While everyone talks about AI, many businesses struggle to find practical ways to use it. The key to successful AI is simple: focus on saving time on repetitive daily tasks that drain your team's energy.",
      "At WebziFire, we build AI assistants that connect directly to your company's actual documents and database. When a customer asks a question, the AI reads your product catalog or knowledge base and gives an accurate, friendly answer in seconds.",
      "For one international client, this automated customer triage reduced support response times by 70%, freeing up their team to focus on closing new sales."
    ]
  },
  {
    id: "4",
    slug: "answer-engine-optimization-aeo-and-structured-schema",
    title: "How to Rank in AI Search Engines: Google, Perplexity & ChatGPT",
    category: "Search & Growth",
    readTime: "5 min read",
    date: "Sep 2026",
    summary:
      "What business owners need to know about AI search engines and how structured website data helps new customers find you.",
    author: "Sarah Lin",
    authorRole: "Director of Organic Search & Growth",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    content: [
      "More and more customers are asking questions directly to AI tools like Perplexity, Gemini, and ChatGPT instead of browsing traditional search lists. If your website isn't structured clearly, AI search engines will overlook your business.",
      "To show up as a recommended answer, your website needs structured data—invisible labels in your code that explain your company name, services, prices, and reviews in a format search engines easily understand.",
      "By combining clean technical SEO with clear, helpful answers to common customer questions, your business becomes the trusted source AI tools cite when recommending solutions in your industry."
    ]
  },
  {
    id: "5",
    slug: "modern-polyglot-database-architecture-postgresql-mysql-supabase",
    title: "Choosing the Right Database: PostgreSQL, MySQL, and Supabase",
    category: "Database Systems",
    readTime: "6 min read",
    date: "Nov 2026",
    summary:
      "Why picking the right database matters for your app's speed, security, and future growth—explained in simple terms.",
    author: "Hammad Khan",
    authorRole: "Founder & Principal Software Architect",
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1200&auto=format&fit=crop",
    content: [
      "A database is the digital filing cabinet of your software. If you pick the wrong one, your app becomes slow, hard to change, and expensive to fix later on.",
      "For business tools, customer accounts, and financial accounting where precision is critical, relational databases like PostgreSQL and MySQL are unbeatable. They ensure every balance matches and every order is recorded without errors.",
      "When you need real-time updates—like live chat or instant notifications—tools like Supabase allow us to build fast, secure features in days instead of months. Using the right tool for the job keeps your application fast, secure, and ready to scale."
    ]
  }
];
