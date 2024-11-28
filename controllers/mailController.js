import nodemailer from "nodemailer"

const sendMail = async (req, res) => {
    const { name, email, subject, message } = req.body;

    if(!name || !email || !subject || !message){
      return res.status(400).json({message: "Some data is not available !"})
    }
  
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  
    const mailOptions = {
      from: email,
      to: process.env.SMTP_EMAIL,
      subject: `Message form NewMane: ${subject}`,
      text: `You have a new message from ${name} (${email}): \n\n message: \n\n ${message}`,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      res.status(200).json({ success: true, message: 'Email sent successfully!' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to send email', error });
    }
  };
  
  export default sendMail ;