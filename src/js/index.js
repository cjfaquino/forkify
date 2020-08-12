import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from './views/base';

/*Global state of app
    - Search object
    - Current recipe obj
    - Shopping list obj
    - Linked recipes */
const state = {};

//SEARCH CONTROLLER

const controlSearch = async () => {
  //1 get query from view
  const query = searchView.getInput();
  console.log(query);

  if (query) {
    //2 new search obj and add to state
    state.search = new Search(query);

    //3 prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);

    try {
      //4 search for recipes
      await state.search.getResults();

      //5 render results in ui
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (err) {
      alert('Something went wrong with the search...');
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-inline');
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

//RECIPE CONTROLLER

const controlRecipe = async () => {
  //get ID from url
  const id = window.location.hash.replace('#', '');

  if (id) {
    //prepare ui

    //create new recipe obj
    state.recipe = new Recipe(id);
    //testing
    window.r = state.recipe;

    try {
      //get recipe data and parse ingredients
      await state.recipe.getRecipe();
      console.log(state.recipe.ingredients);
      state.recipe.parseIngredients();

      //calc servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      //render recipe
      console.log(state.recipe);
    } catch (err) {
      alert('Error processing recipe');
    }
  }
};

['hashchange', 'load'].forEach((event) => window.addEventListener(event, controlRecipe));
