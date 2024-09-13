document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const alertList = document.getElementById('alert-list');

    function switchTab(tabId) {
        tabButtons.forEach(button => button.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        document.querySelector(`.tab-button[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(tabId).classList.add('active');

        loadItems(tabId); // تحميل البيانات عند التبديل إلى التبويب المحدد
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    function loadItems(section) {
        const items = JSON.parse(localStorage.getItem(section)) || [];
        const tableBody = document.querySelector(`#${section}-table tbody`);
        tableBody.innerHTML = '';

        items.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.name}</td>
                <td>${item.quantity}</td>
                <td>${formatDateTime(item.subscriptionStart)}</td>
                <td>${formatDateTime(item.subscriptionEnd)}</td>
                <td>${item.contactNumber}</td>
                <td><button onclick="deleteItem('${section}', ${index})">حذف</button></td>
            `;
            tableBody.appendChild(row);
        });

        checkExpiredSubscriptions(section, items);
    }

    function formatDateTime(dateTime) {
        const date = new Date(dateTime);
        return `${date.toLocaleDateString('ar-EG')} ${date.toLocaleTimeString('ar-EG')}`;
    }

    function addItem(section, name, quantity, subscriptionStart, subscriptionEnd, contactNumber) {
        const items = JSON.parse(localStorage.getItem(section)) || [];
        items.push({ name, quantity, subscriptionStart, subscriptionEnd, contactNumber });
        localStorage.setItem(section, JSON.stringify(items));
        loadItems(section);
    }

    function deleteItem(section, index) {
        const items = JSON.parse(localStorage.getItem(section)) || [];
        items.splice(index, 1);
        localStorage.setItem(section, JSON.stringify(items));
        loadItems(section);
    }

    function checkExpiredSubscriptions(section, items) {
        const now = new Date();
        alertList.innerHTML = '';

        items.forEach(item => {
            const endDate = new Date(item.subscriptionEnd);
            if (now > endDate) {
                const alertItem = document.createElement('li');
                alertItem.textContent = `الاشتراك في "${item.name}" قد انتهى!`;
                alertItem.style.color = 'red';
                alertList.appendChild(alertItem);
            }
        });
    }

    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const section = form.id.replace('-form', '');
            const name = form.querySelector(`#${section}-item-name`).value;
            const quantity = form.querySelector(`#${section}-item-quantity`).value;
            const subscriptionStart = form.querySelector(`#${section}-subscription-start`).value;
            const subscriptionEnd = form.querySelector(`#${section}-subscription-end`).value;
            const contactNumber = form.querySelector(`#${section}-contact-number`).value;
            addItem(section, name, quantity, subscriptionStart, subscriptionEnd, contactNumber);
            form.reset();
        });
    });

    switchTab('youtube'); // تفعيل التبويب الأول بشكل افتراضي

    // Expose deleteItem function to global scope
    window.deleteItem = deleteItem;
});
