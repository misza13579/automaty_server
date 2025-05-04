window.onload = function() {
  const username = sessionStorage.getItem("username");
  const token = sessionStorage.getItem("token");  // Zakładając, że token jest zapisany w sessionStorage po zalogowaniu
  
  if (!username || !token) {
      // Jeśli użytkownik nie jest zalogowany (brak nazwy użytkownika lub tokenu), przekieruj na stronę logowania
      window.location.href = "login.htm";
      return;
  }

  document.getElementById("username").innerText = "Witaj, " + username;

  // Dodanie tokenu JWT do nagłówka żądania
  fetch(`http://localhost:3000/wyniki`, {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      }
  })
  .then(response => response.json())
  .then(data => {
    console.log(data); 
      if (data.error) {
          // Obsługa sytuacji, gdy użytkownik nie ma dostępu do wyników
          alert("Błąd: " + data.error);
          return;
      }

      const tabela = document.getElementById("wynik");  // <-- tbody

      data.forEach(row => {
          const tr = document.createElement("tr");

          const tdData = document.createElement("td");
          tdData.innerText = row.data;
          tdData.style.border = "1px solid black";
          tdData.style.padding = "8px";

          const tdWynik = document.createElement("td");
          tdWynik.innerText = row.wynik;
          tdWynik.style.border = "1px solid black";
          tdWynik.style.padding = "8px";

          tr.appendChild(tdData);
          tr.appendChild(tdWynik);

          tabela.appendChild(tr);
      });
  })
  .catch(error => {
      console.error("Błąd:", error);
      alert("Wystąpił błąd podczas ładowania danych.");
  });
};
