import express from "express";
import path from "path";

const dir = import.meta.dir;
const app = express();

app.use(express.static(dir));

app.get("/", (req, res) => {
    res.sendFile(path.join(dir, "index.html"));
});

app.listen(5000, () => console.log("redis test frontend running on port 5000"));
