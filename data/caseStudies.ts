export type WorkCategory =
  | "Web & SaaS"
  | "Mobile Apps"
  | "ERP & POS"
  | "E-Commerce"
  | "AI & Automation"
  | "UI/UX & Desktop";

export interface CaseStudy {
  id: string;
  number: string;
  title: string;
  category: WorkCategory;
  categoryNumber: string;
  categoryLabel: string;
  isImportantCategory?: boolean;
  relatedServiceSlug: string;
  relatedServiceName: string;
  client: string;
  location: string;
  year: string;
  headline: string;
  description: string;
  tags: string[];
  image: string;
  techStack: string[];
  stackLabel?: "Stack" | "Tools";
  metrics?: { label: string; value: string }[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
}

export const caseStudies: CaseStudy[] = [
  // 01 — Web & SaaS (2 projects)
  {
    id: "estateflow-real-estate-portal",
    number: "01",
    title: "EstateFlow — Real Estate Management Portal",
    category: "Web & SaaS",
    categoryNumber: "01",
    categoryLabel: "01 — Web & SaaS",
    relatedServiceSlug: "website-web-application-development",
    relatedServiceName: "Website & Web Application Development",
    client: "EstateFlow",
    location: "Web & SaaS",
    year: "2025",
    headline: "Full-Featured Real Estate Portal, Agent CRM & Lead Pipeline",
    description:
      "A complete real estate platform for agencies to showcase properties, manage agents, capture inquiries, and track property sales and rentals.",
    tags: [
      "Property listings",
      "Agent dashboard",
      "CRM",
      "Lead management",
      "Property inquiries",
      "Admin panel",
    ],
    image: "/work/estateflow.jpg",
    techStack: ["Next.js", "Node.js", "PostgreSQL"],
    stackLabel: "Stack",
  },
  {
    id: "nexora-business-operations-saas",
    number: "02",
    title: "Nexora — Business Operations SaaS",
    category: "Web & SaaS",
    categoryNumber: "01",
    categoryLabel: "01 — Web & SaaS",
    relatedServiceSlug: "saas-product-development",
    relatedServiceName: "SaaS Product Development",
    client: "Nexora Cloud",
    location: "Web & SaaS",
    year: "2025",
    headline: "Centralized Cloud Platform for Departments, Projects & Finances",
    description:
      "A centralized cloud-based platform that allows businesses to manage departments, employees, customers, projects, finances, and daily operations.",
    tags: [
      "Business dashboard",
      "Team management",
      "Financial reports",
      "Role permissions",
      "Analytics",
    ],
    image: "/work/nexora-saas.jpg",
    techStack: ["React", "Node.js", "Express", "PostgreSQL"],
    stackLabel: "Stack",
  },

  // 02 — Mobile Apps (2 projects)
  {
    id: "novakart-mobile-shopping",
    number: "03",
    title: "NovaKart — Mobile Shopping Application",
    category: "Mobile Apps",
    categoryNumber: "02",
    categoryLabel: "02 — Mobile Apps",
    relatedServiceSlug: "mobile-application-development",
    relatedServiceName: "Mobile Application Development",
    client: "NovaKart",
    location: "iOS & Android",
    year: "2025",
    headline: "Intuitive Cross-Platform Commerce, Checkout & Live Order Tracking",
    description:
      "A modern cross-platform shopping application providing customers with an intuitive mobile shopping experience, product discovery, secure checkout, and order tracking.",
    tags: [
      "Product catalog",
      "Shopping cart",
      "Wishlist",
      "Payments",
      "Order tracking",
    ],
    image: "/work/novakart.jpg",
    techStack: ["React Native", "Node.js", "REST APIs"],
    stackLabel: "Stack",
  },
  {
    id: "gonza-logistics-fleet-app",
    number: "04",
    title: "Gonza — Logistics & Fleet Mobile App",
    category: "Mobile Apps",
    categoryNumber: "02",
    categoryLabel: "02 — Mobile Apps",
    relatedServiceSlug: "mobile-application-development",
    relatedServiceName: "Mobile Application Development",
    client: "Gonza Logistics",
    location: "iOS & Android",
    year: "2025",
    headline: "Real-Time Driver Dispatch, Route Management & GPS Fleet Tracking",
    description:
      "A mobile solution for transportation businesses to coordinate drivers, monitor deliveries, manage routes, and track fleet operations in real time.",
    tags: [
      "Driver app",
      "Delivery tracking",
      "Route management",
      "GPS integration",
      "Delivery status",
    ],
    image: "/work/gonza.jpg",
    techStack: ["React Native", "Node.js", "PostgreSQL"],
    stackLabel: "Stack",
  },

  // 03 — ERP & POS (3 projects · Important category)
  {
    id: "nexora-erp-management-system",
    number: "05",
    title: "Nexora ERP — Enterprise Business Management System",
    category: "ERP & POS",
    categoryNumber: "03",
    categoryLabel: "03 — ERP & POS",
    isImportantCategory: true,
    relatedServiceSlug: "erp-enterprise-software",
    relatedServiceName: "ERP & Enterprise Software",
    client: "Nexora ERP",
    location: "Enterprise ERP",
    year: "2025",
    headline: "Unified Sales, Purchases, Inventory, HR & Multi-Branch Accounting",
    description:
      "An integrated enterprise management solution designed to simplify business operations by connecting sales, purchases, inventory, employees, accounting, and reporting.",
    tags: [
      "Sales & purchases",
      "HR management",
      "Accounting",
      "Inventory",
      "Multi-branch operations",
      "Reports",
    ],
    image: "/work/nexora-erp.jpg",
    techStack: ["React", "Node.js", "Express", "PostgreSQL"],
    stackLabel: "Stack",
  },
  {
    id: "stockpilot-warehouse-inventory",
    number: "06",
    title: "StockPilot — Warehouse & Inventory Management System",
    category: "ERP & POS",
    categoryNumber: "03",
    categoryLabel: "03 — ERP & POS",
    isImportantCategory: true,
    relatedServiceSlug: "erp-enterprise-software",
    relatedServiceName: "ERP & Enterprise Software",
    client: "StockPilot",
    location: "Warehouse & Inventory",
    year: "2025",
    headline: "Multi-Warehouse Stock Control, Barcode Scanning & Transfer Tracking",
    description:
      "A comprehensive warehouse management platform that helps businesses control stock levels, warehouse operations, product movement, suppliers, and inventory transfers across multiple locations.",
    tags: [
      "Multi-warehouse",
      "Stock transfers",
      "Barcode scanning",
      "Purchase orders",
      "Stock alerts",
      "Inventory reports",
    ],
    image: "/work/stockpilot.jpg",
    techStack: ["React", "Node.js", "PostgreSQL", "REST APIs"],
    stackLabel: "Stack",
  },
  {
    id: "restora-restaurant-pos",
    number: "07",
    title: "Restora — Restaurant Management & POS System",
    category: "ERP & POS",
    categoryNumber: "03",
    categoryLabel: "03 — ERP & POS",
    isImportantCategory: true,
    relatedServiceSlug: "pos-retail-management-systems",
    relatedServiceName: "POS & Retail Management Systems",
    client: "Restora POS",
    location: "Hospitality & POS",
    year: "2025",
    headline: "All-in-One Restaurant POS, Floor Tables, Kitchen Display & Billing",
    description:
      "An all-in-one restaurant solution for managing customer orders, tables, kitchen operations, menus, billing, staff, and restaurant performance.",
    tags: [
      "Restaurant POS",
      "Table management",
      "Kitchen display",
      "Online orders",
      "Billing",
      "Staff management",
    ],
    image: "/work/restora.jpg",
    techStack: ["React", "Node.js", "PostgreSQL", "Electron"],
    stackLabel: "Stack",
  },

  // 04 — E-Commerce (2 projects)
  {
    id: "aura-fashion-ecommerce",
    number: "08",
    title: "Aura — Fashion & Lifestyle E-Commerce",
    category: "E-Commerce",
    categoryNumber: "04",
    categoryLabel: "04 — E-Commerce",
    relatedServiceSlug: "ecommerce-development",
    relatedServiceName: "E-commerce Development",
    client: "Aura",
    location: "E-Commerce",
    year: "2025",
    headline: "Editorial Fashion Storefront with Seamless Collections & Checkout",
    description:
      "A premium online shopping experience for fashion brands featuring product collections, customer accounts, order management, and seamless checkout.",
    tags: [
      "Product collections",
      "Shopping cart",
      "Payment integration",
      "Customer accounts",
      "Order management",
    ],
    image: "/work/aura.jpg",
    techStack: ["Next.js", "React", "Node.js"],
    stackLabel: "Stack",
  },
  {
    id: "marketnest-multivendor-marketplace",
    number: "09",
    title: "MarketNest — Multi-Vendor Marketplace",
    category: "E-Commerce",
    categoryNumber: "04",
    categoryLabel: "04 — E-Commerce",
    relatedServiceSlug: "ecommerce-development",
    relatedServiceName: "E-commerce Development",
    client: "MarketNest",
    location: "Multi-Vendor Commerce",
    year: "2025",
    headline: "Centralized Seller Platform with Commissions & Automated Payouts",
    description:
      "A scalable marketplace connecting multiple sellers and customers through a centralized platform for product listings, purchases, payments, and order management.",
    tags: [
      "Seller accounts",
      "Product management",
      "Order processing",
      "Commission system",
      "Payment gateway",
    ],
    image: "/work/marketnest.jpg",
    techStack: ["Next.js", "Node.js", "PostgreSQL"],
    stackLabel: "Stack",
  },

  // 05 — AI & Automation (1 project)
  {
    id: "supportiq-ai-customer-support",
    number: "10",
    title: "SupportIQ — AI Customer Support Platform",
    category: "AI & Automation",
    categoryNumber: "05",
    categoryLabel: "05 — AI & Automation",
    relatedServiceSlug: "ai-powered-application-development",
    relatedServiceName: "AI-Powered Application Development",
    client: "SupportIQ",
    location: "Applied AI",
    year: "2025",
    headline: "Intelligent Knowledge-Base Search & Automated Customer Resolution",
    description:
      "An intelligent customer support solution that uses AI to answer customer questions, understand business documentation, and automate routine support operations.",
    tags: [
      "AI chatbot",
      "Knowledge base",
      "Document search",
      "Automated responses",
      "Support analytics",
    ],
    image: "/work/supportiq.jpg",
    techStack: ["Next.js", "Node.js", "OpenAI API", "PostgreSQL"],
    stackLabel: "Stack",
  },

  // 06 — UI/UX & Desktop (2 projects)
  {
    id: "findesk-desktop-accounting",
    number: "11",
    title: "FinDesk — Desktop Accounting Software",
    category: "UI/UX & Desktop",
    categoryNumber: "06",
    categoryLabel: "06 — UI/UX & Desktop",
    relatedServiceSlug: "desktop-application-development",
    relatedServiceName: "Desktop Application Development",
    client: "FinDesk",
    location: "Windows Desktop",
    year: "2025",
    headline: "Offline-First Windows Accounting, Invoicing & Financial Ledger",
    description:
      "A Windows desktop financial management application that enables businesses to manage invoices, expenses, financial transactions, and accounting records.",
    tags: [
      "Invoice management",
      "Expense tracking",
      "Financial reports",
      "Offline database",
      "Data backup",
    ],
    image: "/work/findesk.jpg",
    techStack: ["Electron", "React", "Node.js", "SQLite"],
    stackLabel: "Stack",
  },
  {
    id: "prismui-enterprise-design-system",
    number: "12",
    title: "PrismUI — Enterprise UI/UX Design System",
    category: "UI/UX & Desktop",
    categoryNumber: "06",
    categoryLabel: "06 — UI/UX & Desktop",
    relatedServiceSlug: "ui-ux-design",
    relatedServiceName: "UI/UX Design",
    client: "PrismUI",
    location: "Design Systems",
    year: "2025",
    headline: "Reusable Enterprise Figma Components, Dashboards & UX Patterns",
    description:
      "A reusable design system for enterprise applications and SaaS products, featuring consistent components, dashboard layouts, design patterns, and responsive interfaces.",
    tags: [
      "Figma components",
      "Design systems",
      "Dashboard layouts",
      "Responsive prototypes",
      "UX workflows",
    ],
    image: "/work/prismui.svg",
    techStack: ["Figma", "Design Systems", "Interactive Prototypes"],
    stackLabel: "Tools",
  },
];
