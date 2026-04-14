// ==========================================
// KeyJinX Vault - Frontend Client Logic
// (Zero-Knowledge Architecture Enabled)
// ==========================================

// 1. Fetch and Display Passwords from MongoDB Cloud
async function showPasswords() {
  const token = localStorage.getItem("keyjinx_token");

  // 🛠️ FIX 2: If the name isn't in the cache, fetch it from the profile
  if (!localStorage.getItem("keyjinx_user_name")) {
    try {
      const profileRes = await fetch("/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();

      if (profileRes.ok && profileData.name) {
        // Save "Bharath" to local storage
        localStorage.setItem("keyjinx_user_name", profileData.name);
        // Refresh the navbar display
        location.reload();
      }
    } catch (err) {
      console.error("Identity sync failed", err);
    }
  }
  const table = document.querySelector("table");
  const vaultKey = sessionStorage.getItem("keyjinx_vault_key"); // 🛠️ ZERO-KNOWLEDGE: Get the decryption key

  if (!token) {
    console.warn("No token found, redirecting to login...");
    window.location.href = "login.html";
    return;
  }

  // 🛠️ ZERO-KNOWLEDGE: If they have a token but no memory key (e.g., opened a new tab), force re-login
  if (!vaultKey) {
    console.warn(
      "No decryption key found in active memory. Forcing re-authentication.",
    );
    localStorage.removeItem("keyjinx_token");
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch("/api/vault", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("keyjinx_token");
      sessionStorage.removeItem("keyjinx_vault_key");
      window.location.href = "login.html";
      return;
    }

    const rawData = await response.json();

    if (rawData.length === 0) {
      table.innerHTML = `
                <tr>
                    <th>Website</th>
                    <th>Username</th>
                    <th>Password</th>
                    <th>Action</th>
                </tr>
                <tr><td colspan="4" style="text-align:center; padding: 20px;">Vault is empty. Add a credential above!</td></tr>
            `;
      return;
    }

    // 🛠️ ZERO-KNOWLEDGE: Decrypt the ciphertext arriving from the server
    const decryptedData = rawData.map((entry) => {
      try {
        const bytes = CryptoJS.AES.decrypt(entry.password, vaultKey);
        const plainPassword = bytes.toString(CryptoJS.enc.Utf8);

        if (!plainPassword) throw new Error("Decryption failed");

        return { ...entry, password: plainPassword };
      } catch (err) {
        // If a password was encrypted with an old master password
        return { ...entry, password: "CORRUPTED_DATA" };
      }
    });

    let str = `
            <tr>
                <th>Website</th>
                <th>Username</th>
                <th>Password</th>
                <th>Action</th>
            </tr>
        `;

    // Loop through the Decrypted Data
    decryptedData.forEach((element) => {
      str += `
    <tr>
        <td>${element.website}</td>
        <td>${element.username}</td>
        <td>
            <div class="password-cell">
                <span class="vault-text masked" id="pw-${element._id}">${element.password}</span>

                <div class="vault-actions">
                    <button class="action-btn" title="Toggle Visibility" onclick="toggleMask('${element._id}', this)">
                        <i class="fa-solid fa-eye"></i>
                    </button>
                    <button class="action-btn" title="Copy" onclick="copyPassword('${element.password.replace(/'/g, "\\'")}')">
                        <i class="fa-solid fa-copy"></i>
                    </button>
                </div>
            </div>
        </td>
        <td>
        <button class="action-btn edit-btn" onclick="editEntry('${element._id}', '${element.website}', '${element.username}')" title="Edit Entry">
            <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button class="action-btn delete-btn" onclick="deletePassword('${element._id}')" title="Delete Entry">
            <i class="fa-solid fa-trash"></i>
        </button>
    </td>
    </tr>
  `;
    });

    table.innerHTML = str;
  } catch (error) {
    console.error("Failed to load vault:", error);
    table.innerHTML =
      "<tr><td colspan='4'>Error loading vault data. Check if server is running.</td></tr>";
  }
}

// 2. Intercept the manager.html Form Submit (Handles both SAVE and UPDATE)
document.querySelector("form").addEventListener("submit", async function (e) {
  e.preventDefault();

  const token = localStorage.getItem("keyjinx_token");
  const vaultKey = sessionStorage.getItem("keyjinx_vault_key"); // 🛠️ ZERO-KNOWLEDGE: Get the encryption key

  if (!vaultKey) {
    showToast("Encryption key lost. Please log in again.", "error");
    setTimeout(() => (window.location.href = "login.html"), 1500);
    return;
  }

  const website = document.getElementById("website").value;
  const username = document.getElementById("username").value;
  const rawPassword = document.getElementById("password").value;

  // 🛠️ ZERO-KNOWLEDGE: Encrypt the password BEFORE it leaves the browser
  const encryptedPassword = CryptoJS.AES.encrypt(
    rawPassword,
    vaultKey,
  ).toString();

  const editId = e.target.dataset.editId;
  const method = editId ? "PUT" : "POST";
  const url = editId ? `/api/vault/${editId}` : "/api/vault";

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // 🛠️ ZERO-KNOWLEDGE: Send the ciphertext, not the raw password
      body: JSON.stringify({ website, username, password: encryptedPassword }),
    });

    if (response.ok) {
      e.target.reset();

      delete e.target.dataset.editId;

      const submitBtn = e.target.querySelector("button");
      submitBtn.innerHTML = `Submit <i class="fa-solid fa-floppy-disk"></i>`;

      showToast(
        editId
          ? "Vault entry updated!"
          : "Credential encrypted & locked in the Cloud!",
      );

      showPasswords();
    } else {
      showToast("Failed to process request.", "error");
    }
  } catch (error) {
    console.error("Error processing vault entry:", error);
    showToast("Server communication failed.", "error");
  }
});

