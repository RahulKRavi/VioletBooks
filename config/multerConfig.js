const multer = require('multer');
const path = require('path');

const createStorage = (destination) => {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, `../public/${destination}`));
        },
        filename: function (req, file, cb) {
            const name = Date.now() + '-' + file.originalname;
            cb(null, name);
        }
    });
};

const authorUpload = multer({ storage: createStorage('authorImages') });
const bookUpload = multer({ storage: createStorage('bookImages') });
const bannerUpload = multer({ storage: createStorage('bannerImages') });

module.exports = {
    authorUpload,
    bookUpload,
    bannerUpload
}