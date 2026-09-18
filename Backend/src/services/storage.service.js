import ImageKit from 'imagekit';
import { config } from '../config/config.js';

// 1. ImageKit client setup using config values
const imagekit = new ImageKit({
    publicKey: config.IMAGEKIT_PUBLIC_KEY,
    privateKey: config.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: config.IMAGEKIT_URL_ENDPOINT
});

// 2. Helper function to upload file buffer
export async function uploadFile({ buffer, fileName, folder = "snitch" }) {
    try {
        const result = await imagekit.upload({
            file: buffer, // Multer Buffer directly
            fileName: fileName,
            folder: folder
        });

        return result; // Isme result.url hoga hosted image link
    } catch (error) {
        console.error("ImageKit Upload Error:", error);
        throw error;
    }
}