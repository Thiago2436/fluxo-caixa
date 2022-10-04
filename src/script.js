const instance = axios.create({
    baseURL: 'http://localhost:3333'
});

const cashFlow = {
    movements: [],
    getRevenue: function () {
        let revenueTotal = 0;
        for (let revenue of this.movements) {
            if (revenue.type === "revenue") {
                revenueTotal += revenue.value;
            }
        }
        return revenueTotal;
    },
    getExpense: function () {
        let expenseTotal = 0;
        for (let expense of this.movements) {
            if (expense.type === "expense") {
                expenseTotal += expense.value;
            }
        }
        return expenseTotal;
    }
}

loadMovements();

function loadMovements() {
    instance.get('/movements')
        .then((response) => {
            cashFlow.movements = response.data;
            displayRevenue();
            displayExpense();
            calcBalance();
            displayMovements()
        })
        .catch((err) => {
            console.error(err)
        })
}

function createMovement(newMovement) {
    instance.post('/movements', newMovement)
        .then(function (response) {
            closeModal();
            loadMovements();
            clearForm();
        })
        .catch(function (error) {
            console.log(error);
        });
}

function displayMovements() {
    let movements = '';
    for (let movement of cashFlow.movements) {
        let newDetails = `<div class="details-description ${movement.type === "revenue" ? "details-description-revenue" : "details-description-expense"}">
                            <div class="description-category">
                                <div id="description">${movement.description}</div>
                                <div id="category">${movement.category}</div>
                            </div>
                            <div class="description-value">
                                <div id="value">${convertDataToCurrency(movement.value)}</div>
                                <div id="date">${movement.date}</div>
                            </div>
                        </div>
        `;
        movements = movements + newDetails;
    }
    document.getElementById('details').innerHTML = movements;
}

function calcBalance() {
    let currentRevenue = cashFlow.getRevenue();
    let currentExpense = cashFlow.getExpense();
    let currentBalance = currentRevenue - currentExpense;

    displayProgressBar(currentBalance, currentExpense, currentRevenue);
    displayBalance(currentBalance);
}

function displayProgressBar(currentBalance, currentExpense, currentRevenue) {
    const progressData = {
        width: '',
        backgroundColor: 'rgb(60, 207, 60)',
        percentRevenue: '',
        percentExpense: '',
    }
    if (currentBalance > 0) {
        let barPercentExpense = (currentExpense * 100) / currentRevenue;

        progressData.width = (100 - barPercentExpense) + "%";
        progressData.percentRevenue = 100 - barPercentExpense.toFixed(0) + "%";
        progressData.percentExpense = barPercentExpense.toFixed(0) + "%";
    } else {
        let barPercentRevenue = (currentRevenue * 100) / currentExpense;

        progressData.width = barPercentRevenue + "%";
        progressData.percentRevenue = barPercentRevenue.toFixed(0) + "%";
        progressData.percentExpense = 100 - barPercentRevenue.toFixed(0) + "%";
    }

    document.getElementById("myBar").style.width = progressData.width;
    document.getElementById("myBar").style.backgroundColor = progressData.backgroundColor;
    document.getElementById("percent-revenue").innerText = progressData.percentRevenue;
    document.getElementById("percent-expense").innerText = progressData.percentExpense;
}

function displayBalance(currentBalance) {
    let data = convertDataToCurrency(currentBalance);
    document.getElementById('current-balance').innerHTML = data;
}

function displayRevenue() {
    let data = cashFlow.getRevenue();
    data = convertDataToCurrency(data)
    document.getElementById('current-revenue').innerHTML = data;
}

function displayExpense() {
    let data = cashFlow.getExpense();
    data = convertDataToCurrency(data);
    document.getElementById('current-expense').innerHTML = data;
}

function convertDataToCurrency(data) {
    return `${data.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}`;
}

function openModal() {
    let modal = document.getElementById('myModal');
    modal.style.display = "flex";
}

function closeModal() {
    let modal = document.getElementById('myModal');
    modal.style.display = "none";
}

function submitForm() {
    let newType = document.getElementById('new-type').value;
    let newCategory = document.getElementById('new-category').value;
    let newDescription = document.getElementById('new-description').value;
    let newValue = document.getElementById('new-value').value;
    let newDate = document.getElementById('new-date').value;

    const newMovement = {
        type: newType,
        category: newCategory,
        description: newDescription,
        value: parseFloat(newValue),
        date: new Date(newDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
    }
    createMovement(newMovement);
}

function clearForm() {
    document.getElementById('new-type').value = '';
    document.getElementById('new-category').value = '';
    document.getElementById('new-description').value = '';
    document.getElementById('new-value').value = '';
    document.getElementById('new-date').value = '';
}

function onTypeMovementChange() {

    let newType = document.getElementById('new-type');
    if (newType.value === "revenue") {
        document.getElementById('new-category').setAttribute('disabled', 'disabled');
    } else {
        document.getElementById('new-category').removeAttribute('disabled', 'disabled');
    }
}


