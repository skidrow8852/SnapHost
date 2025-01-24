import { listener } from "./redis";

export async function trackPageView(projectId: string) {

  const date = new Date().toISOString().split("T")[0]; 

  // Increment view counts for all intervals
  await Promise.all([
    // Daily
    listener.incr(`pageViews:daily:${projectId}:${date}`),

    // Weekly
    listener.incr(`pageViews:weekly:${projectId}:${getWeekStartDate(date)}`),

    // Monthly
    listener.incr(`pageViews:monthly:${projectId}:${getMonthStartDate(date)}`),

    // Yearly
    listener.incr(`pageViews:yearly:${projectId}:${getYearStartDate(date)}`),

    // Lifetime
    listener.incr(`pageViews:lifetime:${projectId}`),
  ]);

  // Set expiration for non-lifetime keys (e.g., 30 days for daily keys)
  await Promise.all([
    listener.expire(`pageViews:daily:${projectId}:${date}`, 30 * 24 * 60 * 60),
    listener.expire(`pageViews:weekly:${projectId}:${getWeekStartDate(date)}`, 30 * 24 * 60 * 60),
    listener.expire(`pageViews:monthly:${projectId}:${getMonthStartDate(date)}`, 30 * 24 * 60 * 60),
    listener.expire(`pageViews:yearly:${projectId}:${getYearStartDate(date)}`, 30 * 24 * 60 * 60),
  ]);
}

// Helper functions to calculate start dates for intervals
function getWeekStartDate(date: string) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // Start of the week (Sunday)
  return d.toISOString().split("T")[0];
}

function getMonthStartDate(date: string) {
  const d = new Date(date);
  d.setDate(1); // Start of the month
  return d.toISOString().split("T")[0];
}

function getYearStartDate(date: string) {
  const d = new Date(date);
  d.setMonth(0, 1); // Start of the year
  return d.toISOString().split("T")[0];
}