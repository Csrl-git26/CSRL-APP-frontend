import mongoose from 'mongoose';
const schema = new mongoose.Schema({ marks: Map });
const Model = mongoose.model('TestMap', schema);
async function run() {
  await mongoose.connect('mongodb://localhost:27017/test_db');
  await Model.deleteMany({});
  await Model.create({ marks: { "Q1": 4, "Q2": -1 } });
  const doc = await Model.findOne({}).lean();
  console.log(typeof doc.marks, doc.marks);
  for (const [k, v] of Object.entries(doc.marks)) {
    console.log(k, v);
  }
  process.exit(0);
}
run();
