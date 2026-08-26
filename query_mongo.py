import os
from pymongo import MongoClient
import json
from bson import json_util

uri = "mongodb+srv://csrl:csrl2024@csrl-cluster.a8l72.mongodb.net/?retryWrites=true&w=majority&appName=csrl-cluster"
client = MongoClient(uri)
db = client['test'] # or whichever db is default

raw = list(db.studentrawmarks.find({"studentId": "2601001", "testId": "FMT02"}))
weak = list(db.studentweaktopics.find({"studentId": "2601001", "testId": "FMT02"}))

with open("debug_output.json", "w") as f:
    f.write(json_util.dumps({"rawMarks": raw, "weakTopics": weak}, indent=2))
print("Saved to debug_output.json")
