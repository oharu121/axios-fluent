import Axon from '../Axon';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

/**
 * File Operations Example
 *
 * This example demonstrates file upload and download operations
 */

async function uploadFile() {
  console.log('=== File Upload Example ===');

  // Create form data
  const formData = new FormData();

  // In a real scenario, you would read an actual file
  // formData.append('file', fs.createReadStream('/path/to/file.pdf'));
  formData.append('name', 'document.pdf');
  formData.append('description', 'Important document');

  const client = Axon.new()
    .baseUrl('https://api.example.com')
    .bearer('your-token')
    .multipart();

  try {
    const response = await client.post('/upload', formData);
    console.log('Upload successful:', response.data);
  } catch (error: any) {
    console.error('Upload failed:', error.message);
  }
}

async function uploadMultipleFiles() {
  console.log('\n=== Multiple File Upload Example ===');

  const formData = new FormData();

  // Simulate multiple files
  const files = ['file1.txt', 'file2.txt', 'file3.txt'];

  files.forEach((filename) => {
    // In real scenario: formData.append('files', fs.createReadStream(filename));
    formData.append('files', Buffer.from('file content'), filename);
  });

  formData.append('folder', 'documents');

  const client = Axon.new()
    .baseUrl('https://api.example.com')
    .bearer('your-token')
    .multipart();

  try {
    const response = await client.post('/upload/multiple', formData);
    console.log('Multiple uploads successful:', response.data);
  } catch (error: any) {
    console.error('Upload failed:', error.message);
  }
}

async function downloadFile() {
  console.log('\n=== File Download Example ===');

  const client = Axon.new()
    .baseUrl('https://api.example.com')
    .bearer('your-token')
    .responseType('blob');

  try {
    const response = await client.get('/download/file.pdf');

    // Save to disk
    const outputPath = path.join(__dirname, 'downloaded-file.pdf');
    fs.writeFileSync(outputPath, response.data);

    console.log(`File downloaded to: ${outputPath}`);
  } catch (error: any) {
    console.error('Download failed:', error.message);
  }
}

async function downloadWithProgress() {
  console.log('\n=== Download with Progress Tracking ===');

  const client = Axon.new()
    .baseUrl('https://api.example.com')
    .bearer('your-token')
    .responseType('stream');

  try {
    const response = await client.get('/download/large-file.zip');
    const outputPath = path.join(__dirname, 'large-file.zip');
    const writer = fs.createWriteStream(outputPath);

    let downloadedBytes = 0;
    const totalBytes = parseInt(response.headers['content-length'] || '0', 10);

    response.data.on('data', (chunk: Buffer) => {
      downloadedBytes += chunk.length;
      const progress = ((downloadedBytes / totalBytes) * 100).toFixed(2);
      console.log(`Download progress: ${progress}%`);
    });

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    console.log(`Download complete: ${outputPath}`);
  } catch (error: any) {
    console.error('Download failed:', error.message);
  }
}

async function chunkedUpload() {
  console.log('\n=== Chunked Upload Example ===');

  const fileBuffer = Buffer.alloc(10 * 1024 * 1024); // 10MB file
  const chunkSize = 1 * 1024 * 1024; // 1MB chunks
  const totalChunks = Math.ceil(fileBuffer.length / chunkSize);

  const client = Axon.new()
    .baseUrl('https://api.example.com')
    .bearer('your-token');

  try {
    // Initialize upload
    const initResponse = await client
      .json()
      .post('/upload/init', {
        filename: 'large-file.bin',
        totalSize: fileBuffer.length,
        totalChunks
      });

    const uploadId = initResponse.data.uploadId;

    // Upload chunks
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, fileBuffer.length);
      const chunk = fileBuffer.slice(start, end);

      await client
        .octet()
        .length(chunk.length)
        .range(start, end, fileBuffer.length)
        .post(`/upload/${uploadId}/chunk/${i}`, chunk);

      const progress = ((i + 1) / totalChunks * 100).toFixed(2);
      console.log(`Upload progress: ${progress}%`);
    }

    // Finalize upload
    await client
      .json()
      .post(`/upload/${uploadId}/complete`, {});

    console.log('Chunked upload complete');
  } catch (error: any) {
    console.error('Chunked upload failed:', error.message);
  }
}

async function uploadWithMetadata() {
  console.log('\n=== Upload with Metadata Example ===');

  const formData = new FormData();

  // Add file
  // formData.append('file', fs.createReadStream('/path/to/image.jpg'));

  // Add metadata
  formData.append('title', 'Vacation Photo');
  formData.append('tags', JSON.stringify(['vacation', 'beach', '2024']));
  formData.append('metadata', JSON.stringify({
    location: 'Hawaii',
    camera: 'Canon EOS',
    timestamp: new Date().toISOString()
  }));

  const client = Axon.new()
    .baseUrl('https://api.example.com')
    .bearer('your-token')
    .multipart();

  try {
    const response = await client.post('/photos/upload', formData);
    console.log('Upload with metadata successful:', response.data);
  } catch (error: any) {
    console.error('Upload failed:', error.message);
  }
}

// Run examples
async function runExamples() {
  await uploadFile();
  await uploadMultipleFiles();
  await downloadFile();
  await downloadWithProgress();
  await chunkedUpload();
  await uploadWithMetadata();
}

runExamples();
