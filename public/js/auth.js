/**
 * @file auth.js
 * @description Handles client-side authentication logic including registration, login, and emergency recovery.
 * Manages UI toggling between authentication states and coordinates with the backend API.
 */

document.addEventListener("DOMContentLoaded", () => {
  const loginSection = document.getElementById("loginSection");
  const registerSection = document.getElementById("registerSection");
  const showRegisterBtn = document.getElementById("showRegisterBtn");
  const showLoginBtn = document.getElementById("showLoginBtn");

  /**
   * UI Toggle Handlers
   * Switches the visible authentication forms (Login vs. Register) dynamically
   * without requiring page reloads.
   */
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

  /**
   * Registration Handler
   * Submits new user credentials. Upon success, captures and prominently displays
   * the emergency recovery key which is only returned ONCE from the server.
   */
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

  /**
   * Login Handler
   * Authenticates the user and sets up the local environment (Tokens, Roles, and Vault Keys).
   */
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
      if (res.ok) {
        localStorage.setItem("keyjinx_token", data.token);

        // Persist email identifier for UI context (e.g., Navbar profile)
        const email = document.getElementById("loginEmail").value;
        localStorage.setItem("keyjinx_user_email", email);

        const rawPassword = document.getElementById("loginPassword").value;
        const vaultKey = CryptoJS.SHA256(rawPassword).toString();
        sessionStorage.setItem("keyjinx_vault_key", vaultKey);

        // Decode JWT payload to determine user role and redirect to the appropriate dashboard
        const tokenPayload = JSON.parse(atob(data.token.split(".")[1]));
        const userRole = tokenPayload.role;
        localStorage.setItem("keyjinx_user_role", userRole);

        showToast("Authentication successful. Decrypting vault...", "success");
        setTimeout(() => {
          // Redirect to admin page if user is an admin, otherwise to manager
          const redirectPage =
            userRole === "The Admin" ? "admin.html" : "manager.html";
          window.location.href = redirectPage;
        }, 1500);
      } else {
        showToast(data.message, "error");
      }
    });
});

/**
 * Emergency Override / Password Reset Handler
 * Submits the recovery key along with a new password to recalibrate the vault.
 * Note: Resetting the password purges existing encrypted data due to key regeneration.
 */
document.getElementById("resetForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("resetEmail").value;
  const recoveryKey = document.getElementById("recoveryKey").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirmPassword = document.getElementById("confirmNewPassword").value;

  // Validation Check: Ensure new passwords match to prevent accidental lockouts after recovery
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
