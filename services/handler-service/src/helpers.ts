import { listener } from "./redis";

export async function trackPageView(projectId: string) {
  if (!projectId) {
    console.error("Invalid projectId. Skipping trackPageView.");
    return;
  }

  const date = new Date().toISOString().split("T")[0];

  try {
    // Calculate start dates for intervals
    const weekStartDate = getWeekStartDate(date);
    const monthStartDate = getMonthStartDate(date);
    const yearStartDate = getYearStartDate(date);

    // Redis pipeline for atomicity and efficiency
    const pipeline = listener.multi();

    // Increment view counts for all intervals
    pipeline.incr(`pageViews:daily:${projectId}:${date}`);
    pipeline.incr(`pageViews:weekly:${projectId}:${weekStartDate}`);
    pipeline.incr(`pageViews:monthly:${projectId}:${monthStartDate}`);
    pipeline.incr(`pageViews:yearly:${projectId}:${yearStartDate}`);

    // Set expiration for non-lifetime keys (e.g., 30 days for daily keys)
    pipeline.expire(`pageViews:daily:${projectId}:${date}`, 30 * 24 * 60 * 60);
    pipeline.expire(`pageViews:weekly:${projectId}:${weekStartDate}`, 30 * 24 * 60 * 60);
    pipeline.expire(`pageViews:monthly:${projectId}:${monthStartDate}`, 30 * 24 * 60 * 60);
    pipeline.expire(`pageViews:yearly:${projectId}:${yearStartDate}`, 30 * 24 * 60 * 60);

    // Execute the pipeline
    await pipeline.exec();

    console.log(`Tracked page view for projectId: ${projectId}`);
  } catch (error) {
    console.error("Error tracking page view in Redis:", error);
  }
}

// Helper functions to calculate start dates for intervals
function getWeekStartDate(date: string) {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); 
  return d.toISOString().split("T")[0];
}

function getMonthStartDate(date: string) {
  const d = new Date(date);
  d.setDate(1); 
  return d.toISOString().split("T")[0];
}

function getYearStartDate(date: string) {
  const d = new Date(date);
  d.setMonth(0, 1); 
  return d.toISOString().split("T")[0];
}