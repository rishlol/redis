import express from "express";
import dotenv from "dotenv";
import Redis from "ioredis";
import cors from "cors";
import db from "./db";

/* Constants */
const REDIS_TIMEOUT = 60;

/* Initial config */
dotenv.config();
const REDIS_NAME = process.env.REDIS_NAME ?? "localhost"
const app = express();
const redis = new Redis(REDIS_NAME);

/* Middleware */
app.use(express.json());
app.use(cors());

/* Routes */
app.get("/", (req, res) => {
    res.status(200).send("site running");
});

app.get("/movies", async (req, res) => {
    const redis_key = "movies";
    const movies_str = await redis.get(redis_key);
    if(movies_str) {
        res.status(200).json({ "movies":  JSON.parse(movies_str) });
    } else {
        const movies = db.query("SELECT title, genre, release_year, director FROM movies;").all();
        redis.setex(redis_key, REDIS_TIMEOUT, JSON.stringify(movies));
        res.status(200).json({ "movies":  movies });
    }
});

app.get("/movies/:id", async (req, res) => {
    const { id } = req.params;
    const redis_key = `movies:${id}`;
    const movies_id_str = await redis.get(redis_key);

    if(movies_id_str) {
        res.status(200).json(JSON.parse(movies_id_str));
    } else {
        const movie = db.query(
            "SELECT title, genre, release_year, director FROM movies WHERE id = ?;"
        ).get(id) as { title: string, genre: string, release_year: string, director: string };

        redis.setex(redis_key, REDIS_TIMEOUT, JSON.stringify(movie));
        res.status(200).json(movie);
    }
});

app.get("/movies/genre/:genre", async (req, res) => {
    const { genre } = req.params;
    const redis_key = `movies:genre:${genre}`;
    const movies_genre_genre = await redis.get(redis_key);
    
    if(movies_genre_genre) {
        res.status(200).json({ "movies": JSON.parse(movies_genre_genre) });
    } else {
        const movies = db.query("SELECT title, genre, release_year, director FROM movies WHERE genre = ?;").all(genre);
        redis.setex(redis_key, REDIS_TIMEOUT, JSON.stringify(movies));
        res.status(200).json({ "movies": movies });
    }
});

app.get("/users/:username/reviews", async (req, res) => {
    const user_reviews_sql = `SELECT reviews.id, reviews.movie_id, users.id, users.username, reviews.rating, reviews.body, reviews.created_at
    FROM reviews LEFT JOIN users
    ON users.id = reviews.user_id
    WHERE users.username = ?;`;

    const { username } = req.params;
    const redis_key = `users:${username}:review`;
    const users_username_reviews = await redis.get(redis_key);

    if(users_username_reviews) {
        res.status(200).json({ "username": username, "reviews": JSON.parse(users_username_reviews) })
    } else {
        const reviews = db.query(user_reviews_sql).all(username);
        redis.setex(redis_key, REDIS_TIMEOUT, JSON.stringify(reviews));
        res.status(200).json({ "username": username, "reviews": reviews });
    }
});

app.get("/users", async (req, res) => {
    const users_sql = "SELECT * FROM users;";
    const redis_key = "users";
    const users = await redis.get(redis_key);

    if(users) {
        res.status(200).json({ "users": JSON.parse(users) });
    } else {
        const usersdb = db.query(users_sql).all();
        redis.setex(redis_key, REDIS_TIMEOUT, JSON.stringify(usersdb));
        res.status(200).json({ "users": usersdb });
    }
});

app.get("/reviews", async (req, res) => {
    const reviews_sql = `SELECT users.username, movies.title, reviews.rating, reviews.body, reviews.created_at
    FROM reviews LEFT JOIN users
    ON reviews.user_id = users.id
    LEFT JOIN movies
    ON reviews.movie_id = movies.id;`;
    const redis_key = "reviews";
    const reviews = await redis.get(redis_key);

    if(reviews) {
        res.status(200).json({ "reviews": JSON.parse(reviews) });
    } else {
        const reviewsdb = db.query(reviews_sql).all();
        redis.setex(redis_key, REDIS_TIMEOUT, JSON.stringify(reviewsdb));
        res.status(200).json({ "reviews": reviewsdb });
    }
})

app.post("/reviews", (req, res) => {
    const { movie_id, user_id, rating, body } = req.body;
    if(!movie_id || !user_id || !rating)
        res.status(401).send("movie_id, user_id, rating required.");

    try {
        const result = db.prepare(`INSERT INTO reviews
            (movie_id, user_id, rating, body, created_at)
            VALUES (?, ?, ?, ?, ?);`
        ).run(movie_id, user_id, rating, body ?? "", new Date().toISOString());

        if(result.changes == 0)
            res.status(409).send("error inserting review");
        res.status(200).end();
    } catch(e) {
        console.log(e);
        res.status(409).end();
    }
});

app.post("/movies", (req, res) => {
    const { title, genre, release_year, director } = req.body;
    if(!title || !genre || !release_year)
        res.status(401).send("title, genre, release_year required.");

    try {
        const result = db.prepare(`INSERT INTO movies
            (title, genre, release_year, director)
            VALUES (?, ?, ?, ?);`
        ).run(title, genre, release_year, director ?? "");
        
        if(result.changes == 0)
            res.status(409).send("error inserting movie");
        res.status(200).end();
    } catch(e) {
        console.log(e);
        res.status(409).send("error inserting movie!");
    }
});

app.post("/users", (req, res) => {
    const { username } = req.body;
    if(!username)
        res.status(401).send("username required.");

    try {
        const result = db.prepare(`INSERT INTO users
            (username, created_at)
            VALUES (?, ?);`
        ).run(username, new Date().toISOString());

        if(result.changes == 0)
        res.status(409).send("error inserting user");
    res.status(200).end();
    } catch(e) {
        console.log(e);
        res.status(409).send("error inserting user! try another username");
    }
});

/* Listen for requests */
app.listen(3000, err => {
    if(err)
        console.log(err);
    else
        console.log("redis test backend running on port 3000");
});
