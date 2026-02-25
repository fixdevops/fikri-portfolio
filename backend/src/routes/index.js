import express from "express";
import authRoutes from "./authRoutes.js";
import { createResourceRouter } from "./resourceRoutes.js";

const router = express.Router();

router.get("/health", (_req, res) => {
  res.json({ data: { status: "ok" } });
});

router.use("/auth", authRoutes);
router.use("/projects", createResourceRouter("projects"));
router.use("/certificates", createResourceRouter("certificates"));
router.use("/blogs", createResourceRouter("blogs"));
router.use("/animes", createResourceRouter("animes"));
router.use("/anime-stories", createResourceRouter("anime-stories"));
router.use("/quotes", createResourceRouter("quotes"));
router.use("/audios", createResourceRouter("audios"));
router.use("/chat-messages", createResourceRouter("chat-messages"));

export default router;
