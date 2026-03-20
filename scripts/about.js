document.addEventListener("DOMContentLoaded", function() {
    // เลือกทุก element ที่มี class 'fade-in'
    const fadeElements = document.querySelectorAll('.fade-in');

    // สร้างตัวตรวจจับ (Observer)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // ถ้า element โผล่เข้ามาในหน้าจอแล้ว
            if (entry.isIntersecting) {
                entry.target.classList.add('visible'); // เติม class visible เพื่อเริ่ม animation
            }
        });
    }, {
        threshold: 0.15 // ให้เห็นสัก 15% ของ element ก่อนค่อยแสดง
    });

    // สั่งให้ observer เฝ้าดูทุก element
    fadeElements.forEach(el => observer.observe(el));
});