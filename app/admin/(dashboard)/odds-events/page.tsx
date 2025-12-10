"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

type ApiOddsEvent = {
  id: string;
  sportKey: string;
  sportTitle: string;
  commenceTime: string; // ISO
  homeTeam: string;
  awayTeam: string;
  image: string;
};

type LeagueFilter = "ALL" | string;

// ✅ Base leagues that should always appear in the filter,
// even if there are currently no events for them.
const BASE_LEAGUES = ["NFL", "NBA", "NCAAF", "NCAAB", "MLB", "MMA"];

export default function AdminOddsEventsPage() {
  const [events, setEvents] = useState<ApiOddsEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [leagueFilter, setLeagueFilter] = useState<LeagueFilter>("ALL");
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Cloudinary env vars (same style as your EditBlog page)
  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";

  // Fetch all events once
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch("/api/admin/odds-events", {
          cache: "no-store",
        });
        if (!res.ok) {
          const body = await res.json().catch(() => null);
          throw new Error(body?.error || "Failed to load events");
        }

        const raw: any[] = await res.json();

        const safe: ApiOddsEvent[] = raw.map((e) => ({
          id: String(e.id),
          sportKey: String(e.sportKey ?? ""),
          sportTitle: String(e.sportTitle ?? ""),
          commenceTime: String(e.commenceTime),
          homeTeam: String(e.homeTeam ?? ""),
          awayTeam: String(e.awayTeam ?? ""),
          image: String(e.image ?? ""),
        }));

        setEvents(safe);
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err?.message || "Failed to load events.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // derive league options from the data + always include base leagues
  const leagueOptions = useMemo(() => {
    const set = new Set<string>(BASE_LEAGUES);
    events.forEach((e) => {
      if (e.sportTitle) set.add(e.sportTitle);
    });
    return Array.from(set).sort();
  }, [events]);

  // filtered by league
  const filteredEvents = useMemo(() => {
    const lowerCaseSearchQuery = searchQuery.toLowerCase();

    // Filter based on league
    const leagueFilteredEvents =
      leagueFilter === "ALL"
        ? events
        : events.filter((e) => e.sportTitle === leagueFilter);

    // Further filter by search query in homeTeam or awayTeam
    const searchedEvents = leagueFilteredEvents.filter(
      (e) =>
        e.homeTeam.toLowerCase().includes(lowerCaseSearchQuery) ||
        e.awayTeam.toLowerCase().includes(lowerCaseSearchQuery)
    );

    return searchedEvents;
  }, [events, leagueFilter, searchQuery]);

  const truncate = (str: string, max = 80) =>
    str.length > max ? str.slice(0, max) + "…" : str;

  const withUploadingSet = (eventId: string, add: boolean) => {
    setUploadingIds((prev) => {
      const s = new Set(prev);
      if (add) s.add(eventId);
      else s.delete(eventId);
      return s;
    });
  };

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    event: ApiOddsEvent
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      toast.error("Cloudinary env vars missing");
      e.target.value = "";
      return;
    }

    const eventId = event.id;
    withUploadingSet(eventId, true);

    try {
      // 1) upload to Cloudinary via unsigned preset
      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", UPLOAD_PRESET);

      const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
      const { data } = await axios.post(url, form);

      const newImageUrl: string = data.secure_url;
      if (!newImageUrl) {
        throw new Error("Cloudinary did not return a secure_url");
      }

      // 2) Save URL to OddsEvent.image in DB
      const saveRes = await fetch(
        `/api/admin/odds-events/${encodeURIComponent(eventId)}/image`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: newImageUrl }),
        }
      );

      if (!saveRes.ok) {
        const body = await saveRes.json().catch(() => null);
        throw new Error(body?.error || "Failed to save image URL");
      }

      const saved = await saveRes.json();

      // 3) Update local state
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === eventId ? { ...ev, image: saved.image ?? newImageUrl } : ev
        )
      );

      toast.success("Event image updated");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Upload failed");
    } finally {
      withUploadingSet(eventId, false);
      e.target.value = "";
    }
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
      <Toaster position="top-right" />

      <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl mt-10 text-[#263E4D]">
        Odds Events – Images
      </h1>
      <p className="font-poppins text-gray-600 mt-2 mb-8 max-w-2xl">
        Browse OddsEvents by league and update the Cloudinary image stored in
        the <code>image</code> field.
      </p>

      {/* League filter */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
        <div className="w-full sm:w-63">
          <label className="block text-sm font-poppins text-gray-700 mb-2">
            Filter by League
          </label>
          <select
            value={leagueFilter}
            onChange={(e) => setLeagueFilter(e.target.value as LeagueFilter)}
            className="w-full font-poppins pl-1 py-3 border-2 border-gray-200 rounded-lg"
          >
            <option value="ALL">All Leagues</option>
            {leagueOptions.map((lv) => (
              <option key={lv} value={lv}>
                {lv}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Search Bar */}
      <div className="mb-8">
        <label className="block text-sm font-poppins text-gray-700 mb-2">
          Search by Team Names
        </label>
        <input
          type="text"
          placeholder="Enter team name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[255px] font-poppins pl-1 py-3 border-2 border-gray-200 rounded-lg"
        />
      </div>
      {/* States */}
      {loading ? (
        <div className="flex items-center gap-3 py-24 text-gray-500 font-poppins">
          <Spinner />
          Loading events…
        </div>
      ) : errorMsg ? (
        <div className="text-red-600 py-24 font-poppins">{errorMsg}</div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center text-gray-600 py-24 font-poppins">
          No events found for this filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((ev) => {
            const uploading = uploadingIds.has(ev.id);
            const kickOff = new Date(ev.commenceTime).toLocaleString(
              undefined,
              {
                dateStyle: "medium",
                timeStyle: "short",
              }
            );
            const inputId = `event-image-${ev.id}`;

            return (
              <div
                key={ev.id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="relative">
                  <img
                    src={
                      ev.image && ev.image.trim()
                        ? ev.image
                        : "/placeholder.svg"
                    }
                    alt={`${ev.homeTeam} vs ${ev.awayTeam}`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-poppins bg-black/70 text-white">
                      {ev.sportTitle || "Unknown"}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div>
                    <p className="font-poppins text-xs text-gray-500">
                      {kickOff}
                    </p>
                    <h3 className="font-playfair text-lg text-[#263E4D]">
                      {ev.homeTeam} vs {ev.awayTeam}
                    </h3>
                  </div>

                  {/* Image info + uploader */}
                  <div className="mt-3">
                    <input
                      id={inputId}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(e, ev)}
                    />

                    <label
                      htmlFor={inputId}
                      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-poppins cursor-pointer transition-colors ${
                        uploading
                          ? "bg-gray-500 text-gray-200 cursor-wait"
                          : "bg-[#263E4D] text-white hover:bg-[#1a2834]"
                      }`}
                    >
                      {uploading ? (
                        <>
                          <Spinner tiny />
                          Updating…
                        </>
                      ) : (
                        <>Change Image</>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Spinner({ tiny = false }: { tiny?: boolean }) {
  const size = tiny ? "h-4 w-4" : "h-6 w-6";
  return (
    <svg
      className={`animate-spin ${size}`}
      viewBox="0 0 24 24"
      aria-label="spinner"
    >
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
      />
    </svg>
  );
}
