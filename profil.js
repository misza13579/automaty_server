window.onload = function() {
  const username = sessionStorage.getItem("username");
  const token = sessionStorage.getItem("token");  

  if (!username || !token) {
      window.location.href = "login.htm";
      return;
  }

  document.getElementById("username").innerText = "Witaj, " + username;

  fetch(`http://localhost:3000/wyniki`, {
      method: 'GET',
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
      }
  })
  .then(response => response.json())
  .then(data => {
      if (data.error) {
          alert("Błąd: " + data.error);
          return;
      }

      const tabela = document.getElementById("wynik");
      tabela.innerHTML = ""; // wyczyść jeśli coś jest

      data.forEach((row, index) => {
          const tr = document.createElement("tr");
          if (index >= 5) {
            tr.style.display = "none";  // ukryj wiersze powyżej 5
          }

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

      const showMoreBtn = document.getElementById("showMoreBtn");

      if(data.length > 5){
        showMoreBtn.style.display = "inline-block";  // pokaż przycisk jeśli więcej niż 5 wyników
      } else {
        showMoreBtn.style.display = "none";
      }

      showMoreBtn.onclick = () => {
          for(let i = 5; i < tabela.children.length; i++) {
              tabela.children[i].style.display = "table-row"; // pokaż ukryte wiersze
          }
          showMoreBtn.style.display = "none";  // ukryj przycisk po kliknięciu
      };
  })
  .catch(error => {
      console.error("Błąd:", error);
      alert("Wystąpił błąd podczas ładowania danych.");
  });
};
