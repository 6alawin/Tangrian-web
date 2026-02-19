const firebaseConfig = {
    apiKey: "AIzaSyA87cosA-moPLr0W48ZHJExgE6D2HMMkFM",
    authDomain: "tangrian-web.firebaseapp.com",
    projectId: "tangrian-web",
    storageBucket: "tangrian-web.firebasestorage.app",
    messagingSenderId: "270323183242",
    appId: "1:270323183242:web:9d2204359647f4ddcf0773",
    measurementId: "G-C5ETY84ETR"
};

// --- 2. เริ่มทำงาน Firebase ---
// เช็คก่อนว่าเคย Initialize ไปหรือยัง จะได้ไม่ Error ซ้ำ
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// --- 3. ส่วนดึงข้อมูล (Logic) ---
// ใช้ DOMContentLoaded เพื่อรอให้ HTML โหลดเสร็จก่อน 100% ค่อยรันโค้ด
document.addEventListener("DOMContentLoaded", function() {
    
    console.log("Start loading news..."); // เช็คใน Console ว่าไฟล์ทำงานไหม

    const newsContainer = document.getElementById('news-container');

    // ถ้าหน้านี้ไม่มีกล่องข่าว ก็จบการทำงานไปเลย (กัน Error เวลาเอา Script นี้ไปใช้หน้าอื่น)
    if (!newsContainer) return;

    db.collection("news")
      .orderBy("timestamp", "desc") 
      .get()
      .then((querySnapshot) => {
        
        if (querySnapshot.empty) {
            newsContainer.innerHTML = `<div class="col-12 text-center p-5 text-muted">ยังไม่มีข่าวสาร</div>`;
            return;
        }

        newsContainer.innerHTML = ""; // เคลียร์ข้อความ Loading ออก
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // ใช้รูป Default ถ้าไม่มีรูป (กันรูปแตก)
            const showImage = data.imageUrl ? data.imageUrl : 'https://via.placeholder.com/400x300?text=Tangrian+News';

            const cardHTML = `

                <a href="${data.link || '#'}" class="news-card" target="_blank" style="text-decoration: none; color: inherit;">
                    <div class="news-img-col">
                        <img src="${showImage}" class="news-img" alt="news" 
                             onerror="this.onerror=null;this.src='https://via.placeholder.com/400x300?text=Image+Error';">
                    </div>
                    <div class="news-body-col">
                        <div>
                            <div class="news-title">${data.title || 'ไม่มีหัวข้อ'}</div>
                            <div class="news-tags text-muted" style="font-size: 0.9em;">${data.description || ''}</div>
                        </div>
                        <div class="arrow-btn">
                            <i class="fa-solid fa-chevron-right"></i>
                        </div>
                    </div>
                </a>
            `;
            
            newsContainer.innerHTML += cardHTML;
        });
    })
    .catch((error) => {
        console.error("Error getting news:", error);
        newsContainer.innerHTML = `<div class="col-12 text-center text-danger">โหลดข้อมูลไม่สำเร็จ: ${error.message}</div>`;
    });
});