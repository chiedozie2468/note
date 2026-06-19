import { Liveblocks } from "@liveblocks/node";

let liveblocks: Liveblocks | undefined;

function getLiveblocks(): Liveblocks {
  const key = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!key) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not set");
  }

  if (!liveblocks) {
    liveblocks = new Liveblocks({ secret: key });
  }

  return liveblocks;
}

export default new Proxy({} as Liveblocks, {
  get(_target, prop) {
    const client = getLiveblocks();
    const value = (client as unknown as Record<PropertyKey, unknown>)[prop];

    if (typeof value === "function") {
      return value.bind(client);
    }

    return value;
  },
});