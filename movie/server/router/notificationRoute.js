import nodemailer from 'nodemailer'
import connection from '../db/connection.js';

export default function sendOverdueBookNotifications() {
  // create a transporter for sending email notifications
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'marlin40@ethereal.email',
        pass: 'TNcT57XZYQp8N2sAPz'
    }
});
// const transporter = nodemailer.createTransport({
//     // service: 'gmail',
//     host: 'smtp.gmail.com',
//     port: 465,
//     secure: true,
//     auth: {
//       user: 'ahnafakib@iut-dhaka.edu',
//       pass: 'Akibismad2'
//     }
//   });
  
  // create a scheduled task to check for overdue books and send notifications
  setInterval(() => {
    connection.query('SELECT overduebooks.*, users.email FROM overduebooks JOIN users ON overduebooks.username = users.username WHERE overduebooks.duration > 0', (err, results) => {
      if (err) {
        console.log(err);
      } else if (results.length > 0) {
        results.forEach((result) => {
          // send a notification email to the borrower
          const mailOptions = {
            from: 'marlin40@ethereal.email',
            to: result.email,
            subject: 'Book Overdue',
            text: `Dear ${result.username},\n\nThis is a reminder that the book ${result.bookId} is now overdue and needs to be returned.\n\nThank you.`
          };
          transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
              console.log(err);
            } else {
              console.log(`Notification sent to ${result.username}: ${info.response}`);
            }
          });
        });
      }
    });
  }, 360); // run every hour 
}


