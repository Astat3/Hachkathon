/**
 * Mock data generator for prospects
 * Generates realistic prospect data based on target market criteria
 */

import { generateRandomPhoneNumber } from "./phone-validator";
import type { TargetMarketCriteria, CompanySizeType } from "@/types/prospect";

// Industry-specific data
const INDUSTRY_DATA = {
  "Technology": {
    companies: [
      "TechVision Solutions", "CloudSync Systems", "DataFlow Analytics", "CodeCraft Labs",
      "InnovateTech Group", "DigitalEdge Software", "ByteStream Technologies", "NexGen Computing",
      "SmartCode Solutions", "CyberCore Systems", "AppForge Technologies", "DevOps Masters",
      "CloudNine Solutions", "TechPulse Innovations", "DataBridge Systems", "CodeWave Labs",
      "FutureTech Ventures", "PixelPerfect Software", "NetSphere Technologies", "AlgoRhythm Labs"
    ],
    roles: [
      "CTO", "VP of Engineering", "Director of Technology", "Head of IT",
      "Chief Innovation Officer", "VP of Product", "Engineering Manager", "IT Director"
    ]
  },
  "Healthcare": {
    companies: [
      "HealthFirst Medical", "CarePoint Clinics", "MediCare Solutions", "Wellness Partners",
      "LifeLine Healthcare", "PrimeCare Medical", "HealthBridge Systems", "VitalCare Group",
      "MedTech Innovations", "CureWell Healthcare", "HealthSync Solutions", "CarePath Medical",
      "WellSpring Health", "MediConnect Systems", "HealthPro Services", "CareLink Medical",
      "VitalHealth Partners", "MedCore Solutions", "HealthWise Group", "CareFirst Systems"
    ],
    roles: [
      "Chief Medical Officer", "Hospital Administrator", "Director of Operations", "Practice Manager",
      "VP of Patient Services", "Clinical Director", "Healthcare Administrator", "Medical Director"
    ]
  },
  "Finance": {
    companies: [
      "Capital Ventures Group", "FinTech Solutions", "WealthWise Advisors", "SecureBank Systems",
      "InvestPro Partners", "MoneyFlow Financial", "TrustFund Management", "EquityEdge Group",
      "FinanceFirst Solutions", "AssetGuard Systems", "CreditLine Partners", "BankTech Innovations",
      "WealthBridge Advisors", "CapitalCore Group", "FinSecure Solutions", "InvestSmart Partners",
      "MoneyMasters Financial", "TrustPoint Advisors", "EquityPro Systems", "FinanceHub Group"
    ],
    roles: [
      "CFO", "VP of Finance", "Director of Operations", "Financial Controller",
      "Investment Director", "Risk Manager", "Treasury Director", "Finance Manager"
    ]
  },
  "Retail": {
    companies: [
      "ShopSmart Retail", "MarketPlace Group", "RetailEdge Solutions", "StoreFirst Systems",
      "MegaMart Enterprises", "ShopWise Retail", "MarketPro Group", "RetailHub Solutions",
      "StoreConnect Systems", "ShopFlow Retail", "MarketEdge Group", "RetailMasters Solutions",
      "StoreTech Systems", "ShopBridge Retail", "MarketWise Group", "RetailPro Solutions",
      "StoreLink Systems", "ShopCore Retail", "MarketFirst Group", "RetailSync Solutions"
    ],
    roles: [
      "VP of Retail Operations", "Store Manager", "Director of Sales", "Retail Operations Manager",
      "Regional Manager", "Merchandising Director", "VP of Store Operations", "Retail Director"
    ]
  },
  "Manufacturing": {
    companies: [
      "IndustrialTech Manufacturing", "PrecisionParts Corp", "FactoryFlow Systems", "ManuTech Solutions",
      "ProduceLine Industries", "MakersEdge Manufacturing", "AssemblyPro Systems", "IndustrialCore Group",
      "FactoryMasters Corp", "ManuFlow Solutions", "ProductionTech Industries", "MakersHub Manufacturing",
      "AssemblyEdge Systems", "IndustrialPro Group", "FactorySync Corp", "ManuTech Industries",
      "ProduceMasters Solutions", "MakersCore Manufacturing", "AssemblyFirst Systems", "IndustrialHub Group"
    ],
    roles: [
      "VP of Manufacturing", "Plant Manager", "Director of Operations", "Production Manager",
      "Operations Director", "Manufacturing Director", "Supply Chain Manager", "Factory Manager"
    ]
  },
  "Education": {
    companies: [
      "EduTech Solutions", "LearningBridge Academy", "SmartLearn Systems", "KnowledgeHub Education",
      "BrightFuture Schools", "EduConnect Solutions", "LearnPro Academy", "WisdomPath Education",
      "SmartSchool Systems", "KnowledgeFirst Solutions", "BrightMind Academy", "EduMasters Systems",
      "LearnEdge Solutions", "WisdomHub Education", "SmartPath Academy", "KnowledgePro Systems",
      "BrightLearn Solutions", "EduBridge Academy", "LearnFirst Systems", "WisdomCore Education"
    ],
    roles: [
      "Dean of Students", "Academic Director", "VP of Education", "School Administrator",
      "Director of Curriculum", "Education Director", "Principal", "VP of Academic Affairs"
    ]
  },
  "Real Estate": {
    companies: [
      "PropertyPro Realty", "HomeFirst Real Estate", "EstateEdge Group", "RealtyMasters Solutions",
      "PropertyHub Realty", "HomeBridge Real Estate", "EstateCore Group", "RealtyPro Solutions",
      "PropertyFirst Realty", "HomeEdge Real Estate", "EstateHub Group", "RealtyConnect Solutions",
      "PropertyMasters Realty", "HomeCore Real Estate", "EstateFirst Group", "RealtyBridge Solutions",
      "PropertyEdge Realty", "HomeHub Real Estate", "EstateSync Group", "RealtyFirst Solutions"
    ],
    roles: [
      "VP of Real Estate", "Property Manager", "Director of Operations", "Real Estate Director",
      "Portfolio Manager", "Asset Manager", "VP of Property Management", "Operations Director"
    ]
  },
  "Hospitality": {
    companies: [
      "GrandStay Hotels", "ComfortInn Group", "LuxuryLodge Resorts", "HospitalityPro Solutions",
      "StayFirst Hotels", "WelcomeInn Group", "ResortEdge Solutions", "HotelMasters Group",
      "StayHub Hotels", "ComfortFirst Group", "LuxuryStay Resorts", "HospitalityEdge Solutions",
      "StayPro Hotels", "WelcomeHub Group", "ResortFirst Solutions", "HotelCore Group",
      "StayEdge Hotels", "ComfortHub Group", "LuxuryFirst Resorts", "HospitalityMasters Solutions"
    ],
    roles: [
      "General Manager", "Director of Operations", "VP of Hospitality", "Hotel Manager",
      "Operations Manager", "Director of Guest Services", "VP of Hotel Operations", "Resort Manager"
    ]
  }
};

