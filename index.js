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

require("dotenv").config();

const { teamCommand } = require("./commands/team");
const { setTeam, getTeam, deleteTeam, listFormats } = require("./db");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

//////////////////////////////////////////////////////
// Slash 등록
//////////////////////////////////////////////////////

async function registerCommands() {
  try {
    const commands = [teamCommand.toJSON()];
    const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

    console.log("🔄 Registering slash commands...");

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );

    console.log("✅ Slash commands registered!");
  } catch (err) {
    console.error("❌ Command register failed:", err);
  }
}

//////////////////////////////////////////////////////
// Railway 생존용 서버
//////////////////////////////////////////////////////

const PORT = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("OK");
}).listen(PORT, "0.0.0.0");

//////////////////////////////////////////////////////
// 봇 준비
//////////////////////////////////////////////////////

client.once("clientReady", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

//////////////////////////////////////////////////////
// 명령 처리
//////////////////////////////////////////////////////

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== "team") return;

  await interaction.deferReply({ ephemeral: true });

  const sub = interaction.options.getSubcommand();

  //////////////////////////////////////////////////////
  // list (format 필요 없음)
  //////////////////////////////////////////////////////

  if (sub === "list") {
    const formats = listFormats(interaction.user.id);

    if (!formats.length) {
      return interaction.editReply("저장된 팀이 없어!");
    }

    return interaction.editReply(
      `📦 팀 목록:\n${formats.map(f => `• ${f}`).join("\n")}`
    );
  }

  //////////////////////////////////////////////////////
  // format 필요한 것들
  //////////////////////////////////////////////////////

  const format = interaction.options.getString("format", true)
    .trim()
    .toLowerCase();

  //////////////////////////////////////////////////////
  // set
  //////////////////////////////////////////////////////

  if (sub === "set") {
    const team = interaction.options.getString("team", true);

    setTeam(interaction.user.id, format, team);

    return interaction.editReply(
      `✅ 저장 완료!\n포맷: ${format}`
    );
  }

  //////////////////////////////////////////////////////
  // view
  //////////////////////////////////////////////////////

  if (sub === "view") {
    const team = getTeam(interaction.user.id, format);

    if (!team) {
      return interaction.editReply("저장된 팀이 없어!");
    }

    if (team.length > 1800) {
      const file = new AttachmentBuilder(
        Buffer.from(team),
        { name: `team-${format}.txt` }
      );

      return interaction.editReply({
        content: "📄 팀이 길어서 파일로 보낼게!",
        files: [file],
      });
    }

    return interaction.editReply(
      `📄 팀 (${format})\n\`\`\`\n${team}\n\`\`\``
    );
  }

  //////////////////////////////////////////////////////
  // delete
  //////////////////////////////////////////////////////

  if (sub === "delete") {
    const ok = deleteTeam(interaction.user.id, format);

    if (!ok) {
      return interaction.editReply("삭제할 팀이 없어!");
    }

    return interaction.editReply("🗑️ 삭제 완료!");
  }
});

//////////////////////////////////////////////////////

registerCommands()
  .then(() => client.login(process.env.DISCORD_TOKEN))
  .catch(console.error);
