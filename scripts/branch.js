const apiKEY = 'lkbNT9OIVgQSh6OD7xBQbwjAXTjSqBARRS3afBRtskDfMfr9uePKIXViAbqmpUZA5QsLFhCapbyhBUl6BbFI8wyTdbYBFjLKTFGfPChXajQlXm3hnCeH9AS8QF50K6Y6uY2w4QM4tFBZRZO8kYUiJAOVEe8h2BVdir4EIqlX8LZk1KPKJi6WAUyHoEJgtKD6DT26oPwYxAZyhw2vWmFY7A3YCtgle7Bgd8OSnj8dhEtEVD4Ys5boDIZsKmL8yujy';
// --- ตั้งค่าพื้นฐาน ---
const API_KEY = apiKEY; // ⚠️ อย่าลืมแก้ให้ตรงกับในไฟล์ .env ของ Server นะครับ
const BASE_URL = 'http://localhost:3000';

// สร้างตัวแปรไว้เก็บข้อมูลตอนเปิด Pop-up
let allBranchesData = {};
let currentImages = [];
let currentIndex = 0;

// --- ฟังก์ชันสำหรับยิง API ---
async function callApi(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            }
        };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(BASE_URL + endpoint, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data; // ส่งกลับเป็น Object JSON
    } catch (error) {
        console.error('API Error:', error);
        alert('❌ เชื่อมต่อ server ไม่ได้: ' + error.message);
    }
}

// --- ฟังก์ชันดึงข้อมูลมาแสดงหน้าเว็บ ---
async function fetchBranches() {
    const tangrianBox = document.getElementById('tangrian-list');
    const otherBox = document.getElementById('other-list');    

    if (tangrianBox) tangrianBox.innerHTML = '';
    if (otherBox) otherBox.innerHTML = '';

    try {
        // 1. เรียก API ไปดึงข้อมูล (เรียกแค่นี้พอ เพราะ callApi จัดการให้หมดแล้ว)
        const res = await callApi('/branches', 'GET');

        // 2. เช็คว่ามีข้อมูลหรือไม่ (หลังบ้านคุณส่ง { success: true, branches: [...] } กลับมา)
        if (!res || !res.success || !res.branches || res.branches.length === 0) {
            if (tangrianBox) tangrianBox.innerHTML = '<p>ยังไม่มีข้อมูลสาขาในขณะนี้</p>';
            return;
        }
        
        // 3. วนลูป (Loop) สร้างการ์ดทีละสาขา
        res.branches.forEach(branch => {
            // เก็บข้อมูลสาขานี้ลง Object ใหญ่ เพื่อให้ Pop-up ดึงไปใช้ต่อได้ (ใช้ _id จาก MongoDB)
            allBranchesData[branch._id] = branch;

            // ดึงรูปปก (ถ้า imageCover เป็น Array ให้ดึงช่องแรก, ถ้าไม่มีให้ใส่รูปปลอม)
            let coverImage = 'https://placehold.co/600x400';
            if (branch.imageCover && branch.imageCover.length > 0) {
                coverImage = branch.imageCover[0]; 
            }

            // ตัดรายละเอียดให้สั้นลง
            let shortDetail = branch.detail ? branch.detail.substring(0, 50) + '...' : 'ไม่มีรายละเอียด';

            // สร้าง HTML ของการ์ด
            const card = `
                <div class="branch-card">
                    <img src="${coverImage}" class="branch-img" alt="${branch.name}">
                    <div class="branch-details">
                        <h3>${branch.name}</h3>
                        <p>${shortDetail}</p> 
                    </div>
                    <div class="card-actions">
                        <button onclick="openPopup('${branch._id}')" class="action-btn" style="cursor:pointer; border:none;">
                            More Detail
                        </button>
                        <a href="${branch.map_link || '#'}" target="_blank" class="action-btn">Map</a>
                    </div>
                </div>
            `;

            // 4. แยกหมวดหมู่ว่าให้ไปอยู่กล่องไหน
            if (branch.category === 'tangrian') { // เช็คชื่อให้ตรงกับที่คุณตั้งในระบบ Admin
                if (tangrianBox) tangrianBox.innerHTML += card;
            } else {
                if (otherBox) otherBox.innerHTML += card;
            }
        });

    } catch (error) {
        console.error('Error fetching branches:', error);
        if (tangrianBox) tangrianBox.innerHTML = '<p style="color:red;">โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่</p>';
    }
}

// --- ส่วน Pop-up ---
window.openPopup = function(id) {
    const data = allBranchesData[id];
    if (!data) return;

    // 1. รวมรูปภาพ (รูปปก + รูปใน Gallery)
    currentImages = [];
    if (data.imageCover && data.imageCover.length > 0) {
        currentImages.push(data.imageCover[0]); 
    }
    
    // สังเกตว่าผมใช้ garelly ตามที่คุณตั้งชื่อในฐานข้อมูล
    if (data.garelly && Array.isArray(data.garelly)) {
        currentImages = currentImages.concat(data.garelly); 
    }
    
    // กันเหนียว: ถ้าไม่มีรูปเลย
    if (currentImages.length === 0) currentImages.push('https://placehold.co/600x400');

    currentIndex = 0;

    // ใส่ข้อมูล
    document.getElementById('modal-title').innerText = data.name;
    document.getElementById('modal-desc').innerText = data.detail || '-';

    // โชว์รูป
    updateSlide();

    // เปิด Modal
    document.getElementById('branch-modal').style.display = 'flex';
}

window.changeSlide = function(n) {
    currentIndex += n;
    if (currentIndex >= currentImages.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = currentImages.length - 1;
    updateSlide();
}

function updateSlide() {
    const imgElement = document.getElementById('modal-img');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const counter = document.getElementById('slide-counter');

    imgElement.src = currentImages[currentIndex];

    // ถ้ามีมากกว่า 1 รูป ให้โชว์ปุ่มเลื่อน
    if (currentImages.length > 1) {
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
        counter.innerText = `${currentIndex + 1} / ${currentImages.length}`;
        counter.style.display = 'block';
    } else {
        // ถ้ามีรูปเดียว ซ่อนปุ่มทิ้งให้หมด
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
        counter.style.display = 'none';
    }
}

window.closePopup = function() {
    document.getElementById('branch-modal').style.display = 'none';
}

window.onclick = function(event) {
    const modal = document.getElementById('branch-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// สั่งทำงานตอนเปิดหน้าเว็บ
document.addEventListener('DOMContentLoaded', fetchBranches);