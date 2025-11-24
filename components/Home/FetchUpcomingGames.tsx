import UpcomingGames from "./UpcomingGames";

// Helper to determine the absolute URL required for server-side fetching
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
};

export default async function FetchUpcomingGamesSection() {
  const t1 = Date.now();
  const baseUrl = getBaseUrl();

  // Next.js Server Components require an absolute URL.
  // We use the 'next' option to handle caching.
  // revalidate: 60 means the cache will persist for 60 seconds across all users.
  const response = await fetch(`${baseUrl}/api/odds-data`, {
    method: "GET",
    next: {
      revalidate: 60,
      tags: ["odds-data"],
    },
    cache: "no-cache",
  });

  if (!response.ok) {
    console.error("Failed to fetch odds data", response.statusText);
    // You might want to return null or an error UI here
    return <div>Error loading upcoming games.</div>;
  }

  const events = await response.json();

  console.log(
    "Time taken to fetch and parse API (Component):",
    Date.now() - t1
  );
  console.log("Total events returned (Component):", events.length);

  return <UpcomingGames events={events} />;
}
