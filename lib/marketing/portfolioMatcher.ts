/**
 * Smart Portfolio Matching Engine (Idea 3)
 * Automatically pairs target companies with WebziFire's production case studies
 * to provide tangible social proof and concrete technical metrics in outreach.
 */

export interface MatchedPortfolioProof {
  projectId: string;
  projectTitle: string;
  category: string;
  techStack: string[];
  metricsSnippet: string;
  proofSentence: string;
  caseStudySlug: string;
}

export interface PortfolioProject {
  id: string;
  title: string;
  category: string;
  keywords: string[];
  techStack: string[];
  metrics: string;
  proofTemplate: string;
  slug: string;
}

export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: "estateflow-real-estate-portal",
    title: "EstateFlow — Real Estate Portal & CRM",
    category: "PropTech / Real Estate SaaS",
    keywords: [
      "real estate",
      "property",
      "properties",
      "rental",
      "rentals",
      "listings",
      "agent",
      "broker",
      "brokerage",
      "proptech",
      "housing",
      "mortgage",
      "tenant",
      "landlord"
    ],
    techStack: ["Next.js 14", "Node.js", "PostgreSQL", "PostGIS", "Tailwind CSS"],
    metrics: "180ms search latency & 3.4x lift in buyer leads",
    proofTemplate:
      "For context, we recently engineered EstateFlow—a Next.js 14 & PostgreSQL property portal featuring geospatial search and automated lead routing that achieved 180ms query speeds and a 3.4x increase in buyer conversions.",
    slug: "estateflow-real-estate-portal"
  },
  {
    id: "novakart-mobile-shopping",
    title: "NovaKart — Commerce & Order Flow Platform",
    category: "E-Commerce / Retail & Mobile",
    keywords: [
      "ecommerce",
      "e-commerce",
      "retail",
      "store",
      "shopping",
      "cart",
      "checkout",
      "order",
      "products",
      "stripe",
      "marketplace",
      "d2c",
      "fashion",
      "apparel",
      "shop"
    ],
    techStack: ["Next.js", "React Native", "Node.js", "Stripe SDK", "Redis"],
    metrics: "48% lift in checkout completion & sub-millisecond cart caching",
    proofTemplate:
      "For context, we recently engineered NovaKart—a high-performance commerce application with 1-click checkout and Redis inventory reservations that drove a 48% increase in checkout completions.",
    slug: "novakart-mobile-shopping"
  },
  {
    id: "nexora-erp-management-system",
    title: "Nexora ERP — Enterprise Operations & Financial Core",
    category: "ERP & Multi-Branch Business Systems",
    keywords: [
      "erp",
      "accounting",
      "inventory",
      "invoicing",
      "financial",
      "finance",
      "pos",
      "multi-branch",
      "ledger",
      "purchases",
      "warehouse",
      "supply chain"
    ],
    techStack: ["React", "Node.js", "Express", "PostgreSQL", "Redis"],
    metrics: "100% multi-branch inventory sync & <140ms transaction speed",
    proofTemplate:
      "For context, we recently built Nexora ERP—an enterprise management platform handling multi-branch inventory sync and double-entry accounting ledgers with sub-140ms transaction speeds.",
    slug: "nexora-erp-management-system"
  },
  {
    id: "stockpilot-warehouse-inventory",
    title: "StockPilot — Warehouse & Logistics Management",
    category: "Logistics & Supply Chain",
    keywords: [
      "warehouse",
      "logistics",
      "stock",
      "barcode",
      "rfid",
      "fulfillment",
      "pallet",
      "distribution",
      "freight",
      "cargo",
      "fleet",
      "transportation"
    ],
    techStack: ["React", "Node.js", "PostgreSQL", "REST APIs", "Zebra SDK"],
    metrics: "99.8% inventory accuracy & zero lost SKU incidents",
    proofTemplate:
      "For context, we developed StockPilot—a multi-location warehouse management system with real-time barcode scanning and inventory tracking that achieved 99.8% audit accuracy.",
    slug: "stockpilot-warehouse-inventory"
  },
  {
    id: "nexora-business-operations-saas",
    title: "Nexora — Business Operations & Multi-Tenant SaaS",
    category: "B2B SaaS / Web Applications",
    keywords: [
      "saas",
      "b2b",
      "cloud",
      "software",
      "operations",
      "dashboard",
      "analytics",
      "portal",
      "management",
      "team",
      "workflow",
      "enterprise",
      "devops"
    ],
    techStack: ["React 18", "Node.js", "Express", "PostgreSQL RLS", "Docker"],
    metrics: "99.98% platform uptime & 62% reduction in admin overhead",
    proofTemplate:
      "For context, we recently engineered Nexora—a multi-tenant operations SaaS platform built with React, Node.js, and PostgreSQL that reduced administrative overhead by 62% with 99.98% availability.",
    slug: "nexora-business-operations-saas"
  }
];

/**
 * Matches the optimal production case study based on target industry, description, and tech stack.
 */
export function matchPortfolioProof(
  industry: string = "",
  description: string = "",
  techStack: string[] = []
): MatchedPortfolioProof {
  const combinedText = `${industry} ${description} ${techStack.join(" ")}`.toLowerCase();

  let bestProject: PortfolioProject = PORTFOLIO_PROJECTS[4]; // Default to Nexora SaaS
  let highestMatchCount = 0;

  for (const project of PORTFOLIO_PROJECTS) {
    let matches = 0;
    for (const kw of project.keywords) {
      if (combinedText.includes(kw)) {
        matches += 2; // high weight for keyword matches
      }
    }

    // Technology overlap
    for (const tech of project.techStack) {
      if (combinedText.includes(tech.toLowerCase())) {
        matches += 1;
      }
    }

    if (matches > highestMatchCount) {
      highestMatchCount = matches;
      bestProject = project;
    }
  }

  return {
    projectId: bestProject.id,
    projectTitle: bestProject.title,
    category: bestProject.category,
    techStack: bestProject.techStack,
    metricsSnippet: bestProject.metrics,
    proofSentence: bestProject.proofTemplate,
    caseStudySlug: bestProject.slug
  };
}
