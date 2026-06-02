// =========================
// PRODUCTOS INTERACTIVOS
// =========================

const productCards = document.querySelectorAll(".product-card");

const data = {
  clasica: {
    title: "Chip de batata",
    text: "Elaborada con ingredientes simples y producción artesanal.",
    vitA: "85%",
    vitC: "72%",
    fiber: "91%",
    potassium: "78%"
  },

  ahumada: {
    title: "Dulce de batata",
    text: "Perfil intenso con especias suaves y notas ahumadas.",
    vitA: "76%",
    vitC: "65%",
    fiber: "84%",
    potassium: "70%"
  },

  dulce: {
    title: "Batata natural",
    text: "Versión dulce inspirada en sabores regionales.",
    vitA: "80%",
    vitC: "60%",
    fiber: "74%",
    potassium: "68%"
  }
};

// Función para actualizar el panel
function updatePanel(product) {

  document.getElementById("panelTitle").textContent =
    data[product].title;

  document.getElementById("panelText").textContent =
    data[product].text;

  // Barras
  document.getElementById("vitA").style.width =
    data[product].vitA;

  document.getElementById("vitC").style.width =
    data[product].vitC;

  document.getElementById("fiber").style.width =
    data[product].fiber;

  document.getElementById("potassium").style.width =
    data[product].potassium;

  // Textos
  document.getElementById("vitAText").textContent =
    data[product].vitA;

  document.getElementById("vitCText").textContent =
    data[product].vitC;

  document.getElementById("fiberText").textContent =
    data[product].fiber;

  document.getElementById("potassiumText").textContent =
    data[product].potassium;
}

// Eventos de las tarjetas
productCards.forEach((card) => {

  card.addEventListener("click", () => {

    productCards.forEach((c) => {
      c.classList.remove("active");
    });

    card.classList.add("active");

    updatePanel(card.dataset.product);

  });

});

// =========================
// PRODUCTO INICIAL
// =========================

const initialCard = document.querySelector(
  '[data-product="clasica"]'
);

if (initialCard) {
  initialCard.classList.add("active");
  updatePanel("clasica");
}