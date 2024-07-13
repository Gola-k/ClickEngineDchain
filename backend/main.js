const express = require('express');
const multer = require('multer');
const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cors = require("cors")
const http = require('http');
const https = require('https');
// import downloadAndExtractZip from './utils/extractAndPlay';

const app = express();
app.use(cors())
const port = process.env.PORT || 3000;
const serverIp = "144.76.95.55"

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// Function to download a file from a URL to a specified location
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
  
      // Make a GET request to the URL
      protocol.get(url, (response) => {
        // Check if the response is successful (status code 200)
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download file. Status code: ${response.statusCode}`));
          return;
        }

        const destDir = path.dirname(dest); 
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
  
        // Create a writable stream to save the file
        const fileStream = fs.createWriteStream(dest);
  
        // Pipe the response to the file stream
        response.pipe(fileStream);
  
        // Resolve the promise when the download is complete
        fileStream.on('finish', () => {
          fileStream.close();
          resolve();
        });
  
        // Handle errors during the download
        fileStream.on('error', (err) => {
          fs.unlink(dest, () => {}); // Delete the file
          reject(err);
        });
      }).on('error', (err) => {
        reject(err);
      });
    });
  }
 // Function to unzip a file and delete it
function unzipFileAndStartServer(zipFilePath) {
    return new Promise((resolve, reject) => {
      // Load the zip file
      const zip = new AdmZip(zipFilePath);
  
      // Extract the contents of the zip file
      zip.extractAllTo(path.dirname(zipFilePath), true);
  
      // Use async/await for cleaner code and error handling
      (async () => {
        try {
          // Delete the zip file after successful extraction
          await fs.promises.unlink(zipFilePath);
          console.log(`Zip file ${zipFilePath} deleted successfully.`);
        } catch (error) {
          console.error(`Error deleting zip file: ${error.message}`);
          // Handle deletion error (optional)
          // You can reject the promise or log an error message
          // reject(error);
        } finally {
          // // Execute npx serve command regardless of deletion success/failure
          // const { stdout, stderr, error } = await exec(`npx serve downloads -l 3000`);
          // if (error) {
          //   console.error(`Error running npx serve: ${error.message}`);
          //   // Handle npx serve error (optional)
          //   // You can reject the promise or log an error message
          //   // reject(error);
          //   return;
          // }
          // console.log(`npx serve stdout: ${stdout}`);
          // console.error(`npx serve stderr: ${stderr}`);

        }
        // Resolve the promise only after all operations are complete
        resolve();
      })();
    });
  }


app.get("/hello", (req,res)=>{
  res.send("Hello from remote server")
})

// app.get('/folder-view', (req, res) => {
//   const folderPath = path.join(__dirname, 'downloadeds'); // Replace with actual path
//   if (!fs.existsSync(folderPath)) {
//     return res.status(404).send('Folder not found');
//   }

//   const files = fs.readdirSync(folderPath);
//   let htmlContent = `<!DOCTYPE html><html><body><h1>Folder Contents</h1><ul>`;

//   files.forEach(file => {
//     const filePath = path.join(folderPath, file);
//     const isDirectory = fs.statSync(filePath).isDirectory();
//     const href = isDirectory ? `/folder-view?path=${filePath}` : filePath;
//     htmlContent += `<li><a href="${href}">${file}</a></li>`;
//   });

//   htmlContent += `</ul></body></html>`;
//   res.send(htmlContent);
// });



app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // console.log("upload ")

    const zip = new AdmZip(req.file.buffer);
    const tempDir = path.join(__dirname, 'tempPlay'); // Create a temporary directory
    zip.extractAllTo(tempDir, true); // Extract zip contents to the temporary directory
    // console.log("unupload")

    // Run npx serve on the temporary directory with the --open flag
    // exec(`npx serve ${tempDir} -l 3000`, (error, stdout, stderr) => {
    //     if (error) {
    //         console.error(`Error running npx serve: ${error.message}`);
    //         res.status(500).send('Internal server error');
    //         return;
    //     }

    //     console.log(`npx serve stdout: ${stdout}`);
    //     console.error(`npx serve stderr: ${stderr}`);
        
        
    // });
    // res.send(`Serving extracted files with npx serve on port ...`);

    res.send(`http://localhost:3000/preview-content`); // Replace with actual URL
  });


app.post("/play",async (req,res)=>{
    // console.log(req.body.url)
    const {url} = req.body;

    if (!url || typeof url !== 'string') {
        return res.status(400).send('Invalid data format. Please send a string.');
    }
    const ind = url.lastIndexOf('/')
    const fileName = url.substring(ind+1);

    console.log("file name is - ",fileName)
    const dest = path.join(__dirname, 'downloads', fileName, `${fileName}.zip`); // Destination path to save the file

    try {
        downloadFile(url, dest)
        .then(() => {
            console.log('File downloaded successfully!');
            // Unzip the downloaded file
            return unzipFileAndStartServer(dest);        
        })
        .catch((err) => {
            console.error('Failed to download file:', err);
        });
    } catch (error) {
        res.status(404)
    }finally{
      res.send(`http://localhost:3000/folder-content/${fileName}`); 
    }
})

app.get("/delete-temp", async (req, res) => {
  const folderPath = path.join(__dirname, 'tempPlay');
  try {
      fs.rmdirSync(folderPath, { recursive: true });
      res.send(`Folder ${folderName} deleted successfully`);
  } catch (error) {
      res.status(500).send(`Error deleting folder: ${error.message}`);
  }
});

app.post("/delete-folder", async (req, res) => {
  const folder = req.body.folderName
  const folderPath = path.join(__dirname, 'downloads',folder);
  try {
      fs.rmdirSync(folderPath, { recursive: true });
      console.log(`Folder ${folderName} deleted successfully`)
      res.send(`Folder ${folderName} deleted successfully`);
  } catch (error) {
      res.status(500).send(`Error deleting folder: ${error.message}`);
  }
});

function serveFolderContent(req, res, next) {
  const folderName = req.params.folderName;
  const staticPath = path.join(__dirname, 'downloads', folderName);
  express.static(staticPath)(req, res, next);
}

app.use('/folder-content/:folderName', serveFolderContent);

app.use('/preview-content/', express.static(path.join(__dirname, "tempPlay")));


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port} on ip ${serverIp}`);
});