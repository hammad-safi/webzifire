export interface TeamMember {
  id: string;
  name: string;
  role: string;
  discipline: string;
  location: string;
  bio: string;
  avatar: string;
  linkedin?: string;
  github?: string;
}

export const founder = {
  name: "Hammad Khan",
  role: "Founder & Principal Software Architect",
  title: "Founder & Chief Technology Architect",
  discipline: "Enterprise Systems, Next.js Platforms & Applied AI",
  location: "Global Remote Delivery",
  bio: "Directing end-to-end software architecture, bespoke web platforms, high-velocity Next.js applications, and custom AI automation pipelines. Built on direct engineering accountability, strict code hygiene, and commercial leverage.",
  avatar: "/founder-muhammad-hammad.jpg",
  quote: "We don't build disposable websites or bloated templates. We engineer high-performance web platforms, enterprise software, and custom AI systems designed to solve real operational bottlenecks, accelerate conversion, and scale with your business without architectural rewrites.",
  stats: [
    { label: "Production Deployments", value: "85+" },
    { label: "Core Architecture Standard", value: "Sub-Second" },
    { label: "Direct Lead Review", value: "100%" },
    { label: "Client SLA Guarantee", value: "< 24 Hours" },
  ],
  principles: [
    {
      number: "01",
      title: "Direct Architectural Ownership",
      desc: "Every line of schema, API route, and user experience is directly architected and verified by the founder. Zero junior handoffs or agency communication lag.",
    },
    {
      number: "02",
      title: "Full-Stack & Database Precision",
      desc: "Standardized on high-performance architectures: Next.js App Router, TypeScript, Node.js, and enterprise database systems including PostgreSQL, MySQL, Supabase, and MongoDB Atlas. Zero template bloat or legacy dependencies.",
    },
    {
      number: "03",
      title: "Engineered for Commercial Velocity",
      desc: "Software engineered for real business leverage. Sub-second response times, automated CI/CD pipelines, strict SOC2 readiness, and full IP handover.",
    },
  ],
};

// Single founder entry in teamMembers array
export const teamMembers: TeamMember[] = [
  {
    id: "lead-founder",
    name: founder.name,
    role: founder.role,
    discipline: founder.discipline,
    location: founder.location,
    bio: founder.bio,
    avatar: founder.avatar,
  },
];
