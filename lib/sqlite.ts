import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const DB_DIR = path.join(process.cwd(), "data")
const DB_PATH = path.join(DB_DIR, "content-factory.db")

let initialized = false

export function initDatabase() {
  if (initialized) return
  fs.mkdirSync(DB_DIR, { recursive: true })
  runRawStatement(`
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      keyword TEXT NOT NULL,
      data_source TEXT NOT NULL,
      article_count INTEGER NOT NULL DEFAULT 0,
      total INTEGER,
      total_page INTEGER,
      page INTEGER,
      raw_cut_words TEXT,
      report_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)
  initialized = true
}

export function runStatement(sql: string) {
  initDatabase()
  runRawStatement(sql)
}

export function runQuery<T = Record<string, unknown>>(sql: string): T[] {
  initDatabase()
  const output = execFileSync("sqlite3", ["-json", DB_PATH, sanitizeSql(sql)], {
    encoding: "utf8",
  })
  if (!output.trim()) {
    return []
  }
  try {
    return JSON.parse(output) as T[]
  } catch (error) {
    throw new Error(`Failed to parse sqlite output: ${error}`)
  }
}

function runRawStatement(sql: string) {
  execFileSync("sqlite3", [DB_PATH, sanitizeSql(sql)], {
    stdio: "pipe",
  })
}

export function sqlValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "NULL"
  }
  if (typeof value === "number" || typeof value === "bigint") {
    return value.toString()
  }
  if (typeof value === "boolean") {
    return value ? "1" : "0"
  }
  const text = String(value).replace(/'/g, "''")
  return `'${text}'`
}

function sanitizeSql(sql: string) {
  return sql.trim()
}
