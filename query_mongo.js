import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '../CSRL-APP-backed/.env' });

const uri = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  
  const rawMarks = await db.collection('studentrawmarks').find({ studentId: '2601001', testId: 'FMT02' }).toArray();
  const weakTopics = await db.collection('studentweaktopics').find({ studentId: '2601001', testId: 'FMT02' }).toArray();
  
  fs.writeFileSync('debug_output.json', JSON.stringify({ rawMarks, weakTopics }, null, 2));
  console.log("Saved to debug_output.json");
  process.exit(0);
}
run();