// 3. Delete a Password via API
async function deletePassword(id) {
  const confirmDelete = confirm(
    "Are you sure you want to vaporize this entry from the database?",
  );
  if (!confirmDelete) return;

  const token = localStorage.getItem("keyjinx_token");

  try {
    const response = await fetch(`/api/vault/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      showToast("Entry vaporized.");
      showPasswords();
    } else {
      showToast("Failed to delete entry.", "error");
    }
  } catch (error) {
    console.error("Error deleting password:", error);
  }
}

// 4. Utility: Copy Password to Clipboard
function copyPassword(passwordText) {
  navigator.clipboard
    .writeText(passwordText)
    .then(() => {
      showToast("Password copied to clipboard!");
    })
    .catch((err) => {
      console.error("Could not copy text: ", err);
      showToast("Failed to copy.", "error");
    });
}

// 5. Utility: Toggle Password Visibility
function toggleMask(id, btn) {
  const textSpan = document.getElementById(`pw-${id}`);
  const icon = btn.querySelector("i");

  if (textSpan.classList.contains("masked")) {
    textSpan.classList.remove("masked");
    textSpan.classList.add("unmasked");
    icon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    textSpan.classList.remove("unmasked");
    textSpan.classList.add("masked");
    icon.classList.replace("fa-eye-slash", "fa-eye");
  }
}

// 6. Utility: Custom Toast Notifications
function showToast(message, type = "success") {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";

    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.color = "#fff";
    toast.style.padding = "10px 20px";
    toast.style.borderRadius = "5px";
    toast.style.zIndex = "1000";
    toast.style.transition = "opacity 0.5s ease-in-out";
    toast.style.opacity = "0";

    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.backgroundColor = type === "error" ? "#ff4c4c" : "#4caf50";
  toast.style.opacity = "1";

  setTimeout(() => {
    toast.style.opacity = "0";
  }, 3000);
}

// 7. This function fills the form with existing data so the user can change it
function editEntry(id, website, username) {
  document.getElementById("website").value = website;
  document.getElementById("username").value = username;
  document.getElementById("password").value = "";
  const form = document.getElementById("passwordForm");

  const submitBtn = form.querySelector("button");
  submitBtn.innerHTML = `Update Entry <i class="fa-solid fa-rotate"></i>`;

  form.dataset.editId = id;
}

// Initialize the app by fetching data immediately
if (document.querySelector("table") || document.querySelector(".vault-table")) {
  showPasswords();
}
