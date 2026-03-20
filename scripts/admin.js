// ============================================================
// CONFIG
// ============================================================
const API_KEY = 'lkbNT9OIVgQSh6OD7xBQbwjAXTjSqBARRS3afBRtskDfMfr9uePKIXViAbqmpUZA5QsLFhCapbyhBUl6BbFI8wyTdbYBFjLKTFGfPChXajQlXm3hnCeH9AS8QF50K6Y6uY2w4QM4tFBZRZO8kYUiJAOVEe8h2BVdir4EIqlX8LZk1KPKJi6WAUyHoEJgtKD6DT26oPwYxAZyhw2vWmFY7A3YCtgle7Bgd8OSnj8dhEtEVD4Ys5boDIZsKmL8yujy'; // อย่าลืมใส่คีย์ของคุณเหมือนเดิม
const BASE_URL = 'http://localhost:3000';

// ============================================================
// Elements
// ============================================================
const imageInput   = document.getElementById('imageInput');
const galleryInput = document.getElementById('galleryInput');

const coverPreview = document.getElementById('coverPreview');
const coverPlaceholder = document.getElementById('coverPlaceholder');

const galleryPreview = document.getElementById('galleryPreview');
const galleryPlaceholder = document.getElementById('galleryPlaceholder');

// ============================================================
// CORE: callApi
// ============================================================
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
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        alert('❌ เชื่อมต่อ server ไม่ได้: ' + error.message);
    }
}

// ============================================================
// Helper: 🗜️ แปลงและบีบอัดรูปก่อนส่ง (แทนที่ toBase64 เดิม)
// ============================================================
function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                
                // กำหนดความกว้างสูงสุด 1200px (ปรับได้)
                const MAX_WIDTH = 1200;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // แปลงเป็น JPEG คุณภาพ 70% (เบาเครื่อง ส่งเร็ว)
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                resolve(compressedBase64);
            };
        };
    });
}

// ============================================================
// Helper: Preview รูปใน grid 
// ============================================================
function previewImages(files, previewDiv, placeholderDiv) {
    previewDiv.innerHTML = ''; 

    if (!files || files.length === 0) {
        placeholderDiv.style.display = 'flex'; 
        return;
    }

    placeholderDiv.style.display = 'none'; 

    Array.from(files).forEach(file => {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file); 
        img.alt = file.name;
        previewDiv.appendChild(img); 
    });
}

// ============================================================
// Preview: Cover Image & Gallery
// ============================================================
imageInput.addEventListener('change', function () {
    previewImages(this.files, coverPreview, coverPlaceholder);
});

galleryInput.addEventListener('change', function () {
    previewImages(this.files, galleryPreview, galleryPlaceholder);
});

// ============================================================
// โหลดข้อมูลเมื่อเปิดหน้า
// ============================================================
document.addEventListener('DOMContentLoaded', fetchBranches);

// ============================================================
// ดึงข้อมูลสาขามาแสดงในตาราง
// ============================================================
async function fetchBranches() {
    const listTable = document.getElementById('branch-list');
    const loading   = document.getElementById('loading');

    listTable.innerHTML = '';
    if (loading) loading.style.display = 'block';

    const res = await callApi('/branches', 'GET');
    
    // แก้นิดนึง: Backend ส่งกลับมาเป็น { success: true, branches: [...] }
    const data = res && res.branches ? res.branches : [];

    if (loading) loading.style.display = 'none';

    if (!data || data.length === 0) {
        listTable.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#888;">ไม่พบข้อมูล</td></tr>';
        return;
    }

    window.allBranchData = data.reduce((acc, curr) => {
        acc[curr._id] = curr;
        return acc;
    }, {});

    data.forEach((branch) => {
        const coverImg = Array.isArray(branch.imageCover) && branch.imageCover.length > 0
            ? branch.imageCover[0]
            : 'https://placehold.co/100';

        const row = `
            <tr>
                <td><img src="${coverImg}" width="60" height="60" style="border-radius:6px; object-fit:cover;"></td>
                <td>${branch.name}</td>
                <td><span class="badge ${branch.category}">${branch.category}</span></td>
                <td>
                    <button class="btn edit" onclick="editBranch('${branch._id}')">
                        <i class="fa-solid fa-pen"></i> แก้ไข
                    </button>
                    <button class="btn delete" onclick="deleteBranch('${branch._id}', '${branch.name}')">
                        <i class="fa-solid fa-trash"></i> ลบ
                    </button>
                </td>
            </tr>
        `;
        listTable.innerHTML += row;
    });
}

