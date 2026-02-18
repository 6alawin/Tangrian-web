const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.getElementById('nav-menu');


mobileMenu.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

document.addEventListener("DOMContentLoaded", function() {
    const fadeElements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.15 // ให้เห็นเนื้อหา 15% ก่อนค่อยแสดง
    });

    fadeElements.forEach(el => observer.observe(el));
});