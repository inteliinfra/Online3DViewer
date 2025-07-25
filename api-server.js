import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('website'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow only 3D file formats
    const allowedExtensions = [
      '.3dm', '.3ds', '.3mf', '.amf', '.bim', '.brep', '.dae', '.fbx',
      '.fcstd', '.gltf', '.glb', '.ifc', '.iges', '.step', '.stl',
      '.obj', '.off', '.ply', '.wrl'
    ];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only 3D model files are allowed.'), false);
    }
  }
});

// API Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: '3D Viewer API'
  });
});

// Upload single file
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please provide a file in the request'
      });
    }

    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      uploadDate: new Date().toISOString(),
      filePath: `/uploads/${req.file.filename}`,
      viewerUrl: `/viewer?file=${encodeURIComponent(req.file.filename)}`
    };

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: fileInfo
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

// Upload multiple files
app.post('/api/upload/multiple', upload.array('files', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please provide files in the request'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      uploadDate: new Date().toISOString(),
      filePath: `/uploads/${file.filename}`,
      viewerUrl: `/viewer?file=${encodeURIComponent(file.filename)}`
    }));

    res.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: uploadedFiles
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    });
  }
});

// List uploaded files
app.get('/api/files', (req, res) => {
  try {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      return res.json({ files: [] });
    }

    const files = fs.readdirSync(uploadDir)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.3dm', '.3ds', '.3mf', '.amf', '.bim', '.brep', '.dae', '.fbx',
                '.fcstd', '.gltf', '.glb', '.ifc', '.iges', '.step', '.stl',
                '.obj', '.off', '.ply', '.wrl'].includes(ext);
      })
      .map(file => {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          uploadDate: stats.mtime.toISOString(),
          filePath: `/uploads/${file}`,
          viewerUrl: `/viewer?file=${encodeURIComponent(file)}`
        };
      })
      .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));

    res.json({ files });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({
      error: 'Failed to list files',
      message: error.message
    });
  }
});

// Delete a file
app.delete('/api/files/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join('uploads', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: 'File not found',
        message: `File ${filename} does not exist`
      });
    }

    fs.unlinkSync(filePath);
    res.json({
      success: true,
      message: `File ${filename} deleted successfully`
    });

  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      error: 'Failed to delete file',
      message: error.message
    });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Custom viewer endpoint
app.get('/viewer', (req, res) => {
  const file = req.query.file;
  if (!file) {
    return res.status(400).send('No file specified');
  }

  // Serve the viewer with the specified file
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, user-scalable=no">
        <title>3D Viewer - ${file}</title>
        <link rel="stylesheet" type="text/css" href="build/website_dev/o3dv.website.min.css">
        <script type="text/javascript" src="build/website_dev/o3dv.website.min.js"></script>
    </head>
    <body>
        <div id="viewer-container" style="width: 100%; height: 100vh;"></div>
        <script>
            // Initialize the viewer
            OV.StartWebsite();

            // Load the specified file
            setTimeout(() => {
                const fileUrl = '/uploads/${encodeURIComponent(file)}';
                console.log('Loading file:', fileUrl);

                // Trigger file load
                const event = new CustomEvent('loadFile', {
                    detail: { url: fileUrl, filename: '${file}' }
                });
                document.dispatchEvent(event);
            }, 1000);
        </script>
    </body>
    </html>
  `);
});

// Serve the main viewer
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size exceeds the 100MB limit'
      });
    }
  }

  console.error('API Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`3D Viewer API Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Upload endpoint: http://localhost:${PORT}/api/upload`);
  console.log(`Viewer: http://localhost:${PORT}/`);
});
