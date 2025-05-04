document.addEventListener('DOMContentLoaded', () => {
    const fetchDataBtn = document.getElementById('fetchDataBtn');
    const dataDisplay = document.getElementById('dataDisplay');

    fetchDataBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/api/data');
            const data = await response.json();
            dataDisplay.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            dataDisplay.textContent = 'Error fetching data: ' + error.message;
        }
    });
});
