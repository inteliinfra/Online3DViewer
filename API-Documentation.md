# 3D Viewer API Documentation

This API server provides endpoints for uploading, managing, and viewing 3D model files.

## Base URL
```
http://localhost:8080
```

## Endpoints

### Health Check
**GET** `/api/health`

Check if the API server is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-07-24T16:50:00.000Z",
  "service": "3D Viewer API"
}
```

### Upload Single File
**POST** `/api/upload`

Upload a single 3D model file.

**Headers:**
```
Content-Type: multipart/form-data
```

**Body:**
```
file: [3D model file]
```

**Supported File Formats:**
- 3DM (.3dm)
- 3DS (.3ds)
- 3MF (.3mf)
- AMF (.amf)
- BIM (.bim)
- BREP (.brep)
- DAE (.dae)
- FBX (.fbx)
- FCStd (.fcstd)
- glTF (.gltf, .glb)
- IFC (.ifc)
- IGES (.iges)
- STEP (.step)
- STL (.stl)
- OBJ (.obj)
- OFF (.off)
- PLY (.ply)
- WRL (.wrl)

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "filename": "file-1234567890-123456789.3dm",
    "originalName": "model.3dm",
    "size": 1024000,
    "mimetype": "application/octet-stream",
    "uploadDate": "2025-07-24T16:50:00.000Z",
    "filePath": "/uploads/file-1234567890-123456789.3dm",
    "viewerUrl": "/viewer?file=file-1234567890-123456789.3dm"
  }
}
```

### Upload Multiple Files
**POST** `/api/upload/multiple`

Upload multiple 3D model files (up to 10 files).

**Headers:**
```
Content-Type: multipart/form-data
```

**Body:**
```
files: [3D model files]
```

**Response:**
```json
{
  "success": true,
  "message": "3 files uploaded successfully",
  "data": [
    {
      "filename": "file-1234567890-123456789.3dm",
      "originalName": "model1.3dm",
      "size": 1024000,
      "mimetype": "application/octet-stream",
      "uploadDate": "2025-07-24T16:50:00.000Z",
      "filePath": "/uploads/file-1234567890-123456789.3dm",
      "viewerUrl": "/viewer?file=file-1234567890-123456789.3dm"
    }
  ]
}
```

### List Uploaded Files
**GET** `/api/files`

Get a list of all uploaded 3D model files.

**Response:**
```json
{
  "files": [
    {
      "filename": "file-1234567890-123456789.3dm",
      "size": 1024000,
      "uploadDate": "2025-07-24T16:50:00.000Z",
      "filePath": "/uploads/file-1234567890-123456789.3dm",
      "viewerUrl": "/viewer?file=file-1234567890-123456789.3dm"
    }
  ]
}
```

### Delete File
**DELETE** `/api/files/:filename`

Delete a specific uploaded file.

**Response:**
```json
{
  "success": true,
  "message": "File file-1234567890-123456789.3dm deleted successfully"
}
```

### View 3D Model
**GET** `/viewer?file=filename`

Open the 3D viewer with a specific file loaded.

**Parameters:**
- `file`: The filename to load in the viewer

## Usage Examples

### Upload a file using curl
```bash
curl -X POST \
  -F "file=@model.3dm" \
  http://localhost:8080/api/upload
```

### Upload multiple files using curl
```bash
curl -X POST \
  -F "files=@model1.3dm" \
  -F "files=@model2.stl" \
  -F "files=@model3.obj" \
  http://localhost:8080/api/upload/multiple
```

### List all files
```bash
curl http://localhost:8080/api/files
```

### Delete a file
```bash
curl -X DELETE \
  http://localhost:8080/api/files/filename.3dm
```

### Open viewer with specific file
```
http://localhost:8080/viewer?file=filename.3dm
```

## JavaScript Examples

### Upload file using fetch
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch('http://localhost:8080/api/upload', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('Upload successful:', data);
  // Open viewer with uploaded file
  window.open(data.data.viewerUrl, '_blank');
})
.catch(error => {
  console.error('Upload failed:', error);
});
```

### Upload multiple files
```javascript
const formData = new FormData();
for (let file of fileInput.files) {
  formData.append('files', file);
}

fetch('http://localhost:8080/api/upload/multiple', {
  method: 'POST',
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('Upload successful:', data);
})
.catch(error => {
  console.error('Upload failed:', error);
});
```

### List files
```javascript
fetch('http://localhost:8080/api/files')
.then(response => response.json())
.then(data => {
  console.log('Files:', data.files);
})
.catch(error => {
  console.error('Failed to list files:', error);
});
```

## Error Responses

### File too large
```json
{
  "error": "File too large",
  "message": "File size exceeds the 100MB limit"
}
```

### Invalid file type
```json
{
  "error": "Upload failed",
  "message": "Invalid file type. Only 3D model files are allowed."
}
```

### File not found
```json
{
  "error": "File not found",
  "message": "File filename.3dm does not exist"
}
```

## Limits

- **File size limit**: 100MB per file
- **Multiple files**: Up to 10 files per request
- **Supported formats**: 3DM, 3DS, 3MF, AMF, BIM, BREP, DAE, FBX, FCStd, glTF, IFC, IGES, STEP, STL, OBJ, OFF, PLY, WRL

## Docker Usage

### Build and run with API server
```bash
docker build -t online-3d-viewer .
docker run -d -p 8080:8080 --name online-3d-viewer-container online-3d-viewer
```

### Access API endpoints
```bash
# Health check
curl http://localhost:8080/api/health

# Upload file
curl -X POST -F "file=@model.3dm" http://localhost:8080/api/upload

# List files
curl http://localhost:8080/api/files
```
