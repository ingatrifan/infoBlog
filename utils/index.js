const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { transport, mailOptions, upload } = require('./constants')


exports.criptToken = () => {
    try {
        let token = crypto.randomBytes(20).toString('hex')
        return token;
    } catch (error) {
        console.log(error)
    }
};
exports.sendMail = async(mailOption) => {
    try {
        let mail = {
            to: mailOption.to,
            from: mailOptions[mailOption.mailType].from,
            subject: mailOptions[mailOption.mailType].Subject,
            text:mailOptions[mailOption.mailType].text + mailOption.link
        }
        transport.sendMail(mail)
    } catch (error) {
        console.log(error)
    }
}
exports.escapeRegexSearch = (text) =>{
    return new RegExp(text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"),'gi')
};
exports.upload = upload
