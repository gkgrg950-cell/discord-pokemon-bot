// commands/team.js
const { SlashCommandBuilder } = require("discord.js");

const teamCommand = new SlashCommandBuilder()
  .setName("team")
  .setDescription("포켓몬 팀 저장/조회")

  // ✅ 팀 저장
  .addSubcommand((sub) =>
    sub
      .setName("set")
      .setDescription("팀 저장")
      .addStringOption((opt) =>
        opt
          .setName("format")
          .setDescription("배틀 포맷 (예: gen9ou)")
          .setRequired(true)
      )
      .addStringOption((opt) =>
        opt
          .setName("team")
          .setDescription("팀 텍스트(Showdown team export)")
          .setRequired(true)
          .setMaxLength(6000)
      )
  )

  // ✅ 팀 조회
  .addSubcommand((sub) =>
    sub
      .setName("view")
      .setDescription("팀 조회")
      .addStringOption((opt) =>
        opt
          .setName("format")
          .setDescription("배틀 포맷 (예: gen9ou)")
          .setRequired(true)
      )
  )

  // ⭐⭐⭐ 팀 삭제 (새로 추가!)
  .addSubcommand((sub) =>
    sub
      .setName("delete")
      .setDescription("팀 삭제")
      .addStringOption((opt) =>
        opt
          .setName("format")
          .setDescription("삭제할 포맷 (예: gen9ou)")
          .setRequired(true)
      )
  );

module.exports = { teamCommand };
