import HomeHero from "@/components/Home/HomeHero";
import UpcomingGames from "@/components/Home/UpcomingGames";

export default function Home() {
  return (
    <main>
      <HomeHero />

      <UpcomingGames />
      <div className="h-20" />
    </main>
  );
}
