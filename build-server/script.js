const { exec } = require("child_process");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3")
const path = require("path");
const fs = require("fs");
const mime = require("mime-types")
const project_id = "adsasdas"
const s3client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: "",
        secretAccessKey: '',
    }
})


async function init() {
    console.log("exicuting clone file");

    const outDir = path.join(__dirname, 'output');

    console.log(outDir);

    const p = exec(`cd ${outDir} && npm install && npm run build`)

    p.stdout.on('data', function (data) {
        console.log(data.toString());
    });

    p.stdout.on('error', function (data) {
        console.log("ERROR", data.toString());
    });



    p.stdout.on('close', async function () {
        console.log("build completed")
        const distFolderPath = path.join(__dirname, 'output', "build");
        const distFolderContents = fs.readdirSync(distFolderPath, { recursive: true });


        for (const fileOrDir of distFolderContents) {
            const s3Key = `__output/${project_id}/${fileOrDir}`;
            const filePath = path.join(distFolderPath, fileOrDir);


            if (fs.lstatSync(filePath).isDirectory()) continue;
            const command = new PutObjectCommand({
                Bucket: 'builder-321',
                Key: s3Key,
                Body: fs.createReadStream(filePath),
                ContentType: mime.lookup(filePath) || 'application/octet-stream',
            });


            try {
                await s3client.send(command);
                console.log(`Uploaded ${filePath} to ${s3Key}`);
            } catch (err) {
                console.error(`Error uploading ${filePath} to ${s3Key}:`, err);
            }
        }

        console.log("done...");

    });
}

init()