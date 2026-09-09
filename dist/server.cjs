var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
var METABASE_BASE_URL = process.env.METABASE_BASE_URL || "https://metabase.grupofq.com";
var METABASE_API_KEY = process.env.METABASE_API_KEY || "mb_tPBib47vdkmuYcA8lzFFzIx76bAt9gwnZTYKOmivMTY=";
async function fetchMetabase(endpoint, options = {}) {
  const cleanBase = METABASE_BASE_URL.replace(/\/$/, "");
  const url = `${cleanBase}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": METABASE_API_KEY,
    "X-Metabase-Session": METABASE_API_KEY,
    // Compatibility
    ...options.headers || {}
  };
  try {
    const res = await fetch(url, {
      ...options,
      headers
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
      data
    };
  } catch (error) {
    return {
      ok: false,
      status: 500,
      error: error.message || "Network error reaching Metabase API"
    };
  }
}
app.get("/api/metabase/status", async (_req, res) => {
  const startTime = Date.now();
  const result = await fetchMetabase("/api/card");
  const duration = Date.now() - startTime;
  if (result.ok) {
    res.json({
      connected: true,
      baseUrl: METABASE_BASE_URL,
      responseTimeMs: duration,
      cardsCount: Array.isArray(result.data) ? result.data.length : 0,
      cardsSample: Array.isArray(result.data) ? result.data.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        display: c.display,
        collection_id: c.collection_id
      })) : []
    });
  } else {
    const userResult = await fetchMetabase("/api/user/current");
    res.json({
      connected: userResult.ok,
      baseUrl: METABASE_BASE_URL,
      responseTimeMs: duration,
      error: result.error || (typeof result.data === "string" ? result.data : JSON.stringify(result.data)),
      details: result
    });
  }
});
app.get("/api/metabase/cards", async (_req, res) => {
  const result = await fetchMetabase("/api/card");
  if (result.ok) {
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.data || result.error });
  }
});
app.get("/api/metabase/dashboards", async (_req, res) => {
  const result = await fetchMetabase("/api/dashboard");
  if (result.ok) {
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.data || result.error });
  }
});
app.post("/api/metabase/card/:id/query", async (req, res) => {
  const cardId = req.params.id;
  const { parameters } = req.body || {};
  const result = await fetchMetabase(`/api/card/${cardId}/query`, {
    method: "POST",
    body: JSON.stringify({ parameters: parameters || [] })
  });
  if (result.ok) {
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.data || result.error });
  }
});
app.get("/api/metabase/card/:id", async (req, res) => {
  const cardId = req.params.id;
  const result = await fetchMetabase(`/api/card/${cardId}`);
  if (result.ok) {
    res.json(result.data);
  } else {
    res.status(result.status || 500).json({ error: result.data || result.error });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CRM Health Dashboard Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
