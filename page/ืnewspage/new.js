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

const firebaseConfig = {
            // ... เอา Config มาวาง ...
        };
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        const db = firebase.firestore();

        // 2. ดึงข้อมูลจาก Collection "news"
        const newsContainer = document.getElementById('news-container');

        db.collection("news").orderBy("timestamp", "desc").get().then((querySnapshot) => {
            newsContainer.innerHTML = ""; // เคลียร์ข้อความ Loading
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                
                // สร้าง HTML การ์ดข่าว
                const cardHTML = `
                <div class="col-md-6">
                    <a href="${data.link || '#'}" class="news-card" target="_blank">
                        <div class="news-img-col">
                            <img src="${data.imageUrl}" alt="News Image" class="news-img">
                        </div>
                        <div class="news-body-col">
                            <div>
                                <div class="news-title">${data.title}</div>
                                <div class="news-tags text-muted">${data.description || ''}</div>
                            </div>
                            <div class="arrow-btn">
                                <i class="fa-solid fa-chevron-right"></i>
                            </div>
                        </div>
                    </a>
                </div>
                `;
                
                newsContainer.innerHTML += cardHTML;
            });
        }).catch((error) => {
            console.log("Error getting documents: ", error);
            newsContainer.innerHTML = "<p>ไม่สามารถโหลดข้อมูลได้</p>";
        });