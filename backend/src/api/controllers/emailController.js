const handleCheckEmails = (req, res) => {
  console.log('Checking email...');
  const allowedEmails = process.env.ALLOWED_EMAILS.split(',');
  const { email } = req.body;

  if (allowedEmails.includes(email)) {
    console.log('Email is allowed'); 
    return res.status(200).json({ allowed: true });
  } else {
    console.log('Email is not allowed'); 
    return res.status(403).json({ allowed: false });
  }
};

module.exports = {
  handleCheckEmails,
};
