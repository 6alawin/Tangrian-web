const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.getElementById('nav-menu');

mobileMenu.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

function toggleDropdown(e) {
    // เช็คหน้าจอ ถ้าเล็กกว่า 768px (มือถือ) ให้ทำงาน
    if (window.innerWidth <= 768) {
        e.preventDefault(); // กันไม่ให้ลิงก์เด้ง
        const dropdown = document.getElementById("joinDropdown");
        
        // สลับคลาส show (เปิด/ปิด)
        if (dropdown.style.display === "block") {
            dropdown.style.display = "none";
        } else {
            dropdown.style.display = "block";
        }
    }
}