/**
 * @file contact.js
 * @description Handles contact form submissions by posting plain-text inquiries to the backend.
 * These messages are stored unencrypted and are only visible to the Admin via the dashboard.
 */

/**
 * Contact Form Submission Handler
 * Gathers form data and POSTs it to the API. No authentication is required
 * since this is an open channel for public enquiries.
 */
document.getElementById('contactForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        // Parse the JSON response (the catch-all SPA route would otherwise return index.html)
        const data = await response.json();

        if (response.ok) {
            contactToast("Message encrypted and sent! 📨");
            e.target.reset(); 
        } else {
            contactToast(data.message || "Submission failed.", "error");
        }
    } catch (error) {
        console.error("Connection Error:", error);
        contactToast("Server is unreachable.", "error");
    }
});

/**
 * Utility: Contact Page Toast Notification
 * Standalone toast isolated from script.js to avoid cross-page dependency.
 */
function contactToast(msg, type = "success") {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        document.body.appendChild(toast);
    }
    toast.innerText = msg;
    toast.className = "show " + type;
    setTimeout(() => { toast.className = ""; }, 3000);
}