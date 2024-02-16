require('dotenv').config(); 
const { onRequest } = require('firebase-functions/v2/https');
const { defineInt, defineString } = require('firebase-functions/params');

// const projectId = defineString("FIREBASE_PROJECT_ID")
// const privateKeyId = defineString('FIREBASE_PRIVATE_KEY_ID')
// const privateKey = defineString("FIREBASE_PRIVATE_KEY")
// const clientEmail = defineString("FIREBASE_CLIENT_EMAIL")
// const clientId = defineString("FIREBASE_CLIENT_ID")
// const clientX509 = defineString("FIREBASE_CLIENT_X509_CERT_URL")

const admin = require('firebase-admin');

var serviceAccount = {
  "type": "service_account",
  "project_id": process.env.FIREBASE_PROJECT_ID,
  "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
  "private_key": process.env.FIREBASE_PRIVATE_KEY,
  "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  "client_id": process.env.FIREBASE_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL,
  "universe_domain": "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.STORAGE_BUCKET
});

const db = admin.firestore();

module.exports = {
  db,
  admin,
};
