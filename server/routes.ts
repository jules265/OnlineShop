import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import path from "path";
import express from 'express';
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from the root directory
  app.use(express.static(path.join(__dirname, '..')));

  // Routes for our HTML pages
  app.get('/login', (_req, res) => {
    res.sendFile(path.join(__dirname, '../login.html'));
  });

  app.get('/customer', (_req, res) => {
    res.sendFile(path.join(__dirname, '../customer.html'));
  });

  // Redirect root to login if not authenticated
  app.get('/', (_req, res) => {
    res.redirect('/login');
  });

  // API routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  const httpServer = createServer(app);
  return httpServer;
}