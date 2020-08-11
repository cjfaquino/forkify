// Global app controller

import str from './models/Search';
import { add, multiply, ID } from './views/searchView';

console.log(`using imported functions ${add(ID, 2)} and ${multiply(3, 5)}. ${str}`);
