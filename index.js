process.on("uncaughtException", (err) => console.error("UNCAUGHT:", err));
process.on("unhandledRejection", (err) => console.error("UNHANDLED:", err));

const http = require("http");
const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config({ quiet: true });

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "team") {
    return interaction.reply({ content: "team command works!", ephemeral: true });
  }
});

const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("OK");
}).listen(PORT, "0.0.0.0", () => console.log("HTTP server listening on", PORT));

client.login(process.env.DISCORD_TOKEN)
  .then(() => console.log("Login OK"))
  .catch((e) => console.error("❌ Login failed:", e));