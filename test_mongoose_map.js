import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  marks: { type: Map, of: mongoose.Schema.Types.Mixed }
});
const Model = mongoose.model('TestMap', schema);

async function test() {
  await mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true });
  
  const doc = new Model({ marks: { Q1: 4, Q2: -1 } });
  await doc.save();
  
  const fetched = await Model.findOne().lean();
  console.log('Fetched marks type:', typeof fetched.marks);
  console.log('Is Map?', fetched.marks instanceof Map);
  console.log('Keys:', Object.keys(fetched.marks));
  
  process.exit(0);
}
// We don't have mongodb running, so let's mock it
