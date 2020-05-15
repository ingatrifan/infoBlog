const nodemailer = require('nodemailer');

exports.mailOptions = {
    'resetPasswordMail':{
        from : process.env.GMAIL_USER,
        Subject : 'infoBlog password reset',
        text : "Please click on the link bellow or paste it into your browser to complete the process.\n"+
                'If you did not request this , please ignore this email.\n'
    }
}
exports.transport = nodemailer.createTransport({
    service :'Gmail',
    auth : {
        user : process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
    }
});

const multer = require('multer');
const storage = multer.diskStorage({
    filename: function(req, file, callback) {
      callback(null, Date.now() + file.originalname);
    }
  });
const imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
exports.upload = multer({ storage: storage, fileFilter: imageFilter})