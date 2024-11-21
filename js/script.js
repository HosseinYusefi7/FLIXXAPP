const global = {
  currentPage: window.location.pathname,
  search: {
    term: '',
    type: '',
    page: 1,
    totalPages: 1,
    totalResults: 0,
  },
  api: {
    API_KEY: '3313d226ef787165810b4499d0880271',
    API_URL: 'https://api.themoviedb.org/3/',
  },
};

async function searchAPIData() {
  showSpinner();
  const response = await fetch(
    `${global.api.API_URL}search/${global.search.type}?api_key=${global.api.API_KEY}&langauge=en-US&query=${global.search.term}&page=${global.search.page}`,
  );

  const data = await response.json();
  hideSpinner();
  return data;
}
async function fetchAPIData(endpoint) {
  showSpinner();
  const response = await fetch(
    `${global.api.API_URL}${endpoint}?api_key=${global.api.API_KEY}&language=en-US`,
  );
  const data = await response.json();
  hideSpinner();
  return data;
}

// display popular movies
async function displayPopularMovies() {
  const { results } = await fetchAPIData('movie/popular');
  const popularMovies = await fetch(
    `https://api.themoviedb.org/3/movie/popular?api_key=3313d226ef787165810b4499d0880271&language=en-US&page=1`,
  );
  const popularMoviesData = await popularMovies.json();

  results.forEach((movie) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
            <a href="movie-details.html?id=${movie.id}">
            ${
              movie.poster_path
                ? `<img
              src="https://image.tmdb.org/t/p/w500/${movie.poster_path}"
              class="card-img-top"
              alt="${movie.title}"
            />`
                : `<img
              src="images/no-image.jpg"
              class="card-img-top"
              alt="${movie.title}"
            />`
            }
          </a>
          <div class="card-body">
            <h5 class="card-title">${movie.title}</h5>
            <p class="card-text">
              <small class="text-muted">Release: ${movie.release_date}</small>
            </p>
          </div>
    
    `;
    document.querySelector('#popular-movies').appendChild(div);
  });
}
// display popular Shows
async function displayPopularShows() {
  const { results } = await fetchAPIData('tv/top_rated');
  results.forEach((show) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
          <a href="tv-details.html?id=${show.id}">
            ${
              show.poster_path
                ? `<img
              src="https://image.tmdb.org/t/p/w500/${show.poster_path}"
              class="card-img-top"
              alt="${show.name}"
            />`
                : `<img
              src="images/no-image.jpg"
              class="card-img-top"
              alt="${show.name}"
            />`
            }
          </a>
          <div class="card-body">
            <h5 class="card-title">${show.name}</h5>
            <p class="card-text">
              <small class="text-muted">Aired: ${show.first_air_date}</small>
            </p>
          </div>

        `;
    document.querySelector('#popular-shows').appendChild(div);
  });
}

