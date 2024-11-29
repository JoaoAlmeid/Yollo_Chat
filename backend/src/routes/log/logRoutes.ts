import { Router } from "express";
import { createActionLog } from "../../controllers/log/logController";

const logRouter = Router();

logRouter.post('/logs/action', createActionLog)

export default logRouter;