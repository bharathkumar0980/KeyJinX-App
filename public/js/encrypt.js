/**
 * KEYJINX - Text Transcoder Logic
 * Zero-Knowledge Implementation
 */

function processText(mode) {
    const text = document.getElementById('rawText').value.trim();
    const key = document.getElementById('secretKey').value.trim();
    const outputField = document.getElementById('outputText');
    const resultArea = document.getElementById('resultArea');

    if (!text || !key) {
        showToast("Both Input and Key are required for transcoding.", "error");
        return;
    }

    try {
        let result = "";
        
        if (mode === 'encrypt') {
            result = CryptoJS.AES.encrypt(text, key).toString();
            showToast("Data successfully encrypted.");
        } else {
            const bytes = CryptoJS.AES.decrypt(text, key);
            result = bytes.toString(CryptoJS.enc.Utf8);
            
            if (!result) throw new Error("Invalid Key or Corrupted Data");
            showToast("Data successfully decrypted.");
        }

        outputField.value = result;
        resultArea.style.display = "block";
        
    } catch (error) {
        console.error("Transcode Error:", error);
        showToast("Operation failed: Ensure your key is correct.", "error");
        resultArea.style.display = "none";
    }
}

function copyResult() {
    const text = document.getElementById('outputText').value;
    navigator.clipboard.writeText(text).then(() => {
        showToast("Result copied to clipboard!");
    });
}

function toggleVisibility(id, icon) {
    const input = document.getElementById(id);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.replace("fa-eye-slash", "fa-eye");
    }
}

function showToast(msg, type = "success") {
    const toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.className = "show " + type;
    setTimeout(() => { toast.className = ""; }, 3000);
}