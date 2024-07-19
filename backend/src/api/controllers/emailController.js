const handleCheckEmails = (req, res) => {
  const allowedEmails = process.env.ALLOWED_EMAILS.split(',');
  const { email } = req.body;

  if (allowedEmails.includes(email)) {
    return res.status(200).json({ allowed: true });
  } else {
    return res.status(403).json({ allowed: false });
  }
};

module.exports = {
  handleCheckEmails,
};
