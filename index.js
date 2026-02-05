const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

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

client.login(process.env.DISCORD_TOKEN).catch((e) => {
  console.error("❌ Login failed:", e);
});
