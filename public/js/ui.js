// ==========================================
// KeyJinX - User Interface & Experience Logic
// ==========================================

// Toggle Password Visibility in the Vault
function toggleVaultVisibility(inputId, iconElement) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        iconElement.classList.remove("fa-eye");
        iconElement.classList.add("fa-eye-slash");
        iconElement.style.color = "#ff6600"; // Light up Hextech Orange
    } else {
        input.type = "password";
        iconElement.classList.remove("fa-eye-slash");
        iconElement.classList.add("fa-eye");
        iconElement.style.color = "rgba(255, 255, 255, 0.5)"; // Dim
    }
}

// Check Password Strength for New Entries
function checkVaultStrength(password) {
    const bar = document.getElementById("vault-strength-bar");
    const text = document.getElementById("vault-strength-text");

    if (password.length === 0) {
        bar.style.width = "0%";
        bar.style.backgroundColor = "transparent";
        text.innerText = "Awaiting input...";
        return;
    }

    let strength = 0;
    if (password.length > 7) strength += 1; 
    if (password.match(/[a-z]+/)) strength += 1; 
    if (password.match(/[A-Z]+/)) strength += 1; 
    if (password.match(/[0-9]+/)) strength += 1; 
    if (password.match(/[$@#&!%*?]+/)) strength += 1; 

    switch (strength) {
        case 1:
        case 2:
            bar.style.width = "33%";
            bar.style.backgroundColor = "#ff4c4c"; 
            text.innerText = "Weak - Hackers will laugh at this";
            break;
        case 3:
        case 4:
            bar.style.width = "66%";
            bar.style.backgroundColor = "#ffaa00"; 
            text.innerText = "Moderate - Getting harder to crack";
            break;
        case 5:
            bar.style.width = "100%";
            bar.style.backgroundColor = "#00e676"; 
            text.innerText = "Strong - Vault Locked Tight 🔒";
            break;
    }
}