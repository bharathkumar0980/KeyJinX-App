// ==========================================
// KeyJinX - Authentication UI Logic
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const loginSection = document.getElementById("loginSection");
    const registerSection = document.getElementById("registerSection");
    const showRegisterBtn = document.getElementById("showRegisterBtn");
    const showLoginBtn = document.getElementById("showLoginBtn");

    // 1. UI Toggle Logic
    showRegisterBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        loginSection.style.display = "none";
        registerSection.style.display = "block";
        document.getElementById("pageTitle").innerText = "INITIALIZE PROTOCOL";
    });

    showLoginBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        registerSection.style.display = "none";
        loginSection.style.display = "block";
        document.getElementById("pageTitle").innerText = "VAULT ACCESS";
    });

    // 2. Register Submission
    document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("regEmail").value;
        const password = document.getElementById("regPassword").value;
        const confirm = document.getElementById("regConfirmPassword").value;

        if (password !== confirm) return showToast("Passwords do not match", "error");

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            showToast(data.message);
            showLoginBtn.click();
        } else {
            showToast(data.message, "error");
        }
    });

    // 3. Login Submission
    document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("keyjinx_token", data.token);
            showToast("Authenticated. Entering Vault...");
            setTimeout(() => window.location.href = "manager.html", 1000);
        } else {
            showToast(data.message, "error");
        }
    });
});

function showToast(msg, type = "success") {
    const toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.className = "show " + type;
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}