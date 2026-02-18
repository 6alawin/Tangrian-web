import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// --------------------------------------------------------------
// 🔴 วาง Config ของคุณตรงนี้ (เหมือนไฟล์ branch.js) 🔴
const firebaseConfig = {
    apiKey: "AIzaSyA87cosA-moPLr0W48ZHJExgE6D2HMMkFM",
    authDomain: "tangrian-web.firebaseapp.com",
    projectId: "tangrian-web",
    storageBucket: "tangrian-web.firebasestorage.app",
    messagingSenderId: "270323183242",
    appId: "1:270323183242:web:9d2204359647f4ddcf0773",
    measurementId: "G-C5ETY84ETR"
};
// --------------------------------------------------------------

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const branchCollection = collection(db, "branch");

// โหลดข้อมูลเมื่อเปิดหน้า
document.addEventListener('DOMContentLoaded', fetchBranches);

// ฟังก์ชันดึงข้อมูลมาแสดงในตาราง
async function fetchBranches() {
    const listTable = document.getElementById('branch-list');
    const loading = document.getElementById('loading');
    
    listTable.innerHTML = '';
    loading.style.display = 'block';

    try {
        const querySnapshot = await getDocs(branchCollection);
        loading.style.display = 'none';

        if (querySnapshot.empty) {
            listTable.innerHTML = '<tr><td colspan="4" style="text-align:center;">ไม่พบข้อมูล</td></tr>';
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const row = `
                <tr>
                    <td><img src="${data.imgUrl || 'https://placehold.co/100'}" width="60" style="border-radius:5px;"></td>
                    <td>${data.name}</td>
                    <td><span class="badge ${data.category}">${data.category}</span></td>
                    <td>
                        <button class="btn edit" onclick="editBranch('${docSnap.id}')"><i class="fa-solid fa-pen"></i> แก้ไข</button>
                        <button class="btn delete" onclick="deleteBranch('${docSnap.id}', '${data.name}')"><i class="fa-solid fa-trash"></i> ลบ</button>
                    </td>
                </tr>
            `;
            listTable.innerHTML += row;
        });
        
        // เก็บข้อมูลดิบไว้ใช้ตอนกด Edit (Global Variable)
        window.allBranchData = querySnapshot.docs.reduce((acc, curr) => {
            acc[curr.id] = curr.data();
            return acc;
        }, {});

    } catch (e) {
        console.error(e);
        alert('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    }
}

// ฟังก์ชันบันทึกข้อมูล (Add หรือ Update)
document.getElementById('branch-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const docId = document.getElementById('doc-id').value;
    const name = document.getElementById('name').value;
    const category = document.getElementById('category').value;
    const detail = document.getElementById('detail').value;
    const imgUrl = document.getElementById('imgUrl').value;
    const mapLink = document.getElementById('mapLink').value;
    
    // แปลง Textarea Gallery ให้เป็น Array (แยกบรรทัด)
    const galleryText = document.getElementById('gallery').value;
    const gallery = galleryText.split('\n').map(url => url.trim()).filter(url => url !== '');

    const branchData = { name, category, detail, imgUrl, mapLink, gallery };

    try {
        if (docId) {
            // === โหมดแก้ไข (Update) ===
            await updateDoc(doc(db, "branch", docId), branchData);
            alert('✅ แก้ไขข้อมูลเรียบร้อย!');
        } else {
            // === โหมดเพิ่มใหม่ (Add) ===
            await addDoc(branchCollection, branchData);
            alert('✅ เพิ่มสาขาใหม่เรียบร้อย!');
        }

        resetForm();
        fetchBranches(); // โหลดตารางใหม่

    } catch (e) {
        console.error(e);
        alert('❌ เกิดข้อผิดพลาด: ' + e.message);
    }
});

// ฟังก์ชันเตรียมข้อมูลใส่ฟอร์มเพื่อแก้ไข
window.editBranch = function(id) {
    const data = window.allBranchData[id];
    
    document.getElementById('doc-id').value = id;
    document.getElementById('name').value = data.name;
    document.getElementById('category').value = data.category;
    document.getElementById('detail').value = data.detail || '';
    document.getElementById('imgUrl').value = data.imgUrl || '';
    document.getElementById('mapLink').value = data.mapLink || '';
    
    // แปลง Array กลับเป็นบรรทัด เพื่อใส่ใน Textarea
    if (data.gallery && Array.isArray(data.gallery)) {
        document.getElementById('gallery').value = data.gallery.join('\n');
    } else {
        document.getElementById('gallery').value = '';
    }

    // เปลี่ยนหน้าตาปุ่ม
    document.getElementById('form-title').innerText = "แก้ไขข้อมูล: " + data.name;
    document.getElementById('cancel-btn').style.display = 'inline-block';
    document.querySelector('.btn.save').innerText = 'บันทึกการแก้ไข';
    
    // เลื่อนหน้าจอไปที่ฟอร์ม
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ฟังก์ชันลบ
window.deleteBranch = async function(id, name) {
    if (confirm(`คุณต้องการลบสาขา "${name}" ใช่หรือไม่? \n(ลบแล้วกู้คืนไม่ได้นะ!)`)) {
        try {
            await deleteDoc(doc(db, "branch", id));
            alert('ลบข้อมูลเรียบร้อย');
            fetchBranches();
        } catch (e) {
            console.error(e);
            alert('ลบไม่สำเร็จ: ' + e.message);
        }
    }
}

// ฟังก์ชันล้างฟอร์ม
window.resetForm = function() {
    document.getElementById('branch-form').reset();
    document.getElementById('doc-id').value = '';
    document.getElementById('form-title').innerText = "เพิ่มสาขาใหม่";
    document.getElementById('cancel-btn').style.display = 'none';
    document.querySelector('.btn.save').innerText = 'บันทึกข้อมูล';
}