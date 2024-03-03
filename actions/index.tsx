"use server";

import { siteConfig } from "@/config/site";
import { Movie } from "@/lib/types";
import genres from "@/lib/genres";
import { ogTitle } from "@/lib/types";

// Server side fetching of all the titles and count
export const fetchTitles = async () => {
  const res = await fetch(siteConfig.apiUrl.titles, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch API data");
  }
  const data = await res.json();
  return data;
};

export const fetchRecommends = async (title: string) => {
  const res = await fetch(
    `${siteConfig.apiUrl.recommendations}?title=${title}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch API data");
  }
  const data = await res.json();
  return data;
};

export const getTitleFromId = async (id: number) => {
  try {
    const data = await fetchTitles();
    const moviesList: Movie[] = data.list;
    const movie = moviesList.find((movie) => movie.id === id);
    return movie ? movie.title : undefined;
  } catch (err) {
    console.log("Failed to fetch the Title from ID");
  }
};

// TMDB Api for images, overview etc. from [title](from kaggle dataset)
export const fetchMoviesData = async (title: string) => {
  const res = await fetch(
    `${siteConfig.apiUrl.tmdb}?query=${title}&api_key=${process.env.TMDB_KEY}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch API data");
  }
  return res.json();
};

export const getTmdbData = async (title: string, id: number) => {
  const tmdbData = await fetchMoviesData(title)
  const first = tmdbData.results[0] // Take the first one as there are many results for title

  const genreNames: string[] = first.genre_ids.map((id: number) => {
    const idToFind = id;
    const foundObject = genres.find(item => item.id === idToFind);
    return foundObject?.name
  })

  const movieData: Movie =  {
    ...{title, id},
    "adult": first.adult,
    "genres": genreNames, // Tmdb Api gives genre id's, we get genre name for each genre_id
    "ogLanguage": first.original_language,
    "overview": first.overview,
    "popularity": first.popularity,
    "posterPath": first.poster_path,
    "releaseDate": first.release_date,
    "voteAverage": first.vote_average,
    "voteCount": first.vote_count
  }

  return movieData
}

export const getMoviesData = async (arr: ogTitle[], start: number, end: number ) => {
  let moviesData: Movie[] = [];
  for (let i = start; i < end; i++) {
    const movieData = await getTmdbData(arr[i].title, arr[i].id)
    moviesData.push(movieData)
  }
  // console.log(moviesData)
  return moviesData
}