// ==========================================
// KeyJinX - Dual-Interface Navigation Logic
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  const navMenu = document.getElementById("navMenu");
  const token = localStorage.getItem("keyjinx_token");

  const userName = localStorage.getItem("keyjinx_user_name");
  const userEmail = localStorage.getItem("keyjinx_user_email");
  const identifier = userName || userEmail || "UNKNOWN";

  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  if (navMenu) {
    // ==========================================
    // 1. DESKTOP MENU (Icons + Dropdown)
    // ==========================================
    let desktopItems = `
      <li class="desktop-item"><a href="index.html" class="${currentPage === "index.html" ? "active" : ""}" title="Home"><i class="fa-solid fa-house"></i></a></li>
    `;

    if (token) {
      desktopItems += `<li class="desktop-item"><a href="manager.html" class="${currentPage === "manager.html" ? "active" : ""}" title="Vault"><i class="fa-solid fa-vault"></i></a></li>`;
    }

    desktopItems += `
      <li class="dropdown desktop-item">
          <a href="#" class="dropbtn" title="Cryptographic Tools"><i class="fa-solid fa-microchip"></i></a>
          <div class="dropdown-content">
              <a href="text_encrypt.html"><i class="fa-solid fa-user-secret"></i> Text Transcoder</a>
              <a href="image_vault.html"><i class="fa-solid fa-file-image"></i> Image Cipher</a>
          </div>
      </li>
      <li class="desktop-item"><a href="about.html" class="${currentPage === "about.html" ? "active" : ""}" title="System Intel"><i class="fa-solid fa-circle-info"></i></a></li>
      <li class="desktop-item"><a href="contact.html" class="${currentPage === "contact.html" ? "active" : ""}" title="Secure Comms"><i class="fa-solid fa-envelope"></i></a></li>
    `;

    if (token) {
      desktopItems += `
        <li class="nav-session-block desktop-item">
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
      desktopItems += `<li class="desktop-item"><a href="login.html" class="${currentPage === "login.html" ? "active" : ""}" title="Login" style="margin-right: 20px;"><i class="fa-solid fa-right-to-bracket"></i></a></li>`;
    }

    // ==========================================
    // 2. MOBILE MENU (Pure Text Only)
    // ==========================================
    let mobileItems = `
      <li class="mobile-item"><a href="index.html" class="${currentPage === "index.html" ? "active" : ""}">HOME</a></li>
    `;

    if (token) {
      mobileItems += `<li class="mobile-item"><a href="manager.html" class="${currentPage === "manager.html" ? "active" : ""}">VAULT</a></li>`;
    }

    mobileItems += `
      <li class="mobile-item"><a href="text_encrypt.html" class="${currentPage === "text_encrypt.html" ? "active" : ""}">TEXT TRANSCODER</a></li>
      <li class="mobile-item"><a href="image_vault.html" class="${currentPage === "image_vault.html" ? "active" : ""}">IMAGE CIPHER</a></li>
      <li class="mobile-item"><a href="about.html" class="${currentPage === "about.html" ? "active" : ""}">ABOUT</a></li>
      <li class="mobile-item"><a href="contact.html" class="${currentPage === "contact.html" ? "active" : ""}">CONTACT</a></li>
    `;

    if (token) {
      mobileItems += `
        <li class="mobile-item"><a href="profile.html" class="${currentPage === "profile.html" ? "active" : ""}">PROFILE</a></li>
        <li class="mobile-item"><a href="#" id="mobileLogoutBtn" style="color: rgb(var(--danger-rgb));">DISCONNECT</a></li>
      `;
    } else {
      mobileItems += `<li class="mobile-item"><a href="login.html" class="${currentPage === "login.html" ? "active" : ""}">LOGIN</a></li>`;
    }

    // Inject BOTH lists
    navMenu.innerHTML = desktopItems + mobileItems;

    // Logout Events
    const doLogout = () => {
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "login.html";
    };
    document.getElementById("logoutBtn")?.addEventListener("click", doLogout);
    document
      .getElementById("mobileLogoutBtn")
      ?.addEventListener("click", doLogout);
  }
});

// Clocks and Utilities
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

// ==========================================
// MOBILE HAMBURGER MENU TOGGLE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const navMenu = document.getElementById("navMenu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    const navLinks = navMenu.querySelectorAll(".mobile-item a");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      });
    });
  }
});
