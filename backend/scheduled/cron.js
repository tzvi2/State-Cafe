const { db, storage } = require('../firebase/firebaseAdminConfig');

const bucketName = process.env.STORAGE_BUCKET;
const backupFolder = 'firestore-backup';

async function backupFirestore() {
  const timestamp = new Date().toISOString();
  const backupFile = `${backupFolder}/${timestamp}/menuItems.json`;

  try {
    console.log('Starting Firestore backup...');
    const snapshot = await db.collection('menuItems').get();
    console.log('Retrieved Firestore snapshot');
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Mapped Firestore data');

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(backupFile);
    console.log(`Preparing to save backup to ${backupFile} in bucket ${bucketName}`);

    await file.save(JSON.stringify(data));
    console.log(`Successfully backed up menuItems to ${backupFile}`);
  } catch (error) {
    console.error('Error backing up Firestore:', error);
  }
}

module.exports = backupFirestore;
