// app/prediction/page.tsx
import Link from "next/link";

const data = {
  id: "0ae85bbc3711ad0cb94475a40e2364f0",
  sportKey: "americanfootball_nfl",
  sportTitle: "NFL",
  commenceTime: "2025-11-16T18:00:00.000Z",
  homeTeam: "Atlanta Falcons",
  awayTeam: "Carolina Panthers",
  createdAt: "2025-11-14T02:10:51.382Z",
  updatedAt: "2025-11-14T02:10:51.382Z",
  eventpredictions: [
    {
      id: 9,
      heading: "Falcons vs. Panthers: Who Will Reign Supreme in Atlanta?",
      description:
        "The Atlanta Falcons and Carolina Panthers face off in an exciting NFC showdown that promises thrills for fans and action for sports bettors alike. Set to take place on November 16, 2025, this game features two NFC South rivals looking to improve their standings in what has been a competitive season. As both teams vie for playoff contention, the stakes couldn't be higher.\n\nRecent form is a critical element in predicting the outcome of any matchup. The Falcons have shown resilience with a solid performance over the past weeks, while the Panthers have struggled to find consistency. The Falcons have been impressive at home this season, boasting a record that reflects their ability to dominate in front of their fans. In contrast, the Panthers have demonstrated vulnerability on the road, which could prove detrimental in this high-pressure atmosphere.\n\nWhen looking at head-to-head matchups, the Falcons hold a significant edge. Recent history shows that Atlanta has taken the last few encounters, and this psychological advantage may play a crucial role in the upcoming game. Current odds reflect this sentiment, with most bookmakers favoring Atlanta. The Falcons are listed with odds around -192 to -197 for a straight win, while the Panthers hover around +160 to +170. This line indicates confidence in the Falcons' ability to come out on top.\n\nAnalyzing the strengths and weaknesses of both teams reveals that the Falcons present a balanced attack, featuring a strong running game complemented by an improving passing attack. They effectively utilize their offensive weapons, including a playmaking quarterback who can extend plays. Meanwhile, the Panthers have struggled to find a cohesive game plan, often hampered by turnovers and an inconsistent offensive line. Their defense has shown flashes of brilliance but remains prone to big plays, which could be exploited by the Falcons' offense.\n\nOn the injury front, the data provided shows no significant absenteeism affecting either squad at this point, which adds to the predictability of their starting lineups and overall schematics for the game. Having both teams at full strength allows for a more accurate gauge of each team's true capabilities during the matchup.\n\nHome-field advantage cannot be overlooked in this encounter. The Falcons will be playing in the comfortable confines of Mercedes-Benz Stadium, where the crowd's energy often bolsters the players. Historically, teams playing at home in divisional matchups tend to perform better due to the familiar environment and the support of their fanbase.\n\nIn terms of betting lines, the spread is set at -3.5 in favor of the Falcons, which aligns with the overall assessment of their performance compared to the struggling Panthers. The market also indicates a total point line of 42.5, suggesting expectations of a moderately scoring game, likely reflecting both teams' offensive potentials and defensive shortcomings.\n\nGiven all this information, it becomes clear that the Atlanta Falcons are poised to secure a victory in their matchup against the Carolina Panthers. Their recent form, head-to-head success, home-field advantage, and balanced offense collectively stack the odds in favor of Atlanta.\n\nHowever, it's crucial to note that predictions in sports betting are not guaranteed outcomes. While the data and analysis strongly suggest a win for the Falcons, anything can happen in the unpredictable realm of professional football. Bettors should assess their risk accordingly and never wager more than they can afford to lose. With that said, expect the Falcons to continue their successful run against their division rivals and emerge victorious in this heated contest.",
      oddsEventId: "0ae85bbc3711ad0cb94475a40e2364f0",
      createdAt: "2025-11-14T02:10:51.382Z",
      updatedAt: "2025-11-14T02:10:51.382Z",
    },
  ],
};

// Static line summary for this page (you can later bind this from DB)
const lineSummary = {
  spread: "-3.5 ATL",
  total: "42.5",
  moneylineHome: "-192",
  moneylineAway: "+165",
};

