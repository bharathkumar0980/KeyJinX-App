// ==========================================
// KeyJinX - Dynamic Navigation System
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const navMenu = document.getElementById("navMenu");
    if (!navMenu) return;

    const token = localStorage.getItem("keyjinx_token");
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    let menuItems = `
        <li><a href="index.html" ${currentPage === 'index.html' ? 'class="active"' : ''}>Home</a></li>
        <li><a href="about.html" ${currentPage === 'about.html' ? 'class="active"' : ''}>About</a></li>
        <li><a href="contact.html" ${currentPage === 'contact.html' ? 'class="active"' : ''}>Contact</a></li>
    `;

    if (token) {
        menuItems += `
            <li><a href="manager.html" ${currentPage === 'manager.html' ? 'class="active"' : ''}>Manager</a></li>
            <li><a href="#" id="logoutBtn" style="color: #ff4c4c;">Logout</a></li>
        `;
    } else {
        menuItems += `<li><a href="login.html" ${currentPage === 'login.html' ? 'class="active"' : ''}>Login</a></li>`;
    }

    navMenu.innerHTML = menuItems;

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.removeItem("keyjinx_token");
        window.location.href = "login.html";
    });
});