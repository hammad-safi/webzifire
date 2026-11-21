export const SERVICE_BANNERS = {
  web: "/services/website-web-application-development.jpg",
  mobile: "/services/mobile-application-development.jpg",
  erp: "/services/erp-enterprise-software.jpg",
  pos: "/services/pos-retail-management-systems.jpg",
  saas: "/services/saas-product-development.jpg",
  crm: "/services/crm-business-applications.jpg",
  ecommerce: "/services/ecommerce-development.jpg",
  backend: "/services/backend-api-development.jpg",
  desktop: "/services/desktop-application-development.jpg",
  ai: "/services/ai-powered-application-development.jpg",
  design: "/services/ui-ux-design.jpg",
  maintenance: "/services/software-maintenance-optimization.jpg",
};

export function getRelevantServiceBanner(params: {
  servicePillar?: string;
  title?: string;
  slug?: string;
}): string {
  const t = `${params.servicePillar || ""} ${params.title || ""} ${params.slug || ""}`.toLowerCase();

  if (t.includes("pos") || t.includes("retail") || t.includes("checkout") || t.includes("cashier") || t.includes("store")) {
    return SERVICE_BANNERS.pos;
  }
  if (t.includes("erp") || t.includes("enterprise software") || t.includes("operations") || t.includes("supply chain") || t.includes("inventory")) {
    return SERVICE_BANNERS.erp;
  }
  if (t.includes("crm") || t.includes("sales") || t.includes("pipeline") || t.includes("customer relationship") || t.includes("lead")) {
    return SERVICE_BANNERS.crm;
  }
  if (t.includes("mobile") || t.includes("ios") || t.includes("android") || t.includes("react native") || t.includes("flutter") || t.includes("app")) {
    return SERVICE_BANNERS.mobile;
  }
  if (t.includes("saas") || t.includes("multi-tenant") || t.includes("subscription") || t.includes("b2b software")) {
    return SERVICE_BANNERS.saas;
  }
  if (t.includes("ecommerce") || t.includes("e-commerce") || t.includes("cart") || t.includes("shopify") || t.includes("marketplace")) {
    return SERVICE_BANNERS.ecommerce;
  }
  if (t.includes("backend") || t.includes("api") || t.includes("microservice") || t.includes("graphql") || t.includes("serverless") || t.includes("database")) {
    return SERVICE_BANNERS.backend;
  }
  if (t.includes("desktop") || t.includes("electron") || t.includes("windows") || t.includes("macos")) {
    return SERVICE_BANNERS.desktop;
  }
  if (t.includes("ai") || t.includes("artificial intelligence") || t.includes("agent") || t.includes("llm") || t.includes("rag") || t.includes("machine learning")) {
    return SERVICE_BANNERS.ai;
  }
  if (t.includes("ui") || t.includes("ux") || t.includes("design") || t.includes("figma") || t.includes("user experience") || t.includes("interface")) {
    return SERVICE_BANNERS.design;
  }
  if (t.includes("maintenance") || t.includes("optimization") || t.includes("refactor") || t.includes("modernization") || t.includes("legacy") || t.includes("performance")) {
    return SERVICE_BANNERS.maintenance;
  }

  return SERVICE_BANNERS.web;
}

/**
 * Step 4: Matches the generated article to its relevant WebziFire branded service banner.
 * Uses official high-resolution, branded WebziFire graphics instead of low-quality AI image generation.
 */
export async function runGenerateAndStoreFeaturedImage(params: {
  articleId: string;
  slug: string;
  title: string;
  imagePrompt: string;
  servicePillar?: string;
}): Promise<{ imageUrl: string; modelUsed: string }> {
  const bannerUrl = getRelevantServiceBanner({
    servicePillar: params.servicePillar,
    title: params.title,
    slug: params.slug,
  });

  return {
    imageUrl: bannerUrl,
    modelUsed: "webzifire-curated-service-banners",
  };
}
