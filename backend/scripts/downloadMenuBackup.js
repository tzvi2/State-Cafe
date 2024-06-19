require('dotenv').config();
const { Storage } = require('@google-cloud/storage');
const fs = require('fs');
const path = require('path');

const bucketName = "state-cafe.appspot.com";
const fileName = 'firestore-backup/2024-06-19T16:00:05.307Z/menuItems.json'; 
const destFileName = path.join(__dirname, 'menuItems.json');

async function downloadFile() {
  try {
    console.log('Initializing Google Cloud Storage...');
    const storage = new Storage();
    console.log('Storage initialized.');

    console.log(`Downloading file ${fileName} from bucket ${bucketName}...`);
    await storage.bucket(bucketName).file(fileName).download({ destination: destFileName });
    console.log(`Downloaded ${fileName} to ${destFileName}`);

    // Read and print the file contents
    const fileContents = fs.readFileSync(destFileName, 'utf8');
    console.log('File Contents:', fileContents);
  } catch (error) {
    console.error('Error downloading the file:', error);
  }
}

downloadFile();
