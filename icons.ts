const SetNumber = 7;
const CurrentSet = `TFT_Set${SetNumber}`;

const rawData: RawData = JSON.parse(Deno.readTextFileSync("./data/en_us.json"));

interface DataItem {
  icon: string;
  name: string;
  apiName: string;
}

interface RawData {
  items: Array<DataItem>;
  sets: {
    [key: number]: {
      champions: Array<DataItem>;
      traits: Array<DataItem>;
    };
  };
}

interface Mappings {
  items: Record<string, string>;
  traits: Record<string, string>;
  championsL: Record<string, string>;
  champions: Record<string, string>;
}

function toMappings(acc: Record<string, string>, item: DataItem) {
  const icon = icon2Src(item.icon);
  acc[item.name?.toLowerCase()] = icon;
  acc[item.apiName?.toLowerCase()] = icon;

  return acc;
}

function toMappingsChamp(acc: Record<string, string>, item: DataItem) {
  const icon = icon2Src(championIcon(item.apiName));
  acc[item.name?.toLowerCase()] = icon;
  acc[item.apiName?.toLowerCase()] = icon;

  return acc;
}

const champMapping: Record<string, string> = {
  tft7_dragonblue: "tft7_miragedragon",
  tft7_dragongold: "tft7_shimmerscaledragon",
  tft7_dragongreen: "tft7_jadedragon",
  tft7_dragonpurple: "tft7_whispersdragon",
};

function championIcon(apiName: string): string {
  const an = apiName.toLowerCase();
  let san = champMapping[an] || an;
  const sn = CurrentSet.toLowerCase();

  return `assets/characters/${an}/hud/${san}_square.${sn}.png`;
}

function icon2Src(icon: string): string {
  const prefix = "https://raw.communitydragon.org/latest/game/";
  const ico = icon
    .toLowerCase()
    .replace(".dds", ".png")
    .replace(".tex", ".png");
  const src = `${prefix}${ico}`;

  return src;
}

export const mappings: Mappings = {
  items: rawData.items.reduce(toMappings, {}),
  traits: rawData.sets[SetNumber].traits.reduce(toMappings, {}),
  championsL: rawData.sets[SetNumber].champions.reduce(toMappings, {}),
  champions: rawData.sets[SetNumber].champions.reduce(toMappingsChamp, {}),
};
