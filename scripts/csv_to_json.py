import csv
import json
import sys
from collections import OrderedDict

"""
This script got made because I got tired of inputting questions manually.

It was on question 27 where I drew the line and said fuck it.

So here is a script that converts CSV into JSON format.

The CSV column names are:
    Category,Question,Correct Answer,Wrong Answer 1, Wrong Answer 2, Wrong Answer 3

The JSON format it comes out to:
[
  {
    "sectionId": 1,
    "topic": "Safety and Infection Control",
    "weight": 34,
    "questions": [
      {
        "id": 1,
        "question": `question`,
        "answers": [
          `correct`,
          `wrong1`,
          `wrong2,
          `wrong3
        ],
        "answerIndex": 0
      }
    }
]

This also skips incomplete rows, so when we add more, please ensure all columns are filled.
"""

# Category weights based on what was given to me
# Any category not listed in the CSV gets an auto-assigned sectionId and weight of 0.
CATEGORY_META = {
    "Safety and Infection Control": {"sectionId": 1, "weight": 34},
    "Skin Care":                    {"sectionId": 2, "weight": 27},
    "Skin Analysis":                {"sectionId": 3, "weight": 13},
    "Hair Removal":                 {"sectionId": 4, "weight": 13},
    "Advanced Treatments":           {"sectionId": 5, "weight": 5},
    "Makeup":                       {"sectionId": 6, "weight": 4},
    "Client Consultation":          {"sectionId": 7, "weight": 4},
}


def csv_to_json(csv_path: str, json_path: str) -> None:
    sections: OrderedDict[str, dict] = OrderedDict()
    question_id = 1
    next_section_id = max((m["sectionId"] for m in CATEGORY_META.values()), default=0) + 1

    with open(csv_path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            category = (row.get("Category") or "").strip()
            question  = (row.get("Question") or "").strip()
            correct   = (row.get("Correct Answer") or "").strip()
            wrong1    = (row.get("Wrong Answer 1") or "").strip()
            wrong2    = (row.get("Wrong Answer 2") or "").strip()
            wrong3    = (row.get("Wrong Answer 3") or "").strip()

            if not question or not correct or not wrong1 or not wrong2 or not wrong3:
                print(f"  WARNING: skipping row {reader.line_num} — missing fields: {row['Question']!r}")
                continue

            if category not in sections:
                if category in CATEGORY_META:
                    meta = CATEGORY_META[category]
                    sid, weight = meta["sectionId"], meta["weight"]
                else:
                    sid, weight = next_section_id, 0
                    next_section_id += 1

                sections[category] = {
                    "sectionId": sid,
                    "topic": category,
                    "weight": weight,
                    "questions": [],
                }

            sections[category]["questions"].append({
                "id": question_id,
                "question": question,
                "answers": [correct, wrong1, wrong2, wrong3],
                "answerIndex": 0,
            })
            question_id += 1

    output = list(sections.values())

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    total_questions = question_id - 1
    print(f"Done. {total_questions} questions across {len(output)} sections -> {json_path}")
    for s in output:
        print(f"  [{s['sectionId']}] {s['topic']} — {len(s['questions'])} questions (weight {s['weight']})")


if __name__ == "__main__":
    csv_file  = sys.argv[1] if len(sys.argv) > 1 else "../assets/questions.csv"
    json_file = sys.argv[2] if len(sys.argv) > 2 else "../assets/questions.json"
    csv_to_json(csv_file, json_file)