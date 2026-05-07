import { open, type DB } from "@op-engineering/op-sqlite";
import { File, Directory, Paths } from "expo-file-system";
import { Asset } from "expo-asset";

const DB_NAME = "premQ.db";
const VERSION_FILE = "premQ.version";

let db: DB | null = null;

export async function initPremDB() {
  const dbDir = new Directory(Paths.document, "SQLite");
  const dbFile = new File(Paths.document, "SQLite", DB_NAME);
  const versionFile = new File(Paths.document, "SQLite", VERSION_FILE)

  const versionAsset = Asset.fromModule(require("../assets/premQ.version"));
  await versionAsset.downloadAsync();
  const bundledVersion = await new File(versionAsset.localUri!).text();
  const storedVersion = versionFile.exists ? await versionFile.text() : "0"
  
  if (!dbFile.exists || storedVersion !== bundledVersion) {
    dbDir.create({ intermediates: true, idempotent: true });
    const asset = Asset.fromModule(require("../assets/premQ.db"));
    await asset.downloadAsync();
    const assetFile = new File(asset.localUri!);
    if (dbFile.exists) dbFile.delete();
    assetFile.copy(dbFile);
    versionFile.write(bundledVersion)
  }

  db = open({ name: DB_NAME, location: dbDir.uri });
  return db;
}

export type PremQuestion = {
  id: number,
  question: string,
  answers: string[],
  answerIndex: number,
  category: string,
};

export function getPremQuestions(): PremQuestion[] {
  if (!db) throw new Error("premDB not initialized - call initPremDB() first");
  const result = db.executeSync("SELECT * FROM questions");
  return (result.rows ?? []).map(row => ({
    id: row.id as number,
    question: row.question as string,
    answers: JSON.parse(row.answers as string),
    answerIndex: row.answerIndex as number,
    category: row.category as string,
  }));
}

export default { initPremDB, getPremQuestions };