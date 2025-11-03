import Articles from "@/components/Home/Articles";
import HomeHero from "@/components/Home/HomeHero";
import UpcomingGames from "@/components/Home/UpcomingGames";

export default function Home() {
  return (
    <main className="">
      <HomeHero />
      <Articles />
      <UpcomingGames />
      <div className="h-20" />
    </main>
  );
}
