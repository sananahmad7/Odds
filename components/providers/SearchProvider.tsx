"use client";

import React, { createContext, useContext, useState } from "react";

type SearchCtx = {
  query: string;
  setQuery: (q: string) => void;
};

const SearchContext = createContext<SearchCtx | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  return (
    <SearchContext.Provider value={{ query, setQuery }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used within SearchProvider");
  return ctx;
}
