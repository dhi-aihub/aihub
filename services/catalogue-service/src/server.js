import http from "http";
import index from "./index.js";
import "dotenv/config";

const port = process.env.PORT || 3001;

const server = http.createServer(index);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
