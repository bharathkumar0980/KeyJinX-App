/**
 * @file image_cipher.js
 * @description Client-side image encryption and decryption using AES-256 (CryptoJS).
 * Implements a Zero-Knowledge Protocol: the image binary is converted to a Base64 DataURL
 * string, encrypted entirely in-browser, and saved as a proprietary `.kjx` ciphertext file.
 * The server is never involved in this process.
 */

/**
 * Toggle Secret Key Input Visibility
 * @param {string} inputId - ID of the key input field.
 * @param {HTMLElement} iconElement - The eye icon element to toggle.
 */
function toggleVisibility(inputId, iconElement) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === "password") {
        input.type = "text";
        iconElement.classList.remove("fa-eye");
        iconElement.classList.add("fa-eye-slash");
        iconElement.style.color = "#ff00c8";
    } else {
        input.type = "password";
        iconElement.classList.remove("fa-eye-slash");
        iconElement.classList.add("fa-eye");
        iconElement.style.color = "rgba(223, 248, 255, 0.5)";
    }
}

/**
 * Core Image Cipher
 * Reads the selected image file and either encrypts or decrypts it using AES-256.
 * - Encrypt: Reads as DataURL → AES encrypt → download as `.kjx` text file.
 * - Decrypt: Reads `.kjx` text → AES decrypt → validate DataURL prefix → download as PNG.
 * @param {string} mode - 'encrypt' or 'decrypt'
 */
async function processImage(mode) {
    const fileInput = document.getElementById('imageInput');
    const key = document.getElementById('cipherKey').value;
    const outputContainer = document.getElementById('outputContainer');
    const preview = document.getElementById('imagePreview');

    if (!fileInput.files[0] || !key) {
        return showToast("Please select a file and enter a key.", "error");
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    showToast("Processing cryptographic layers...");

    reader.onload = function(e) {
        const data = e.target.result;

        try {
            if (mode === 'encrypt') {
                // 1. Encrypt the Base64 DataURL
                const encrypted = CryptoJS.AES.encrypt(data, key).toString();
                
                // 2. Create the .kjx file (Encrypted Text)
                createDownload(encrypted, "secret_vault.kjx", "text/plain", false);
                preview.style.display = "none";
                showToast("Image encrypted and locked.");
            } else {
                // 1. Decrypt the ciphertext
                const decrypted = CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
                
                if (!decrypted.startsWith("data:image")) throw new Error("Invalid Key");

                // 2. Show the preview
                preview.src = decrypted;
                preview.style.display = "block";
                
                // Convert the Base64 DataURL back into a real binary Blob before download
                createDownload(decrypted, "decrypted_image.png", "image/png", true);
                showToast("Identity verified. Image unlocked.");
            }
            outputContainer.style.display = "block";
        } catch (err) {
            console.error(err);
            showToast("Decryption failed. Invalid Key.", "error");
            outputContainer.style.display = "none";
        }
    };

    if (mode === 'encrypt') {
        reader.readAsDataURL(file); // Binary image → Base64 DataURL string for AES input
    } else {
        reader.readAsText(file);    // .kjx ciphertext file → plain text for AES decryption
    }
}

/**
 * DataURL to Blob Converter
 * Splits the Base64 DataURL into MIME type and raw binary parts,
 * then constructs a typed Uint8Array to produce a true binary Blob.
 * This is required for the browser's download link to save a valid image file.
 * @param {string} dataurl - A Base64 encoded DataURL (e.g., 'data:image/png;base64,...').
 * @returns {Blob} A binary Blob of the decoded image data.
 */
function dataURLToBlob(dataurl) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]); 
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

/**
 * Create Download Link
 * Generates a temporary object URL and injects a download anchor into the DOM.
 * Uses the DataURL-to-Blob helper for images to ensure a valid binary file is saved.
 * @param {string} content - The raw content (ciphertext string or Base64 DataURL).
 * @param {string} fileName - The filename for the download.
 * @param {string} mimeType - The MIME type of the output file.
 * @param {boolean} isDataURL - If true, content is treated as a DataURL and converted to a Blob.
 */
function createDownload(content, fileName, mimeType, isDataURL) {
    const container = document.getElementById('downloadLinkContainer');
    
    // Route to binary conversion for images, or wrap raw text for .kjx cipher files
    const blob = isDataURL ? dataURLToBlob(content) : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    container.innerHTML = `
        <a href="${url}" download="${fileName}" class="btn" style="background: rgba(var(--jinx-cyan-rgb), 0.2); border: 1px solid rgb(var(--jinx-cyan-rgb));">
            DOWNLOAD PROCESSED FILE <i class="fa-solid fa-download"></i>
        </a>
    `;
}

function showToast(msg, type = "success") {
    const toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.className = "show " + type;
    setTimeout(() => { toast.className = ""; }, 3000);
}