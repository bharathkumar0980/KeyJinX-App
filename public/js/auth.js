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
  document
    .getElementById("registerForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("regEmail").value;
      const password = document.getElementById("regPassword").value;
      const confirm = document.getElementById("regConfirmPassword").value;

      if (password !== confirm)
        return showToast("Passwords do not match", "error");

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(
          `🚨 EMERGENCY RECOVERY KEY 🚨\n\n${data.recoveryKey}\n\nSAVE THIS NOW. If you lose your password, this is the ONLY way to recover your vault. We do not store this in plain text!`,
        );
        showToast(data.message);
        document.getElementById("showLoginBtn").click();
      } else {
        showToast(data.message, "error");
      }
    });

  // 3. Login Submission
  document
    .getElementById("loginForm")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      // Inside your login fetch request in auth.js:
      // Inside your login fetch request in auth.js
      if (res.ok) {
        localStorage.setItem("keyjinx_token", data.token);

        // 🛠️ FIX 1: Save the email as the initial fallback identifier
        const email = document.getElementById("loginEmail").value;
        localStorage.setItem("keyjinx_user_email", email);

        const rawPassword = document.getElementById("loginPassword").value;
        const vaultKey = CryptoJS.SHA256(rawPassword).toString();
        sessionStorage.setItem("keyjinx_vault_key", vaultKey);

        showToast("Authentication successful. Decrypting vault...", "success");
        setTimeout(() => {
          window.location.href = "manager.html";
        }, 1500);
      } else {
        showToast(data.message, "error");
      }
    });
});

// 4. Emergency Override Submission
document.getElementById("resetForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("resetEmail").value;
  const recoveryKey = document.getElementById("recoveryKey").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmNewPassword").value;

  // 🛠️ NEW: Validation Check to prevent accidental lockouts
  if (newPassword !== confirmPassword) {
    return showToast("New passwords do not match. Aborting.", "error");
  }

  try {
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, recoveryKey, newPassword }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast("Vault Recalibrated. Data Purged.");
      // Redirect to login so they can use their new password
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2500);
    } else {
      showToast(data.message, "error");
    }
  } catch (error) {
    console.error("Reset Error:", error);
    showToast("Communication link severed.", "error");
  }
});

function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  toast.innerText = msg;
  toast.className = "show " + type;
  setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}
