/**
 * KEYJINX - Contact Form Handler
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

        // This will now receive actual JSON instead of index.html
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