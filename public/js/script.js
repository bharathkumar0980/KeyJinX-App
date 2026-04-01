// ==========================================
// KeyJinX Vault - Frontend Client Logic
// ==========================================

// 1. Fetch and Display Passwords from MongoDB Cloud
async function showPasswords() {
    const table = document.querySelector("table");
    
    try {
        const response = await fetch('/api/vault');
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
                    <td class="password-cell">
                        <span class="masked">********</span>
                        <button class="action-btn" onclick="copyPassword('${element.password}')" title="Copy Password">
                            <i class="fa-solid fa-copy"></i>
                        </button>
                    </td>
                    <td>
                        <button class="delete-btn" onclick="deletePassword('${element._id}')" title="Vaporize Entry">
                            <i class="fa-solid fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>
            `;
        });

        table.innerHTML = str;

    } catch (error) {
        console.error("Failed to load vault:", error);
        table.innerHTML = "<tr><td colspan='4'>Error loading vault data. Check if server is running.</td></tr>";
    }
}

// 2. Intercept the Form Submit and Send to Node.js API
document.querySelector("form").addEventListener("submit", async function (e) {
    e.preventDefault(); 

    const website = document.getElementById("website").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch('/api/vault', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ website, username, password })
        });

        if (response.ok) {
            e.target.reset(); // Clear the inputs
            showToast("Credential locked in the Cloud! 🚀");
            showPasswords();  // Refresh the table instantly
        } else {
            showToast("Failed to secure password.", "error");
        }
    } catch (error) {
        console.error("Error saving password:", error);
        showToast("Server communication failed.", "error");
    }
});

// 3. Delete a Password via API
async function deletePassword(id) {
    const confirmDelete = confirm("Are you sure you want to vaporize this entry from the database?");
    if (!confirmDelete) return;

    try {
        const response = await fetch(`/api/vault/${id}`, {
            method: 'DELETE'
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
    navigator.clipboard.writeText(passwordText).then(() => {
        showToast("Password copied to clipboard!");
    }).catch(err => {
        console.error('Could not copy text: ', err);
        showToast("Failed to copy.", "error");
    });
}

// 5. Utility: Custom Toast Notifications
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

// Initialize the app by fetching data immediately
showPasswords();