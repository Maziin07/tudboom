document.addEventListener("DOMContentLoaded", () => {
    // Menu Toggle
    const menuToggle = document.getElementById("menu-toggle");
    const nav = document.getElementById("nav")?.querySelector("ul");

    if (menuToggle && nav) {
        menuToggle.addEventListener("click", () => {
            nav.classList.toggle("active");
        });
    }
    
    
    // Menu Hamburguer

    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const hamburgerDropdown = document.getElementById("hamburgerDropdown");

    hamburgerBtn.addEventListener("click", () => {
      hamburgerDropdown.style.display =
        hamburgerDropdown.style.display === "flex" ? "none" : "flex";
    });

    // Fecha o dropdown ao clicar fora
    document.addEventListener("click", function (e) {
      if (
        !hamburgerBtn.contains(e.target) &&
        !hamburgerDropdown.contains(e.target)
      ) {
        hamburgerDropdown.style.display = "none";
      }
    });
    
    
    // Carousel de Produtos

    const productsWrapper = document.querySelector(".products-wrapper");
    const leftArrow = document.querySelector(".left-arrow");
    const rightArrow = document.querySelector(".right-arrow");

    if (productsWrapper && leftArrow && rightArrow) {
        const scrollAmount = 280; // Ajuste este valor (largura do card + gap)

        leftArrow.addEventListener("click", () => {
            productsWrapper.scrollBy({
                left: -scrollAmount,
                behavior: "smooth",
            });
        });

        rightArrow.addEventListener("click", () => {
            productsWrapper.scrollBy({
                left: scrollAmount,
                behavior: "smooth",
            });
        });

        // Função para atualizar a visibilidade dos botões
        const updateArrowVisibility = () => {
            const maxScrollLeft = productsWrapper.scrollWidth - productsWrapper.clientWidth;
            leftArrow.style.display = productsWrapper.scrollLeft > 0 ? "block" : "none";
            rightArrow.style.display = productsWrapper.scrollLeft < maxScrollLeft ? "block" : "none";
        };

        // Adiciona o evento de scroll para atualizar a visibilidade
        productsWrapper.addEventListener("scroll", updateArrowVisibility);

        // Atualiza a visibilidade inicial
        updateArrowVisibility();
    }
});