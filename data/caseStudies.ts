export type WorkCategory =
  | "Web & SaaS"
  | "Mobile Apps"
  | "ERP & POS"
  | "E-Commerce"
  | "AI & Automation"
  | "UI/UX & Desktop";

export interface CaseStudyArchitectureLayer {
  layer: string;
  technologies: string;
  description: string;
}

export interface CaseStudyArchitecture {
  overview: string;
  layers: CaseStudyArchitectureLayer[];
}

export interface CaseStudyMetric {
  value: string;
  label: string;
}

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
  metrics?: CaseStudyMetric[];
  challenge?: string;
  architecture?: CaseStudyArchitecture;
  deliverables?: string[];
  testimonial?: {
    quote: string;
    author: string;
    role: string;
  };
}

export const caseStudies: CaseStudy[] = [
  // 01 — Web & SaaS
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
    techStack: ["Next.js 14", "Node.js", "PostgreSQL", "PostGIS", "Tailwind CSS"],
    stackLabel: "Stack",
    metrics: [
      { value: "180ms", label: "Median Property Search Latency" },
      { value: "3.4x", label: "Increase in Qualified Buyer Leads" },
      { value: "100%", label: "Automated Multi-Agent Sync" },
    ],
    challenge:
      "Fragmented real estate brokerages suffered from disconnected property listings, slow multi-second search queries on high-res media, and lost buyer leads due to non-standardized intake forms.",
    architecture: {
      overview:
        "Engineered with a server-rendered Next.js edge storefront and high-performance geospatial PostgreSQL backend, delivering instant map lookups and instant agent notifications.",
      layers: [
        {
          layer: "Presentation & Edge",
          technologies: "Next.js 14 App Router, Server Components, Tailwind CSS",
          description: "Sub-second listing exploration with responsive interactive property cards and image optimization.",
        },
        {
          layer: "APIs & Business Logic",
          technologies: "Node.js Micro-Routes, Mapbox SDK, WhatsApp Webhooks",
          description: "Automated lead dispatch, agent assignment routing, and dynamic appointment booking.",
        },
        {
          layer: "Data & Geolocation",
          technologies: "PostgreSQL, PostGIS, Connection Pooling",
          description: "Geospatial coordinate indexing allowing radius-based property searches in under 180ms.",
        },
        {
          layer: "Security & Operations",
          technologies: "Role-Based Access Control, Daily Automated Snapshots",
          description: "Strict isolation of sensitive lead contact details and transaction history.",
        },
      ],
    },
    deliverables: [
      "Custom Next.js Property Search & Booking Web Portal",
      "Centralized Agent & Broker CRM Dashboard",
      "Automated WhatsApp & Email Lead Notification Pipeline",
      "Complete PostgreSQL Migration & PostGIS Geospatial Schema",
    ],
    testimonial: {
      quote:
        "WebziFire rebuilt our property portal from the ground up. Listing lookups became instantaneous and our agent response times dropped from 4 hours to under 5 minutes.",
      author: "Marcus Vance",
      role: "Managing Principal, EstateFlow Real Estate",
    },
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
    techStack: ["React", "Node.js", "Express", "PostgreSQL", "Docker"],
    stackLabel: "Stack",
    metrics: [
      { value: "62%", label: "Reduction in Admin Overhead" },
      { value: "99.98%", label: "Platform Availability Uptime" },
      { value: "10x", label: "Faster Monthly Financial Close" },
    ],
    challenge:
      "Mid-market service firms were drowning in 5+ disparate SaaS subscriptions (project tracking, timesheets, invoicing, staff directory) creating billing discrepancies and data siloing.",
    architecture: {
      overview:
        "Constructed a unified multi-tenant SaaS architecture with strict tenant schema boundaries, real-time analytics aggregation, and automated financial reconciliation engines.",
      layers: [
        {
          layer: "Frontend Application",
          technologies: "React 18 SPA, Redux Toolkit, Tailwind CSS",
          description: "High-density data tables, fluid KPI charts, and instantaneous client-side filtering.",
        },
        {
          layer: "Backend Services",
          technologies: "Node.js, Express, JWT Multi-Tenant Guard Middleware",
          description: "RESTful micro-routes managing invoicing, project milestones, and automated timesheet approvals.",
        },
        {
          layer: "Database Layer",
          technologies: "PostgreSQL with Row-Level Security (RLS)",
          description: "Guaranteed enterprise tenant data isolation and ACID-compliant ledger transactions.",
        },
        {
          layer: "DevOps & Deployment",
          technologies: "Docker Containers, Nginx Reverse Proxy, Automated Backups",
          description: "Zero-downtime rolling container deployments with continuous telemetry monitoring.",
        },
      ],
    },
    deliverables: [
      "Multi-Department Operations & Scheduling Dashboard",
      "Time Tracking, Task Scheduling & Project Pipeline System",
      "Automated Invoice Generation & Financial Reporting Module",
      "Granular Role-Based Access Control (RBAC) Matrix",
    ],
  },

  // 02 — Mobile Apps
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
    techStack: ["React Native", "Expo", "Node.js", "Stripe SDK", "Redis"],
    stackLabel: "Stack",
    metrics: [
      { value: "48%", label: "Increase in Mobile Checkout Completion" },
      { value: "60 FPS", label: "Fluid Scroll & Native Screen Transitions" },
      { value: "4.8 ★", label: "App Store & Google Play Customer Rating" },
    ],
    challenge:
      "High mobile cart abandonment caused by clumsy multi-step checkouts, sluggish product feeds during promotional spikes, and lack of real-time push notification engagement.",
    architecture: {
      overview:
        "Engineered with a high-performance React Native client, frictionless 1-click checkout, and an asynchronous Redis-backed inventory locking service.",
      layers: [
        {
          layer: "Mobile Native Layer",
          technologies: "React Native, Reanimated 3, Gesture Handler",
          description: "Silky 60fps gesture navigation, offline image caching, and instant product feed hydration.",
        },
        {
          layer: "Commerce & Checkout",
          technologies: "Stripe Mobile SDK, Apple Pay, Google Pay",
          description: "Biometric 1-tap checkout eliminating friction and minimizing cart abandonment.",
        },
        {
          layer: "Caching & Inventory",
          technologies: "Redis In-Memory Cache, Node.js API Gateway",
          description: "Sub-millisecond flash-sale inventory reservation preventing double-selling.",
        },
        {
          layer: "Notifications",
          technologies: "Firebase Cloud Messaging (FCM)",
          description: "Segmented automated push triggers for order status and cart recovery.",
        },
      ],
    },
    deliverables: [
      "Cross-Platform iOS & Android Mobile Application Codebase",
      "1-Click Seamless Checkout & Digital Wallet Integration",
      "Real-Time Order Tracking & Driver Proximity Status",
      "Admin Mobile Push Campaign Management Console",
    ],
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
    techStack: ["React Native", "Node.js", "PostgreSQL", "WebSockets", "Mapbox"],
    stackLabel: "Stack",
    metrics: [
      { value: "28%", label: "Reduction in Fleet Fuel & Mileage Costs" },
      { value: "Sub-2s", label: "GPS Telemetry Sync Interval" },
      { value: "99.4%", label: "On-Time Commercial Deliveries" },
    ],
    challenge:
      "Dispatchers had zero real-time visibility over driver routes, resulting in fuel waste, delayed commercial deliveries, and manual telephone coordination prone to human error.",
    architecture: {
      overview:
        "Constructed an offline-first mobile driver client paired with a WebSocket telemetry stream and centralized route optimization engine.",
      layers: [
        {
          layer: "Driver Client & Sensors",
          technologies: "React Native, Background Geolocation, Offline SQLite",
          description: "Continuous GPS route tracking with zero battery drain and offline queueing in dead zones.",
        },
        {
          layer: "Real-Time Streaming",
          technologies: "WebSocket Cluster, Socket.io, Node.js",
          description: "Low-latency live coordinate broadcasts to the dispatcher console every 2 seconds.",
        },
        {
          layer: "Routing & Geofencing",
          technologies: "Mapbox Matrix API, Turf.js Geofencing",
          description: "Automated delivery arrival confirmation upon entering client perimeter bounds.",
        },
        {
          layer: "Audit & Compliance",
          technologies: "PostgreSQL, Digital Signatures, AWS S3",
          description: "Immutable digital proof-of-delivery photos and recipient e-signatures.",
        },
      ],
    },
    deliverables: [
      "Driver Mobile App with Turn-by-Turn Waypoint Navigation",
      "Centralized Dispatch & Route Optimization Dashboard",
      "Digital Signature & Photo Proof-of-Delivery Module",
      "Automated Fleet Telemetry & Driver Performance Analytics",
    ],
  },

  // 03 — ERP & POS
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
    techStack: ["React", "Node.js", "Express", "PostgreSQL", "Redis"],
    stackLabel: "Stack",
    metrics: [
      { value: "100%", label: "Real-Time Multi-Branch Inventory Sync" },
      { value: "< 140ms", label: "Average Transaction Execution Time" },
      { value: "$180k+", label: "Annual Savings in Avoided SaaS Licensing" },
    ],
    challenge:
      "Legacy on-premise accounting software caused multi-day inventory sync delays between regional warehouses and central headquarters, resulting in stockouts and manual reconciliation errors.",
    architecture: {
      overview:
        "Built a modular enterprise ERP architecture featuring an ACID-compliant double-entry accounting core, distributed inventory lock managers, and real-time multi-branch synchronization.",
      layers: [
        {
          layer: "Enterprise Interface",
          technologies: "React 18, TanStack Table, Virtualized Lists",
          description: "Fluid rendering of 50,000+ line-item general ledgers with instant search and keyboard shortcuts.",
        },
        {
          layer: "Business Transaction Core",
          technologies: "Node.js, Express, Distributed Lock Manager",
          description: "Strict isolation ensuring zero double-allocations during simultaneous multi-branch purchase orders.",
        },
        {
          layer: "Financial Ledger Database",
          technologies: "PostgreSQL with Partitioned Tables & Read Replicas",
          description: "Automated trial balances, audit logs, and instant journal creation compliant with GAAP/IFRS.",
        },
        {
          layer: "Reporting & Export Engine",
          technologies: "Background Worker Queues, Puppeteer PDF Engine",
          description: "Asynchronous compilation of massive multi-year executive P&L and tax statements.",
        },
      ],
    },
    deliverables: [
      "Multi-Branch Sales, Purchases & General Ledger System",
      "Automated Stock Valuation & Warehouse Transfer Module",
      "Payroll, Employee Attendance & Role Management Engine",
      "Executive P&L, Balance Sheet & Cashflow Intelligence Reports",
    ],
    testimonial: {
      quote:
        "Nexora ERP unified 4 regional subsidiaries into a single real-time truth. We cut our end-of-month financial closing from 14 days down to 24 hours.",
      author: "Tariq Al-Mansoor",
      role: "Chief Financial Officer, Gulf Logistics Group",
    },
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
    techStack: ["React", "Node.js", "PostgreSQL", "REST APIs", "Zebra SDK"],
    stackLabel: "Stack",
    metrics: [
      { value: "99.8%", label: "Inventory Accuracy Post-Deployment" },
      { value: "3.2x", label: "Faster Pallet Ingestion & Binning Speed" },
      { value: "Zero", label: "Lost SKU Incidents Over 12 Months" },
    ],
    challenge:
      "Warehouses relied on paper clipboards and manual spreadsheets, causing fulfillment delays, misplaced SKUs, and massive discrepancy between physical counts and digital databases.",
    architecture: {
      overview:
        "Engineered an automated warehouse management platform with rugged barcode scanner integration, bin-location routing algorithms, and automated supplier replenishment triggers.",
      layers: [
        {
          layer: "Mobile Scanner UI",
          technologies: "Progressive Web App (PWA), Zebra Scanner Hardware API",
          description: "Rapid barcode capture optimized for warehouse floor tablets and ruggedized handheld terminals.",
        },
        {
          layer: "Warehouse Logic",
          technologies: "Node.js Batch Ingestion Service, WebSocket Alerts",
          description: "Idempotent stock movement processing preventing inventory calculation drifts.",
        },
        {
          layer: "Relational Ledger",
          technologies: "PostgreSQL, Strict Referential Constraints",
          description: "Immutable FIFO/LIFO lot tracking and automated inventory depreciation schedules.",
        },
        {
          layer: "Supplier Automation",
          technologies: "Automated Reorder Webhooks, SMTP PDF Generators",
          description: "Automated purchase orders triggered when bin counts breach safety margins.",
        },
      ],
    },
    deliverables: [
      "Real-Time Multi-Warehouse Stock Management Console",
      "Handheld Barcode & QR Code Scanning Workflows",
      "Automated Purchase Order & Low-Stock Trigger System",
      "Batch Tracking, Expiry Management & Bin Location Mapping",
    ],
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
    techStack: ["React", "Node.js", "PostgreSQL", "Electron", "SQLite"],
    stackLabel: "Stack",
    metrics: [
      { value: "100%", label: "Offline-Operational Billing Guarantee" },
      { value: "4.5s", label: "Average Table Bill Settlement Speed" },
      { value: "35%", label: "Increase in Table Turnover Rate" },
    ],
    challenge:
      "High-volume dining spots experienced lost kitchen tickets, slow terminal billing during dinner rushes, and devastating revenue downtime whenever internet connections flickered.",
    architecture: {
      overview:
        "Designed an offline-first POS architecture running on Electron with an embedded SQLite engine that continuously mirrors to cloud PostgreSQL without blocking terminal operations.",
      layers: [
        {
          layer: "Terminal POS Client",
          technologies: "Electron, React, SQLite Local Persistence",
          description: "Instant billing operations that never freeze, even during complete broadband outages.",
        },
        {
          layer: "Kitchen Order Display",
          technologies: "WebSockets, Thermal ESC/POS Printer Drivers",
          description: "Split order tickets automatically routed to kitchen stations (hot, cold, bar) within 50ms.",
        },
        {
          layer: "Cloud Sync Engine",
          technologies: "Bi-Directional Background Sync, Conflict Resolution",
          description: "Seamless synchronization of daily sales, tax batches, and inventory once connectivity returns.",
        },
        {
          layer: "Security & Auditing",
          technologies: "Biometric Staff Clock-In, Void/Refund Manager Override",
          description: "Complete loss-prevention audit trail tracking every discount, refund, and cash drawer open.",
        },
      ],
    },
    deliverables: [
      "High-Speed Touchscreen POS Billing & Cash Drawer Interface",
      "Interactive Dining Room Floor Plan & Table Status Map",
      "Kitchen Display System (KDS) with Order Timing Stations",
      "Offline Local Database with Automated Cloud Mirroring",
    ],
  },

  // 04 — E-Commerce
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
    techStack: ["Next.js 14", "React", "Node.js", "Stripe Elements", "Tailwind CSS"],
    stackLabel: "Stack",
    metrics: [
      { value: "98/100", label: "Google Lighthouse Mobile Performance Score" },
      { value: "2.1s", label: "Largest Contentful Paint (LCP) Worldwide" },
      { value: "41%", label: "Lift in High-Value Cart Conversion" },
    ],
    challenge:
      "A luxury lifestyle label was constrained by rigid SaaS templates that loaded slowly, struggled with localized currencies, and lacked editorial visual storytelling.",
    architecture: {
      overview:
        "Architected a headless e-commerce experience using Next.js 14 Server-Side Rendering (SSR), edge-optimized media delivery, and frictionless international payments.",
      layers: [
        {
          layer: "Storefront UI & Media",
          technologies: "Next.js 14 App Router, Next/Image, Edge CDN",
          description: "Ultra-fast global rendering of editorial campaigns with automated AVIF/WebP image compression.",
        },
        {
          layer: "Cart & State",
          technologies: "Stateless Encrypted JWT Carts, Optimistic UI Updates",
          description: "Instantaneous item adding, sizing selection, and drawer checkout with zero page reloads.",
        },
        {
          layer: "Checkout & Currencies",
          technologies: "Stripe Elements, Multi-Currency Real-Time FX",
          description: "Frictionless localized checkout supporting Apple Pay, Google Pay, and localized bank rails.",
        },
        {
          layer: "SEO & Rich Discovery",
          technologies: "JSON-LD Product Schemas, Dynamic OpenGraph Engine",
          description: "Automatic generation of rich snippet markup for Google Shopping search placement.",
        },
      ],
    },
    deliverables: [
      "Editorial Brand Storefront with Fluid Animation & Micro-Interactions",
      "Multi-Currency & International Tax Calculation Engine",
      "Customer Account Portal with Order History & Return Requests",
      "Headless Product Catalog Management & Inventory Hooks",
    ],
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
    techStack: ["Next.js", "Node.js", "PostgreSQL", "Stripe Connect", "Redis"],
    stackLabel: "Stack",
    metrics: [
      { value: "100%", label: "Automated Seller Commission Split & Payouts" },
      { value: "Sub-250ms", label: "Global Product Catalog Filter Queries" },
      { value: "12,000+", label: "Active Product Listings Handled Seamlessly" },
    ],
    challenge:
      "Managing independent seller payouts, automated split commissions, and inconsistent catalog submissions without overwhelming manual administrator oversight.",
    architecture: {
      overview:
        "Engineered an automated multi-vendor platform featuring Stripe Connect custom accounts, split checkout transactions, and an isolated merchant fulfillment workspace.",
      layers: [
        {
          layer: "Marketplace Storefront",
          technologies: "Next.js SSR, Multi-Store Search Indexing",
          description: "Unified cart allowing customers to buy items from multiple distinct sellers in a single checkout.",
        },
        {
          layer: "Vendor Management",
          technologies: "Isolated Merchant Dashboards, Catalog Moderation",
          description: "Dedicated portal for merchants to manage stock, print shipping labels, and track earnings.",
        },
        {
          layer: "Escrow & Payouts",
          technologies: "Stripe Connect Custom, Automated Escrow Hold",
          description: "Automated disbursement of seller funds post-delivery with platform fees deducted instantly.",
        },
        {
          layer: "Catalog Database",
          technologies: "PostgreSQL, GIN Indexing, Redis Cache",
          description: "Sub-250ms multifaceted search filtering across categories, price brackets, and vendor ratings.",
        },
      ],
    },
    deliverables: [
      "Public Marketplace Storefront with Unified Shopping Cart",
      "Dedicated Multi-Vendor Dashboard for Listings & Sales Reports",
      "Automated Stripe Connect Escrow & Scheduled Vendor Payouts",
      "Master Admin Moderation, Dispute & Commission Rule Engine",
    ],
  },

  // 05 — AI & Automation
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
    techStack: ["Next.js 14", "Node.js", "OpenAI API", "PostgreSQL", "pgvector"],
    stackLabel: "Stack",
    metrics: [
      { value: "73%", label: "First-Contact Resolution Handled Autonomously" },
      { value: "1.8s", label: "Average AI Contextual Answer Generation Time" },
      { value: "85%", label: "Reduction in Customer Escalation to Human Agents" },
    ],
    challenge:
      "Support teams were buried under thousands of repetitive tier-1 tickets (order tracking, reset passwords, warranty FAQs), creating 24+ hour ticket response delays.",
    architecture: {
      overview:
        "Engineered a production-ready Retrieval-Augmented Generation (RAG) platform with PostgreSQL pgvector embeddings, streaming UI, and safe hallucination guardrails.",
      layers: [
        {
          layer: "Interactive Chat Client",
          technologies: "Next.js 14, Vercel AI SDK, Streaming HTTP",
          description: "Low-latency streaming responses with markdown formatting, citations, and suggested follow-ups.",
        },
        {
          layer: "RAG & Vector Retrieval",
          technologies: "pgvector, OpenAI Text Embeddings, Hybrid Search",
          description: "Sub-50ms vector cosine similarity matching against corporate documentation and support manuals.",
        },
        {
          layer: "Context & Guardrails",
          technologies: "Node.js Safety Filter, Prompt Boundary Verification",
          description: "Strict isolation preventing prompt injection, hallucinations, and out-of-scope enterprise data leakage.",
        },
        {
          layer: "Human Escalation",
          technologies: "Webhook Integration, Zendesk & Slack Handover",
          description: "Graceful automated handoff to human support representatives when sentiment drops below threshold.",
        },
      ],
    },
    deliverables: [
      "Embeddable Web Chat Widget with Real-Time Streaming Responses",
      "Dynamic Knowledge Base Ingestion Pipeline (PDF, Markdown, URLs)",
      "pgvector Semantic Search & Document Embedding Store",
      "Human-in-the-Loop Escalation & Sentiment Analysis Dashboard",
    ],
    testimonial: {
      quote:
        "SupportIQ reduced our customer support ticket backlog by over 70% within the first month. Our human agents now only handle genuinely complex inquiries.",
      author: "Elena Rostova",
      role: "VP of Customer Experience, SupportIQ",
    },
  },

  // 06 — UI/UX & Desktop
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
    techStack: ["Electron", "React", "Node.js", "SQLite", "Tailwind CSS"],
    stackLabel: "Stack",
    metrics: [
      { value: "Zero", label: "Cloud Dependency (100% On-Premise Air-Gapped)" },
      { value: "< 80ms", label: "Instantaneous Ledger Search Across 100k+ Records" },
      { value: "AES-256", label: "Encrypted SQLite Database at Rest" },
    ],
    challenge:
      "Enterprise finance departments required strict local data sovereignty, instantaneous financial reporting, and guaranteed operation without dependence on external internet connections.",
    architecture: {
      overview:
        "Built a hardened Electron desktop application powered by an embedded, encrypted SQLite database, delivering instantaneous financial calculations and zero cloud latency.",
      layers: [
        {
          layer: "Desktop Window Shell",
          technologies: "Electron Hardened Sandbox, Context Isolation",
          description: "Secure cross-platform desktop binary with native OS window controls and low memory footprint.",
        },
        {
          layer: "Ergonomic Finance UI",
          technologies: "React 18, Keyboard Shortcuts, Virtualized Grids",
          description: "Engineered specifically for fast 10-key numeric entry, rapid invoice creation, and quick reconciliation.",
        },
        {
          layer: "Local Embedded Database",
          technologies: "SQLite with AES-256 Encryption & WAL Mode",
          description: "Blazing fast on-disk ACID transactions supporting instantaneous search across hundreds of thousands of ledger entries.",
        },
        {
          layer: "Printing & Backup",
          technologies: "Native Printer Spooling, One-Click Encrypted Backups",
          description: "Direct thermal and laser invoice printing with automated periodic zip backups to external storage.",
        },
      ],
    },
    deliverables: [
      "Windows & macOS Desktop Accounting Application Installers",
      "Double-Entry Bookkeeping Ledger with Automated Balance Verification",
      "Invoice Designer with One-Click PDF Export & Thermal Printing",
      "Encrypted Local Database Backup & Restore Utility",
    ],
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
    techStack: ["Figma", "Design Tokens", "Tailwind CSS", "Storybook", "WCAG 2.1 AA"],
    stackLabel: "Tools",
    metrics: [
      { value: "4.5x", label: "Faster UI Feature Prototyping & Development" },
      { value: "100%", label: "WCAG 2.1 AA Accessibility & Contrast Compliance" },
      { value: "240+", label: "Standardized Figma Tokens & Reusable React Components" },
    ],
    challenge:
      "Engineering teams suffered from fragmented styling, inconsistent accessibility compliance, and weeks of wasted developer time recreating common components across different products.",
    architecture: {
      overview:
        "Crafted a unified enterprise design system connecting Figma design tokens directly to Tailwind CSS utility variables, ensuring pixel-perfect engineering consistency.",
      layers: [
        {
          layer: "Semantic Design Tokens",
          technologies: "Figma Variables, Design Tokens Format (DTCG)",
          description: "Systematic color ramps, typography scales, spacing grids, and elevation shadows for light & dark modes.",
        },
        {
          layer: "Figma Component Library",
          technologies: "Figma Auto-Layout 5.0, Component Properties",
          description: "Production-ready buttons, form controls, data tables, modals, and navigation drawers with all state variants.",
        },
        {
          layer: "Code Alignment",
          technologies: "Tailwind CSS Config, React Component Stubs",
          description: "1:1 token mapping guaranteeing developers can implement Figma mockups without guessing hex codes or spacing.",
        },
        {
          layer: "Accessibility & Guidelines",
          technologies: "WCAG 2.1 AA Contrast Verification, Figma Dev Mode",
          description: "Complete design guidelines for keyboard focus indicators, screen reader labels, and touch target sizes.",
        },
      ],
    },
    deliverables: [
      "Master Enterprise Figma Library with 240+ Reusable Components",
      "Tailwind CSS Token Configuration Matching Figma Styles Exactly",
      "Interactive Dashboard Layout Prototypes with Micro-Interactions",
      "WCAG 2.1 AA Accessibility & Contrast Verification Guide",
    ],
  },
];
