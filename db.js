const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "teams.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function ensureDBFile() {
  ensureDataDir();
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: {} }, null, 2), "utf8");
  }
}

function readDB() {
  ensureDBFile();
  const raw = fs.readFileSync(DB_PATH, "utf8");
  return JSON.parse(raw);
}

function writeDB(db) {
  ensureDBFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

function normalizeFormat(format) {
  return String(format || "").trim().toLowerCase();
}

function setTeam(userId, format, teamText) {
  const fmt = normalizeFormat(format);
  const team = String(teamText || "").trim();

  const db = readDB();
  if (!db.users[userId]) db.users[userId] = { teams: {} };

  db.users[userId].teams[fmt] = {
    teamText: team,
    updatedAt: new Date().toISOString(),
  };

  writeDB(db);
}

function getTeam(userId, format) {
  const fmt = normalizeFormat(format);
  const db = readDB();
  return db.users?.[userId]?.teams?.[fmt]?.teamText || null;
}
function deleteTeam(userId, format) {
  const fmt = normalizeFormat(format);
  const db = readDB();

  const user = db.users?.[userId];
  if (!user?.teams?.[fmt]) return false;

  delete user.teams[fmt];

  // 유저가 가진 팀이 0개가 되면 유저 데이터도 정리(선택이지만 깔끔함)
  if (Object.keys(user.teams).length === 0) {
    delete db.users[userId];
  }

  writeDB(db);
  return true;
}

module.exports = { setTeam, getTeam, deleteTeam };
