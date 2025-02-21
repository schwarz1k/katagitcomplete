const inputField = document.getElementById('autocomplete');
const autocompleteList = document.getElementById('autocomplete-list');
const repoList = document.getElementById('repo-list');

let addedRepos = [];

let debounceTimeout;
const debounce = (func, delay) => {
    return function (...args) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => func.apply(this, args), delay);
    };
};

const fetchRepositories = async (query) => {
    if (query === "") {
        autocompleteList.textContent = '';
        return;
    }

    try {
        const response = await fetch(`https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc`);
        const data = await response.json();

        autocompleteList.textContent = '';
        data.items.slice(0, 5).forEach(repo => {
            const listItem = document.createElement('li');
            listItem.textContent = repo.name;
            listItem.dataset.owner = repo.owner.login;
            listItem.dataset.stars = repo.stargazers_count;
            listItem.addEventListener('click', () => addRepository(repo));
            autocompleteList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Ошибка при получении данных с API', error);
    }
};

const addRepository = (repo) => {
    const repoItem = document.createElement('li');
    repoItem.classList.add('repo-item');

    repoItem.innerHTML = `
    <p>Name: ${repo.name}</p>
    <p>Owner: ${repo.owner.login}</p>
    <p>Stars: ${repo.stargazers_count}</p>
    <button class="remove-btn" onclick="removeRepository(event)"></button>
  `;

    addedRepos.push(repo);
    repoList.appendChild(repoItem);

    inputField.value = '';
    autocompleteList.innerHTML = '';
};

const removeRepository = (event) => {
    const repoItem = event.target.closest('li');
    const repoIndex = Array.from(repoList.children).indexOf(repoItem);
    addedRepos.splice(repoIndex, 1);
    repoItem.remove();
};

inputField.addEventListener('input', debounce((e) => {
    fetchRepositories(e.target.value);
}, 300));