import React, { useState, useEffect, Component } from "react";
import SearchBox from "./search";
import Card from "./card";
import Error from "./Error";
import Success from "./Success";
let chump = require("chump");
// Instantiate client with your api token
let client = new chump.Client("avz5tysthcikycgdgc538jhm4kba3k");

// Instantiate a destination user
let user = new chump.User(
  "uj85za4tw7ypawr1mhm5f7gu6sqvox",
  "optionalUserDeviceHere"
);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      movieID: [157336, 475557, 299536, 181812, 419704, 449924, 466272, 338967], // set initital load movie - Interstellar
      success: undefined,
      radarr_url: "",
      radarr_api_key: "",
      tmdb_api_key: "",
      tmdb_url: "",
      endpoint: "movie"
    };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    const data = this.state;
    const obj = {
      title: data.original_title,
      qualityProfileId: 3,
      titleSlug:
        data.original_title.replace(" ", "-").toLowerCase() +
        "-" +
        data.movieID,
      images: [
        {
          coverType: "poster",
          url: `http://image.tmdb.org/t/p/original${data.poster}`
        }
      ],
      tmdbId: data.movieID,
      year: Number(data.release.substring(0, 4)),
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
      `${this.state.radarr_url}/movie?apikey=${this.state.radarr_api_key}`,
      options
    )
      .then(response => response.json())
      .then(json => {
        this.setState({
          ...this.state,
          success: true,
          error: undefined,
          response: json
        });

        setTimeout(() => {
          this.setState({
            success: undefined
          });
        }, 5000);
      })
      .catch(err => {
        this.setState({
          ...this.state,
          error: true,
          success: undefined
        });
        setTimeout(() => {
          this.setState({
            error: undefined
          });
        }, 5000);
      });
  }

  render() {
    if (this.state.response && this.state.success) {
      let message = new chump.Message({
        title: this.state.response.title,
        message: "New movie requested",
        enableHtml: false,
        user: user
      });

      client
        .sendMessage(message)
        .then(() => {
          console.log("Message sent.");
        })
        .catch(error => {
          console.log("An error occurred.");
          console.log(error.stack);
        });
      this.setState({ response: undefined });
    }
    return (
      <div>
        {this.state.error && <Error />}
        {this.state.success && <Success />}
        <SearchBox fetchMovieID={this.fetchMovieID.bind(this)} />
        <Card data={this.state} handleClick={this.handleClick} />
      </div>
    );
  } // END render

  // the api request function
  fetchApi(url) {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        // update state with API data
        this.setState({
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

    // .catch((err) => console.log('Movie not found!'))
  } // end function

  fetchMovieID(movieID) {
    let url = `${this.state.tmdb_url}/movie/${movieID}?&api_key=${this.state.tmdb_api_key}`;
    this.fetchApi(url);
  } // end function

  componentDidMount() {
    let mov = this.state.movieID;
    let movieNum = Math.floor(Math.random() * mov.length);
    let url = `${this.state.tmdb_url}/movie/${mov[movieNum]}?&api_key=${this.state.tmdb_api_key}`;
    this.fetchApi(url);

    //========================= BLOODHOUND ==============================//
    let suggests = new Bloodhound({
      datumTokenizer: function(datum) {
        return Bloodhound.tokenizers.whitespace(datum.value);
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        url: `${this.state.tmdb_url}/search/movie?query=%QUERY&api_key=${this.state.tmdb_api_key}`,
        filter: function(movies) {
          // Map the remote source JSON array to a JavaScript object array
          return $.map(movies.results, function(movie) {
            return {
              value: movie.original_title, // search original title
              id: movie.id // get ID of movie simultaniously
            };
          });
        } // end filter
      } // end remote
    }); // end new Bloodhound

    suggests.initialize(); // initialise bloodhound suggestion engine

    //========================= END BLOODHOUND ==============================//

    //========================= TYPEAHEAD ==============================//
    // Instantiate the Typeahead UI
    $(".typeahead")
      .typeahead(
        {
          hint: true,
          highlight: true,
          minLength: 2
        },
        { source: suggests.ttAdapter() }
      )
      .on(
        "typeahead:selected",
        function(obj, datum) {
          this.fetchMovieID(datum.id);
        }.bind(this)
      ); // END Instantiate the Typeahead UI
    //========================= END TYPEAHEAD ==============================//
  } // end component did mount function

  // } // END CLASS - APP
}
module.exports = App;