// ============================================================
// บันทึกข้อมูล (Add / Update)
// ============================================================
document.getElementById('branch-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const docId    = document.getElementById('doc-id').value;
    const name     = document.getElementById('name').value;
    const category = document.getElementById('category').value;
    const detail   = document.getElementById('detail').value;
    const mapLink  = document.getElementById('mapLink').value;

    let imageCover = [];
    if (imageInput.files.length > 0) {
        // ใช้ compressImage แทน toBase64
        imageCover = await Promise.all(Array.from(imageInput.files).map(compressImage));
    } else if (docId && window.allBranchData[docId]) {
        imageCover = window.allBranchData[docId].imageCover || [];
    }

    let garelly = [];
    if (galleryInput.files.length > 0) {
        // ใช้ compressImage แทน toBase64
        garelly = await Promise.all(Array.from(galleryInput.files).map(compressImage));
    } else if (docId && window.allBranchData[docId]) {
        garelly = window.allBranchData[docId].garelly || [];
    }

    const branchData = { name, category, detail, imageCover, map_link: mapLink, garelly };

    if (docId) {
        await callApi(`/branches/${docId}`, 'PUT', branchData);
        alert('✅ แก้ไขข้อมูลเรียบร้อย!');
    } else {
        await callApi('/branches', 'POST', branchData);
        alert('✅ เพิ่มสาขาใหม่เรียบร้อย!');
    }

    resetForm();
    fetchBranches();
});

// ============================================================
// แก้ไขข้อมูล — ดึงข้อมูลเดิมใส่ฟอร์ม
// ============================================================
window.editBranch = function (id) {
    const data = window.allBranchData[id];

    document.getElementById('doc-id').value   = id;
    document.getElementById('name').value     = data.name;
    document.getElementById('category').value = data.category;
    document.getElementById('detail').value   = data.detail || '';
    document.getElementById('mapLink').value  = data.map_link || '';

    coverPreview.innerHTML = '';
    if (data.imageCover && data.imageCover.length > 0) {
        coverPlaceholder.style.display = 'none';
        data.imageCover.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            coverPreview.appendChild(img);
        });
    } else {
        coverPlaceholder.style.display = 'flex';
    }

    galleryPreview.innerHTML = '';
    if (data.garelly && data.garelly.length > 0) {
        galleryPlaceholder.style.display = 'none';
        data.garelly.forEach(src => {
            const img = document.createElement('img');
            img.src = src;
            galleryPreview.appendChild(img);
        });
    } else {
        galleryPlaceholder.style.display = 'flex';
    }

    document.getElementById('form-title').innerText     = 'แก้ไขข้อมูล: ' + data.name;
    document.getElementById('cancel-btn').style.display = 'inline-block';
    document.querySelector('.btn.save').innerText        = '💾 บันทึกการแก้ไข';

    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ============================================================
// ลบข้อมูล
// ============================================================
window.deleteBranch = async function (id, name) {
    if (confirm(`คุณต้องการลบสาขา "${name}" ใช่หรือไม่?\n(ลบแล้วกู้คืนไม่ได้!)`)) {
        await callApi(`/branches/${id}`, 'DELETE');
        alert('✅ ลบข้อมูลเรียบร้อย');
        fetchBranches();
    }
};

// ============================================================
// ล้างฟอร์ม
// ============================================================
window.resetForm = function () {
    document.getElementById('branch-form').reset();
    document.getElementById('doc-id').value             = '';
    document.getElementById('form-title').innerText     = 'เพิ่มสาขาใหม่';
    document.getElementById('cancel-btn').style.display = 'none';
    document.querySelector('.btn.save').innerText        = '💾 บันทึกข้อมูล';
    
    coverPreview.innerHTML = '';
    coverPlaceholder.style.display = 'flex';
    
    galleryPreview.innerHTML = '';
    galleryPlaceholder.style.display = 'flex';
};