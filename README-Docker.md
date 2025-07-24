# Online 3D Viewer - Docker Setup

This repository contains a Docker setup for hosting the Online 3D Viewer application.

## Quick Start

### Build and Run with Docker Compose
```bash
# Build and start the container
docker-compose up -d

# Access the application at http://localhost:8080
```

### Manual Docker Commands
```bash
# Build the Docker image
docker build -t online-3d-viewer .

# Run the container
docker run -d -p 8080:80 --name online-3d-viewer-container online-3d-viewer

# Access the application at http://localhost:8080
```

## Container Management

### Stop the container
```bash
docker stop online-3d-viewer-container
```

### Remove the container
```bash
docker rm online-3d-viewer-container
```

### View logs
```bash
docker logs online-3d-viewer-container
```

### Health check
```bash
curl http://localhost:8080/
```

## Features

- **Simple Node.js setup**: Direct npm server without nginx complexity
- **http-server**: Lightweight static file server
- **Hot reload**: Development-friendly setup
- **CORS support**: Ready for iframe integration
- **Easy debugging**: Direct access to Node.js logs
- **Smaller image**: No nginx overhead

## Port Configuration

- **Container port**: 8080 (internal)
- **Host port**: 8080 (external)
- **Access URL**: http://localhost:8080

## Development

For development with hot reload:
```bash
# Build and run development container
docker-compose --profile dev up -d

# Access at http://localhost:8081
```

## File Structure

```
/app/
├── website/
│   ├── index.html     # Main application
│   ├── assets/        # Static assets (images, icons)
│   └── build/         # Symlinked to /app/build
└── build/             # Built JavaScript files
```

## Troubleshooting

### Container won't start
Check the logs:
```bash
docker logs online-3d-viewer-container
```

### Can't access the application
1. Verify container is running: `docker ps`
2. Check port mapping: `docker port online-3d-viewer-container`
3. Test health endpoint: `curl http://localhost:8080/health`

### Build issues
1. Ensure Docker has enough memory (recommended: 4GB+)
2. Clear Docker cache: `docker system prune -a`
3. Rebuild without cache: `docker build --no-cache -t online-3d-viewer .`
