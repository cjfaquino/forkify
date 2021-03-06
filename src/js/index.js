import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
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
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    //highlight selected search item
    if (state.search) searchView.highlightSelected(id);

    //create new recipe obj
    state.recipe = new Recipe(id);

    try {
      //get recipe data and parse ingredients
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();

      //calc servings and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      //render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (err) {
      alert('Error processing recipe');
    }
  }
};

['hashchange', 'load'].forEach((event) => window.addEventListener(event, controlRecipe));

//LIST CONTROLLER
const controlList = () => {
  //create new list if theres none
  if (!state.list) state.list = new List();

  //add each ing to list and UI
  state.recipe.ingredients.forEach((el) => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

//LIKE CONTROLLER
const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;

  //user has not liked recipe
  if (!state.likes.isLiked(currentID)) {
    //add like
    const newLike = state.likes.addLike(currentID, state.recipe.title, state.recipe.author, state.recipe.img);
    //toggle like button
    likesView.toggleLikeBtn(true);

    //add like to UI
    likesView.renderLike(newLike);
    //user has liked recipe
  } else {
    //remove like
    state.likes.deleteLike(currentID);
    //toggle like button
    likesView.toggleLikeBtn(false);
    //remove from UI
    likesView.deleteLike(currentID);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//restore liked recipes on page load
window.addEventListener('load', () => {
  state.likes = new Likes();
  //restore likes
  state.likes.readStorage();
  //toggle menu button
  likesView.toggleLikeMenu(state.likes.getNumLikes());
  //render existing likes
  state.likes.likes.forEach((like) => likesView.renderLike(like));
});

//handle delete and  update list item evens
elements.shopping.addEventListener('click', (e) => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  //handle delete button
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    //delete from state
    state.list.deleteItem(id);

    //delete from UI
    listView.deleteItem(id);

    //handle count update
  } else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
});

//handling recipe button clicks
elements.recipe.addEventListener('click', (e) => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches('.btn-increase, .btn-increase *')) {
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    //adding to shopping list
    controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    //like controller
    controlLike();
  }
});
