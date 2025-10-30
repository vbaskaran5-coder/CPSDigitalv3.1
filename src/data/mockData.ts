import { toDate } from 'date-fns-tz';

const timeZone = 'America/Toronto';

/**
 * Returns the current date and time in the 'America/Toronto' timezone.
 * This function should be called every time the current date is needed
 * to avoid stale date issues.
 */
export const getCurrentDate = () => {
  const now = new Date();
  const zonedDate = toDate(now, { timeZone });
  return zonedDate;
};
