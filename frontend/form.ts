import axios from "axios";
import path from "path";

const API = "http://localhost:3000";

const post = async (endpoint: string, data: any) => {
    axios.post(path.join(API, endpoint), data);
}
