import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA87cosA-moPLr0W48ZHJExgE6D2HMMkFM",
    authDomain: "tangrian-web.firebaseapp.com",
    projectId: "tangrian-web",
    storageBucket: "tangrian-web.firebasestorage.app",
    messagingSenderId: "270323183242",
    appId: "1:270323183242:web:9d2204359647f4ddcf0773",
    measurementId: "G-C5ETY84ETR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ตัวแปร Global
let allBranchesData = {};
let currentImages = [];
let currentIndex = 0;

async function fetchBranches() {
    const tangrianBox = document.getElementById('tangrian-list');
    const otherBox = document.getElementById('other-list');

    if (tangrianBox) tangrianBox.innerHTML = '';
    if (otherBox) otherBox.innerHTML = '';

    try {
        const querySnapshot = await getDocs(collection(db, "branch"));

        if (querySnapshot.empty) {
            if (tangrianBox) tangrianBox.innerHTML = '<p>ไม่พบข้อมูลสาขา</p>';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            allBranchesData[doc.id] = data; // จำข้อมูลไว้ใช้ตอนกด

            const card = `
                <div class="branch-card">
                    <img src="${data.imgUrl || 'https://placehold.co/600x400'}" class="branch-img">
                    <div class="branch-details">
                        <h3>${data.name}</h3>
                        <p>${data.detail ? data.detail.substring(0, 50) + '...' : '...'}</p> 
                    </div>
                    <div class="card-actions">
                        <button onclick="openPopup('${doc.id}')" class="action-btn" style="cursor:pointer; border:none;">
                            More Detail
                        </button>
                        <a href="${data.mapLink || '#'}" target="_blank" class="action-btn">Map</a>
                    </div>
                </div>
            `;

            if (data.category === 'tangrian') {
                if (tangrianBox) tangrianBox.innerHTML += card;
            } else {
                if (otherBox) otherBox.innerHTML += card;
            }
        });

    } catch (e) {
        console.error("Error:", e);
    }
}

// --- ส่วน Pop-up ---

window.openPopup = function(id) {
    const data = allBranchesData[id];
    if (!data) return;

    // 1. รวมรูปภาพ (รูปปก + รูปใน Gallery)
    currentImages = [];
    if (data.imgUrl) currentImages.push(data.imgUrl); // รูปปก
    if (data.gallery && Array.isArray(data.gallery)) {
        currentImages = currentImages.concat(data.gallery); // รูปเสริม
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

document.addEventListener('DOMContentLoaded', fetchBranches);