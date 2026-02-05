process.on("uncaughtException", (err) => console.error("UNCAUGHT:", err));
process.on("unhandledRejection", (err) => console.error("UNHANDLED:", err));

const http = require("http");
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config({ quiet: true });

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function registerCommands() {
  if (!process.env.CLIENT_ID || !process.env.GUILD_ID || !process.env.DISCORD_TOKEN) {
    console.log("⚠️ Skip command register: missing env (CLIENT_ID/GUILD_ID/DISCORD_TOKEN)");
    return;
  }

  const commands = [
    new SlashCommandBuilder()
      .setName("team")
      .setDescription("team command test"),
  ].map((c) => c.toJSON());

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

  console.log("🔄 Registering slash commands...");
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands }
  );
  console.log("✅ Slash commands registered!");
}

const PORT = process.env.PORT || 3000;
http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("OK");
  })
  .listen(PORT, "0.0.0.0", () => console.log("HTTP server listening on", PORT));

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "team") {
    return interaction.reply({ content: "team command works!", ephemeral: true });
  }
});

registerCommands()
  .then(() => client.login(process.env.DISCORD_TOKEN))
  .then(() => console.log("Login OK"))
  .catch((e) => console.error("❌ Startup failed:", e));
