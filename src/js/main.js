const form = document.getElementById('search-form');
const submitBtn = document.getElementById('search-btn');
const count = document.getElementById('count');
const maxResultNum = 10;

form.addEventListener('submit', fetchRepos);
form.addEventListener('keydown', submitOnEnter);

form.query.onfocus = (event) => {
    event.target.placeholder = '';
}

form.query.onblur = (event) => {
    if (event.target.value === '') {
        event.target.placeholder = 'Введите название репозитория';
    }
}

form.query.oninput = (event) => {
    event.target.setCustomValidity('')
}

submitBtn.onclick = (event) => {
    event.preventDefault();
    let form = event.target.closest('#search-form');
    form.dispatchEvent(new Event('submit'));
}

function submitOnEnter(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        let form = event.target.closest('#search-form');
        form.dispatchEvent(new Event('submit'));
    }
}

async function fetchRepos(event) {
    event.preventDefault();
    let form = event.target;
    let rawQuery = form.query.value.trim();
    form.query.value = rawQuery;
    let queryValid = validate(form.query);
    if (!queryValid) {
        return;
    }

    let encodedQuery = 'q=' + encodeURIComponent(`${rawQuery}`);
    let url = `https://api.github.com/search/repositories?${encodedQuery}&per_page=${maxResultNum}`;

    let response;
    try {
        response = await fetch(url);
    } catch (error) {
        displayError('Возникла ошибка в сетевом запросе: ' + error.message);
        return;
    }

    if (!response.ok) {
        displayError('Возникла ошибка в сетевом запросе: HTTP Error ' + response.status);
        return;
    }
    let repos = await response.json();
    count.textContent = repos.total_count;
    console.log(repos);
    constructList(repos);
}

function constructList(repos) {
    let ul = document.querySelector('.repositories__list');
    ul.innerHTML = '';
    let reposArray = repos.items;
    switch (repos.total_count) {
        case 0: {
            displayError('Ничего не найдено');
            break;
        }
        default: {
            let repoTemplate = `<div class="repository">
                                <h3 class="repository__title"><a class="repository__link repo-link" target="_blank"></a></h3>
                                <p class="repository__desc"></p>
                                <div class="repository__info">
                                <span class="repository__author">Автор: <a class="repository__link author-link" target="_blank"></a></span>
                                <span class="repository__proglang"></span>
                                <span class="repository__last-update"></span></div></div>`
            reposArray.forEach(element => {
                let li = document.createElement('li');
                li.className = 'repositories__list-item';
                li.insertAdjacentHTML('afterbegin', repoTemplate);
                let title = li.querySelector('.repo-link');
                title.textContent = element.name;
                title.href = element.html_url;
                li.querySelector('.repository__desc').textContent = element.description;
                let author = li.querySelector('.author-link');
                author.textContent = element.owner.login;
                author.href = element.owner.html_url;
                li.querySelector('.repository__proglang').textContent = `Язык программирования: ${element.language ?? 'отсутствует'}`;
                let dateStr = buildDateString(new Date(element.updated_at));
                li.querySelector('.repository__last-update').textContent = `Последнее обновление: ${dateStr}`;
                ul.append(li);
            });
            break;
        }
    }
}

function buildDateString(date) {
    let monthStr;
    switch (date.getMonth()) {
        case 0:
            monthStr = 'января';
            break;
        case 1:
            monthStr = 'февраля';
            break;
        case 2:
            monthStr = 'марта';
            break;
        case 3:
            monthStr = 'апреля';
            break;
        case 4:
            monthStr = 'мая';
            break;
        case 5:
            monthStr = 'июня';
            break;
        case 6:
            monthStr = 'июля';
            break;
        case 7:
            monthStr = 'августа';
            break;
        case 8:
            monthStr = 'сентября';
            break;
        case 9:
            monthStr = 'октября';
            break;
        case 10:
            monthStr = 'ноября';
            break;
        case 11:
            monthStr = 'декабря';
            break;
    }
    return `${date.getDate()} ${monthStr} ${date.getFullYear()}`;
}

function displayError(error) {
    let li = document.createElement('li');
    let ul = document.querySelector('.repositories__list');
    count.textContent = 0;
    li.textContent = error;
    ul.innerHTML = '';
    ul.append(li);
}

function validate(textInput) {
    const validityState = textInput.validity;

    if (validityState.valueMissing) {
        textInput.setCustomValidity("Поле не должно быть пустым или состоять только из пробелов");
    } else {
        textInput.setCustomValidity('');
    }

    return textInput.reportValidity();
}