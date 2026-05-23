import express from "express";
import dotenv from "dotenv";
import Redis from "ioredis";
import { Database } from "bun:sqlite";

/* Constants */
const movies_sql = `CREATE TABLE IF NOT EXISTS movies (
id INT PRIMARY KEY,
title TEXT,
genre TEXT,
release_year TEXT,
director TEXT
);`;
const users_sql = `CREATE TABLE IF NOT EXISTS users (
id INT PRIMARY KEY,
username TEXT UNIQUE,
created_at TEXT
);`;
const reviews_sql = `CREATE TABLE IF NOT EXISTS reviews (
id INT PRIMARY KEY,
movie_id INT,
user_id INT,
rating INT CHECK (rating BETWEEN 1 AND 5),
body TEXT,
created_at TEXT
);`;

/* Initial config */
dotenv.config();
const app = express();
const redis = new Redis();
const db = new Database("movie_ratings.db");

/* Middleware */
app.use(express.json());

/* Routes */
app.get("/", (req, res) => {
    res.status(200).send("site running");
});

app.get("/movies", (req, res) => {
    const movies = db.query("SELECT title, genre, release_year, director FROM movies;").all();
    res.status(200).json({ "movies":  movies });
});

app.get("/movies/:id", (req, res) => {
    const { id } = req.params;
    const movie = db.query(
        "SELECT title, genre, release_year, director FROM movies WHERE id = ?;"
    ).get(id) as { title: string, genre: string, release_year: string, director: string };
    
    res.status(200).json(movie);
});

app.get("/movies/genre/:genre", (req, res) => {
    const { genre } = req.params;
    const movies = db.query("SELECT title, genre, release_year, director FROM movies WHERE genre = ?;").all(genre);
    res.status(200).json({ "movies": movies });
});

app.get("/users/:username/reviews", (req, res) => {
    const user_reviews_sql = `SELECT reviews.id, reviews.movie_id, users.id, users.username, reviews.rating, reviews.body, reviews.created_at
    FROM users LEFT JOIN reviews
    ON users.id = reviews.user_id
    WHERE users.username = ?;`;

    const { username } = req.params;
    const reviews = db.query(user_reviews_sql).all(username);

    res.status(200).json({ "username": username, "reviews": reviews });
});

app.post("/reviews", (req, res) => {

});

/* Prepare database */
db.prepare(movies_sql).run();
db.prepare(users_sql).run();
db.prepare(reviews_sql).run();

/* Listen for requests */
app.listen(3000);
