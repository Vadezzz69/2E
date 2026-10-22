const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });

function authorized(request, env) {
  const auth = request.headers.get("authorization") || "";
  return auth === `Bearer ${env.API_KEY}`;
}

export default {
  async fetch(request, env) {
    if (!authorized(request, env)) {
      return json({ error: "Unauthorized" }, 401);
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const url = new URL(request.url);

    try {
      const body = await request.json();

      if (url.pathname === "/api/all" || url.pathname === "/api/run") {
        const { query, params = [] } = body;

        if (typeof query !== "string" || !Array.isArray(params)) {
          return json({ error: "query must be a string and params an array" }, 400);
        }

        const result = await env.DB.prepare(query).bind(...params).run();
        return json(result);
      }

      if (url.pathname === "/api/batch") {
        const batch = body.batch;

        if (!Array.isArray(batch) || batch.length === 0) {
          return json({ error: "batch must be a non-empty array" }, 400);
        }

        const statements = batch.map(item => {
          if (!item || typeof item.query !== "string" || !Array.isArray(item.params || [])) {
            throw new Error("Invalid batch item");
          }

          return env.DB.prepare(item.query).bind(...(item.params || []));
        });

        const results = await env.DB.batch(statements);
        return json(results);
      }

      if (url.pathname === "/api/exec") {
        const { query } = body;

        if (typeof query !== "string") {
          return json({ error: "query must be a string" }, 400);
        }

        const result = await env.DB.exec(query);
        return json(result);
      }

      return json({ error: "Not found" }, 404);
    } catch (error) {
      return json({
        error: error instanceof Error ? error.message : String(error)
      }, 500);
    }
  }
};
