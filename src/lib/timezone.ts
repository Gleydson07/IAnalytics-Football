export const APP_TIMEZONE = process.env.NEXT_PUBLIC_APP_TIMEZONE || 'America/Sao_Paulo'

/** Data de "hoje" (YYYY-MM-DD) no fuso da aplicação. */
export function todayInAppTz(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE })
}
