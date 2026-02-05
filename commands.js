const { REST, Routes, SlashCommandBuilder } = require("discord.js");
require("dotenv").config();

const commands = [
  new SlashCommandBuilder()
    .setName("team")
    .setDescription("팀 관리")
    .addSubcommand((s) => s.setName("set").setDescription("팀 등록/수정"))
    .addSubcommand((s) => s.setName("view").setDescription("내 팀 확인"))
    .toJSON(),

  new SlashCommandBuilder()
    .setName("battle")
    .setDescription("배틀")
    .addSubcommand((s) =>
      s
        .setName("challenge")
        .setDescription("상대에게 배틀 신청")
        .addUserOption((o) =>
          o.setName("opponent").setDescription("상대").setRequired(true)
        )
    )
    .toJSON(),
];

async function deploy() {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!token || !clientId || !guildId) {
    console.error("❌ .env 값이 비었어. DISCORD_TOKEN/CLIENT_ID/GUILD_ID 확인해줘.");
    process.exit(1);
  }

  const rest = new REST({ version: "10" }).setToken(token);

  await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    body: commands,
  });

  console.log("✅ Commands deployed");
}

deploy().catch((err) => {
  console.error("❌ Commands deploy failed");
  console.error(err);
});
