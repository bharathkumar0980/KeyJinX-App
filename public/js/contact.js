/**
 * CONTACT FORM HANDLER
 * =====================
 * Handles contact form submission
 */

document.getElementById('contactForm').addEventListener('submit', function(e) {
    // Prevent default form submission
    e.preventDefault();
    
    // Get form values
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const subject = document.getElementById('subject').value;
    const message = document.getElementById('message').value;
    
    // In a real application, you would send this data to a server
    // For now, we'll just show a success message
    alert(`Thank you, ${name}! Your message has been sent.\n\nWe'll respond to ${email} soon.`);
    
    // Clear the form
    document.getElementById('contactForm').reset();
});