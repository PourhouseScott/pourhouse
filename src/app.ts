import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import routes from "./routes";
import frontendRoutes from "./routes/frontendRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const publicDir = path.resolve(process.cwd(), "public");

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/static", express.static(publicDir));

app.use("/api", routes);
app.use(frontendRoutes);
app.use(errorHandler);

export default app;