// display movie details
async function displayMovieDetails() {
  const movieId = window.location.search.split('=')[1];
  const movie = await fetchAPIData(`movie/${movieId}`);

  const videos = await fetch(
    `${global.api.API_URL}movie/${movieId}/videos?api_key=${global.api.API_KEY}`,
  );
  const videosData = await videos.json();
  console.log(videosData.results[0]);
  if (videosData.results[0]) {
    videosData.results.slice(0, 1).forEach((video) => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${video.key}`;
      iframe.width = '100%';
      iframe.height = '620';
      iframe.allowFullscreen = true;
      document.querySelector('#trailer').appendChild(iframe);
    });
  }

  // display cast
  const credits = await fetch(
    `${global.api.API_URL}movie/${movieId}/credits?api_key=${global.api.API_KEY}`,
  );
  const creditsData = await credits.json();
  const data = creditsData.cast;

  data.slice(0, 10).forEach((actor) => {
    const div = document.createElement('div');
    div.classList.add('swiper-slide');
    div.innerHTML = `
      <a href="" id="cast-details">
      ${
        actor.profile_path
          ? `<img src="https://image.tmdb.org/t/p/w500/${actor.profile_path}" alt="${actor.name}"  />
        `
          : `<img src="images/${
              actor.gender === 2 ? 'man-user' : 'woman-user'
            }.png" alt="${actor.name}"  />`
      }
        
        <h4>${actor.name}</h4>

      </a>
    `;
    document.querySelector('.swiper-wrapper').appendChild(div);
    initCastSwiper();
  });

  // overlay for background image
  displayBackgroudImage('movie', movie.backdrop_path);
  const div = document.createElement('div');
  div.innerHTML = `
          <div class="details-top">
          <div>
            ${
              movie.poster_path
                ? `<img
                src="https://image.tmdb.org/t/p/w500/${movie.poster_path}"
                class="card-img-top"
                alt="${movie.title}"
              />`
                : `<img
                src="images/no-image.jpg"
                class="card-img-top"
                alt="${movie.title}"
              />`
            }
          </div>
          <div>
            <h2>${movie.title}</h2>
            <p>
              <i class="fas fa-star text-primary"></i>
              ${movie.vote_average.toFixed(1)} / 10
            </p>
            <p class="text-muted">Release Date: ${movie.release_date}</p>
            <p>
              ${movie.overview}
            </p>
            <h5>Genres</h5>
            <ul class="list-group">
              ${movie.genres
                .map((genre) => {
                  return `<li>${genre.name}</li>`;
                })
                .join('')}
            </ul>
            <a href="${
              movie.homepage
            }" target="_blank" class="btn">Visit Movie Homepage</a>
          </div>
        </div>
        <div class="details-bottom">
          <h2>Movie Info</h2>
          <ul>
            <li><span class="text-secondary">Budget:</span> $${addCommas(
              movie.budget,
            )}</li>
            <li><span class="text-secondary">Revenue:</span> $${addCommas(
              movie.revenue,
            )}</li>
            <li><span class="text-secondary">Runtime:</span> ${
              movie.runtime
            }</li>
            <li><span class="text-secondary">Status:</span> ${movie.status}</li>
          </ul>
          <h4>Production Companies</h4>
          <div class="list-group">
          ${movie.production_companies
            .map((company) => {
              return `<span>${company.name} </span>`;
            })
            .join('')}
          </div>
        </div>

  `;
  document.querySelector('#movie-details').appendChild(div);
}
// display backdrop on details page
function displayBackgroudImage(type, background_path) {
  const overlayDiv = document.createElement('div');
  overlayDiv.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${background_path})`;
  overlayDiv.style.backgroundSize = 'cover';
  overlayDiv.style.backgroundPosition = 'center';
  overlayDiv.style.backgroundRepeat = 'no-repeat';
  overlayDiv.style.height = '100vh';
  overlayDiv.style.width = '100vw';
  overlayDiv.style.position = 'absolute';
  overlayDiv.style.top = '0';
  overlayDiv.style.left = '0';
  overlayDiv.style.zIndex = '-1';
  overlayDiv.style.opacity = '0.2';
  if (type === 'movie') {
    document.querySelector('#movie-details').appendChild(overlayDiv);
  } else {
    document.querySelector('#show-details').appendChild(overlayDiv);
  }
}

// display show details
async function displayShowDetails() {
  const showId = window.location.search.split('=')[1];
  const show = await fetchAPIData(`tv/${showId}`);

  const videos = await fetch(
    `${global.api.API_URL}tv/${showId}/videos?api_key=${global.api.API_KEY}`,
  );
  const videosData = await videos.json();
  videosData.results.forEach((video) => {
    if (video.type === 'Trailer') {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${video.key}`;
      iframe.width = '100%';
      iframe.height = '620';
      iframe.allowFullscreen = true;
      document.querySelector('#trailer').appendChild(iframe);
    }
  });

  // Display background image
  displayBackgroudImage('show', show.backdrop_path);
  const div = document.createElement('div');
  div.innerHTML = `
  <div class="details-top">
          <div>
            ${
              show.poster_path
                ? `<img
              src="https://image.tmdb.org/t/p/w500/${show.poster_path}"
              class="card-img-top"
              alt="${show.name}"
            />`
                : `<img
            src="images/no-image.jpg"
            class="card-img-top"
            alt="${show.name}"
          />`
            }
          </div>
          <div>
            <h2>${show.name}</h2>
            <p>
              <i class="fas fa-star text-primary"></i>
              ${show.vote_average.toFixed(1)} / 10
            </p>
            <p class="text-muted">First Air Date: ${show.first_air_date}</p>
            <p>
              ${show.overview}
            </p>
            <h5>Genres</h5>
            <ul class="list-group">
              ${show.genres.map((genre) => `<li>${genre.name}</li>`).join('')}
            </ul>
            <a href="${
              show.homepage
            }" target="_blank" class="btn">Visit Show Homepage</a>
          </div>
        </div>
        <div class="details-bottom">
          <h2>Show Info</h2>
          <ul>
            <li><span class="text-secondary">Number Of Episodes:</span> ${
              show.number_of_episodes
            }</li>
            <li>
              <span class="text-secondary">Last Episode To Air:</span> ${
                show.last_episode_to_air.air_date
              }
            </li>
            <li><span class="text-secondary">Status:</span> ${show.status}</li>
          </ul>
          <h4>Production Companies</h4>
          <div class="list-group">${show.production_companies
            .map((company) => `<span>${company.name} </span>`)
            .join('')}</div>
        </div>
  `;
  document.querySelector('#show-details').appendChild(div);

  // show cast
  const credit = await fetch(
    `${global.api.API_URL}tv/${showId}/credits?api_key=${global.api.API_KEY}`,
  );
  const creditsData = await credit.json();
  const data = creditsData.cast;
  data.slice(0, 10).forEach((actor) => {
    const div = document.createElement('div');
    div.classList.add('swiper-slide');
    div.innerHTML = `
        <a href="" id="cast-details">
        ${
          actor.profile_path
            ? `<img src="https://image.tmdb.org/t/p/w500/${actor.profile_path}" alt="${actor.name}"  />
          `
            : `<img src="images/${
                actor.gender === 2 ? 'man-user' : 'woman-user'
              }.png" alt="${actor.name}"  />`
        }
          
          <h4>${actor.name}</h4>
  
        </a>
      `;
    document.querySelector('.swiper-wrapper').appendChild(div);
    initCastSwiper();
  });
}

// display search results
async function displaySearchResults() {
  const query = window.location.search;
  const urlParams = new URLSearchParams(query);
  global.search.type = urlParams.get('type');
  global.search.term = urlParams.get('search-term');

  if (global.search.term !== '' && global.search.term !== null) {
    const { results, total_pages, page, total_results } = await searchAPIData();
    global.search.page = page;
    global.search.totalPages = total_pages;
    global.search.totalResults = total_results;
    if (results.length === 0) {
      showAlert('No results found');
      return;
    }
    displayResults(results);
    document.querySelector('#search-term').value = '';
  } else {
    showAlert('please enter a search term');
  }
}

function displayResults(results) {
  // clear prev results
  document.querySelector('#search-results').innerHTML = '';
  document.querySelector('#search-results-heading').innerHTML = '';
  document.querySelector('#pagination').innerHTML = '';
  results.forEach((item) => {
    const div = document.createElement('div');
    div.classList.add('card');
    div.innerHTML = `
            <a href="${global.search.type}-details.html?id=${item.id}">
            ${
              item.poster_path
                ? `<img
              src="https://image.tmdb.org/t/p/w500/${item.poster_path}"
              class="card-img-top"
              alt="${global.search.type === 'movie' ? item.title : item.name}"
            />`
                : `<img
              src="images/no-image.jpg"
              class="card-img-top"
              alt="${global.search.type === 'movie' ? item.title : item.name}"
            />`
            }
          </a>
          <div class="card-body">
            <h5 class="card-title">${
              global.search.type === 'movie' ? item.title : item.name
            }</h5>
            <p class="card-text">
              <small class="text-muted">${
                global.search.type === 'movie'
                  ? 'Release Date'
                  : 'First Air Date'
              }: ${
      global.search.type === 'movie' ? item.release_date : item.first_air_date
    }</small>
            </p>
          </div>
    
    `;
    document.querySelector('#search-results-heading').innerHTML = `
    <h2>${results.length} of ${global.search.totalResults} Results for ${global.search.term} </h2>
    `;
    document.querySelector('#search-results').appendChild(div);
  });
  displayPagination();
}

// create and display pagination
function displayPagination() {
  const div = document.createElement('div');
  div.classList.add('pagination');
  div.innerHTML = `
    <button class="btn btn-primary" id="prev">Prev</button>
          <button class="btn btn-primary" id="next">Next</button>
          <div class="page-counter">Page ${global.search.page} of ${global.search.totalPages}</div>
        </div>
  `;
  document.querySelector('#pagination').appendChild(div);
  // disable prev button if on first page
  if (global.search.page === 1) {
    document.querySelector('#prev').disabled = true;
  }
  // disable next button if on last page
  if (global.search.page === global.search.totalPages) {
    document.querySelector('#next').disabled = true;
  }
  // next page
  document.querySelector('#next').addEventListener('click', async () => {
    global.search.page++;
    const { results, totalPages } = await searchAPIData();
    displayResults(results);
  });
  document.querySelector('#prev').addEventListener('click', async () => {
    global.search.page--;
    const { results, totalPages } = await searchAPIData();
    displayResults(results);
  });
}

// custom alert
function showAlert(message, className = 'error') {
  const alertEl = document.createElement('div');
  alertEl.classList.add('alert', className);
  alertEl.appendChild(document.createTextNode(message));
  document.querySelector('#alert').appendChild(alertEl);
  setTimeout(() => alertEl.remove(), 3000);
}
// add commas
function addCommas(number) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
// active link
function highlighActiveLink() {
  const links = document.querySelectorAll('.nav-link');
  links.forEach((link) => {
    if (link.getAttribute('href') === global.currentPage) {
      link.classList.add('active');
    }
  });
}
// display slider movies

async function displaySlider() {
  const { results } = await fetchAPIData('movie/now_playing');
  results.forEach((movie) => {
    const div = document.createElement('div');
    div.classList.add('swiper-slide');
    div.innerHTML = `
            <a href="movie-details.html?id=${movie.id}">
              <img src="https://image.tmdb.org/t/p/w500${
                movie.poster_path
              }" alt="${movie.title}" />
            </a>
            <h4 class="swiper-rating">
              <i class="fas fa-star text-secondary"></i> ${movie.vote_average.toFixed(
                1,
              )} / 10
            </h4>

    `;
    document.querySelector('.swiper-wrapper').appendChild(div);
    initSwiper();
  });
}
function initSwiper() {
  const swiper = new Swiper('.swiper', {
    slidesPerView: 1,
    spaceBetween: 30,
    freeMode: true,
    loop: true,
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
    },
    breakpoints: {
      500: {
        slidesPerView: 2,
      },
      700: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
    },
  });
}

function initCastSwiper() {
  const swiper = new Swiper('.swiper', {
    slidesPerView: 1,
    spaceBetween: 30,
    freeMode: true,
    loop: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    breakpoints: {
      500: {
        slidesPerView: 3,
      },
      700: {
        slidesPerView: 4,
      },
      1200: {
        slidesPerView: 4,
      },
    },
  });
}
function showSpinner() {
  document.querySelector('.spinner').classList.add('show');
}
function hideSpinner() {
  document.querySelector('.spinner').classList.remove('show');
}
function init() {
  switch (global.currentPage) {
    case '/':
    case 'index.html':
      displaySlider();
      displayPopularMovies();
      break;
    case '/shows.html':
      displayPopularShows();
      break;
    case '/movie-details.html':
      displayMovieDetails();
      break;
    case '/tv-details.html':
      displayShowDetails();
      break;
    case '/search.html':
      displaySearchResults();
      break;
  }
  highlighActiveLink();
}

document.addEventListener('DOMContentLoaded', init);
