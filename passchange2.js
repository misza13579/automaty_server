document.getElementById("passch").addEventListener("submit", async function(e) {
    e.preventDefault();
    
  
    const newpassword = document.getElementById("newpassword").value.trim();
    const id = document.getElementById("id").value;
  
    if (!newpassword || !id) {
        showError("Wypełnij wszystkie pola!");
        return;
    }
  
    try {
        const response = await fetch("http://localhost:3000/zmiana_hasla2", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ newpassword, id })
        });
  
        const data = await response.json();
  
        if (!response.ok) {
            throw new Error(data.message || "Błąd podczas zmiany hasla");
        }
  
        alert(data.message);
        window.location.href = "main.htm";
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

  const newpasswordInput = document.getElementById("newpassword");
const idInput = document.getElementById("id");

function checkFields() {
  if (newpasswordInput.value.trim() !== "") {
    idInput.disabled = false;
  } else {
    idInput.disabled = true;
  }
}

// Nasłuchuj zmiany
newpasswordInput.addEventListener('input', checkFields);

// Ustaw idInput na disabled na starcie strony
idInput.disabled = true;