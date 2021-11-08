
async function main(){
    const bestMovies = await getMovies();
    const action = await getMovies("-imdb_score", "Action", 12);
    const sciFi = await getMovies("-imdb_score", "Sci-Fi", 12);
    const thriller = await getMovies("-imdb_score", "Thriller", 12);
    const comedy = await getMovies("-imdb_score", "Comedy", 12);
    displayMovieData(bestMovies[0]);
    displayMoviesData(bestMovies.splice(1), "Incontournables");
    displayMoviesData(action, "Action");
    displayMoviesData(sciFi, "Science-Fiction");
    displayMoviesData(thriller, "Thriller");
    displayMoviesData(comedy, "Comédie");
    createCarousels();
}

async function getMovies(sortBy = "-imdb_score", genre = "", pageSize = 13){
    // Appelle l'API et renvoie les données des films en json
    const response = await fetch(`http://localhost:8000/api/v1/titles?sort_by=${sortBy}&genre=${genre}&page_size=${pageSize}`)
    const response_json = await response.json();
    return response_json.results;
}

function displayMoviesData(movies, categoryName = "Category"){
    const mainContent = document.querySelector('#main-content');
    const h1 = document.createElement("h1");
    const div = document.createElement('div');
    div.className = "carousel"
    div.id = "carousel"
    h1.textContent = categoryName;
    h1.appendChild(div);
    mainContent.appendChild(h1);
    for (let movie of movies) {
        const a = document.createElement('a');
        a.className = `movie`;
        a.id = `${movie.title}`;
        a.href = `#${movie.url}`;
        const img = document.createElement("img");
        img.src = movie.image_url;
        img.addEventListener('click', function(){
            openModal(movie.url)
        });
        a.appendChild(img);
        div.appendChild(a);
    }
}

function displayMovieData(movie){
    const mainContent = document.querySelector('#main-content');
    const h1 = document.createElement("h1");
    const div = document.createElement('div');
    div.className = `best-movie-category`;
    h1.className = `title`;
    h1.textContent = movie.title;
    div.appendChild(h1);
    mainContent.appendChild(div);
    const a = document.createElement('a');
    a.className = `best-movie`;
    a.id = `${movie.title}`;
    a.href = `#${movie.url}`;
    const img = document.createElement("img");
    img.src = movie.image_url;
    const button = document.createElement("button");
    button.addEventListener('click', function(){
        openModal(movie.url)
    });
    button.innerHTML = "Résumé";
    div.appendChild(button)
    div.style.backgroundImage = "url(image/best_movie_background.jpg)";
}

async function openModal(url){
    const response = await fetch(url)
    let response_json = await response.json();
    const modal = document.querySelector('#modal');
    modal.style.display = null;
    modal.addEventListener("click", closeModal);
    modal.querySelector('.js-close-modal').addEventListener('click', closeModal);
    modal.querySelector('.js-stop-modal').addEventListener('click', stopPropagation);
    const title = document.querySelector('#title');
    title.innerHTML = `${response_json.original_title}`;
    const image = document.querySelector('#image');
    image.src = `${response_json.image_url}`;
    const genres = document.querySelector('#genres');
    genres.innerHTML = `Genre: ${response_json.genres}`;
    const date = document.querySelector('#date');
    date.innerHTML = `Date de sortie: ${response_json.date_published}`;
    const rated = document.querySelector('#rated');
    rated.innerHTML = `Rated: ${response_json.rated}`;
    const score = document.querySelector('#score');
    score.innerHTML = `Score imdb: ${response_json.imdb_score}`;
    const director = document.querySelector('#director');
    director.innerHTML = `Réalisateur: ${response_json.directors}`;
    const duration = document.querySelector('#duration');
    duration.innerHTML = `Durée: ${response_json.duration} min`;
    const country = document.querySelector('#countries');
    country.innerHTML = `Pays d'origine: ${response_json.countries}`;
    const grossIncome = document.querySelector('#worldwide_gross_income');
    grossIncome.innerHTML = `Résultat Box-office: ${response_json.worldwide_gross_income} $`;
    const description = document.querySelector('#description');
    description.innerHTML = `Résumé: ${response_json.long_description} `;
}


const closeModal = function (e) {
    e.preventDefault();
    const modal = document.querySelector('#modal');
    modal.style.display = "none";
}

const stopPropagation = function (e) {
    e.stopPropagation()
} 

function createCarousels(){
    const carousels = Array.from(document.querySelectorAll("#carousel"));
    for (index in carousels) {
        new Carousel(carousels[index],{
            slidesToScroll:4, 
            slidesVisibles:8
        });
    } 
}

class Carousel {
    /**
     * @param {HTMLElement} element
     * @param {Object} options
     * @param {Object} options.slidesToScroll Nombre d'éléments à scroller
     * @param {Object} options.slidesVisibles Nombre d'éléments visibles
     */
    constructor(element, options = {} ) {
        this.element = element
        this.options = Object.assign({}, {
            slidesToScroll : 1,
            slidesVisibles : 1
        }, options)
        let children = Array.from(element.children)
        this.currentItem = 0
        this.container = this.createDivWithCLass('carousel_container')
        this.element.appendChild(this.container)
        this.items = children.map((child) => {
            let item = this.createDivWithCLass('carousel_item')
            item.appendChild(child)
            this.container.appendChild(item)
            return item
        })
        this.setStyle()
        this.createNavigation()
    }

    /**
     * 
     * @param {string} className 
     * @returns {HTMLElement}
     */
    createDivWithCLass(className) {
        let div = document.createElement('div')
        div.setAttribute('class', className)
        return div
    }

    /**
     * Applique les dimensions aux éléments du carousel
     */
    setStyle() {
        let ratio = this.items.length / this.options.slidesVisibles
        this.container.style.width = (ratio * 100) + "%"
        this.items.forEach(item => 
            item.style.width = ((100 / this.options.slidesVisibles) / ratio) + "%")
    }

    createNavigation() {
        let nextButton = this.createDivWithCLass('carousel_next')
        //nextButton.innerHTML = ">"
        let prevButton = this.createDivWithCLass('carousel_prev')
        //prevButton.innerHTML = "<"
        this.element.appendChild(nextButton)
        this.element.appendChild(prevButton)
        nextButton.addEventListener("click", this.next.bind(this))
        prevButton.addEventListener("click", this.prev.bind(this))
    }

    next() {
        this.gotoItem(this.currentItem + this.options.slidesToScroll)
    }

    prev() {
        this.gotoItem(this.currentItem - this.options.slidesToScroll)
    }

    /**
     * Déplace le carousel vers l'élément ciblé
     * @param {number} index
     */
    gotoItem (index) {
        if (index < 0) {
            index = this.items.length - this.options.slidesVisibles
        } else if (index >= this.items.length || this.items[this.currentItem + this.options.slidesVisibles] === undefined){
            index = 0
        }
        let translateX = index * -100 / this.items.length
        this.container.style.transform = 'translate3d('+ translateX +'%,0,0)'
        this.currentItem = index
    }
}

main();