function fmt(dt: string) {
  return new Date(dt).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function PredictionPage() {
  const article = data.eventpredictions[0];
  const matchupTitle = `${data.awayTeam} vs ${data.homeTeam} Prediction, Odds & Picks`;
  const leagueHref = `/league/${data.sportTitle.toLowerCase()}`;
  const kickoff = fmt(data.commenceTime);
  const published = fmt(article.createdAt);
  const updated = fmt(article.updatedAt);

  const paragraphs = article.description.split("\n\n").filter(Boolean);

  return (
    <main className="bg-[#FAFAFA] min-h-screen">
      {/* Accent top bar */}
      <div className="h-[3px] w-full bg-[#24257C]" />

      <section className="container mx-auto px-4 md:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumbs */}
        <nav
          className="text-sm text-gray-500 font-inter mb-4"
          aria-label="Breadcrumb"
        >
          <ol className="flex items-center gap-1">
            <li>
              <Link href="/" className="hover:text-[#24257C] transition-colors">
                Home
              </Link>
            </li>
            <li className="mx-1">→</li>
            <li>
              <Link
                href={leagueHref}
                className="hover:text-[#24257C] transition-colors"
              >
                {data.sportTitle}
              </Link>
            </li>
            <li className="mx-1">→</li>
            <li className="text-[#111827]">
              {data.awayTeam} vs {data.homeTeam}
            </li>
          </ol>
        </nav>

        {/* Header / Hero */}
        <header className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="w-full h-[3px] bg-[#24257C]" />
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-50 border border-gray-200 text-[#25818F]">
                {data.sportTitle}
              </span>
              <span className="text-xs text-gray-500 font-inter">
                Kickoff:{" "}
                <span className="font-medium text-[#111827]">{kickoff}</span>
              </span>
            </div>

            <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl font-bold text-[#111827] leading-tight">
              {matchupTitle}
            </h1>

            {/* Teams & Line Summary */}
            <div className="mt-6 grid gap-6 md:grid-cols-[1.3fr_.7fr]">
              <div className="flex flex-col gap-2">
                <p className="text-base text-gray-600 font-inter">
                  {data.awayTeam} at{" "}
                  <span className="font-semibold text-[#111827]">
                    {data.homeTeam}
                  </span>
                </p>
                <p className="text-sm text-gray-500 font-inter">
                  Venue:{" "}
                  <span className="text-[#111827]">Mercedes-Benz Stadium</span>
                  {/* You can replace with a real venue when available */}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 md:p-5">
                <div className="text-[11px] uppercase tracking-wide text-gray-500 font-inter mb-2">
                  Line Summary
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-[#24257C] font-inter [font-variant-numeric:tabular-nums]">
                  <span>Spread {lineSummary.spread}</span>
                  <span>Total {lineSummary.total}</span>
                  <span>
                    ML {data.homeTeam} {lineSummary.moneylineHome} /{" "}
                    {data.awayTeam} {lineSummary.moneylineAway}
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <p className="mt-6 text-xs text-gray-500 font-inter">
              Published: <span className="text-[#111827]">{published}</span> |
              Last Updated: <span className="text-[#111827]">{updated}</span>
            </p>
          </div>
        </header>

        {/* Article Body */}
        <article className="mt-8 md:mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="w-full h-[3px] bg-[#24257C]" />
          <div className="p-6 md:p-8 lg:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-[#111827] font-playfair mb-4">
              {article.heading}
            </h2>

            <div className="prose prose-lg max-w-none prose-p:font-inter prose-p:text-[#111827] prose-headings:text-[#111827]">
              {paragraphs.map((para, idx) => (
                <p key={idx} className="leading-7 md:leading-8">
                  {para}
                </p>
              ))}
            </div>

            {/* CTA (optional) */}
            <div className="mt-8">
              <Link
                href={leagueHref}
                className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-[#24257C] text-white text-sm font-bold tracking-wide uppercase transition hover:bg-[#C83495]"
              >
                Back to {data.sportTitle}
              </Link>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}
