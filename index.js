process.on("uncaughtException", (err) => console.error("UNCAUGHT:", err));
process.on("unhandledRejection", (err) => console.error("UNHANDLED:", err));

const http = require("http");
const {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  AttachmentBuilder,
} = require("discord.js");

require("dotenv").config({ quiet: true });

const { teamCommand } = require("./commands/team");
const { setTeam, getTeam, deleteTeam } = require("./db");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function registerCommands() {
  if (!process.env.CLIENT_ID || !process.env.GUILD_ID || !process.env.DISCORD_TOKEN) {
    console.log("⚠️ Skip command register: missing env (CLIENT_ID/GUILD_ID/DISCORD_TOKEN)");
    return;
  }

  const commands = [teamCommand.toJSON()];

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
  if (interaction.commandName !== "team") return;

  const sub = interaction.options.getSubcommand();
  const formatRaw = interaction.options.getString("format", true);
  const format = formatRaw.trim().toLowerCase();

  const invalidFormat =
    !format || format.length < 3 || format.length > 32 || /\s/.test(format);

  await interaction.deferReply({ ephemeral: true });

  if (invalidFormat) {
    return interaction.editReply(
      "포맷이 이상해요. 예: `gen9ou`, `gen9randombattle` 처럼 입력해줘."
    );
  }

  // /team set
  if (sub === "set") {
    const teamText = interaction.options.getString("team", true);

    try {
      setTeam(interaction.user.id, format, teamText);
      return interaction.editReply(
        `✅ 저장 완료!\n포맷: \`${format}\`\n조회: \`/team view format:${format}\``
      );
    } catch (e) {
      console.error(e);
      return interaction.editReply("❌ 저장 실패! 팀 텍스트가 비었거나 오류가 났어.");
    }
  }

  // /team view
  if (sub === "view") {
// /team delete
if (sub === "delete") {
  const ok = deleteTeam(interaction.user.id, format);

  if (!ok) {
    return interaction.editReply(
      `삭제할 팀이 없어. (format: \`${format}\`)`
    );
  }

  return interaction.editReply(
    `🗑️ 팀 삭제 완료! (format: \`${format}\`)`
  );
}

    const teamText = getTeam(interaction.user.id, format);

    if (!teamText) {
      return interaction.editReply(
        `저장된 팀이 없어. 먼저 \`/team set\`으로 저장해줘.\n포맷: \`${format}\``
      );
    }

    // 길면 파일로 보내기
    if (teamText.length > 1800) {
      const buffer = Buffer.from(teamText, "utf8");
      const file = new AttachmentBuilder(buffer, { name: `team-${format}.txt` });

      return interaction.editReply({
        content: `📄 팀이 길어서 파일로 보낼게! (format: \`${format}\`)`,
        files: [file],
      });
    }

    // 짧으면 메시지로 보여주기
    return interaction.editReply(
      `📄 너의 팀 (format: \`${format}\`)\n\`\`\`\n${teamText}\n\`\`\``
    );
  }
});

registerCommands()
  .then(() => client.login(process.env.DISCORD_TOKEN))
  .then(() => console.log("Login OK"))
  .catch((e) => console.error("❌ Startup failed:", e));
