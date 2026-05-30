import { Database } from "bun:sqlite";

/* Database creation commands */
const movies_sql = `CREATE TABLE IF NOT EXISTS movies (
id INTEGER PRIMARY KEY AUTOINCREMENT,
title TEXT,
genre TEXT,
release_year TEXT,
director TEXT
);`;
const users_sql = `CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
username TEXT UNIQUE,
created_at TEXT
);`;
const reviews_sql = `CREATE TABLE IF NOT EXISTS reviews (
id INTEGER PRIMARY KEY AUTOINCREMENT,
movie_id INT,
user_id INT,
rating INT CHECK (rating BETWEEN 1 AND 5),
body TEXT,
created_at TEXT
);`;

const genres = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi"];
const directors = ["Christopher Nolan", "Greta Gerwig", "Martin Scorsese", "Jordan Peele", "Denis Villeneuve"];
const movies = [
  { title: "Inception", genre: "Sci-Fi", release_year: 2010, director: "Christopher Nolan" },
  { title: "The Dark Knight", genre: "Action", release_year: 2008, director: "Christopher Nolan" },
  { title: "Barbie", genre: "Comedy", release_year: 2023, director: "Greta Gerwig" },
  { title: "Goodfellas", genre: "Drama", release_year: 1990, director: "Martin Scorsese" },
  { title: "Get Out", genre: "Horror", release_year: 2017, director: "Jordan Peele" },
  { title: "Dune", genre: "Sci-Fi", release_year: 2021, director: "Denis Villeneuve" },
  { title: "The Wolf of Wall Street", genre: "Drama", release_year: 2013, director: "Martin Scorsese" },
  { title: "Us", genre: "Horror", release_year: 2019, director: "Jordan Peele" },
  { title: "Interstellar", genre: "Sci-Fi", release_year: 2014, director: "Christopher Nolan" },
  { title: "Lady Bird", genre: "Drama", release_year: 2017, director: "Greta Gerwig" },
];

/* Prepare database */
const db = new Database("movie_ratings.db");
db.prepare(movies_sql).run();
db.prepare(users_sql).run();
db.prepare(reviews_sql).run();

const insertMovie = db.prepare(
  "INSERT INTO movies (title, genre, release_year, director) VALUES ($title, $genre, $release_year, $director)"
);

const insertUser = db.prepare(
  "INSERT INTO users (username) VALUES ($username)"
);

const insertReview = db.prepare(
  "INSERT INTO reviews (user_id, movie_id, rating, body) VALUES ($user_id, $movie_id, $rating, $body)"
);

// Seed movies
for (const movie of movies) {
  insertMovie.run(movie);
}

// Seed users
for (let i = 1; i <= 50; i++) {
  insertUser.run({ $username: `user_${i}` });
}

// Seed reviews — each user reviews 4 random movies
for (let userId = 1; userId <= 50; userId++) {
  const movieIds = Array.from({ length: 10 }, (_, i) => i + 1)
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);

  for (const movieId of movieIds) {
    insertReview.run({
      $user_id: userId,
      $movie_id: movieId,
      $rating: Math.floor(Math.random() * 5) + 1,
      $body: `This is user ${userId}'s review of movie ${movieId}.`,
    });
  }
}

console.log("Seeded: 10 movies, 50 users, ~200 reviews");

export default db;
