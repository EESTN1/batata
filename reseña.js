
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// 🔥 CONFIG TUYA
  const firebaseConfig = {
    apiKey: "AIzaSyCs1tRbJqvR3lQv1I3Q-3D_PZUMyMoyXkA",
    authDomain: "bta-rojas.firebaseapp.com",
    projectId: "bta-rojas",
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 🧠 userId único
let userId = localStorage.getItem("userId");
if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem("userId", userId);
}

// UI
const form = document.getElementById("formContainer");
document.getElementById("openForm").onclick = () => form.classList.remove("hidden");
document.getElementById("cancel").onclick = () => form.classList.add("hidden");

// ⭐ estrellas reales
let selectedStars = 0;
const starsContainer = document.getElementById("stars");

for (let i = 1; i <= 5; i++) {
  const star = document.createElement("span");
  star.innerHTML = "★";
  star.onclick = () => {
    selectedStars = i;
    updateStars();
  };
  starsContainer.appendChild(star);
}

function updateStars() {
  [...starsContainer.children].forEach((s, i) => {
    s.classList.toggle("active", i < selectedStars);
  });
}

// ➕ agregar reseña
document.getElementById("submit").onclick = async () => {
  const name = document.getElementById("name").value.trim();
  const comment = document.getElementById("comment").value.trim();

  if (!name || !comment || selectedStars === 0) {
    alert("Completa todo");
    return;
  }

  await addDoc(collection(db, "reviews"), {
    name,
    comment,
    stars: selectedStars,
    userId,
    createdAt: Date.now()
  });

  form.classList.add("hidden");
  loadReviews();
};

// 📥 cargar reseñas
async function loadReviews() {
  const snapshot = await getDocs(collection(db, "reviews"));
  const container = document.getElementById("reviewsList");
  container.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();

    const div = document.createElement("div");
    div.className = "review-card";

    div.innerHTML = `
      <h4>${data.name}</h4>
      <p>${"★".repeat(data.stars)}</p>
      <p>${data.comment}</p>
      ${
        data.userId === userId
          ? `<button class="btn-outline" onclick="editReview('${docSnap.id}', '${data.comment}')">Editar</button>
             <button class="btn-outline" onclick="deleteReview('${docSnap.id}')">Eliminar</button>`
          : ""
      }
    `;

    container.appendChild(div);
  });
}

// ✏️ editar
window.editReview = async (id, oldText) => {
  const newText = prompt("Editar reseña:", oldText);
  if (newText) {
    await updateDoc(doc(db, "reviews", id), {
      comment: newText
    });
    loadReviews();
  }
};

// 🗑️ eliminar
window.deleteReview = async (id) => {
  await deleteDoc(doc(db, "reviews", id));
  loadReviews();
};

loadReviews();