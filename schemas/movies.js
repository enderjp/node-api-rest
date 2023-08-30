const z = require('zod');

 // validacion de los datos con zod
 const movieSchema = z.object({
    title: z.string({
        invalid_type_error: 'Movie title must be a string',
        required_error: 'Movie title is required'
    }),
    genre: z.array(
        z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-fi','Animation']),
        {
            required_error: 'Movie genre is required'
        }
    ),
    year: z.number().int().positive().min(1900).max(2023),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).optional()
});

function validateMovie(object) {
    return movieSchema.safeParse(object);
}

function validatePartialMovie( object ) {
    return movieSchema.partial().safeParse(object);
}

module.exports = {
    validateMovie,
    validatePartialMovie
}