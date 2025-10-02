let produtos = [];
let produtoEditandoId = null;

document.addEventListener("DOMContentLoaded", () => {
  carregarProdutos();
});

async function carregarProdutos() {
  try {
    console.log('🔄 Carregando produtos...');
    
    const response = await fetch("https://api-tudboom.vercel.app/getItems");
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📦 Dados recebidos:', data);

    produtos = data.map(p => {
      // Debug: Verificar estrutura dos dados recebidos
      console.log('Produto bruto:', p);
      console.log('urlImagem:', p.urlImagem);
      
      // Extrair ID da imagem corretamente
      let imagemId = null;
      if (p.urlImagem) {
        // Se urlImagem é um objeto (populate), pega o _id
        if (typeof p.urlImagem === 'object' && p.urlImagem._id) {
          imagemId = p.urlImagem._id;
          console.log('ImagemId do objeto populate:', imagemId);
        }
        // Se urlImagem é uma string (só o ID)
        else if (typeof p.urlImagem === 'string') {
          imagemId = p.urlImagem;
          console.log('ImagemId da string:', imagemId);
        }
      }

      const produtoProcessado = {
        _id: p._id,
        nome: p.nome,
        descricao: p.descricao,
        categoria: p.categoria || 'Personalizado',
        preco: parseFloat(p.preco || 0),
        imagemId: imagemId,
        criadoEm: p.createdAt ? new Date(p.createdAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')
      };
      
      console.log('Produto processado:', produtoProcessado);
      return produtoProcessado;
    });

    console.log('✅ Produtos processados:', produtos);
    renderizarProdutos();
    
  } catch (error) {
    console.error("❌ Erro ao carregar produtos:", error);
    showNotification("Erro ao carregar produtos: " + error.message, "error");
    produtos = [];
    renderizarProdutos();
  }
}

function openModal(produto = null) {
  const modal = document.getElementById("modal");
  const form = document.getElementById("product-form");

  if (produto) {
    document.getElementById("modal-title").textContent = "Editar Produto";
    document.getElementById("product-name").value = produto.nome;
    document.getElementById("product-description").value = produto.descricao;
    document.getElementById("product-category").value = produto.categoria || 'Personalizado';
    document.getElementById("product-price").value = produto.preco;
    document.getElementById("product-image").removeAttribute('required');
    
    produtoEditandoId = produto._id || produto.id;
  } else {
    form.reset();
    document.getElementById("modal-title").textContent = "Adicionar Produto";
    document.getElementById("product-category").value = '';
    document.getElementById("product-image").setAttribute('required', 'required');
    produtoEditandoId = null;
  }

  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  produtoEditandoId = null;
}

async function saveProduct(event) {
  event.preventDefault();

  const nome = document.getElementById("product-name").value.trim();
  const descricao = document.getElementById("product-description").value.trim();
  const categoria = document.getElementById("product-category").value;
  const preco = parseFloat(document.getElementById("product-price").value);
  const imagemInput = document.getElementById("product-image");

  if (!categoria) {
    showNotification("Selecione uma categoria.", "error");
    return;
  }

  if (isNaN(preco) || preco <= 0) {
    showNotification("Preço deve ser um número válido maior que zero.", "error");
    return;
  }

  if (!produtoEditandoId && (!imagemInput.files || imagemInput.files.length === 0)) {
    showNotification("Selecione uma imagem para o produto.", "error");
    return;
  }

  console.log('💾 Salvando produto:', { nome, descricao, categoria, preco, editando: produtoEditandoId });

  const formData = new FormData();
  formData.append("nome", nome);
  formData.append("descricao", descricao);
  formData.append("categoria", categoria);
  formData.append("preco", preco);

  try {
    let response;
    
    if (produtoEditandoId) {
      formData.append("id", produtoEditandoId);

      if (imagemInput.files.length > 0) {
        formData.append("imagem", imagemInput.files[0]);
      }

      console.log('✏️ Atualizando produto ID:', produtoEditandoId);
      
      response = await fetch("https://api-tudboom.vercel.app/updateItems", {
        method: "POST",
        body: formData
      });

    } else {
      if (imagemInput.files.length === 0) {
        showNotification("Selecione uma imagem para o produto.", "error");
        return;
      }
      
      formData.append("imagem", imagemInput.files[0]);

      console.log('➕ Criando novo produto');
      
      response = await fetch("https://api-tudboom.vercel.app/saveItems", {
        method: "POST",
        body: formData
      });
    }

    console.log('📡 Resposta recebida:', response.status, response.statusText);

    if (response.ok) {
      const acao = produtoEditandoId ? 'atualizado' : 'criado';
      showNotification(`Produto ${acao} com sucesso!`, "success");
      closeModal();
      
      await carregarProdutos();
    } else {
      const errorText = await response.text();
      console.error('❌ Erro na resposta:', errorText);
      showNotification(`Erro ao ${produtoEditandoId ? 'atualizar' : 'salvar'} produto.`, "error");
    }
    
  } catch (error) {
    console.error("❌ Erro ao salvar produto:", error);
    showNotification("Erro de conexão ao salvar produto.", "error");
  }
}

async function excluirProduto(id) {
  if (!confirm("Deseja excluir este produto?")) {
    return;
  }

  try {
    console.log('🗑️ Excluindo produto ID:', id);
    
    const response = await fetch(`https://api-tudboom.vercel.app/deleteItem/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      showNotification("Produto excluído com sucesso!", "success");
      await carregarProdutos();
    } else {
      throw new Error(`Erro ${response.status}: ${response.statusText}`);
    }
    
  } catch (error) {
    console.error("❌ Erro ao excluir produto:", error);
    showNotification("Erro ao excluir produto: " + error.message, "error");
  }
}

function renderizarProdutos() {
  const tbody = document.getElementById("products-tbody");
  
  if (!tbody) {
    console.error('❌ Elemento products-tbody não encontrado');
    return;
  }

  tbody.innerHTML = "";

  if (produtos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: #666;">
          <i class="fas fa-box-open" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
          Nenhum produto encontrado
        </td>
      </tr>
    `;
    atualizarEstatisticas();
    return;
  }

  let totalEstoque = 0;

  produtos.forEach(produto => {
    totalEstoque += produto.preco || 0;

    const tr = document.createElement("tr");

    // ✅ CORREÇÃO PRINCIPAL: Usar o imagemId correto
    const imagemSrc = produto.imagemId ? 
      `https://api-tudboom.vercel.app/imagem/${produto.imagemId}` : 
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAyMEM3LjI3IDIwIDcuMjcgMzAgMjUgMzBTNDIuNzMgMzAgNDIuNzMgMjAiIGZpbGw9IiNEREQiLz4KPC9zdmc+Cg==';
    
    console.log(`🖼️ Produto ${produto.nome} - ImagemID: ${produto.imagemId} - URL: ${imagemSrc}`);

    tr.innerHTML = `
      <td>
        <div class="product-info">
          <img class="product-image" 
               src="${imagemSrc}" 
               alt="${produto.nome}" 
               style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"
               onerror="console.error('Erro ao carregar imagem:', this.src); this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAyMEM3LjI3IDIwIDcuMjcgMzAgMjUgMzBTNDIuNzMgMzAgNDIuNzMgMjAiIGZpbGw9IiNEREQiLz4KPC9zdmc+Cg=='">
          <div class="product-details">
            <h4 style="margin: 0; font-size: 14px; font-weight: 600;">${produto.nome}</h4>
            <span class="product-id" style="font-size: 12px; color: #666;">ID: ${produto._id}</span>
          </div>
        </div>
      </td>
      <td class="product-description" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${produto.descricao}">${produto.descricao}</td>
      <td>
        <span class="category-badge" style="padding: 4px 8px; background: #e3f2fd; color: #1976d2; border-radius: 4px; font-size: 12px;">
          ${getCategoryIcon(produto.categoria)} ${produto.categoria}
        </span>
      </td>
      <td class="product-price" style="font-weight: 600; color: #2e7d32;">R$ ${(produto.preco || 0).toFixed(2)}</td>
      <td style="font-size: 14px; color: #666;">${produto.criadoEm || '-'}</td>
      <td class="actions">
        <button class="action-btn edit-btn" onclick="editarProduto('${produto._id}')" 
                style="background: #1976d2; color: white; border: none; padding: 8px; border-radius: 4px; margin-right: 8px; cursor: pointer;" title="Editar">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn delete-btn" onclick="excluirProduto('${produto._id}')" 
                style="background: #d32f2f; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;" title="Excluir">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  atualizarEstatisticas();
}

function atualizarEstatisticas() {
  const totalProdutos = produtos.length;
  const totalEstoque = produtos.reduce((sum, produto) => sum + (produto.preco || 0), 0);

  const elementos = [
    { id: 'products-count', valor: totalProdutos },
    { id: 'total-count', valor: totalProdutos },
    { id: 'products-shown', valor: `${totalProdutos} exibidos` },
    { id: 'results-count', valor: `${totalProdutos} de ${totalProdutos} produtos` },
    { id: 'total-value', valor: `R$ ${totalEstoque.toFixed(2)}` }
  ];

  elementos.forEach(({ id, valor }) => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.textContent = valor;
    }
  });
}

function getCategoryIcon(categoria) {
  const icons = {
    'Louça': '☕',
    'Escrita e Correção': '🖊️',
    'Cadernos e Papeis': '📓',
    'Equipamento Escolar e Escritório': '📏',
    'Personalizado': '🎨'
  };
  return icons[categoria] || '📦';
}

function editarProduto(id) {
  console.log('✏️ Editando produto:', id);
  const produto = produtos.find(p => p._id === id || p.id === id);
  if (produto) {
    openModal(produto);
  } else {
    console.error('❌ Produto não encontrado para edição:', id);
    showNotification("Produto não encontrado!", "error");
  }
}

function filterProducts() {
  const termo = document.getElementById("search-input").value.toLowerCase().trim();
  const tbody = document.getElementById("products-tbody");
  
  if (!tbody) return;
  
  tbody.innerHTML = "";

  let totalEstoque = 0;
  let resultados = 0;

  const produtosFiltrados = produtos.filter(produto => 
    !termo || 
    produto.nome.toLowerCase().includes(termo) ||
    produto.descricao.toLowerCase().includes(termo) ||
    produto.categoria.toLowerCase().includes(termo)
  );

  produtosFiltrados.forEach(produto => {
    const tr = document.createElement("tr");
    totalEstoque += produto.preco || 0;
    resultados++;

    // ✅ CORREÇÃO: Usar o imagemId correto na busca também
    const imagemSrc = produto.imagemId ? 
      `https://api-tudboom.vercel.app/imagem/${produto.imagemId}` : 
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAyMEM3LjI3IDIwIDcuMjcgMzAgMjUgMzBTNDIuNzMgMzAgNDIuNzMgMjAiIGZpbGw9IiNEREQiLz4KPC9zdmc+Cg==';

    tr.innerHTML = `
      <td>
        <div class="product-info">
          <img class="product-image" 
               src="${imagemSrc}" 
               alt="${produto.nome}" 
               style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
          <div class="product-details">
            <h4 style="margin: 0; font-size: 14px; font-weight: 600;">${produto.nome}</h4>
            <span class="product-id" style="font-size: 12px; color: #666;">ID: ${produto._id}</span>
          </div>
        </div>
      </td>
      <td class="product-description" style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;" title="${produto.descricao}">${produto.descricao}</td>
      <td>
        <span class="category-badge" style="padding: 4px 8px; background: #e3f2fd; color: #1976d2; border-radius: 4px; font-size: 12px;">
          ${getCategoryIcon(produto.categoria)} ${produto.categoria}
        </span>
      </td>
      <td class="product-price" style="font-weight: 600; color: #2e7d32;">R$ ${(produto.preco || 0).toFixed(2)}</td>
      <td style="font-size: 14px; color: #666;">${produto.criadoEm}</td>
      <td class="actions">
        <button class="action-btn edit-btn" onclick="editarProduto('${produto._id}')" style="background: #1976d2; color: white; border: none; padding: 8px; border-radius: 4px; margin-right: 8px; cursor: pointer;">
          <i class="fas fa-edit"></i>
        </button>
        <button class="action-btn delete-btn" onclick="excluirProduto('${produto._id}')" style="background: #d32f2f; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer;">
          <i class="fas fa-trash-alt"></i>
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // Atualizar contadores
  const elementos = [
    { id: 'products-shown', valor: `${resultados} exibidos` },
    { id: 'results-count', valor: `${resultados} de ${produtos.length} produtos` },
    { id: 'total-value', valor: `R$ ${totalEstoque.toFixed(2)}` }
  ];

  elementos.forEach(({ id, valor }) => {
    const elemento = document.getElementById(id);
    if (elemento) {
      elemento.textContent = valor;
    }
  });
}

function showNotification(message, type = 'success') {
  // Remover notificação existente
  const existingNotification = document.querySelector('.tudboom-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Criar nova notificação
  const notification = document.createElement('div');
  notification.className = 'tudboom-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    opacity: 0;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    max-width: 400px;
    ${type === 'success' ? 
      'background: linear-gradient(135deg, #4caf50, #45a049);' : 
      'background: linear-gradient(135deg, #f44336, #e53935);'
    }
  `;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateY(0)';
  }, 100);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-20px)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
  }, 4000);
}

// Fechar modal ao clicar fora dele
window.onclick = function(event) {
  const modal = document.getElementById("modal");
  if (event.target === modal) {
    closeModal();
  }
}

// Adicionar listener para ESC fechar modal
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
});

console.log('✅ Dashboard carregado e pronto!');