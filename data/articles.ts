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
    title: "Building Sub-Second Next.js Enterprise Software Portals",
    category: "Engineering Architecture",
    readTime: "6 min read",
    date: "Nov 2026",
    summary:
      "How we leverage Server Components, fine-grained cache revalidation, and Edge middleware to achieve 99/100 Lighthouse performance on complex enterprise web portals.",
    author: "Danyal Khan",
    authorRole: "VP of Software Engineering",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
    content: [
      "Enterprise software platforms frequently suffer from architectural bloat: heavy client-side bundles, sluggish hydration cycles, and slow Time to First Byte (TTFB). At WebziFire, we consider sub-second responsiveness a non-negotiable conversion factor.",
      "By adopting the Next.js App Router, we enforce a strict separation between Server Components (zero client JavaScript impact) and isolated, interactive Client Components. Server Components execute entirely on Edge nodes proximate to the user, rendering pristine HTML while executing database queries with zero round-trip overhead.",
      "Furthermore, our implementation of fine-grained Incremental Static Regeneration (ISR) ensures high-velocity content updates without incurring re-rendering penalties on high-traffic landing pages. The outcome: consistent 98+ Google Lighthouse scores and an average 184% uplift in user retention."
    ]
  },
  {
    id: "2",
    slug: "obsidian-kinetic-design-system-high-voltage-dark-mode",
    title: "The Obsidian Kinetic Design System: High-Voltage Contrast in Dark Mode",
    category: "Design Engineering",
    readTime: "8 min read",
    date: "Oct 2026",
    summary:
      "Moving beyond traditional flat dark themes. Exploring hairline translucent borders, ambient coral halos, and kinetic typography that command brand authority.",
    author: "Ayesha Qureshi",
    authorRole: "Principal Product Designer & Partner",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
    content: [
      "Traditional dark mode implementations too often devolve into muddy grays and flat low-contrast typography. The Obsidian Kinetic design system was forged to solve this aesthetic fatigue.",
      "Anchored by a foundational deep obsidian canvas (#0C0D12), the system builds tactile spatial hierarchy through disciplined surface elevations: cards at #12141C and elevated modules at #181B26, unified by crisp 1px translucent borders (rgba(255, 255, 255, 0.08)).",
      "Interactive focus states leverage electric neon coral (#FF4D4D) diffused glows. By contrasting stark white headlines (Plus Jakarta Sans) with monospace JetBrains Mono telemetry indicators, the user experience simultaneously conveys architectural discipline and high-velocity engineering."
    ]
  },
  {
    id: "3",
    slug: "practical-autonomous-ai-agents-in-enterprise-operations",
    title: "Practical Autonomous AI Agents in Enterprise Business Operations",
    category: "Applied AI",
    readTime: "7 min read",
    date: "Oct 2026",
    summary:
      "Case breakdown of orchestrating multi-agent LLM systems with private vector storage, strict deterministic guardrails, and automated CRM triage.",
    author: "Marcus Vance",
    authorRole: "Head of AI Automation & ML",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop",
    content: [
      "While generative AI demos captivate public imagination, enterprise deployment demands deterministic reliability, data isolation, and auditability. Speculative prompt chains are unacceptable in enterprise operational workflows.",
      "At WebziFire, our AI service architecture pairs specialized LLMs with custom Retrieval-Augmented Generation (RAG) knowledge stores running on private vector databases (Qdrant and Pinecone). Each AI agent is granted access only through authenticated API tools with schema-validated input/output guardrails.",
      "In a recent deployment for a global logistics client, this multi-agent system reduced manual ticket triage time by 70% while maintaining a 99.8% precision score across multilingual communications."
    ]
  },
  {
    id: "4",
    slug: "answer-engine-optimization-aeo-and-structured-schema",
    title: "Answer Engine Optimization (AEO) and Structured Schema in 2026",
    category: "Organic Growth",
    readTime: "5 min read",
    date: "Sep 2026",
    summary:
      "Preparing enterprise platforms for AI search engines like Perplexity, Gemini, and SearchGPT with semantic entity graphing and deep structured schemas.",
    author: "Sarah Lin",
    authorRole: "Director of Organic Search & Growth",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    content: [
      "Search is no longer merely about ten blue links on Google. Modern B2B buyers and enterprise procurement leaders query LLM answer engines directly: Perplexity, SearchGPT, and Gemini.",
      "To dominate in this paradigm, web architectures must move from keyword matching to explicit entity authority. We build structured semantic graphs utilizing Schema.org specifications (Organization, OfferCatalog, FAQPage, and MedicalWebPage) that enable AI crawlers to unambiguously ingest commercial credentials.",
      "Coupled with technical Core Web Vitals optimization and strategic topical clustering, this system consistently yields 3.2x organic visibility surges across traditional and AI-driven search channels."
    ]
  },
  {
    id: "5",
    slug: "modern-polyglot-database-architecture-postgresql-mysql-supabase",
    title: "Modern Polyglot Database Architecture: PostgreSQL, MySQL, Supabase & Beyond",
    category: "Database Engineering",
    readTime: "7 min read",
    date: "Nov 2026",
    summary:
      "Why dogmatic single-stack reliance fails at scale. How we architect deterministic relational systems with PostgreSQL & MySQL, real-time edge layers with Supabase, and high-throughput document pipelines.",
    author: "Hammad Khan",
    authorRole: "Founder & Principal Software Architect",
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=1200&auto=format&fit=crop",
    content: [
      "Rigid adherence to a single database pattern—such as enforcing document stores across every enterprise workload—creates technical debt. At WebziFire, we architect data systems around the specific computational and transactional reality of the business domain.",
      "For mission-critical ERPs, double-entry financial ledgers, and multi-tenant B2B SaaS platforms, relational databases such as PostgreSQL and MySQL with Prisma ORM provide indispensable ACID guarantees, strict foreign key constraints, and performant indexing on complex joins.",
      "When building rapid-iteration real-time web applications, Supabase provides instant Row Level Security (RLS), real-time WebSocket subscriptions, and built-in vector search (pgvector). Meanwhile, MongoDB Atlas remains our weapon of choice for unstructured event ingestion, high-speed catalog caching, and schemaless document trees. The result: software engines built on the right foundation from day zero."
    ]
  }
];
