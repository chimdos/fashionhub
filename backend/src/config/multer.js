const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const uploadPath = path.upload(__dirname, '..', '..', uploads);

if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
    console.log('Pasta uploads criada com sucesso no servidor!');
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        crypto.randomBytes(16, (err, hash) => {
            if (err) cb(err);
            const fileName = `${hash.toString('hex')}-${file.originalname}`;
            cb(null, fileName);
        });
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de arquivo inválido. Use apenas jpg, jpeg ou png'));
        }
    }
});

module.exports = upload