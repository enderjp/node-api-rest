const express = require('express');
const crypto = require('node:crypto');
const movies = require('./movies.json');
const z = require('zod');
const { validateMovie, validatePartialMovie } = require('./schemas/movies.js');
const  cors = require('cors');




const app = express();
app.use(express.json()); // middleware
app.use(cors());

app.disable('x-powered-by');

const ACCEPTED_ORIGINS = [
    'http://localhost:3000', 
    'https://localhost:8080',
];

app.get('/', (req, res) => {
    res.json({message: 'Hola mundo'})
})

// todos los recursos que sean MOVIES se identifican
// con /movies
app.get('/movies', (req, res) => { 
    const origin = req.header('origin');
    if (ACCEPTED_ORIGINS.includes(origin)){
        res.header('Access-Control-Allow-Origin', origin)

    }
    const { genre } = req.query;
    if (genre) {
        const filteredMovies = movies.filter(
            movie => movie.genre.some(movie => movie.toLowerCase() === genre.toLowerCase())
        );
        return res.json(filteredMovies);
    }
    res.json(movies);
})

  // nueva idea, filtrar por rate > 9
  app.get('/movies/filterRate', (req, res) => {
    const filteredMoviesByRate = movies.filter(movie => movie.rate > 8.5);

    console.log(filteredMoviesByRate);
    if (!filteredMoviesByRate) return res.status(404).json({message: "No movies were found"});

    return res.status(200).json(filteredMoviesByRate);
})

app.get('/movies/:id', (req, res) => { // path to regex
    const { id } = req.params;
    const movie = movies.find(movie => movie.id === id);
    if (movie) return res.json(movie);

    res.status(404).end('<h1>Movie not found</h1>')
});


app.post('/movies', (req, res) => {

   const result = validateMovie(req.body);

   if (result.error){
        return res.status(400).json({error: JSON.parse(result.error.message)})
   }
    
    const newMovie = {
        id: crypto.randomUUID(), // uuid v4
         ...result.data
    };

    movies.push(newMovie);

    // enviar status code de recurso creado correctamente
    res.status(201).json(newMovie);
})

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)
  
    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
  
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
  
    if (movieIndex === -1) {
      return res.status(404).json({ message: 'Movie not found' })
    }
  
    const updateMovie = {
      ...movies[movieIndex],
      ...result.data
    }
  
    movies[movieIndex] = updateMovie
  
    return res.json(updateMovie)
  })

  app.delete('/movies/:id',(req, res) => {
    const { id }  = req.params;

    const eliminateIndex = movies.find(movie => movie.id === id);

    if(eliminateIndex === -1) return res.status(404).json({message: "Movie not found"});

    movies.splice(eliminateIndex, 1);

    console.log(movies);

    return res.status(200).json(movies);
  })



const PORT = process.env.PORT ?? 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})