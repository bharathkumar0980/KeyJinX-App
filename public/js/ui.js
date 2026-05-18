/**
 * @file ui.js
 * @description Shared UI utility functions for the Vault Manager page.
 * Handles password visibility toggling and real-time password strength analysis.
 */

/**
 * Toggle Password Visibility
 * Switches the input type between 'password' and 'text', updating the icon
 * colour to provide a clear visual indicator of the current state.
 * @param {string} inputId - The ID of the target input element.
 * @param {HTMLElement} iconElement - The Font Awesome icon element to update.
 */
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

/**
 * Password Strength Analyser
 * Evaluates the strength of a given password against 5 criteria (length,
 * lowercase, uppercase, numbers, special chars) and updates the strength bar UI.
 * @param {string} password - The raw password string to evaluate.
 */
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