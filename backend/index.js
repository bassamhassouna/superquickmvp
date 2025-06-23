const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

const rubricPath = path.resolve(__dirname, 'assets/rubric.docx');

app.use(cors());

// Setup multer to save files in uploads/ with unique names + original extension
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2,7)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// POST /upload expecting exactly 3 files named file1, file2, file3
app.post('/upload', upload.fields([
  { name: 'file2', maxCount: 1 },
  { name: 'file3', maxCount: 1 },
]), (req, res) => {
  try {
    if (!req.files || !req.files['file2'] || !req.files['file3']) {
      console.error('❌ Missing lesson or overview file');
      return res.status(400).send('Please upload both the lesson and course overview files.');
    }

    const lessonPath = path.resolve(req.files['file2'][0].path);
    const overviewPath = path.resolve(req.files['file3'][0].path);

    console.log('📁 Received files:', rubricPath, lessonPath, overviewPath);

    // Spawn python with rubric + uploaded files
    const python = spawn('python', ['parser.py', rubricPath, lessonPath, overviewPath]);

    let output = '';
    let errorOutput = '';

    python.stdout.on('data', data => {
      output += data.toString();
    });

    python.stderr.on('data', data => {
      errorOutput += data.toString();
      console.error('🐍 Python stderr:', data.toString());
    });

    python.on('close', code => {
      // Cleanup uploaded files (lesson and overview)
      [lessonPath, overviewPath].forEach(fp => {
        try {
          fs.unlinkSync(fp);
        } catch(e) {
          console.warn(`⚠️ Failed to delete ${fp}: ${e.message}`);
        }
      });

      if (code !== 0) {
        console.error(`❌ Python exited with code ${code}`);
        return res.status(500).send(`Python script failed with code ${code}.\n\n${errorOutput}`);
      }

      res.send(output);
    });
  } catch (err) {
    console.error('🔥 Server error:', err);
    res.status(500).send(`Server error: ${err.message}`);
  }
});
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
