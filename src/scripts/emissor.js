// Invoice Management System - Integrado com API
class InvoiceManager {
  constructor() {
    this.baseUrl = 'https://api-tudboom.vercel.app'; // URL da sua API
    this.invoices = [];
    this.currentInvoiceNumber = 1;
    this.items = [{ description: "", quantity: 1, unitPrice: 0, total: 0 }];
    this.includeTax = false; // Inicializa como false

    this.initializeEventListeners();
    this.loadInvoicesFromAPI();
    this.addInitialItem();
    this.getNextInvoiceNumber();
  }

  initializeEventListeners() {
    // Tab switching
    document.querySelectorAll(".tab-button").forEach((button) => {
      button.addEventListener("click", (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Form submission
    document.getElementById("invoice-form").addEventListener("submit", (e) => {
      this.handleFormSubmit(e);
    });

    // Add item button
    document.getElementById("add-item").addEventListener("click", () => {
      this.addItem();
    });

    // Modal controls
    document.getElementById("close-modal").addEventListener("click", () => {
      this.closeModal();
    });

    document.getElementById("print-btn").addEventListener("click", () => {
      this.printInvoice();
    });

    document.getElementById("download-btn").addEventListener("click", () => {
      this.downloadInvoice();
    });

    document.getElementById("pdf-btn").addEventListener("click", () => {
      this.downloadPDF();
    });


    // Close modal when clicking outside
    document.getElementById("preview-modal").addEventListener("click", (e) => {
      if (e.target.id === "preview-modal") {
        this.closeModal();
      }
    });
  }

  toggleTax(value) {
    this.includeTax = !!value; // true/false conforme checkbox
    this.updateTotals();
  }



  // ========== API METHODS ==========

  async loadInvoicesFromAPI() {
    try {
      const response = await fetch(`${this.baseUrl}/getNotasFiscais`);
      if (response.ok) {
        this.invoices = await response.json();
        this.updateInvoiceCount();
        this.renderInvoicesList();
      }
    } catch (error) {
      console.error('Erro ao carregar notas fiscais:', error);
      this.showToast('Erro ao carregar notas fiscais', 'error');
    }
  }

  async getNextInvoiceNumber() {
    try {
      const response = await fetch(`${this.baseUrl}/getNextInvoiceNumber`);
      if (response.ok) {
        const data = await response.json();
        this.currentInvoiceNumber = data.nextNumber;
      }
    } catch (error) {
      console.error('Erro ao buscar próximo número:', error);
    }
  }

  async saveInvoiceToAPI(invoiceData) {
    try {
      const response = await fetch(`${this.baseUrl}/saveNotaFiscal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData)
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao salvar nota fiscal');
      }
    } catch (error) {
      console.error('Erro ao salvar nota fiscal:', error);
      throw error;
    }
  }

  async deleteInvoiceFromAPI(invoiceId) {
    try {
      const response = await fetch(`${this.baseUrl}/deleteNotaFiscal/${invoiceId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        return await response.json();
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao deletar nota fiscal');
      }
    } catch (error) {
      console.error('Erro ao deletar nota fiscal:', error);
      throw error;
    }
  }

  // ========== UI METHODS ==========

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".tab-button").forEach((btn) => {
      btn.classList.remove("active");
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");

    // Update tab panels
    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.remove("active");
    });
    document.getElementById(`${tabName}-tab`).classList.add("active");

    // Refresh invoice list if switching to list tab
    if (tabName === "list") {
      this.loadInvoicesFromAPI();
    }
  }

  addInitialItem() {
    this.renderItems();
  }

  addItem() {
    this.items.push({ description: "", quantity: 1, unitPrice: 0, total: 0 });
    this.renderItems();
  }

  removeItem(index) {
    if (this.items.length > 1) {
      this.items.splice(index, 1);
      this.renderItems();
      this.updateTotals();
    }
  }

  updateItem(index, field, value) {
    
    // atualiza o campo
    this.items[index][field] = value;

    // garante que quantidade e unitPrice são números
    const qty = Number(this.items[index].quantity) || 0;
    const price = Number(this.items[index].unitPrice) || 0;

    // recalcula total do item
    this.items[index].total = qty * price;

    // re-renderiza a lista (assim a "item-total" exibida atualiza)
    this.renderItems();
  }

  renderItems() {
    const container = document.getElementById("items-container");
    container.innerHTML = "";

    this.items.forEach((item, index) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "item-card";
      itemDiv.innerHTML = `
          <div class="item-grid">
            <div class="form-group">
              <label>Descrição</label>
              <input 
                type="text" 
                value="${item.description}" 
                placeholder="Ex: Produto personalizado"
                onchange="invoiceManager.updateItem(${index}, 'description', this.value)"
              >
            </div>
            <div class="form-group">
              <label>Quantidade</label>
              <input 
                type="number" 
                min="1" 
                value="${item.quantity}"
                onchange="invoiceManager.updateItem(${index}, 'quantity', parseInt(this.value) || 1)"
              >
            </div>
            <div class="form-group">
              <label>Valor Unitário (R$)</label>
              <input 
                type="number" 
                min="0" 
                step="0.01" 
                value="${item.unitPrice}"
                onchange="invoiceManager.updateItem(${index}, 'unitPrice', parseFloat(this.value) || 0)"
              >
            </div>
            <div class="form-group">
              <label>Total (R$)</label>
              <span class="item-total">R$ ${item.total.toFixed(2)}</span>
            </div>
            ${this.items.length > 1
          ? `
              <button 
                type="button" 
                class="remove-item" 
                onclick="invoiceManager.removeItem(${index})"
                title="Remover item"
              >
                🗑️
              </button>
            `
          : "<div></div>"
        }
          </div>
        `;
      container.appendChild(itemDiv);
    });

    this.updateTotals();
  }

  updateTotals() {
    const subtotal = this.items.reduce((sum, item) => {
      const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
      return sum + itemTotal;
    }, 0);

    const tax = this.includeTax ? subtotal * 0.1 : 0; // 10% de imposto se incluído
    const total = subtotal + tax;

    // Atualizar na interface
    document.getElementById("subtotal").textContent = `R$ ${subtotal.toFixed(2)}`;

    const taxElement = document.getElementById("tax");
    if (this.includeTax) {
      taxElement.textContent = `R$ ${tax.toFixed(2)}`;
      taxElement.parentElement.style.display = 'flex';
    } else {
      taxElement.parentElement.style.display = 'none';
    }

    document.getElementById("total").textContent = `R$ ${total.toFixed(2)}`;
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    const clientData = {
      clientName: document.getElementById("clientName").value,
      clientEmail: document.getElementById("clientEmail").value,
      clientPhone: document.getElementById("clientPhone").value,
      clientAddress: document.getElementById("clientAddress").value,
      clientCpfCnpj: document.getElementById("clientCpfCnpj").value,
    };

    // Validation
    if (
      !clientData.clientName ||
      !clientData.clientEmail ||
      !clientData.clientAddress ||
      !clientData.clientCpfCnpj
    ) {
      this.showToast("Preencha todos os campos obrigatórios do cliente", "error");
      return;
    }

    if (
      this.items.some(
        (item) => !item.description || item.quantity <= 0 || item.unitPrice <= 0
      )
    ) {
      this.showToast("Preencha todos os itens corretamente", "error");
      return;
    }

    // Calculate totals - CORREÇÃO AQUI
    const subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
    const tax = this.includeTax ? subtotal * 0.1 : 0; // Usa this.includeTax
    const total = subtotal + tax;

    // Create invoice data
    const invoiceData = {
      invoiceNumber: `NF-${String(this.currentInvoiceNumber).padStart(6, "0")}`,
      ...clientData,
      items: [...this.items],
      subtotal,
      tax,
      total,
      issueDate: new Date().toLocaleDateString("pt-BR"),
      status: "emitida",
    };

    try {
      // Save to API
      const result = await this.saveInvoiceToAPI(invoiceData);

      // Reset form
      this.resetForm();

      // Reload invoices and update counter
      await this.loadInvoicesFromAPI();
      await this.getNextInvoiceNumber();

      // Show success message and switch to list tab
      this.showToast("Nota fiscal criada com sucesso!", "success");
      this.switchTab("list");
    } catch (error) {
      this.showToast(error.message || "Erro ao criar nota fiscal", "error");
    }
  }

  resetForm() {
    document.getElementById("invoice-form").reset();
    this.items = [{ description: "", quantity: 1, unitPrice: 0, total: 0 }];
    this.includeTax = false; // CORREÇÃO: Reseta o checkbox também
    this.renderItems();
  }

  renderInvoicesList() {
    const container = document.getElementById("invoices-list");

    if (this.invoices.length === 0) {
      container.innerHTML = `
          <div class="empty-state">
            <div class="empty-icon">📄</div>
            <h3>Nenhuma nota fiscal encontrada</h3>
            <p>Crie sua primeira nota fiscal na aba "Nova Nota Fiscal"</p>
          </div>
        `;
      return;
    }

    container.innerHTML = `
        <h3 class="section-title">Notas Fiscais Emitidas (${this.invoices.length})</h3>
        <div class="invoices-grid">
          ${this.invoices
        .map(
          (invoice) => `
            <div class="invoice-card">
              <div class="invoice-header">
                <div>
                  <div class="invoice-number">${invoice.invoiceNumber}</div>
                  <div class="invoice-status">${invoice.status}</div>
                </div>
              </div>
              <div class="invoice-details">
                <div class="invoice-detail">
                  <span class="invoice-detail-label">Cliente:</span>
                  <div>${invoice.clientName}</div>
                  <div style="color: #6b7280; font-size: 0.75rem;">${invoice.clientEmail}</div>
                </div>
                <div class="invoice-detail">
                  <span class="invoice-detail-label">Data de Emissão:</span>
                  <div>${invoice.issueDate}</div>
                  <span class="invoice-detail-label">Itens:</span>
                  <div>${invoice.items.length} item(s)</div>
                </div>
                <div class="invoice-detail">
                  <span class="invoice-detail-label">Valor Total:</span>
                  <div class="invoice-total">R$ ${invoice.total.toFixed(2)}</div>
                </div>
              </div>
              <div class="invoice-actions">
                <button 
                  class="btn-secondary" 
                  onclick="invoiceManager.previewInvoice('${invoice.id || invoice._id}')"
                >
                  Ver/Imprimir
                </button>
                <button 
                  class="btn-trash" 
                  onclick="invoiceManager.deleteInvoice('${invoice.id || invoice._id}')"
                  title="Remover nota fiscal"
                >
                  🗑️
                </button>
              </div>
            </div>
          `
        )
        .join("")}
        </div>
      `;
  }

  previewInvoice(invoiceId) {
    const invoice = this.invoices.find((inv) => (inv.id || inv._id) === invoiceId);
    if (!invoice) return;

    const modal = document.getElementById("preview-modal");
    const previewContainer = document.getElementById("invoice-preview");

    previewContainer.innerHTML = `
        <div class="invoice-document print-content">
          <div class="invoice-company-header">
            <div class="company-logo">
              <img src="/assets/imagens/logo.png" alt="Logo Tudboom" class="company-logo-img">
              <div>
                <div class="company-name">TUDBOOM</div>
                <div class="company-tagline">Produtos Personalizados</div>
              </div>
            </div>
            <div class="invoice-title-section">
              <div class="invoice-title">NOTA</div>
              <div class="invoice-subtitle">(Sem validade fiscal)</div>
            </div>
          </div>
  
          <div class="invoice-info-grid">
            <div class="info-section">
              <h3>DADOS DA EMPRESA</h3>
              <p><strong>TUDBOOM LTDA</strong></p>
              <p>Rua Luiza de Carvalho, 250</p>
              <p>Sorocaba</p>
              <p>CEP: 18046-161</p>
              <p>Telefone: (15)991865-965</p>
              <p>Email: comercial.tudboom@gmail.com</p>
            </div>
            <div class="info-section">
              <h3>DADOS DA NOTA</h3>
              <p><strong>Número:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Data de Emissão:</strong> ${invoice.issueDate}</p>
              <p><strong>Status:</strong> ${invoice.status}</p>
            </div>
          </div>
  
          <div class="client-info">
            <h3>DADOS DO CLIENTE</h3>
            <p><strong>Nome:</strong> ${invoice.clientName}</p>
            <p><strong>Email:</strong> ${invoice.clientEmail}</p>
            ${invoice.clientPhone ? `<p><strong>Telefone:</strong> ${invoice.clientPhone}</p>` : ""}
            <p><strong>CPF/CNPJ:</strong> ${invoice.clientCpfCnpj}</p>
            <p><strong>Endereço:</strong> ${invoice.clientAddress}</p>
          </div>
  
          <div>
            <h3 style="color: #be185d; font-weight: bold; margin-bottom: 0.5rem;">ITENS</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Qtd</th>
                  <th>Valor Unit.</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items
        .map(
          (item) => `
                  <tr>
                    <td>${item.description}</td>
                    <td>${item.quantity}</td>
                    <td>R$ ${item.unitPrice.toFixed(2)}</td>
                    <td>R$ ${item.total.toFixed(2)}</td>
                  </tr>
                `
        )
        .join("")}
              </tbody>
            </table>
          </div>
  
          <div class="invoice-totals">
            <div class="totals-box">
              <div class="total-line">
                <span>Subtotal:</span>
                <span>R$ ${invoice.subtotal.toFixed(2)}</span>
              </div>
              ${invoice.tax > 0 ? `
              <div class="total-line">
                <span>Impostos:</span>
                <span>R$ ${invoice.tax.toFixed(2)}</span>
              </div>
              ` : ''}
              <div class="total-line total-final-line">
                <span>Total:</span>
                <span>R$ ${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
  
          <div class="invoice-footer">
          </div>
        </div>
      `;

    modal.classList.add("active");
    this.currentPreviewInvoice = invoice;
  }

  closeModal() {
    document.getElementById("preview-modal").classList.remove("active");
    this.currentPreviewInvoice = null;
  }

  printInvoice() {
    const printContent = document.querySelector(".print-content");
    if (printContent) {
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printContent.outerHTML;
      window.print();
      document.body.innerHTML = originalContent;

      // Reinitialize the app after printing
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }

  downloadInvoice() {
    if (!this.currentPreviewInvoice) return;

    const invoice = this.currentPreviewInvoice;
    const content = this.generateTextContent(invoice);

    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${invoice.invoiceNumber}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  downloadPDF() {
    const element = document.querySelector(".print-content");
    if (!element || !this.currentPreviewInvoice) return;

    const opt = {
      margin: 0.5,
      filename: `${this.currentPreviewInvoice.invoiceNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  }

  async deleteInvoice(invoiceId) {
    if (!confirm("Tem certeza que deseja excluir esta nota fiscal?")) {
      return;
    }

    try {
      await this.deleteInvoiceFromAPI(invoiceId);
      await this.loadInvoicesFromAPI();
      this.showToast("Nota fiscal removida com sucesso!", "success");
    } catch (error) {
      this.showToast(error.message || "Erro ao remover nota fiscal", "error");
    }
  }

  generateTextContent(invoice) {
    return `
TUDBOOM - NOTA FISCAL
=====================

Número: ${invoice.invoiceNumber}
Data: ${invoice.issueDate}
Status: ${invoice.status}

DADOS DO CLIENTE:
Nome: ${invoice.clientName}
Email: ${invoice.clientEmail}
${invoice.clientPhone ? `Telefone: ${invoice.clientPhone}` : ""}
CPF/CNPJ: ${invoice.clientCpfCnpj}
Endereço: ${invoice.clientAddress}

ITENS:
${invoice.items
        .map(
          (item, index) =>
            `${index + 1}. ${item.description} - Qtd: ${item.quantity} - Valor: R$ ${item.unitPrice.toFixed(2)} - Total: R$ ${item.total.toFixed(2)}`
        )
        .join("\n")}

TOTAIS:
Subtotal: R$ ${invoice.subtotal.toFixed(2)}
${invoice.tax > 0 ? `Impostos: R$ ${invoice.tax.toFixed(2)}` : ''}
Total: R$ ${invoice.total.toFixed(2)}

---
Esta é uma nota fiscal sem validade fiscal.
Tudboom - Produtos Personalizados
    `;
  }

  updateInvoiceCount() {
    document.getElementById("invoice-count").textContent = this.invoices.length;
  }

  showToast(message, type = "success") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.invoiceManager = new InvoiceManager();
});