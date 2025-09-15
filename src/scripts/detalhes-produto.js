document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");

  // Configuração da API
  const API_BASE_URL = 'https://api-tudboom.vercel.app';

  // Produtos estáticos (fallback)
  const produtosEstaticos = [
    {
      id: "1",
      name: "Caneca de Porcelana Personalizada Católica Nossa Senhora Aparecida",
      img: "/assets/imagens/canecaaparecida.png",
      description: "💖 Ideal para presentear em momentos especiais e datas comemorativas 🌟",
      price: "R$22,50"
    },
    {
      id: "2",
      name: "Torre de Xícaras de Porcelana Personalizada com Suporte - 150 ml (cada)",
      img: "/assets/imagens/torredexicaras.png",
      description: "✨☕ Torre Personalizada com 4 Xícaras - Beleza, Praticidade e Exclusividade! ☕✨",
      price: "R$112,99"
    },
    {
      id: "3",
      name: "Caneca Personalizada Porcelana Catequista",
      img: "/assets/imagens/canecacatequista.png",
      description: "Adquira uma lembrança que vai fortalecer os laços de fé! Transforme gratidão em um presente inesquecível! ✨💫",
      price: "R$23,80"
    },
    {
      id: "4",
      name: "Caneca cerâmica personalizada com sua arte 325ml",
      img: "/assets/imagens/canecasuaarte.png",
      description: "Personalize com a sua própria arte. Ideal para presentes criativos e únicos!",
      price: "R$29,90 - R$58,90"
    },
    {
      id: "5",
      name: "Caneca Personalizada Medicina veterinária",
      img: "/assets/imagens/canecamedicina.webp",
      description: "Perfeita para presentear profissionais e estudantes da área da saúde animal!",
      price: "R$23,50"
    },
    {
      id: "6",
      name: "Caneca Gospel Seja Forte E Corajosa",
      img: "/assets/imagens/canecagospel.webp",
      description: "Inspire fé e força com esta linda caneca cristã. Um presente cheio de significado!",
      price: "R$23,90 - R$57,90"
    },
    {
      id: "7",
      name: "Caneta Em Gel Personagens Heróis / Animes / Star Wars",
      img: "/assets/imagens/canetaherois.webp",
      description: "Canetas divertidas e colecionáveis com seus personagens favoritos!",
      price: "R$10,00"
    },
    {
      id: "8",
      name: "Caneta em Gel Apagável Signos Tinta Azul",
      img: "/assets/imagens/canetasigno.webp",
      description: "Escreva com estilo e apague com facilidade. Ideal para amantes de signos!",
      price: "R$11,90"
    },
    {
      id: "9",
      name: "Caneca de Porcelana Batman 370 ml Original Dc Comics Licenciada",
      img: "/assets/imagens/canecabatman.webp",
      description: "Produto oficial DC Comics. Ótima opção para fãs do Batman!",
      price: "R$11,80"
    },
    {
      id: "10",
      name: 'Bloco de notas Autoadesivas Fofas',
      img: 'https://down-br.img.susercontent.com/file/br-11134207-7r98o-ltyjmyurjy3k7f.webp',
      description: "Bloco de notas com personagens fofos para anotar coisas importantes e lembrar o que quiser!",
      price: "R$11,90"
    }
  ];

  // Função para carregar produtos dinâmicos
  function carregarProdutosDinamicos() {
    try {
      // Primeiro tenta carregar do catálogo
      const produtosCatalogo = localStorage.getItem('tudboom_products');
      if (produtosCatalogo) {
        const produtos = JSON.parse(produtosCatalogo);
        return produtos.map(p => {
          // Usar imagemId para construir URL da imagem
          let imageUrl;
          if (p.imagemId) {
            imageUrl = `${API_BASE_URL}/imagem/${p.imagemId}`;
          } else if (p.image && p.image.startsWith('http')) {
            imageUrl = p.image;
          } else {
            imageUrl = '/assets/imagens/produto-default.jpg';
          }

          return {
            id: p.id.toString(),
            name: p.name,
            img: imageUrl,
            description: p.description,
            price: `R$${p.price.toFixed(2).replace('.', ',')}`
          };
        });
      }

      // Se não encontrar no catálogo, tenta no dashboard
      const produtosDashboard = localStorage.getItem('products');
      if (produtosDashboard) {
        const produtos = JSON.parse(produtosDashboard);
        return produtos.map(p => {
          // Usar imagemId para construir URL da imagem
          let imageUrl;
          if (p.imagemId) {
            imageUrl = `${API_BASE_URL}/imagem/${p.imagemId}`;
          } else if (p.image && p.image.startsWith('http')) {
            imageUrl = p.image;
          } else {
            imageUrl = '/assets/imagens/produto-default.jpg';
          }

          return {
            id: p.id.toString(),
            name: p.name,
            img: imageUrl,
            description: p.description,
            price: `R$${p.price.toFixed(2).replace('.', ',')}`
          };
        });
      }

      return [];
    } catch (error) {
      console.error('Erro ao carregar produtos dinâmicos:', error);
      return [];
    }
  }

  // Combina produtos estáticos com dinâmicos
  const produtosDinamicos = carregarProdutosDinamicos();
  const todosProdutos = [...produtosEstaticos, ...produtosDinamicos];

  // Busca o produto pelo ID
  const produto = todosProdutos.find(p => p.id === id);

  if (produto) {
    document.getElementById("productImg").src = produto.img;
    document.getElementById("productImg").alt = produto.name;
    document.getElementById("productName").textContent = produto.name;
    document.getElementById("productDescription").textContent = produto.description;
    document.getElementById("productPrice").textContent = produto.price;
    
    // Atualiza o title da página
    document.title = `${produto.name} - Tudboom`;
  } else {
    document.querySelector(".product-info").innerHTML = `
      <h2>Produto não encontrado.</h2>
      <p>O produto que você está procurando não existe ou foi removido.</p>
      <a href="/src/pages/catalogo.html" class="buy-button">Ver Catálogo</a>
    `;
  }

  function setupWhatsappButton() {
    const lojaNumero = "5515991865965";
    const botaoComprar = document.querySelector(".buy-button");

    if (!botaoComprar) return;

    botaoComprar.onclick = () => {
      const productName = document.getElementById("productName").innerText.trim();
      const mensagem = encodeURIComponent(`Olá! 😊 Tenho interesse em: ${productName}`);
      const urlWhatsapp = `https://api.whatsapp.com/send?phone=${lojaNumero}&text=${mensagem}`;
      window.open(urlWhatsapp, "_blank");
    };
  }

  // Buscar produtos do Backend usando ID
