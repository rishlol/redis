import express from "express";
import path from "path";

const dir = import.meta.dir;
const app = express();

app.use(express.static(dir));

app.get("/", (req, res) => {
    res.sendFile(path.join(dir, "index.html"));
});

app.get("/reviews", (req, res) => {
    res.sendFile(path.join(dir, "reviews.html"));
});

app.listen(3001, err => {
    if(err)
        console.log(err);
    else
        console.log("redis test frontend running on port 3001");
});
