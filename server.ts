import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import { mappings } from "./icons.ts";
import { exists, ensureDir } from "https://deno.land/std/fs/mod.ts";
import * as log from "https://deno.land/std/log/mod.ts";

const port = 6969;

async function handle(
  coll: Record<string, string>,
  folder: string,
  id: string
): Promise<string> {
  log.info(`Fetching ${folder}/${id}`);
  const storagePath = `storage/${folder}`;
  await ensureDir(storagePath);

  const fname = `${storagePath}/${id}.png`;
  const fileExists = await exists(fname);

  if (!fileExists) {
    const url = coll[id];
    log.info(`Loading from ${url}`);
    const resp = await fetch(url);
    const body = await resp.text();
    await Deno.writeTextFile(fname, body);
  }

  return await Deno.readTextFile(fname);
}

const router = new Router();
router
  .get("/trait/:id", async (context) => {
    context.response.body = await handle(
      mappings.traits,
      "traits",
      context?.params?.id
    );
    context.response.type = "image/png";
  })
  .get("/champion/:id", async (context) => {
    context.response.body = await handle(
      mappings.champions,
      "champions",
      context?.params?.id
    );
    context.response.type = "image/png";
  })
  .get("/item/:id", async (context) => {
    context.response.body = await handle(
      mappings.items,
      "items",
      context?.params?.id
    );
    context.response.type = "image/png";
  });

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

log.info(`Ready to go ${port}`);
await app.listen({ port });
