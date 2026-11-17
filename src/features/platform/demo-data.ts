/**
 * Placeholder data for the Phase 3 visual migration. See the note in
 * src/features/companies/demo-data.ts — same reasoning, platform-scoped.
 * Delete this file once the real company service (platform view) lands in Phase 5, slice I.
 */

export const STAFF = { name: 'Tobi Lawal', role: 'Platform admin' }

export interface PlatformEstate {
  id: string
  name: string
  city: string
  units: number
  status: 'active' | 'deactivated'
}

export interface PlatformCompany {
  id: string
  name: string
  contactName: string
  contactEmail: string
  phone: string
  city: string
  rcNumber: string
  createdAt: number
  users: number
  estates: PlatformEstate[]
  status: 'active' | 'suspended'
  suspension?: { reason: string; at: number; by: string }
}

const DAY = 86_400_000
const HOUR = 3_600_000
const now = Date.now()

const pool: [string, string][] = [
  ['Palmgrove Estate', 'Lagos'], ['Cedar Court', 'Abuja'], ['Harbour View Estate', 'Lagos'], ['Maple Close', 'Port Harcourt'],
  ['Sunrise Gardens', 'Ibadan'], ['Royal Palm Villas', 'Lagos'], ['Garden City Heights', 'Port Harcourt'], ['Ridgeway Estate', 'Abuja'],
  ['Oakwood Terrace', 'Enugu'], ['Lakeshore Residences', 'Lagos'], ['Pinecrest Estate', 'Kano'], ['Emerald Park', 'Abuja'],
]

/** Deterministic filler so every company has a plausible estate list. */
function estatesFor(key: number, count: number, city: string, deactivated = 0): PlatformEstate[] {
  return Array.from({ length: count }, (_, i) => {
    const [name] = pool[(key * 3 + i) % pool.length]
    return {
      id: `c${key}-e${i + 1}`,
      name: i >= pool.length ? `${name} II` : name,
      city,
      units: 24 + ((key * 37 + i * 29) % 11) * 12,
      status: i >= count - deactivated ? ('deactivated' as const) : ('active' as const),
    }
  })
}

function seedCompanies(): PlatformCompany[] {
  const c = (
    n: number,
    name: string,
    contactName: string,
    domain: string,
    city: string,
    daysAgo: number,
    users: number,
    estateCount: number,
    extra: Partial<PlatformCompany> = {},
  ): PlatformCompany => ({
    id: `co${n}`,
    name,
    contactName,
    contactEmail: `${contactName.split(' ')[0].toLowerCase()}@${domain}`,
    phone: `80${n % 10} 555 0${100 + n * 7}`,
    city,
    rcNumber: `RC ${1_000_000 + n * 91_733}`,
    createdAt: now - daysAgo * DAY,
    users,
    estates: estatesFor(n, estateCount, city),
    status: 'active',
    ...extra,
  })
  return [
    c(1, 'Crestview Property Management', 'Kemi Adebayo', 'crestview.ng', 'Lagos', 420, 1184, 6, {
      estates: [
        { id: 'c1-e1', name: 'Palmgrove Estate', city: 'Lagos', units: 120, status: 'active' },
        { id: 'c1-e2', name: 'Banana Island Gardens', city: 'Lagos', units: 64, status: 'active' },
        { id: 'c1-e3', name: 'Maitama Heights', city: 'Abuja', units: 86, status: 'active' },
        { id: 'c1-e4', name: 'Ikeja GRA Court', city: 'Lagos', units: 48, status: 'active' },
        { id: 'c1-e5', name: 'Victoria Island Towers', city: 'Lagos', units: 0, status: 'active' },
        { id: 'c1-e6', name: 'Lekki Gardens Phase 2', city: 'Lagos', units: 40, status: 'deactivated' },
      ],
    }),
    c(2, 'Hallmark Estate Services', 'Bola Adeniyi', 'hallmark.com.ng', 'Abuja', 356, 612, 4),
    c(3, 'Greenfield Homes Ltd', 'Emeka Nwosu', 'greenfieldhomes.ng', 'Port Harcourt', 281, 298, 3),
    c(4, 'Orchid Residences Management', 'Ngozi Okafor', 'orchidresidences.ng', 'Lagos', 244, 174, 2),
    c(5, 'Rivers Gate Properties', 'Tamuno Briggs', 'riversgate.ng', 'Port Harcourt', 398, 702, 5, {
      status: 'suspended',
      suspension: { reason: 'Unpaid subscription after two reminders (invoice INV-2291).', at: now - 11 * DAY, by: 'Tobi Lawal' },
    }),
    c(6, 'Savannah Realty Group', 'Aminu Sani', 'savannahrealty.ng', 'Kano', 205, 143, 2),
    c(7, 'Palmview Facilities Ltd', 'Funke Ogunleye', 'palmview.ng', 'Lagos', 512, 1320, 7),
    c(8, 'Unity Court Management', 'Chidi Eze', 'unitycourt.ng', 'Enugu', 150, 68, 1),
    c(9, 'Ikoyi Heritage Estates', 'Sade Williams', 'ikoyiheritage.ng', 'Lagos', 330, 389, 3, {
      status: 'suspended',
      suspension: { reason: 'Requested by the company admin while management changes hands.', at: now - 26 * DAY, by: 'Ifeoma Daniel' },
    }),
    c(10, 'Lakeside Property Partners', 'Yusuf Garba', 'lakesidepp.ng', 'Abuja', 3, 3, 0),
    c(11, 'BrightGate Estates', 'Moyo Alabi', 'brightgate.ng', 'Ibadan', 1, 6, 1),
    c(12, 'Mainland Manor Holdings', 'Ada Obi', 'mainlandmanor.ng', 'Lagos', 0.25, 1, 0),
    c(13, 'Cedar Hill Residences', 'Halima Bello', 'cedarhill.ng', 'Abuja', 62, 96, 2),
    c(14, 'Adekunle & Sons Realty', 'Tunde Adekunle', 'adekunlerealty.ng', 'Lagos', 38, 54, 1, {
      status: 'suspended',
      suspension: { reason: 'Suspected duplicate of an existing company account. Pending verification.', at: now - 4 * DAY, by: 'Tobi Lawal' },
    }),
  ].map((co) => ({ ...co, createdAt: Math.round(co.createdAt - (co.createdAt % HOUR)) }))
}

export const DEMO_PLATFORM_COMPANIES: PlatformCompany[] = seedCompanies()

/** "12 Mar 2025" in Lagos time. */
export const formatDate = (t: number) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', day: 'numeric', month: 'short', year: 'numeric' }).format(t)
