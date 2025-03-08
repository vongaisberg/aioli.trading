function fetchCardData() {
    fetch('/api/cards')
      .then(response => response.json())
      .then(data => {
        document.getElementById('current-index').textContent = `${data.current_index.toFixed(2)} €/ton`;
        document.getElementById('monthly-change-abs').textContent = `${data.monthly_change_abs >= 0 ? '+' : ''}${data.monthly_change_abs.toFixed(2)} €/ton`;
        document.getElementById('monthly-change-rel').textContent = `${data.monthly_change_rel >= 0 ? '+' : ''}${data.monthly_change_rel.toFixed(2)}%`;
        document.getElementById('price-target').textContent = `${data.price_target.toFixed(2)} €/ton`;
      });
  }
  
  export { fetchCardData };
  