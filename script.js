const API_URL = "https://dummyjson.com/recipes";

const recipeGrid = document.getElementById('recipe-grid');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const cuisineSelect = document.getElementById('cuisine-filter');
const difficultySelect = document.getElementById('difficulty-filter');
const totalRecipesText = document.getElementById('recipe-count');
const favoriteCountBadge = document.getElementById('favorite-count');
const favoriteButton = document.getElementById('favorite-button');
const resetButton = document.getElementById('reset-filter-button');

const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const emptyState = document.getElementById('empty-state');

const recipeDialog = document.getElementById('recipe-dialog');
const dialogContent = document.getElementById('dialog-content');
const closeDialogBtn = document.getElementById('close-dialog');

let allRecipes = [];
let favorites = [];
let showOnlyFavorites = false;

const fetchRecipes = async () => {
  showState('loading');
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Gagal mengambil data');
    
    const data = await response.json();
    allRecipes = data.recipes;
    
    populateCuisineFilter(allRecipes);
    filterAndRender();
  } catch (error) {
    console.error("Error:", error);
    showState('error');
  }
};

function showState(state) {
  loadingState.hidden = state !== 'loading';
  errorState.hidden = state !== 'error';
  emptyState.hidden = state !== 'empty';
  recipeGrid.hidden = state !== 'content';
}

function renderRecipes(recipes) {
  recipeGrid.innerHTML = '';
  totalRecipesText.textContent = `${recipes.length} recipes`;

  if (recipes.length === 0) {
    showState('empty');
    return;
  }

  showState('content');

  recipes.forEach((recipe) => {
    const { id, name, cuisine, prepTimeMinutes, cookTimeMinutes, difficulty, image, rating } = recipe;
    const isFav = favorites.includes(id);

    recipeGrid.innerHTML += `
      <article class="recipe-card">
        <div class="recipe-image-wrap">
          <img class="recipe-image" src="${image}" alt="${name}" loading="lazy">
        </div>

        <div class="recipe-body">
          <span class="recipe-cuisine">${cuisine.toUpperCase()}</span>
          <h3 class="recipe-title">${name}</h3>

          <div class="recipe-meta">
            <span>⭐ ${rating}</span>
            <span>⏱️ ${prepTimeMinutes + cookTimeMinutes} min</span>
            <span>${difficulty}</span>
          </div>

          <div class="recipe-actions">
            <button type="button" class="view-detail-btn" data-id="${id}">View Detail</button>
            <button type="button" class="fav-btn ${isFav ? 'active' : ''}" data-id="${id}">
              ${isFav ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      </article>
    `;
  });
}

function populateCuisineFilter(recipes) {
  const cuisines = [...new Set(recipes.map((r) => r.cuisine))];
  cuisineSelect.innerHTML = '<option value="">All Cuisine</option>';
  cuisines.forEach((cuisine) => {
    cuisineSelect.innerHTML += `<option value="${cuisine}">${cuisine}</option>`;
  });
}

function filterAndRender() {
  const searchQuery = searchInput.value.toLowerCase().trim();
  const selectedCuisine = cuisineSelect.value;
  const selectedDifficulty = difficultySelect.value;

  const isFiltered = searchQuery !== '' || selectedCuisine !== '' || selectedDifficulty !== '' || showOnlyFavorites;
  resetButton.hidden = !isFiltered;

  if (favoriteButton) {
    favoriteButton.classList.toggle('active', showOnlyFavorites);
  }

  const filtered = allRecipes.filter((recipe) => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery);
    const matchesCuisine = selectedCuisine === '' || recipe.cuisine === selectedCuisine;
    const matchesDifficulty = selectedDifficulty === '' || recipe.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    const matchesFavorites = !showOnlyFavorites || favorites.includes(recipe.id);

    return matchesSearch && matchesCuisine && matchesDifficulty && matchesFavorites;
  });

  renderRecipes(filtered);
}

function toggleFavorite(id) {
  const recipeId = Number(id);
  if (favorites.includes(recipeId)) {
    favorites = favorites.filter((favId) => favId !== recipeId);
  } else {
    favorites.push(recipeId);
  }
  
  favoriteCountBadge.textContent = favorites.length;
  filterAndRender();
}

function showRecipeDetail(id) {
  const recipe = allRecipes.find((r) => r.id === Number(id));
  if (!recipe) return;

  dialogContent.innerHTML = `
    <h2>${recipe.name}</h2>
    <img src="${recipe.image}" alt="${recipe.name}" style="width: 100%; max-height: 250px; object-fit: cover; border-radius: 8px; margin: 12px 0;">
    <p><strong>Cuisine:</strong> ${recipe.cuisine}</p>
    <p><strong>Difficulty:</strong> ${recipe.difficulty}</p>
    <p><strong>Prep Time:</strong> ${recipe.prepTimeMinutes} mins | <strong>Cook Time:</strong> ${recipe.cookTimeMinutes} mins</p>
    <p><strong>Servings:</strong> ${recipe.servings}</p>
    
    <h3>Ingredients:</h3>
    <ul>
      ${recipe.ingredients.map((ing) => `<li>${ing}</li>`).join('')}
    </ul>

    <h3>Instructions:</h3>
    <ol>
      ${recipe.instructions.map((ins) => `<li>${ins}</li>`).join('')}
    </ol>
  `;

  recipeDialog.showModal();
}

function resetFilters() {
  searchInput.value = '';
  cuisineSelect.value = '';
  difficultySelect.value = '';
  showOnlyFavorites = false;
  filterAndRender();
}

searchInput.addEventListener('input', filterAndRender);

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  filterAndRender();
});

  favoriteButton.addEventListener('click', () => {
    showOnlyFavorites = !showOnlyFavorites; // Toggle mode filter favorit
    filterAndRender();
  });


cuisineSelect.addEventListener('change', filterAndRender);
difficultySelect.addEventListener('change', filterAndRender);

resetButton.addEventListener('click', resetFilters);

recipeGrid.addEventListener('click', (e) => {
  const favBtn = e.target.closest('.fav-btn');
  const detailBtn = e.target.closest('.view-detail-btn');

  if (favBtn) {
    toggleFavorite(favBtn.dataset.id);
  } else if (detailBtn) {
    showRecipeDetail(detailBtn.dataset.id);
  }
});

closeDialogBtn.addEventListener('click', () => {
  recipeDialog.close();
});


fetchRecipes();