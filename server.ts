import {
  Application,
  Router,
  send,
  Context,
} from "https://deno.land/x/oak/mod.ts";
import { mappings } from "./icons.ts";
import { exists, ensureDir } from "https://deno.land/std/fs/mod.ts";
import { writableStreamFromWriter } from "https://deno.land/std@0.151.0/streams/mod.ts";

import * as log from "https://deno.land/std@0.151.0/log/mod.ts";

const port = 6969;

async function handle(
  coll: Record<string, string>,
  folder: string,
  id: string
): Promise<[string, number]> {
  log.info(`Fetching ${folder}/${id}`);
  const storagePath = `storage/${folder}`;
  await ensureDir(storagePath);

  const fname = `${storagePath}/${id}.png`;
  const fileExists = await exists(fname);

  if (!fileExists) {
    const url = coll[id];
    log.info(`Loading from ${url}`);

    if (!url) {
      return ["", 404];
    }

    try {
      const resp = await fetch(url);
      if (resp.status === 200) {
        const file = await Deno.open(fname, { write: true, create: true });
        const writableStream = writableStreamFromWriter(file);
        await resp.body?.pipeTo(writableStream);
      }
    } catch (e) {
      log.error(`Could not find data for ${id} at ${url}`);
      return ["", 404];
    }
  }

  return [fname, 200];
}

const createHandler = (coll: Record<string, string>, folder: string) => {
  return async (context: Context<any>) => {
    const ctx = context as Record<string, any>;
    const [fname, status] = await handle(
      coll,
      folder,
      ctx?.params?.id?.toLowerCase()
    );
    context.response.status = status;

    if (status === 200) {
      await send(context, fname);
    }
  };
};

const router = new Router();
router
  .get("/champion/:id", createHandler(mappings.champions, "champions"))
  .get("/championL/:id", createHandler(mappings.championsL, "championsL"))
  .get("/trait/:id", createHandler(mappings.traits, "traits"))
  .get("/item/:id", createHandler(mappings.items, "items"));

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

log.info(`Ready to go ${port}`);
await app.listen({ port });
