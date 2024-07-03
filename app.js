const express = require('express');
const crypto = require('node:crypto');
const cors = require('cors');
const movies = require('./movies.json');
const { validateMovie, validatePartialMovie } = require('./schemas/movies');

const app = express();
app.use(express.json());
app.use(
    cors({
        origin: (origin, callback) => {
            const ACCEPTED_ORIGINS = ['http://localhost:8080', 'http://localhost:1234', 'http://192.168.88.191:8080'];

            if (ACCEPTED_ORIGINS.includes(origin)) {
                return callback(null, true);
            }

            if (!origin) {
                return callback(null, true);
            }

            return callback(new Error('Not allowed by CORS'));
        },
    })
);
app.disable('x-powered-by'); // Deshabilitar el header X-Powered-By: Express

// métodos normales: GET/HEAD/POST
// métodos complejos: PUT/PATCH/DELETE

// CORS PRE-Flight
// OPTIONS

// Todos los recursos que sean MOVIES se identifica con /movies
app.get('/movies', (req, res) => {
    /* const origin = req.header('origin');
    // cuando la peticion es del mismo ORIGIN
    if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin);
    } */

    const { genre } = req.query;

    if (genre) {
        const filteredMovies = movies.filter((movie) =>
            movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
        );

        return res.json(filteredMovies);
    }

    res.json(movies);
});

app.get('/movies/:id', (req, res) => {
    const { id } = req.params;
    const movie = movies.find((movie) => movie.id === id);

    if (movie) return res.json(movie);

    res.status(404).json({ message: 'Movie not found' });
});

app.post('/movies', (req, res) => {
    const result = validateMovie(req.body);

    if (!result.success) {
        // 422 Unprocessable Entity
        return res.status(400).json({ message: JSON.parse(result.error.message) });
    }

    // en base de datos
    const newMovie = {
        id: crypto.randomUUID(), // crea id random
        ...result.data,
    };

    // Esto no sería REST, porque estamos guardanfo el estado de la aplicación en memoria
    movies.push(newMovie);

    res.status(201).json(newMovie); // Actualizar la caché del cliente
});

app.delete('/movies/:id', (req, res) => {
    /* const origin = req.header('origin');
    if (ACCEPTED_ORIGINS.includes(origin) || !origin) res.header('Access-Control-Allow-Origin', origin); */

    const { id } = req.params;
    const movieIndex = movies.findIndex((movie) => movie.id === id);

    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' });
    }

    movies.splice(movieIndex, 1);

    return res.json({ message: 'Movie deleted' });
});

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body);

    if (!result.success) return res.status(400).json({ error: JSON.parse(result.error.message) });

    const { id } = req.params;
    const movieIndex = movies.findIndex((movie) => movie.id === id);

    if (movieIndex === -1) return res.status(404).json({ message: 'Movie not found' });

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data,
    };

    movies[movieIndex] = updateMovie;

    return res.json(updateMovie);
});

const PORT = process.env.PORT ?? 1234;

app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`);
});
