const $ = (id) => document.getElementById(id);
const token = localStorage.getItem("keyjinx_token");

if (!token) window.location.href = "login.html";

// 1. Fetch and Populate Data
window.onload = async () => {
  try {
    const res = await fetch("/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("keyjinx_token");
      window.location.href = "login.html";
      return;
    }

    const data = await res.json();

    $("val-name").innerText = data.name || "Unknown Operative";
    $("val-email").innerText = data.email;
    $("roleDisplay").innerText = `CLEARANCE: ${data.role.toUpperCase()}`;
  } catch (error) {
    showMsg("Failed to connect to mainframe.", "error");
  }
};

// 2. Toggle Edit Panels
window.toggleEdit = function (field) {
  const panel = $(`edit-${field}`);
  const row = $(`row-${field}`);

  if (panel.classList.contains("active")) {
    panel.classList.remove("active");
    row.style.display = "flex";
  } else {
    panel.classList.add("active");
    row.style.display = "none";

    if (field === "name") $("input-name").value = $("val-name").innerText;
    if (field === "email") $("input-email").value = $("val-email").innerText;
    if (field === "password") {
      $("input-curr-pass").value = "";
      $("input-new-pass").value = "";
      $("input-confirm-pass").value = ""; // 🛠️ Clear the new confirm field
    }
  }
};

// 3. Save Specific Field & Handle Cryptographic Migration
window.saveField = async function (field) {
  const payload = {};

  if (field === "name") payload.name = $("input-name").value;
  if (field === "email") payload.email = $("input-email").value;

  // 🛠️ ZERO-KNOWLEDGE MIGRATION LOGIC
  if (field === "password") {
    payload.currentPassword = $("input-curr-pass").value;
    payload.newPassword = $("input-new-pass").value;
    const confirmPassword = $("input-confirm-pass").value;

    if (!payload.currentPassword || !payload.newPassword || !confirmPassword) {
      return showMsg("All password fields are required.", "error");
    }
    if (payload.newPassword !== confirmPassword) {
      return showMsg("New credentials do not match. Aborting.", "error");
    }

    showMsg(
      "Initiating Cryptographic Migration... Do not close window.",
      "success",
    );

    try {
      // Step A: Derive the Old and New Keys
      const oldKey = CryptoJS.SHA256(payload.currentPassword).toString();
      const newKey = CryptoJS.SHA256(payload.newPassword).toString();

      // Step B: Download the current encrypted vault
      const vaultRes = await fetch("/api/vault", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const rawVault = await vaultRes.json();

      // Step C: Decrypt with Old Key, Re-encrypt with New Key
      const reEncryptedVault = rawVault.map((entry) => {
        // Decrypt
        const bytes = CryptoJS.AES.decrypt(entry.password, oldKey);
        const plainPassword = bytes.toString(CryptoJS.enc.Utf8);

        if (!plainPassword)
          throw new Error("Invalid current password. Cannot decrypt vault.");

        // Re-encrypt
        const newCiphertext = CryptoJS.AES.encrypt(
          plainPassword,
          newKey,
        ).toString();
        return { _id: entry._id, password: newCiphertext };
      });

      // Step D: Send the Re-Encrypted Vault to the Server
      const migrateRes = await fetch("/api/vault/migrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ encryptedVault: reEncryptedVault }),
      });

      if (!migrateRes.ok) throw new Error("Failed to upload migrated vault.");
    } catch (error) {
      console.error(error);
      return showMsg(
        error.message || "Migration failed. Your password was NOT changed.",
        "error",
      );
    }
  }

  // 🛠️ STANDARD PROFILE UPDATE LOGIC (Proceeds if migration succeeds or if just updating Name/Email)
  try {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      if (data.passwordChanged) {
        showMsg(
          "Vault Migrated & Credentials updated. Terminating Session...",
          "success",
        );
        setTimeout(() => {
          localStorage.removeItem("keyjinx_token");
          sessionStorage.removeItem("keyjinx_vault_key"); // Wipe the memory key!
          window.location.href = "login.html";
        }, 2000);
      } else {
        if (data.user.name) {
          $("val-name").innerText = data.user.name;
          localStorage.setItem("keyjinx_user_name", data.user.name); // Update memory
        }
        if (data.user.email) {
          $("val-email").innerText = data.user.email;
          localStorage.setItem("keyjinx_user_email", data.user.email); // Update fallback
        }

        showMsg(data.message, "success");
        toggleEdit(field);

        // 🛠️ REFRESH HUD: Trigger a quick reload to re-render the navbar with the new name
        setTimeout(() => location.reload(), 1000);
      }
    } else {
      showMsg(data.message || "Update failed.", "error");
    }
  } catch (error) {
    showMsg("Transmission error.", "error");
  }
};

// 4. Message System
function showMsg(text, type) {
  const box = $("msgBox");
  box.textContent = text;
  box.style.display = "block";
  box.className = type === "success" ? "msg-success" : "msg-error";

  setTimeout(() => {
    if (
      box.className !== "msg-success" ||
      text !== "Credentials updated. Session terminated. Redirecting..."
    ) {
      box.style.display = "none";
    }
  }, 4000);
}