// US Cities and States
const LOCATIONS = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ",
  "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA",
  "Austin, TX", "Jacksonville, FL", "Fort Worth, TX", "Columbus, OH", "Charlotte, NC",
  "San Francisco, CA", "Indianapolis, IN", "Seattle, WA", "Denver, CO", "Washington, DC",
  "Boston, MA", "Nashville, TN", "Detroit, MI", "Portland, OR", "Las Vegas, NV",
  "Memphis, TN", "Louisville, KY", "Baltimore, MD", "Milwaukee, WI", "Albuquerque, NM",
  "Tucson, AZ", "Fresno, CA", "Sacramento, CA", "Kansas City, MO", "Mesa, AZ",
  "Atlanta, GA", "Omaha, NE", "Colorado Springs, CO", "Raleigh, NC", "Miami, FL",
  "Oakland, CA", "Minneapolis, MN", "Tulsa, OK", "Cleveland, OH", "Wichita, KS",
  "Arlington, TX", "Tampa, FL", "New Orleans, LA", "Bakersfield, CA", "Aurora, CO"
];

// First names
const FIRST_NAMES = [
  "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
  "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Nancy", "Daniel", "Lisa",
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
  "Kenneth", "Dorothy", "Kevin", "Carol", "Brian", "Amanda", "George", "Melissa",
  "Edward", "Deborah", "Ronald", "Stephanie", "Timothy", "Rebecca", "Jason", "Sharon",
  "Jeffrey", "Laura", "Ryan", "Cynthia", "Jacob", "Kathleen", "Gary", "Amy",
  "Nicholas", "Shirley", "Eric", "Angela", "Jonathan", "Helen", "Stephen", "Anna",
  "Larry", "Brenda", "Justin", "Pamela", "Scott", "Nicole", "Brandon", "Emma"
];

// Last names
const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas",
  "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White",
  "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young",
  "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts", "Gomez", "Phillips", "Evans", "Turner", "Diaz", "Parker",
  "Cruz", "Edwards", "Collins", "Reyes", "Stewart", "Morris", "Morales", "Murphy",
  "Cook", "Rogers", "Gutierrez", "Ortiz", "Morgan", "Cooper", "Peterson", "Bailey",
  "Reed", "Kelly", "Howard", "Ramos", "Kim", "Cox", "Ward", "Richardson"
];

