document.getElementById("passch").addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const username = sessionStorage.getItem("username");
    const token = sessionStorage.getItem("token"); 
    if (!username || !token) {
        // Jeśli użytkownik nie jest zalogowany (brak nazwy użytkownika lub tokenu), przekieruj na stronę logowania
        window.location.href = "login.htm";
        return;
    }
  
    const newpassword = document.getElementById("secondpassword").value.trim();
    const password = document.getElementById("password").value;
  
    if (!newpassword || !password) {
        showError("Wypełnij wszystkie pola!");
        return;
    }
  
    try {
        const response = await fetch("http://localhost:3000/zmiana_hasla", {
            method: "PUT",
            headers: {
                'Authorization': `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ newpassword, username, password })
        });
  
        const data = await response.json();
  
        if (!response.ok) {
            throw new Error(data.komunikat || data.message || "Błąd podczas zmiany hasła");
        }
        
        alert(data.komunikat || "Hasło zmienione.");
        sessionStorage.removeItem("token"); 
        sessionStorage.removeItem("username"); 
        window.location.href = "login.htm";
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