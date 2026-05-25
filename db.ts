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

/* Prepare database */
const db = new Database("movie_ratings.db");
db.prepare(movies_sql).run();
db.prepare(users_sql).run();
db.prepare(reviews_sql).run();

export default db;