// Company sizes
const COMPANY_SIZES: CompanySizeType[] = ["1-10", "11-50", "51-200", "201-1000", "1000+"];

/**
 * Generates a random name
 */
function generateRandomName(): string {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${firstName} ${lastName}`;
}

/**
 * Generates a random email based on name and company
 */
function generateEmail(name: string, company: string): string {
  const nameParts = name.toLowerCase().split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];
  const companyDomain = company
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 15);

  const formats = [
    `${firstName}.${lastName}@${companyDomain}.com`,
    `${firstName}${lastName}@${companyDomain}.com`,
    `${firstName[0]}${lastName}@${companyDomain}.com`,
    `${firstName}@${companyDomain}.com`,
  ];

  return formats[Math.floor(Math.random() * formats.length)];
}

/**
 * Selects a random item from an array
 */
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Filters industries based on criteria
 */
function getFilteredIndustries(criteria?: TargetMarketCriteria): string[] {
  const allIndustries = Object.keys(INDUSTRY_DATA);

  if (!criteria?.industries || criteria.industries.length === 0) {
    return allIndustries;
  }

  return criteria.industries.filter(industry => allIndustries.includes(industry));
}

/**
 * Filters locations based on criteria
 */
function getFilteredLocations(criteria?: TargetMarketCriteria): string[] {
  if (!criteria?.locations || criteria.locations.length === 0) {
    return LOCATIONS;
  }

  // Match by city or state
  return LOCATIONS.filter(location => {
    return criteria.locations!.some(filter => 
      location.toLowerCase().includes(filter.toLowerCase())
    );
  });
}

/**
 * Filters company sizes based on criteria
 */
function getFilteredCompanySizes(criteria?: TargetMarketCriteria): CompanySizeType[] {
  if (!criteria?.companySizes || criteria.companySizes.length === 0) {
    return COMPANY_SIZES;
  }

  return criteria.companySizes as CompanySizeType[];
}

/**
 * Generates a single mock prospect
 */
export function generateMockProspect(
  campaignId: string,
  criteria?: TargetMarketCriteria
): Omit<any, "id" | "createdAt" | "updatedAt"> {
  const industries = getFilteredIndustries(criteria);
  const locations = getFilteredLocations(criteria);
  const companySizes = getFilteredCompanySizes(criteria);

  const industry = randomItem(industries);
  const industryData = INDUSTRY_DATA[industry as keyof typeof INDUSTRY_DATA];
  const companyName = randomItem(industryData.companies);
  const contactRole = randomItem(industryData.roles);
  const contactName = generateRandomName();
  const phoneNumber = generateRandomPhoneNumber();
  const email = generateEmail(contactName, companyName);
  const location = randomItem(locations);
  const companySize = randomItem(companySizes);

  return {
    campaignId,
    companyName,
    contactName,
    contactRole,
    phoneNumber,
    email,
    industry,
    companySize,
    location,
    status: "pending" as const,
    notes: null,
    metadata: {
      generatedAt: new Date().toISOString(),
      source: "mock-data-generator",
    },
  };
}

/**
 * Generates multiple mock prospects
 */
export function generateMockProspects(
  campaignId: string,
  count: number,
  criteria?: TargetMarketCriteria
): Array<Omit<any, "id" | "createdAt" | "updatedAt">> {
  const prospects = [];
  const usedCompanies = new Set<string>();

  // Ensure we have enough variety
  const industries = getFilteredIndustries(criteria);
  const maxProspectsPerIndustry = Math.ceil(count / industries.length);

  for (let i = 0; i < count; i++) {
    let prospect;
    let attempts = 0;
    const maxAttempts = 50;

    // Try to generate a unique company
    do {
      prospect = generateMockProspect(campaignId, criteria);
      attempts++;
    } while (
      usedCompanies.has(prospect.companyName) &&
      attempts < maxAttempts
    );

    usedCompanies.add(prospect.companyName);
    prospects.push(prospect);
  }

  return prospects;
}

/**
 * Gets available industries
 */
export function getAvailableIndustries(): string[] {
  return Object.keys(INDUSTRY_DATA);
}

/**
 * Gets available locations
 */
export function getAvailableLocations(): string[] {
  return LOCATIONS;
}

/**
 * Gets available company sizes
 */
export function getAvailableCompanySizes(): CompanySizeType[] {
  return COMPANY_SIZES;
}
