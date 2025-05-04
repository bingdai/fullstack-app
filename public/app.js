//comment
document.addEventListener('DOMContentLoaded', () => {
    const fetchDataBtn = document.getElementById('fetchDataBtn');
    const createUserForm = document.getElementById('createUserForm');
    const dataDisplay = document.getElementById('dataDisplay');

    // Fetch users
    async function fetchUsers() {
        try {
            const response = await fetch('/api/data');
            const users = await response.json();
            displayUsers(users);
        } catch (error) {
            dataDisplay.textContent = 'Error fetching users: ' + error.message;
        }
    }

    // Create user
    async function createUser(name, email) {
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email }),
            });
            if (!response.ok) {
                throw new Error('Failed to create user');
            }
            fetchUsers(); // Refresh the list after creating a new user
        } catch (error) {
            dataDisplay.textContent = 'Error creating user: ' + error.message;
        }
    }

    // Display users in a table
    function displayUsers(users) {
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        // Create table headers
        const headers = ['ID', 'Name', 'Email', 'Created At'];
        const headerRow = document.createElement('tr');
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);

        // Create table rows
        users.forEach(user => {
            const row = document.createElement('tr');
            Object.values(user).forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });

        table.appendChild(thead);
        table.appendChild(tbody);
        dataDisplay.innerHTML = '';
        dataDisplay.appendChild(table);
    }

    // Event listeners
    fetchDataBtn.addEventListener('click', fetchUsers);

    if (createUserForm) {
        createUserForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            createUser(name, email);
        });
    }
});
