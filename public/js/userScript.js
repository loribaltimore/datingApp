let favoriteMovieBtn = document.querySelector('#favorite_movie_btn');
let currently_watching = document.querySelector('#currently_watching');
let hobbyForms = document.querySelector('.hobby-form-div');
let movieInputs = document.querySelectorAll('.movie-inputs');
let habitChoice = document.querySelectorAll('.habit-choice');
let favoriteGameInput = document.querySelector('#favorite-game-input');
let favoriteGameBtn = document.querySelector('#favorite-game-btn');
let favoriteBookBtn = document.querySelector('#favorite-book-btn');
let favoriteBookDiv = document.querySelector('#favorite-book-div');
let currentlyReadingBtn = document.querySelector('#currently-reading-btn');
let currentMovieBtn = document.querySelector('#current_movie_btn');
let travelFormBtn = document.querySelector('#travel-form-btn');
let promptSelect = document.querySelector('#prompt-select');
let promptResponse = document.querySelector('#prompt-response');
let promptResponseDiv = document.querySelector('#prompt-response-div');
let promptResponseBtn = document.querySelector('#prompt-response-btn');
let promptForm = document.querySelector('#prompt-form');



if (hobbyForms) {
    favoriteMovieBtn.addEventListener('click', async (event) => {
        console.log('working');
        let query = event.path[1].childNodes[1].value;
        let movieInfo = await axios({
            method: 'get',
            url: 'https://api.themoviedb.org/3/search/movie',
            params: {
                api_key: movieAPI,
                query: query,
                include_adult: false
            },
            headers: {
                'Content-Type': 'application-json'
            }
        }).then(res => { console.log(res.data.results); return res.data.results })
            .catch(err => console.log(err));
        let topMoviesDiv = document.createElement('div');
        topMoviesDiv.setAttribute('id', 'top_movies')
        for (let i = 0; i < 3; i++){
            document.getElementById(`movie-radio-${i}`).setAttribute('src', `http://image.tmdb.org/t/p/w185/${movieInfo[i].poster_path}`);
            document.getElementById(`poster_${i}`).setAttribute('value', `${movieInfo[i].poster_path}::${movieInfo[i].original_title}::${movieInfo[i].release_date}`);
            }
    });
    currentMovieBtn.addEventListener('click', async (event) => {
        let query = event.path[1].childNodes[9].value;
        let movieInfo = await axios({
            method: 'get',
            url: 'https://api.themoviedb.org/3/search/movie',
            params: {
                api_key: movieAPI,
                query: query,
                include_adult: false
            },
            headers: {
                'Content-Type': 'application-json'
            }
        }).then(res => { console.log(res.data.results); return res.data.results })
            .catch(err => console.log(err));
        let topMoviesDiv = document.createElement('div');
        topMoviesDiv.setAttribute('id', 'top_movies')
        for (let i = 0; i < 3; i++){
            document.getElementById(`current-radio-${i}`).setAttribute('src', `http://image.tmdb.org/t/p/w185/${movieInfo[i].poster_path}`);
            document.getElementById(`current_poster_${i}`).setAttribute('value', `${movieInfo[i].poster_path}::${movieInfo[i].original_title}::${movieInfo[i].release_date}`);
            }
    });
 
}

for (let input of movieInputs) {
    input.addEventListener('click', (event) => {
        console.log(event.path);
        event.path[2][3].removeAttribute('hidden');
    })
}

for (let habit of habitChoice) {
    habit.addEventListener('click', (event) => {
        console.log(event.target.id)
        switch (event.target.id) {
            case 'smoking-btn':
                console.log('also working')
                document.getElementById('smoking-form').removeAttribute('hidden')
                break;
            case 'drinking-btn':
                document.getElementById('drinking-form').removeAttribute('hidden')
                break;
            case 'drugs-btn':
                document.getElementById('drugs-form').removeAttribute('hidden')
                break;
            case 'weed-btn':
                document.getElementById('weed-form').removeAttribute('hidden')
                break;
            
        }

    })
}

if (favoriteBookBtn) {
    favoriteBookBtn.addEventListener('click', async(event) => {
        let query = event.path[1].childNodes[1].value;
        let bookInfo = await axios({
            method: 'get',
            url: 'https://www.googleapis.com/books/v1/volumes',
            params: {
                q: query,
                key: bookAPI
            },
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => { console.log(response.data.items.splice(0, 4)); return response.data.items.splice(0, 4) })
            .catch(err => console.log(err));
        
        for (let i = 0; i < 3; i++){
            document.getElementById(`favorite-book-poster${i}`).setAttribute('src', bookInfo[i].volumeInfo.imageLinks.thumbnail);
            let bookTitle = bookInfo[i].volumeInfo.title.split(' ');
            let bookTitleEnd = bookTitle.pop()
            if (bookTitleEnd === 'The') {
                bookTitle.unshift(bookTitleEnd);
                bookTitle = bookTitle.join(' ')
            } else {
                bookTitle.push(bookTitleEnd);
                bookTitle = bookTitle.join(' ')
            };
            document.getElementById(`favorite-book-input${i}`).setAttribute('value', `${bookTitle}::${bookInfo[i].volumeInfo.imageLinks.thumbnail}::${bookInfo[i].volumeInfo.authors[0]}`);
        
        }
    })
}
if (currentlyReadingBtn) {
    currentlyReadingBtn.addEventListener('click', async(event) => {
        let query = event.path[1].childNodes[1].value;
        let bookInfo = await axios({
            method: 'get',
            url: 'https://www.googleapis.com/books/v1/volumes',
            params: {
                q: query,
                key: bookAPI
            },
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => { console.log(response.data.items.splice(0, 4)); return response.data.items.splice(0, 4) })
            .catch(err => console.log(err));
        
        for (let i = 0; i < 3; i++){
            document.getElementById(`current-book-poster${i}`).setAttribute('src', bookInfo[i].volumeInfo.imageLinks.thumbnail);
            let bookTitle = bookInfo[i].volumeInfo.title.split(' ');
            let bookTitleEnd = bookTitle.pop()
            if (bookTitleEnd === 'The') {
                bookTitle.unshift(bookTitleEnd);
                bookTitle = bookTitle.join(' ')
            } else {
                bookTitle.push(bookTitleEnd);
                bookTitle = bookTitle.join(' ')
            };
            document.getElementById(`current-book-input${i}`).setAttribute('value', `${bookTitle}::${bookInfo[i].volumeInfo.imageLinks.thumbnail}::${bookInfo[i].volumeInfo.authors[0]}`);
        
        }
    })
};

if (promptSelect) {
    promptSelect.addEventListener('click', async (event) => {

        promptResponseDiv.removeAttribute('hidden');
        })
    promptResponseBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        let prompt = event.path[2][0].value;
        let promptRes = document.getElementById('prompt-response');
        let promptResValue = promptRes.value;
        promptRes.value = prompt + '::' + promptResValue;
        promptForm.submit();
    })
};

// if (favoriteGameBtn) {
//     favoriteGameBtn.addEventListener('click', async (event) => {
//         event.preventDefault();
//         let query = event.path[1][0].value;
//         let gameResults =  await axios({
//             method: 'get',
//             url: 'https://api.igdb.com/v4/games',
//             params: {
//                 search: query,
//                 fields: 'cover.image_id, release_dates.human, name '
//             },
//             headers: {
//                 'Client-ID': twitch_client,
//                 'Authorization': `Bearer ${accessToken}`,
//                 'Content-Type': 'application/json'
//             }
//         }).then(response => { return response.data }).catch(err => console.log(err))
//     })
// }
