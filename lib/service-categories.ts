import type { Service } from "@/types/database";

export type ServiceCategory =
  | "General & Checkups"
  | "Consultation & Follow-up"
  | "Vaccinations"
  | "Physicals & Wellness"
  | "Mental Health"
  | "Pediatric & Women's Health"
  | "Travel & Lifestyle"
  | "Labs & Reviews"
  | "Chronic Care & Specialized"
  | "Procedures & Urgent"
  | "Other";

const CATEGORY_KEYWORDS: { category: ServiceCategory; keywords: string[] }[] = [
  { category: "Consultation & Follow-up", keywords: ["consultation", "follow-up", "follow up"] },
  { category: "General & Checkups", keywords: ["checkup", "general", "wellness visit", "physical examination"] },
  { category: "Vaccinations", keywords: ["vaccination", "vaccine", "flu shot", "covid", "immunization"] },
  { category: "Physicals & Wellness", keywords: ["physical", "wellness", "sports physical", "school physical", "pre-employment", "dot physical"] },
  { category: "Mental Health", keywords: ["mental health"] },
  { category: "Pediatric & Women's Health", keywords: ["pediatric", "women", "pregnancy", "sti"] },
  { category: "Travel & Lifestyle", keywords: ["travel", "nutrition", "smoking", "weight", "allergy"] },
  { category: "Labs & Reviews", keywords: ["lab", "review", "x-ray", "imaging", "ecg"] },
  { category: "Chronic Care & Specialized", keywords: ["chronic", "diabetes", "blood pressure", "asthma", "copd", "thyroid", "ent", "eye", "skin", "wound", "ear wax", "vitamin", "b12", "iron"] },
  { category: "Procedures & Urgent", keywords: ["procedure", "urgent", "telehealth", "prescription refill", "minor procedure"] },
];

function getCategoryForService(service: Service): ServiceCategory {
  const name = (service.name || "").toLowerCase();
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((k) => name.includes(k))) return category;
  }
  return "Other";
}

export function groupServicesByCategory(services: Service[]): Map<ServiceCategory, Service[]> {
  const map = new Map<ServiceCategory, Service[]>();
  for (const s of services) {
    const cat = getCategoryForService(s);
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(s);
  }
  const order: ServiceCategory[] = [
    "General & Checkups",
    "Consultation & Follow-up",
    "Vaccinations",
    "Physicals & Wellness",
    "Mental Health",
    "Pediatric & Women's Health",
    "Travel & Lifestyle",
    "Labs & Reviews",
    "Chronic Care & Specialized",
    "Procedures & Urgent",
    "Other",
  ];
  const sorted = new Map<ServiceCategory, Service[]>();
  for (const cat of order) {
    const list = map.get(cat);
    if (list?.length) sorted.set(cat, list);
  }
  Array.from(map.entries()).forEach(([cat, list]) => {
    if (!sorted.has(cat)) sorted.set(cat, list);
  });
  return sorted;
}
