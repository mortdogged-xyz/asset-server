run:
	deno run --allow-net --allow-read --allow-write --reload server.ts

update-dragon-data:
	curl https://raw.communitydragon.org/latest/cdragon/tft/en_us.json > data/en_us.json
