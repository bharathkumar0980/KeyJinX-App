// ==========================================
// KeyJinX Vault - Frontend Client Logic
// ==========================================

// 1. Fetch and Display Passwords from MongoDB Cloud
async function showPasswords() {
  const table = document.querySelector("table");

  const token = localStorage.getItem("keyjinx_token");

  if (!token) {
    console.warn("No token found, redirecting to login...");
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

    // If the server says "Who are you?" (401 or 403), kick them out to login
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem("keyjinx_token");
      window.location.href = "login.html";
      return;
    }

    const data = await response.json();

    if (data.length === 0) {
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

    // Build the table headers
    let str = `
            <tr>
                <th>Website</th>
                <th>Username</th>
                <th>Password</th>
                <th>Action</th>
            </tr>
        `;

    // Loop through the MongoDB data
    data.forEach((element) => {
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
                    <button class="action-btn" title="Copy" onclick="copyPassword('${element.password}')">
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
  const website = document.getElementById("website").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // We check if the form has a 'dataset.editId' (set by the editEntry function)
  const editId = e.target.dataset.editId;

  // Decide the Method and URL based on whether we are editing or creating
  const method = editId ? "PUT" : "POST";
  const url = editId ? `/api/vault/${editId}` : "/api/vault";

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ website, username, password }),
    });

    if (response.ok) {
      e.target.reset(); // Clear inputs

      // RESET UI FROM EDIT MODE
      delete e.target.dataset.editId; // Remove the ID so next submit is a 'Save'

      const submitBtn = e.target.querySelector("button");
      submitBtn.innerHTML = `Submit <i class="fa-solid fa-floppy-disk"></i>`; // Change back to "Submit"

      showToast(
        editId ? "Vault entry updated!" : "Credential locked in the Cloud!",
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
    // Switch to UNMASKED
    textSpan.classList.remove("masked");
    textSpan.classList.add("unmasked");
    icon.classList.replace("fa-eye", "fa-eye-slash");
  } else {
    // Switch back to MASKED
    textSpan.classList.remove("unmasked");
    textSpan.classList.add("masked");
    icon.classList.replace("fa-eye-slash", "fa-eye");
  }
}

// 6. Utility: Custom Toast Notifications
function showToast(message, type = "success") {
  let toast = document.getElementById("toast");

  // Create the toast element if it doesn't exist in the HTML
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";

    // Basic inline styles so it works even without CSS updates
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

  // Fade out after 3 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 3000);
}

// 7. This function fills the form with existing data so the user can change it
function editEntry(id, website, username) {
  document.getElementById("website").value = website;
  document.getElementById("username").value = username;
  document.getElementById("password").value = ""; // Force them to enter a new password or the old one
  const form = document.getElementById("passwordForm");

  // Change the form button to "Update" instead of "Save"
  const submitBtn = form.querySelector("button");
  submitBtn.innerHTML = `Update Entry <i class="fa-solid fa-rotate"></i>`;

  // Store the ID globally so the form knows we are UPDATING, not SAVING NEW
  form.dataset.editId = id;
}

// Initialize the app by fetching data immediately
// Only run vault logic if the page actually contains the vault table
if (document.querySelector("table") || document.querySelector(".vault-table")) {
  showPasswords();
}
