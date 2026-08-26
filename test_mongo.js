import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const StudentRawMarksSchema = new mongoose.Schema({
  studentId: String,
  testId: String,
  centerId: String,
  studentName: String,
  marks: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  }
}, { collection: 'studentrawmarks' });
const StudentRawMarks = mongoose.model('StudentRawMarksTest', StudentRawMarksSchema);

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  const rawMarks = await StudentRawMarks.find({ studentId: '2601001' }).lean();
  console.log('rawMarks length:', rawMarks.length);
  if (rawMarks.length > 0) {
    const marks = rawMarks[0].marks;
    console.log('Type of marks:', typeof marks);
    console.log('Is Map?:', marks instanceof Map);
    console.log('Keys if Object:', Object.keys(marks));
  }
  process.exit(0);
}
test();
