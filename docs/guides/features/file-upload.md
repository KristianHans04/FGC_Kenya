# File Upload

The application allows uploading supporting documents as part of the application process.

## Supported Files

- **Resume/CV**: PDF, Word documents (up to 5MB)
- **Academic Transcripts**: PDF only (up to 10MB)
- **Recommendation Letters**: PDF only (up to 5MB each)
- **Certificates**: PDF, JPG, PNG (up to 5MB)

## Upload Process

1. Select appropriate document type
2. Choose file from your device
3. System validates file type and size
4. File is securely uploaded and stored
5. Confirmation shows successful upload

## Security

All uploads are:
- Validated for type and size
- Scanned for security issues
- Stored securely on the server
- Accessible only to authorized users

## Limits

- Maximum 5 files per application
- Individual file size limits vary by type
- Total upload size monitored

## Upload Process

### Client-Side Upload
```typescript
interface FileUploadProps {
  applicationId: string;
  documentType: DocumentType;
  onUploadComplete: (file: UploadedFile) => void;
  onUploadError: (error: UploadError) => void;
}

function FileUpload({ applicationId, documentType, onUploadComplete, onUploadError }: FileUploadProps) {
  const handleFileSelect = async (files: FileList) => {
    for (const file of Array.from(files)) {
      // Validate file
      const validation = validateFile(file, documentType);
      if (!validation.valid) {
        onUploadError(validation.error);
        continue;
      }

      // Upload file
      try {
        const uploadedFile = await uploadFile(file, applicationId, documentType);
        onUploadComplete(uploadedFile);
      } catch (error) {
        onUploadError(error);
      }
    }
  };

  return (
    <div className="file-upload">
      <input
        type="file"
        multiple={fileSpecs[documentType].maxFiles > 1}
        accept={getAcceptedFormats(documentType)}
        onChange={(e) => handleFileSelect(e.target.files)}
      />
    </div>
  );
}
```

### Server-Side Processing
```typescript
async function handleFileUpload(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const applicationId = formData.get('applicationId') as string;
  const documentType = formData.get('documentType') as DocumentType;

  // 1. Validate file
  const validation = await validateUploadedFile(file, documentType);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  // 2. Scan for viruses
  const scanResult = await scanFileForViruses(file);
  if (!scanResult.safe) {
    return NextResponse.json({ error: 'File contains malware' }, { status: 400 });
  }

  // 3. Generate secure filename
  const secureFilename = generateSecureFilename(file.name);
  const filePath = `uploads/${applicationId}/${documentType}/${secureFilename}`;

  // 4. Store file
  await storeFile(file, filePath);

  // 5. Create database record
  const fileRecord = await createFileRecord({
    applicationId,
    documentType,
    filename: secureFilename,
    originalName: file.name,
    size: file.size,
    mimeType: file.type,
    path: filePath
  });

  // 6. Generate access URL
  const accessUrl = generateSecureAccessUrl(fileRecord.id);

  return NextResponse.json({
    success: true,
    file: {
      id: fileRecord.id,
      name: fileRecord.originalName,
      size: fileRecord.size,
      type: fileRecord.documentType,
      url: accessUrl
    }
  });
}
```

## Security Features

### File Validation
- **MIME Type Checking**: Server-side verification of file types
- **File Signature Analysis**: Content-based file type detection
- **Size Limits**: Prevent oversized file uploads
- **Filename Sanitization**: Remove dangerous characters

### Virus Scanning
```typescript
interface VirusScanResult {
  safe: boolean;
  threats: string[];
  scanTime: number;
}

async function scanFileForViruses(file: File): Promise<VirusScanResult> {
  // Integration with virus scanning service (e.g., ClamAV)
  const scanResult = await virusScanner.scan(file);

  return {
    safe: scanResult.threats.length === 0,
    threats: scanResult.threats,
    scanTime: scanResult.duration
  };
}
```

### Access Control
- **User Authorization**: Only application owners can upload
- **File Ownership**: Database-level ownership verification
- **Temporary URLs**: Time-limited access to uploaded files
- **Download Tracking**: Audit trail of file access

## Storage Architecture

### File Storage Options

