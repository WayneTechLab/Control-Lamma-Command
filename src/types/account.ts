export type AccountLevelId = 0 | 1 | 2 | 3 | 4 | 5

export type AccountLevel = {
  id: AccountLevelId
  code: string
  audience: string
  plan: 'free' | 'paid' | 'private'
  label: string
  description: string
}

export const ACCOUNT_LEVELS: Record<AccountLevelId, AccountLevel> = {
  0: {
    id: 0,
    code: 'guest',
    audience: 'Guest / Public',
    plan: 'free',
    label: 'Level 0 - Guest',
    description: 'Public home page access only.',
  },
  1: {
    id: 1,
    code: 'member',
    audience: 'User / Member',
    plan: 'free',
    label: 'Level 1 - Member',
    description: 'Free signed-in account with dashboard and local status access.',
  },
  2: {
    id: 2,
    code: 'pro',
    audience: 'User / Pro',
    plan: 'paid',
    label: 'Level 2 - Pro',
    description: 'Paid account for advanced chat and saved workflows.',
  },
  3: {
    id: 3,
    code: 'diamond',
    audience: 'User / Diamond',
    plan: 'paid',
    label: 'Level 3 - Diamond',
    description: 'Premium paid account for high-limit model operations.',
  },
  4: {
    id: 4,
    code: 'employee',
    audience: 'Employee / Private',
    plan: 'private',
    label: 'Level 4 - Employee',
    description: 'Private admin account for user support and model control.',
  },
  5: {
    id: 5,
    code: 'owner',
    audience: 'Owner / Private',
    plan: 'private',
    label: 'Level 5 - Owner',
    description: 'Super admin account with system ownership and user management.',
  },
}

export const PUBLIC_LEVEL = ACCOUNT_LEVELS[0]
export const SETUP_PREVIEW_LEVEL = ACCOUNT_LEVELS[5]

export function canAccessDashboard(level: AccountLevelId) {
  return level >= 1
}

export function canControlModels(level: AccountLevelId) {
  return level >= 4
}

export function canManageUsers(level: AccountLevelId) {
  return level >= 4
}

export function canManageSystem(level: AccountLevelId) {
  return level >= 5
}

export function getAccountLevelById(value: unknown): AccountLevel {
  const numeric = Number(value)
  if ([0, 1, 2, 3, 4, 5].includes(numeric)) {
    return ACCOUNT_LEVELS[numeric as AccountLevelId]
  }

  return ACCOUNT_LEVELS[1]
}

export function getAccountLevelFromClaims(claims: Record<string, unknown>) {
  if (claims.owner === true || claims.superAdmin === true) return ACCOUNT_LEVELS[5]
  if (claims.employee === true || claims.admin === true) return ACCOUNT_LEVELS[4]
  if (claims.accountLevel != null) return getAccountLevelById(claims.accountLevel)

  const plan = String(claims.plan ?? claims.tier ?? '').toLowerCase()
  if (plan === 'diamond') return ACCOUNT_LEVELS[3]
  if (plan === 'pro') return ACCOUNT_LEVELS[2]

  return ACCOUNT_LEVELS[1]
}
