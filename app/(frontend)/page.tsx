import Articles from "@/components/Home/Articles";
import Hero from "@/components/Home/Hero";
import UpcomingGames from "@/components/Home/UpcomingGames";

export default function Home() {
  return (
    <main className="">
      <Hero />
      <Articles />
      <UpcomingGames />
      <div className="h-20" />
    </main>
  );
}
