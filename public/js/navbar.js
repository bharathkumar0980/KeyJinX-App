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
        `;

        // --- SECRET ADMIN DOOR LOGIC ---
        try {
            // Decode the JWT payload (the middle section of the token)
            const payload = JSON.parse(atob(token.split('.')[1]));
            
            // Check if the user is 'The Admin'
            if (payload.role === 'The Admin') {
                menuItems += `
                    <li><a href="admin.html" style="color: #FF00C8; text-shadow: 0 0 5px rgba(255,0,200,0.5);">
                        <i class="fa-solid fa-terminal"></i> Sentinel
                    </a></li>
                `;
            }
        } catch (error) {
            console.error("Failed to decode token for clearance check.", error);
        }

        // Add Logout button
        menuItems += `<li><a href="#" id="logoutBtn" style="color: #ff4c4c;">Logout</a></li>`;
    } else {
        menuItems += `<li><a href="login.html" ${currentPage === 'login.html' ? 'class="active"' : ''}>Login</a></li>`;
    }

    navMenu.innerHTML = menuItems;

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.removeItem("keyjinx_token");
        window.location.href = "login.html";
    });
});