const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, intakeData, summary) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #0056b3;">Dear ${intakeData.fullName || 'Client'},</h2>
      <p>Thank you for submitting your intake form to our legal firm. We have received your information and are reviewing it carefully.</p>
      
      <h3 style="color: #0056b3;">Summary of Your Submission:</h3>
      <p style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; border: 1px solid #ddd;">${summary}</p>

      <h3 style="color: #0056b3;">Your Provided Details:</h3>
      <ul style="list-style-type: none; padding: 0;">
        <li style="margin-bottom: 8px;"><strong>Full Name:</strong> ${intakeData.fullName || 'N/A'}</li>
        <li style="margin-bottom: 8px;"><strong>Email:</strong> ${intakeData.email || 'N/A'}</li>
        <li style="margin-bottom: 8px;"><strong>Phone Number:</strong> ${intakeData.phoneNumber || 'N/A'}</li>
        <li style="margin-bottom: 8px;"><strong>Service Type:</strong> ${intakeData.serviceType || 'N/A'}</li>
        ${intakeData.visaType ? `<li style="margin-bottom: 8px;"><strong>Visa Type:</strong> ${intakeData.visaType}</li>` : ''}
        ${intakeData.caseNumber ? `<li style="margin-bottom: 8px;"><strong>Case Number:</strong> ${intakeData.caseNumber}</li>` : ''}
        <li style="margin-bottom: 8px;"><strong>Description of Needs:</strong> ${intakeData.description || 'N/A'}</li>
      </ul>

      <p>We will be in touch shortly to discuss the next steps. In the meantime, if you have any urgent questions, please do not hesitate to contact us.</p>

      <p style="font-size: 0.9em; color: #777; margin-top: 20px;">
        Sincerely,<br>
        <strong>Your Legal Team</strong><br>
        [Your Firm Name]<br>
        [Your Firm Website/Contact Info]
      </p>
    </div>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to', to);
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error(error.response);
    }
  }
};

module.exports = sendEmail;
