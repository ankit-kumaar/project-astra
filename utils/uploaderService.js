import axios from "axios";

// Start the upload process: Initializes the multipart upload and returns an upload ID
const startUpload = async (file) => {
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/media/start-upload/`,
      {
        file_name: file.name,
      }
    );
    return response.data.upload_id;
  } catch (error) {
    console.error(
      "Error starting upload:",
      error.response ? error.response.data : error
    );
    throw new Error("Failed to start upload");
  }
};

// Get a presigned URL for a specific chunk of the video
const getPresignedUrl = async (uploadId, partNumber, fileName) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/media/presigned-url/${uploadId}/${partNumber}`,
      { params: { file_name: fileName } }
    );
    return response.data.presigned_url;
  } catch (error) {
    console.error(
      "Error getting presigned URL:",
      error.response ? error.response.data : error
    );
    throw new Error("Failed to get presigned URL");
  }
};

// Upload a chunk to the presigned URL
const uploadPart = async (presignedUrl, part, videoFileType) => {
  try {
    const response = await axios.put(presignedUrl, part, {
      headers: {
        "Content-Type": videoFileType,
      },
    });
    return response;
  } catch (error) {
    console.error(
      "Error uploading part:",
      error.response ? error.response.data : error
    );
    throw new Error("Failed to upload part");
  }
};

// Complete the upload process with partsInfo
const completeUpload = async (uploadId, fileName, partsInfo) => {
  // Ensure partsInfo is sorted by PartNumber in ascending order
  partsInfo.sort((a, b) => a.PartNumber - b.PartNumber);

  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/media/complete-upload/`,
      {
        upload_id: uploadId,
        file_name: fileName,
        parts_info: partsInfo,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error completing upload:",
      error.response ? error.response.data : error
    );
    throw new Error("Failed to complete upload");
  }
};

// Custom function to handle concurrency with a limit
const pLimit = (concurrency) => {
  const queue = [];
  let activeCount = 0;

  const next = () => {
    if (queue.length > 0 && activeCount < concurrency) {
      activeCount++;
      const [fn, resolve] = queue.shift();
      fn().then(() => {
        activeCount--;
        resolve();
        next();
      });
    }
  };

  return (fn) =>
    new Promise((resolve) => {
      queue.push([fn, resolve]);
      next();
    });
};

// Adaptive chunk sizing based on network speed or conditions
const getAdaptiveChunkSize = () => {
  const defaultChunkSize = 40 * 1024 * 1024; // 40MB
  const fastNetworkThreshold = 70 * 1024 * 1024; // 70MB
  const networkSpeed = navigator.connection ? navigator.connection.downlink : 4; // Approximation

  if (networkSpeed >= 5) {
    return fastNetworkThreshold; // Increase chunk size for fast connections
  }
  return defaultChunkSize; // Default for slower connections
};

// Main function to handle chunked uploads with control over parallelism
const handleUpload = async (file) => {
  try {
    const chunkSize = getAdaptiveChunkSize();
    const videoFileSize = file.size;
    const uploadId = await startUpload(file);
    const partsInfo = [];
    const maxConcurrentUploads = 4; // Limit parallel uploads

    const limit = pLimit(maxConcurrentUploads);

    let partNumber = 1;
    let offset = 0;
    const uploadPromises = [];

    while (offset < videoFileSize) {
      const part = file.slice(offset, offset + chunkSize);
      const currentPartNumber = partNumber; // Ensure correct closure reference

      uploadPromises.push(
        limit(async () => {
          try {
            const presignedUrl = await getPresignedUrl(
              uploadId,
              currentPartNumber,
              file.name
            );
            const response = await uploadPart(presignedUrl, part, file.type);

            // Push to partsInfo only if upload is successful
            if (response.headers.etag) {
              console.log(`Part ${currentPartNumber} uploaded successfully.`);
              partsInfo.push({
                ETag: response.headers.etag,
                PartNumber: currentPartNumber,
              });
            } else {
              console.warn(
                `Part ${currentPartNumber} upload did not return an ETag.`
              );
            }
          } catch (error) {
            console.error(`Error uploading part ${currentPartNumber}:`, error);
            throw new Error(`Failed to upload part ${currentPartNumber}`);
          }
        })
      );

      offset += chunkSize;
      partNumber++;
    }

    // Wait for all parts to complete
    await Promise.all(uploadPromises);

    if (partsInfo.length !== partNumber - 1) {
      throw new Error("Some parts failed to upload. Please retry.");
    }

    await completeUpload(uploadId, file.name, partsInfo);
    console.log("Video upload completed successfully");
  } catch (error) {
    console.error("Video upload failed:", error);
  }
};

export default handleUpload;