#### Local File System (Development)
```typescript
const localStorage = {
  uploadDir: path.join(process.cwd(), 'uploads'),
  maxFileSize: 50 * 1024 * 1024, // 50MB

  async store(file: File, filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, Buffer.from(await file.arrayBuffer()));
  },

  async retrieve(filePath: string): Promise<Buffer> {
    const fullPath = path.join(this.uploadDir, filePath);
    return fs.readFile(fullPath);
  }
};
```

#### Cloud Storage (Production)
```typescript
// AWS S3 Integration
const s3Storage = {
  bucket: process.env.AWS_S3_BUCKET,
  region: process.env.AWS_REGION,

  async store(file: File, filePath: string): Promise<void> {
    const s3Client = new S3Client({ region: this.region });
    await s3Client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: filePath,
      Body: await file.arrayBuffer(),
      ContentType: file.type,
      ACL: 'private'
    }));
  },

  async generatePresignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    const s3Client = new S3Client({ region: this.region });
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: filePath
    });

    return getSignedUrl(s3Client, command, { expiresIn });
  }
};
```

### File Organization
```
/uploads/
├── {applicationId}/
│   ├── resume/
│   │   ├── secure-filename-1.pdf
│   │   └── secure-filename-2.pdf
│   ├── transcript/
│   │   ├── transcript-2024.pdf
│   │   └── transcript-2023.pdf
│   └── recommendation/
│       ├── letter-from-teacher.pdf
│       └── letter-from-mentor.pdf
└── temp/  # Temporary files during upload
```

## Database Schema

### File Record Table
```sql
CREATE TABLE "File" (
  id          String   @id @default(cuid())
  applicationId String
  documentType String
  filename    String   -- Secure filename
  originalName String  -- Original filename
  size        Int
  mimeType    String
  path        String   -- Storage path
  uploadedAt  DateTime @default(now())
  uploadedBy  String   -- User ID

  application Application @relation(fields: [applicationId], references: [id], onDelete: Cascade)

  @@map("files")
);
```

### File Access Log
```sql
CREATE TABLE "FileAccess" (
  id        String   @id @default(cuid())
  fileId    String
  userId    String
  action    String   -- 'upload', 'download', 'view'
  ipAddress String
  userAgent String
  timestamp DateTime @default(now())

  file File @relation(fields: [fileId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("file_access_logs")
);
```

## API Endpoints

### Upload File
```http
POST /api/applications/{applicationId}/upload
Content-Type: multipart/form-data

Form Data:
- file: File to upload
- type: Document type (resume, transcript, recommendation)
```

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "file_id",
    "name": "original-filename.pdf",
    "size": 1024000,
    "type": "resume",
    "url": "https://secure-url.com/download/file_id"
  }
}
```

### List Application Files
```http
GET /api/applications/{applicationId}/files
```

**Response:**
```json
{
  "success": true,
  "files": [
    {
      "id": "file_id",
      "name": "resume.pdf",
      "size": 2048000,
      "type": "resume",
      "uploadedAt": "2024-01-15T10:30:00Z",
      "url": "https://secure-url.com/download/file_id"
    }
  ]
}
```

### Download File
```http
GET /api/files/{fileId}/download
Authorization: Bearer {token}
```

**Response:** File stream with appropriate headers

### Delete File
```http
DELETE /api/files/{fileId}
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

## User Interface

### Upload Component
```tsx
function DocumentUpload({ applicationId, documentType }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadFile(file, applicationId, documentType);
      setFiles(prev => [...prev, result.file]);
    } catch (error) {
      // Handle error
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="document-upload">
      <FileDropzone
        accept={getAcceptedFormats(documentType)}
        maxSize={getMaxSize(documentType)}
        onDrop={handleUpload}
        disabled={uploading || files.length >= maxFiles}
      />

      <FileList files={files} onDelete={handleDelete} />

      {uploading && <UploadProgress />}
    </div>
  );
}
```

### File Management
```tsx
function FileList({ files, onDelete }: FileListProps) {
  return (
    <div className="file-list">
      {files.map(file => (
        <FileItem
          key={file.id}
          file={file}
          onDownload={() => downloadFile(file.id)}
          onDelete={() => onDelete(file.id)}
        />
      ))}
    </div>
  );
}
```

