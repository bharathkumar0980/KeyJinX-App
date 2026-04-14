// ==========================================
// KeyJinX - Trapezoid Command Bar Logic
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  const navMenu = document.getElementById("navMenu");
  const token = localStorage.getItem("keyjinx_token");

  const userName = localStorage.getItem("keyjinx_user_name");
  const userEmail = localStorage.getItem("keyjinx_user_email");
  const identifier = userName || userEmail || "UNKNOWN";

  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  if (navMenu) {
    // 1. CORE
    let menuItems = `
            <li><a href="index.html" class="${currentPage === "index.html" ? "active" : ""}" title="Home"><i class="fa-solid fa-house"></i></a></li>
        `;

    // 2. SECURE OPS (Auth Only)
    if (token) {
      menuItems += `
                <li><a href="manager.html" class="${currentPage === "manager.html" ? "active" : ""}" title="Vault"><i class="fa-solid fa-vault"></i></a></li>
            `;
    }
    // 3. CIPHER TOOLS (Dropdown)
    menuItems += `
            <li class="dropdown">
                <a href="#" class="dropbtn" title="Cryptographic Tools"><i class="fa-solid fa-microchip"></i></a>
                <div class="dropdown-content">
                    <a href="text_encrypt.html"><i class="fa-solid fa-user-secret"></i> Text Transcoder</a>
                    <a href="image_vault.html"><i class="fa-solid fa-file-image"></i> Image Cipher</a>
                </div>
            </li>
        `;

    // 4. INTEL & COMMS
    menuItems += `
            <li><a href="about.html" class="${currentPage === "about.html" ? "active" : ""}" title="System Intel"><i class="fa-solid fa-circle-info"></i></a></li>
            <li><a href="contact.html" class="${currentPage === "contact.html" ? "active" : ""}" title="Secure Comms"><i class="fa-solid fa-envelope"></i></a></li>
        `;

    // 5. ROOT ACCESS (Admin Only)
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.role === "The Admin") {
          menuItems += `<li><a href="admin.html" class="${currentPage === "admin.html" ? "active" : ""}" title="Mainframe Root" style="color: #FF00C8;"><i class="fa-solid fa-terminal"></i></a></li>`;
        }
      } catch (e) {
        console.error("Access error", e);
      }

      // 6. IDENTITY & POWER (Trapezoid Block)
      menuItems += `
                <li class="nav-session-block">
                    <a href="profile.html" class="op-info" title="Access Profile Settings">
                        <span class="op-label">OP_ACTIVE</span>
                        <span class="op-name">${identifier.split(" ")[0].split("@")[0].toUpperCase()}</span>
                    </a>
                    <div id="logoutBtn" class="logout-square" title="Terminate Session">
                        <i class="fa-solid fa-power-off"></i>
                    </div>
                </li>
            `;
    } else {
      // Login for Public Users
      menuItems += `
                <li><a href="login.html" class="${currentPage === "login.html" ? "active" : ""}" title="Login" style="margin-right: 20px;"><i class="fa-solid fa-right-to-bracket"></i></a></li>
            `;
    }

    navMenu.innerHTML = menuItems;

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "login.html";
    });
  }
});

// Clocks and Utilities...
setInterval(() => {
  const now = new Date();
  const utcClock = document.getElementById("clock");
  const locClock = document.getElementById("localClock");
  if (utcClock) utcClock.textContent = now.toUTCString().slice(17, 25);
  if (locClock)
    locClock.textContent = now.toLocaleTimeString("en-US", { hour12: false });
}, 1000);

window.goBack = function () {
  window.history.back();
};
