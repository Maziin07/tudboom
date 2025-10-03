// login.js

// Estado da aplicação
let isLoggedIn = false;

// Elementos DOM
const loginScreen = document.getElementById("loginScreen");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const errorMessage = document.getElementById("errorMessage");
const loginBtn = document.getElementById("loginBtn");
const loginBtnText = document.getElementById("loginBtnText");
const loginLoader = document.getElementById("loginLoader");

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  loginForm.addEventListener("submit", handleLogin);
  togglePassword.addEventListener("click", handleTogglePassword);
});

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  loginBtnText.style.display = "none";
  loginLoader.style.display = "block";
  loginBtn.disabled = true;

  setTimeout(() => {
    if (email === "marcelodias@tudboom.com" || "46306186867" && password === "tudboom@2025LTDA" || "Mariinete@2810") {
      hideError();
      window.location.href = "/src/pages/dashboard.html";
    } else {
      showError("Email ou senha incorretos.");
    }
    loginBtnText.style.display = "flex";
    loginLoader.style.display = "none";
    loginBtn.disabled = false;
  }, 1000);
}

function handleTogglePassword() {
  const type = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = type;
  const icon = togglePassword.querySelector("i");
  icon.className = type === "password" ? "fas fa-eye" : "fas fa-eye-slash";
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
}

function hideError() {
  errorMessage.style.display = "none";
}
