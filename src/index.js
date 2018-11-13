/**
 *@author mhf
 * @copyright mhf
 * @
 */
import * as all from './MW.Layers.js';
var oldL = window.MWL;
export function noConflict() {
	debugger
	window.MWL = oldL;
	return this;
}
//// Always export us to window global (see #2364)
window.MWL = all;


