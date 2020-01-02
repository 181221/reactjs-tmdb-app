import React, { Component } from 'react';
import SearchBox from './search';
import Card from './card';
import Error from './Error'
import Success from './Success'



class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      movieID: 157336, // set initital load movie - Interstellar
      success: undefined
    }
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    const data = this.state
    const obj = {
      title: data.original_title,
      qualityProfileId: 3,
      titleSlug: data.original_title.replace(" ","-").toLowerCase() + "-"+data.movieID,
      images: [{
          "coverType": "poster",
          "url": `http://image.tmdb.org/t/p/original${data.poster}`
        }],
      tmdbId: data.movieID,
      year: Number(data.release.substring(0,4)),
      rootFolderPath: "/tmp"
    }
    const options = {
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(obj),
      method: "POST"
    };
    
    fetch("http://localhost:7878/api/movie?apikey=6901fefa79cb4b07b57a6d3f786f7b67", options)
      .then(response => response.json())
      .then(json => {this.setState({...this.state, success: true, error: undefined, response:json})
        setTimeout(() => {
          this.setState({
            success: undefined
          })
        }, 5000);
      })
      .catch(err => {this.setState({
        ...this.state,
        error: true,
        success:undefined
       })
       setTimeout(() => {
        this.setState({
          error: undefined
        })
       }, 5000);

    })   
  }
  
  render() {
    console.log("this.state", this.state)
    console.log(process.env.TEST)
    return (
      <div>   
        {this.state.error && 
        <Error/>
        }
        {this.state.success && 
        <Success/>
        }
        <SearchBox fetchMovieID={this.fetchMovieID.bind(this)}/>
        <Card data={this.state} handleClick={this.handleClick}/>
      </div>
    )
  } // END render


  // the api request function
  fetchApi(url) {

    fetch(url).then((res) => res.json()).then((data) => {
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

      })
    })

    // .catch((err) => console.log('Movie not found!'))

  } // end function

  fetchMovieID(movieID) {
    let url = `https://api.themoviedb.org/3/movie/${movieID}?&api_key=cfe422613b250f702980a3bbf9e90716`
    this.fetchApi(url)
  } // end function

  componentDidMount() {
    let url = `https://api.themoviedb.org/3/movie/${this.state.movieID}?&api_key=cfe422613b250f702980a3bbf9e90716`
    this.fetchApi(url)

    //========================= BLOODHOUND ==============================//
    let suggests = new Bloodhound({
      datumTokenizer: function(datum) {
        return Bloodhound.tokenizers.whitespace(datum.value);
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        url: 'https://api.themoviedb.org/3/search/movie?query=%QUERY&api_key=cfe422613b250f702980a3bbf9e90716',
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
    $('.typeahead').typeahead({
      hint: true,
      highlight: true,
      minLength: 2
    }, {source: suggests.ttAdapter()}).on('typeahead:selected', function(obj, datum) {
      this.fetchMovieID(datum.id)
    }.bind(this)); // END Instantiate the Typeahead UI
    //========================= END TYPEAHEAD ==============================//

  } // end component did mount function

  // } // END CLASS - APP
}
module.exports = App;
