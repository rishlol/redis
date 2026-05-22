import express from "express";
import dotenv from "dotenv";
import redis from "ioredis";

dotenv.config();
const app = express();
app.use(express.json());

/*
CREATE TABLE movies (
id int primary key,
title text,
genre text,
release_year text,
director text
);
CREATE TABLE users (
id int primary key,
username text unique,
created_at text
);
CREATE TABLE reviews (
id int primary key,
movie_id int,
user_id int,
rating int check (rating between 1 and 5),
body text,
created_at text
);
*/