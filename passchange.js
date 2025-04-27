document.getElementById("passch").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const username = sessionStorage.getItem("username");
    if (!username) {
        showError("Nie jesteś zalogowany!");
        return;
    }
  
    const newpassword = document.getElementById("newpassword").value.trim();
    const password = document.getElementById("password").value;
  
    if (!newpassword || !password) {
        showError("Wypełnij wszystkie pola!");
        return;
    }
  
    try {
        const response = await fetch("http://localhost:3000/zmiana_hasla", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ newpassword, username, password })
        });
  
        const data = await response.json();
  
        if (!response.ok) {
            throw new Error(data.message || "Błąd podczas zmiany hasla");
        }
  
        alert(data.message);
        window.location.href = "profil.html";
    } catch (error) {
        showError(error.message);
        console.error("Błąd:", error);
    }
  });
  
  function showError(message) {
    const errorElement = document.getElementById("error-message");
    errorElement.textContent = message;
    setTimeout(() => errorElement.textContent = '', 5000);
  }