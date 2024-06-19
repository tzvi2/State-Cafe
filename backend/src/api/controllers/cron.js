const backupFirestore = require('../../../scheduled/cron');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await backupFirestore();
    res.status(200).json({ message: 'Backup successful' });
  } catch (error) {
    res.status(500).json({ error: 'Error during backup' });
  }
};
