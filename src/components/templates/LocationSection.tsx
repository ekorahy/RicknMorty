"use client";

import { GET_LOCATIONS } from "@/graphql/queries";
import { useQuery } from "@apollo/client";
import LocationList from "../organisms/LocationList";
import TitlePage from "../atoms/TitlePage";
import { useRouter, useSearchParams } from "next/navigation";
import ButtonPagination from "../atoms/ButtonPagination";
import { useState, useEffect } from "react";
import LocationItemSkeleton from "../molecules/LocationItemSkeleton";
import React from "react";
import SearchInputLocations from "../molecules/SearchInputLocations";

export default function LocationsSection() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [screenWidth, setScreenWidth] = useState(0);

  const page = parseInt(searchParams.get("page") || "1", 10);
  const keyword = searchParams.get("keyword") || "";

  const { loading, error, data } = useQuery(GET_LOCATIONS, {
    variables: { page },
  });

  useEffect(() => {
    const updateWidth = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", updateWidth);
    updateWidth();
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    if (!searchParams.get("page")) {
      router.push("?page=1");
    }
  }, [searchParams, router]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKeyword = e.target.value;
    router.push(`?page=${page}&keyword=${newKeyword}`);
  };

  const handleClearSearch = () => {
    router.push(`?page=${page}`);
  };

  const handlePageChange = (newPage: number) => {
    router.push(`?page=${newPage}&keyword=${keyword}`);
  };

  const createPaginationRange = () => {
    const pages = data?.locations?.info?.pages || 1;
    const visiblePages = screenWidth >= 1024 ? 7 : 5;
    const range = [];

    range.push(1);

    if (page > visiblePages - 2) {
      range.push("...");
    }

    const start = Math.max(2, page - 2);
    const end = Math.min(pages - 1, page + 2);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (page < pages - (visiblePages - 3)) {
      range.push("...");
    }

    if (pages > 1) {
      range.push(pages);
    }

    return range;
  };

  const { results } = data?.locations || { results: [], info: {} };
  const { next, prev } = data?.locations?.info || {};

  const filteredResults = results.filter((location: { name: string }) =>
    location.name.toLowerCase().includes(keyword.toLowerCase()),
  );

  return (
    <section className="container mx-auto my-32 px-4 lg:px-8">
      <TitlePage title="Locations" variant="fuchsia" />

      <SearchInputLocations
        keyword={keyword}
        placeholder="Locations"
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        data={filteredResults}
      />

      <div>
        {loading ? (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
            {Array.from({ length: 20 }, (_, index) => (
              <LocationItemSkeleton key={index} />
            ))}
          </ul>
        ) : error ? (
          <p className="text-center text-red-400">Error: {error.message}</p>
        ) : filteredResults.length > 0 ? (
          <LocationList results={filteredResults} />
        ) : (
          <p className="text-center">No locations found</p>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-2 lg:gap-4">
        <ButtonPagination
          variant="prev"
          color="fuchsia"
          disabled={!prev}
          onClick={() => handlePageChange(page - 1)}
        />

        {createPaginationRange().map((pageNumber, index) =>
          typeof pageNumber === "number" ? (
            <ButtonPagination
              key={index}
              color="fuchsia"
              variant="value"
              value={pageNumber}
              active={page === pageNumber}
              onClick={() => handlePageChange(pageNumber)}
            />
          ) : (
            <span key={index} className="mx-2 text-gray-500">
              ...
            </span>
          ),
        )}

        <ButtonPagination
          variant="next"
          color="fuchsia"
          disabled={!next}
          onClick={() => handlePageChange(page + 1)}
        />
      </div>
    </section>
  );
}
