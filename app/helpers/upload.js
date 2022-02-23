const extract = require('extract-zip')
const formidable = require('formidable');

const extractZip = (file, destination, deleteSource) => {
    extract(file, { dir: destination }, (err) => {
        if (!err) {
            if (deleteSource) fs.unlinkSync(file);
            nestedExtract(destination, extractZip);
        } else {
            console.error(err);
        }
    });
};

const nestedExtract = (dir, zipExtractor) => {
    fs.readdirSync(dir).forEach((file) => {
        if (fs.statSync(path.join(dir, file)).isFile()) {
            if (path.extname(file) === '.zip') {
                // deleteSource = true to avoid infinite loops caused by extracting same file
                zipExtractor(path.join(dir, file), dir, true);
            }
        } else {
            nestedExtract(path.join(dir, file), zipExtractor);
        }
    });
};

const uploadMedia = (req) => {
    const uploadDir = req.app.locals.uploadDir;
    const extractDir = req.app.locals.extractDir;
    return { status: 1, uploaded: true };
}

const uploadAndExtract = (req) => {
    const uploadDir = req.app.locals.uploadDir;
    const extractDir = req.app.locals.extractDir;
    const form = new formidable.IncomingForm();
    // file size limit 100MB. change according to your needs
    form.maxFileSize = 100 * 1024 * 1024;
    form.keepExtensions = true;
    form.multiples = true;
    form.uploadDir = uploadDir;

    // collect all form files and fileds and pass to its callback
    form.parse(req, async (err, fields, files) => {
        // when form parsing fails throw error
        if (err) return { status: 0, error: err };

        if (Object.keys(files).length === 0) return { status: 0, error: "no files uploaded" };

        // Iterate all uploaded files and get their path, extension, final extraction path
        const filesInfo = Object.keys(files).map((key) => {
            const file = files[key];
            const filePath = file.path;
            const fileExt = path.extname(file.name);
            const fileName = path.basename(file.name, fileExt);

            return { filePath, fileExt, fileName };
        });

        // Check whether uploaded files are zip files
        const validFiles = filesInfo.every(({ fileExt }) => fileExt === '.zip');

        // if uploaded files are not zip files, return error
        if (!validFiles) return { status: 0, error: "unsupported file type" };

        // iterate through each file path and extract them
        filesInfo.forEach(({ filePath, fileName }) => {
            // create directory with timestamp to prevent overwrite same directory names
            const destDir = `${path.join(extractDir, fileName)}_${new Date().getTime()}`;

            // pass deleteSource = true if source file not needed after extraction
            extractZip(filePath, destDir, false);
        });
        return { status: 1, uploaded: true };
    });

    // runs when new file detected in upload stream
    form.on('fileBegin', function (name, file) {
        // get the file base name `index.css.zip` => `index.html`
        const fileName = path.basename(file.name, path.extname(file.name));
        const fileExt = path.extname(file.name);
        // create files with timestamp to prevent overwrite same file names
        file.path = path.join(uploadDir, `${fileName}_${new Date().getTime()}${fileExt}`);
    });
}

module.exports = {
    uploadMedia
}