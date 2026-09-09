import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const METABASE_BASE_URL = process.env.METABASE_BASE_URL || "https://metabase.grupofq.com";
const METABASE_API_KEY = process.env.METABASE_API_KEY || "mb_tPBib47vdkmuYcA8lzFFzIx76bAt9gwnZTYKOmivMTY=";

// Helper function to call Metabase API
async function fetchMetabase(endpoint: string, options: RequestInit = {}) {
  const cleanBase = METABASE_BASE_URL.replace(/\/$/, "");
  const url = `${cleanBase}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-key": METABASE_API_KEY,
    "X-Metabase-Session": METABASE_API_KEY, // Compatibility
    ...(options.headers as Record<string, string> || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const contentType = res.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    return {
      ok: res.ok,
      status: res.status,
      data,
    };
  } catch (error: any) {
    return {
      ok: false,
      status: 500,
      error: error.message || "Network error reaching Metabase API",
    };
  }
}

// API Routes
app.get(`${process.env.BASE_PATH || ""}/api/metabase/status`, async (_req, res) => {
  const startTime = Date.now();
  // Try fetching user or cards to verify API key
  const result = await fetchMetabase("/api/card");
  const duration = Date.now() - startTime;

  if (result.ok) {
    res.json({
      connected: true,
      baseUrl: METABASE_BASE_URL,
      responseTimeMs: duration,
      cardsCount: Array.isArray(result.data) ? result.data.length : 0,
      cardsSample: Array.isArray(result.data) ? result.data.map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        display: c.display,
        collection_id: c.collection_id
      })) : [],
    });
  } else {
    // Try fetching current session/user if cards didn't return 200
    const userResult = await fetchMetabase("/api/user/current");
    res.json({
      connected: userResult.ok,
      baseUrl: METABASE_BASE_URL,
      responseTimeMs: duration,
      error: result.error || (typeof result.data === 'string' ? result.data : JSON.stringify(result.data)),
      details: result,
    });
  }
});

app.get(`${process.env.BASE_PATH || ""}/api/metabase/cards`, async (_req, res) => {
  const result = await fetchMetabase("/api/card");
  if (result.ok) {
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.data || result.error });
  }
});

app.get(`${process.env.BASE_PATH || ""}/api/metabase/dashboards`, async (_req, res) => {
  const result = await fetchMetabase("/api/dashboard");
  if (result.ok) {
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.data || result.error });
  }
});

app.post(`${process.env.BASE_PATH || ""}/api/metabase/card/:id/query`, async (req, res) => {
  const cardId = req.params.id;
  const { parameters } = req.body || {};
  
  // POST to /api/card/:id/query
  const result = await fetchMetabase(`/api/card/${cardId}/query`, {
    method: "POST",
    body: JSON.stringify({ parameters: parameters || [] }),
  });

  if (result.ok) {
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.data || result.error });
  }
});

app.get(`${process.env.BASE_PATH || ""}/api/metabase/card/:id`, async (req, res) => {
  const cardId = req.params.id;
  const result = await fetchMetabase(`/api/card/${cardId}`);
  if (result.ok) {
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.data || result.error });
  }
});

// Vite / Production middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(process.env.BASE_PATH || "/", vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(process.env.BASE_PATH || "/", express.static(distPath));
    app.get(`${process.env.BASE_PATH || ""}*`, (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CRM Health Dashboard Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
