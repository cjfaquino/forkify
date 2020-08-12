import Search from './models/Search';
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from './views/base';

/*Global state of app
    - Search object
    - Current recipe obj
    - Shopping list obj
    - Linked recipes */
const state = {};

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

    //4 search for recipes
    await state.search.getResults();

    //5 render results in ui
    clearLoader();
    searchView.renderResults(state.search.result);
  }
};

elements.searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  controlSearch();
});