## Performance Optimization

### Upload Optimization
- **Chunked Uploads**: Large file handling
- **Progress Tracking**: Real-time upload progress
- **Resume Uploads**: Interrupted upload resumption
- **Concurrent Uploads**: Multiple file uploads

### Storage Optimization
- **File Compression**: Automatic image compression
- **CDN Integration**: Fast file delivery
- **Caching**: Intelligent file caching
- **Cleanup**: Automatic temporary file removal

## Error Handling

### Upload Errors
```typescript
enum UploadError {
  FILE_TOO_LARGE = 'file_too_large',
  INVALID_TYPE = 'invalid_file_type',
  VIRUS_DETECTED = 'virus_detected',
  STORAGE_ERROR = 'storage_error',
  QUOTA_EXCEEDED = 'quota_exceeded'
}
```

### Error Messages
```typescript
const errorMessages = {
  [UploadError.FILE_TOO_LARGE]: 'File size exceeds the maximum allowed limit',
  [UploadError.INVALID_TYPE]: 'File type not supported',
  [UploadError.VIRUS_DETECTED]: 'File contains malware and cannot be uploaded',
  [UploadError.STORAGE_ERROR]: 'Upload failed due to storage error',
  [UploadError.QUOTA_EXCEEDED]: 'Upload quota exceeded'
};
```

## Monitoring and Analytics

### Upload Metrics
- **Success Rate**: Percentage of successful uploads
- **Average Upload Time**: File upload performance
- **File Type Distribution**: Popular file formats
- **Storage Usage**: Total storage consumption

### Security Monitoring
- **Failed Upload Attempts**: Track upload failures
- **Virus Scan Results**: Malware detection statistics
- **Access Patterns**: File access monitoring
- **Storage Anomalies**: Unusual storage patterns

## Configuration

### Environment Variables
```bash
# File Upload Settings
MAX_FILE_SIZE=10485760          # 10MB in bytes
MAX_FILES_PER_APPLICATION=5
ALLOWED_FILE_TYPES=pdf,doc,docx,jpg,png

# Storage Configuration
STORAGE_TYPE=local              # local | s3 | cloudinary
UPLOAD_DIR=uploads/
TEMP_DIR=temp/

# Security
VIRUS_SCANNING_ENABLED=true
FILE_ACCESS_TIMEOUT=3600        # 1 hour

# AWS S3 (if using S3)
AWS_S3_BUCKET=fgc-kenya-uploads
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

## Testing

### Unit Tests
```typescript
describe('File Upload', () => {
  it('should validate file types correctly', () => {
    expect(validateFileType('document.pdf', 'pdf')).toBe(true);
    expect(validateFileType('document.exe', 'pdf')).toBe(false);
  });

  it('should enforce file size limits', () => {
    const largeFile = { size: 20 * 1024 * 1024 }; // 20MB
    expect(validateFileSize(largeFile, 10 * 1024 * 1024)).toBe(false);
  });
});
```

### Integration Tests
```typescript
describe('Upload API', () => {
  it('should upload file successfully', async () => {
    const file = createMockFile('test.pdf', 'application/pdf');
    const response = await uploadFileAPI(file, applicationId);

    expect(response.success).toBe(true);
    expect(response.file).toBeDefined();
  });

  it('should reject oversized files', async () => {
    const largeFile = createMockFile('large.pdf', 'application/pdf', 20 * 1024 * 1024);
    const response = await uploadFileAPI(largeFile, applicationId);

    expect(response.success).toBe(false);
    expect(response.error).toContain('too large');
  });
});
```

## Future Enhancements

### Planned Features
- **Drag and Drop**: Enhanced file upload UX
- **Batch Uploads**: Upload multiple files simultaneously
- **File Preview**: Preview documents before upload
- **OCR Processing**: Extract text from uploaded documents
- **AI Analysis**: Intelligent document analysis
- **Version Control**: File version management

### Scalability Improvements
- **Distributed Storage**: Multi-region file storage
- **Load Balancing**: Upload load distribution
- **Queue Processing**: Background file processing
- **CDN Optimization**: Global file delivery optimization

This file upload system ensures secure, reliable, and user-friendly document management for the FIRST Global Team Kenya application process.