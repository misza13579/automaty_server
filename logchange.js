document.getElementById("logch").addEventListener("submit", async function(e) {
  e.preventDefault();
  
  const username = sessionStorage.getItem("username");
  const token = sessionStorage.getItem("token"); 
  if (!username || !token) {
    // Jeśli użytkownik nie jest zalogowany (brak nazwy użytkownika lub tokenu), przekieruj na stronę logowania
    window.location.href = "login.htm";
    return;
}


  const newusername = document.getElementById("newusername").value.trim();
  const password = document.getElementById("password").value;

  if (!newusername || !password) {
      showError("Wypełnij wszystkie pola!");
      return;
  }

  try {
      const response = await fetch("http://localhost:3000/zmiana_loginu", {
          method: "PUT",
          headers: {
            'Authorization': `Bearer ${token}`,
              "Content-Type": "application/json"
          },
          body: JSON.stringify({ newusername, username, password })
      });

      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.message || "Błąd podczas zmiany loginu");
      }

      alert(data.message);
      sessionStorage.setItem("username", newusername);
      localStorage.removeItem("token");  // Aktualizacja loginu
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