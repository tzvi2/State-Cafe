const { db } = require('../firebase/firebaseAdminConfig');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage();

const bucketName = process.env.STORAGE_BUCKET;
const backupFolder = 'firestore-backup';

async function backupFirestore() {
  const timestamp = new Date().toISOString();
  const backupFile = `${backupFolder}/${timestamp}/menuItems.json`;

  try {
    const snapshot = await db.collection('menuItems').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const file = storage.bucket(bucketName).file(backupFile);
    await file.save(JSON.stringify(data));
    console.log(`Successfully backed up menuItems to ${backupFile}`);
  } catch (error) {
    console.error('Error backing up Firestore:', error);
  }
}

module.exports = backupFirestore;
