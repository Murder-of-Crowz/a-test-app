import csv
import sqlite3
import json
import os
import time

version = int(time.time())

csv_input = input("Enter path of file to be converted to .db: ").strip()
if not csv_input:
  print("No CSV path provided. Exiting...")
  exit()
if not csv_input.endswith(".csv"):
  print("Enter only .CSV files. Exiting...")
  exit()

CSV_PATH = csv_input
DB_PATH = os.path.join(os.path.dirname(__file__), "../assets/premQ.db")

conn = sqlite3.connect(DB_PATH)
conn.execute("DROP TABLE IF EXISTS questions")
conn.execute("""
  CREATE TABLE IF NOT EXISTS questions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    question      TEXT NOT NULL,
    answers       TEXT NOT NULL,
    answerIndex   INTEGER NOT NULL,
    category      TEXT NOT NULL
  )             
""")

with open(CSV_PATH, newline="", encoding="utf-8") as f:
  reader = csv.DictReader(f)
  for row in reader:
    answers = [
      row["Correct Answer"],
      row["Wrong Answer 1"],
      row["Wrong Answer 2"],
      row["Wrong Answer 3"],
    ]
    conn.execute(
      "INSERT INTO questions (question, answers, answerIndex, category) VALUES (?, ?, ?, ?)",
      (row["Question"], json.dumps(answers), 0, row["Category"])
    )

conn.commit()
conn.close()
print(f"Done - premQ.db created at {DB_PATH}")

version_path = DB_PATH.replace(".db", ".version")
with open(version_path, "w") as f:
  f.write(str(version))
print(f"Done - version: {version}")