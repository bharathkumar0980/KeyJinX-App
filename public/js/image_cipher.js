/**
 * KEYJINX - Image Encryption Logic
 * Client-Side Zero-Knowledge Protocol
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
                
                // 3. 🛠️ FIX: Convert the DataURL string into a REAL Binary Blob
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
        reader.readAsDataURL(file); // Read binary image -> text DataURL
    } else {
        reader.readAsText(file);    // Read .kjx file -> text ciphertext
    }
}

// 🛠️ HELPER: Converts Base64 "Text" into "Binary" Data
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

function createDownload(content, fileName, mimeType, isDataURL) {
    const container = document.getElementById('downloadLinkContainer');
    
    // 🛠️ FIX: Use the helper for images, keep text for .kjx files
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