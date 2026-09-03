const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadBuffer = (file, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
    });
};

const uploadImages = (folder) => {
    return async (req, res, next) => {
        try {
            const files = req.files;

            if (!files?.length) {
                return next();
            }

            const uploads = await Promise.all(
                files.map((file) => uploadBuffer(file, folder))
            );
            req.body.images = uploads.map((image) => (image.secure_url));

            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = uploadImages;