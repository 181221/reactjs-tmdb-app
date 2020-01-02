import React, { useState, useEffect, Component } from "react";
import SearchBox from "./search";
import Card from "./card";
import Error from "./Error";
import Success from "./Success";

const App = props => {
  const movieID = useState([
    157336,
    475557,
    299536,
    181812,
    419704,
    449924,
    466272,
    338967
  ]);
  const [error, setError] = useState(undefined);
  const [movie, setMovie] = useState(undefined);
  const [success, setSuccess] = useState(undefined);

  const fetchApi = url => {
    console.log("fetchig");
    fetch(url)
      .then(res => res.json())
      .then(data => {
        console.log("data", data);
        setMovie({
          movieID: data.id,
          original_title: data.original_title,
          tagline: data.tagline,
          overview: data.overview,
          homepage: data.homepage,
          poster: data.poster_path,
          production: data.production_companies,
          production_countries: data.production_countries,
          genre: data.genres,
          release: data.release_date,
          vote: data.vote_average,
          runtime: data.runtime,
          revenue: data.revenue,
          backdrop: data.backdrop_path
        });
      });
  };
  const fetchMovieID = movieID => {
    let url = `https://api.themoviedb.org/3/movie/${movieID}?&api_key=cfe422613b250f702980a3bbf9e90716`;
    this.fetchApi(url);
  };
  const handleClick = e => {
    const obj = {
      title: movie.original_title,
      qualityProfileId: 3,
      titleSlug:
        movie.original_title.replace(" ", "-").toLowerCase() +
        "-" +
        movie.movieID,
      images: [
        {
          coverType: "poster",
          url: `http://image.tmdb.org/t/p/original${movie.poster}`
        }
      ],
      tmdbId: movie.movieID,
      year: Number(movie.release.substring(0, 4)),
      rootFolderPath: "/tmp"
    };
    const options = {
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(obj),
      method: "POST"
    };

    fetch(
      "http://localhost:7878/api/movie?apikey=6901fefa79cb4b07b57a6d3f786f7b67",
      options
    )
      .then(response => response.json())
      .then(json => {
        setError(undefined);
        setSuccess(true);

        setTimeout(() => {
          setSuccess(undefined);
        }, 5000);
      })
      .catch(err => {
        setError(true);
        setSuccess(undefined);
        setTimeout(() => {
          setError(undefined);
        }, 5000);
      });
  };

  useEffect(() => {
    console.log("fetching");
    let movieNum = Math.floor(Math.random() * movieID.length);
    let url = `https://api.themoviedb.org/3/movie/${movieID[movieNum]}?&api_key=cfe422613b250f702980a3bbf9e90716`;
    fetchApi(url);
  }, []);

  return (
    <div>
      {error && <Error />}
      {success && <Success />}
      <SearchBox fetchMovieID={fetchMovieID} />
      <Card data={movie} handleClick={handleClick} />
    </div>
  );
};
module.exports = App;