async function buscarProdutoDoBackend(id) {
  try {
    const res = await fetch(`https://api-tudboom.vercel.app/getItemById/${id}`);
    if (!res.ok) throw new Error("Produto não encontrado");
    const produto = await res.json();

    // Extrair ID da imagem corretamente
      let imagemId = null;
      if (produto.urlImagem) {
        if (typeof produto.urlImagem === 'object' && produto.urlImagem._id) {
          imagemId = produto.urlImagem._id;
        } else if (typeof produto.urlImagem === 'string') {
          imagemId = produto.urlImagem;
        }
      }

    return {
      id: produto._id,
      name: produto.nome,
      img: produto.imagemId,
      description: produto.descricao,
      price: `R$${parseFloat(produto.preco).toFixed(2).replace('.', ',')}`
    };
  } catch (err) {
    console.error("Erro ao buscar produto no backend:", err);
    return null;
  }
}

(async () => {
  let produto = todosProdutos.find(p => p.id === id);

  // Se não encontrar no localStorage/estático, busca no MongoDB
  if (!produto) {
    produto = await buscarProdutoDoBackend(id);
  }

  if (produto) {
    document.getElementById("productImg").src = produto.img;
    document.getElementById("productImg").alt = produto.name;
    document.getElementById("productName").textContent = produto.name;
    document.getElementById("productDescription").textContent = produto.description;
    document.getElementById("productPrice").textContent = produto.price;
    document.title = `${produto.name} - Tudboom`;
  } else {
    document.querySelector(".product-info").innerHTML = `
      <h2>Produto não encontrado.</h2>
      <p>O produto que você está procurando não existe ou foi removido.</p>
      <a href="/src/pages/catalogo.html" class="buy-button">Ver Catálogo</a>
    `;
  }
})();

  // Configura o botão do WhatsApp
  setupWhatsappButton();

  // Monitora mudanças no localStorage para atualização em tempo real
  window.addEventListener('storage', function(e) {
    if (e.key === 'tudboom_products' || e.key === 'products') {
      // Recarrega a página se o produto atual foi modificado
      const produtosAtualizados = carregarProdutosDinamicos();
      const produtoAtualizado = produtosAtualizados.find(p => p.id === id);
      
      if (produtoAtualizado && produto) {
        // Atualiza as informações sem recarregar a página
        document.getElementById("productImg").src = produtoAtualizado.img;
        document.getElementById("productName").textContent = produtoAtualizado.name;
        document.getElementById("productDescription").textContent = produtoAtualizado.description;
        document.getElementById("productPrice").textContent = produtoAtualizado.price;
        document.title = `${produtoAtualizado.name} - Tudboom`;
      }
    }
  });
});