/* 
 * This file is part of ChiVO, the Chilean Virtual Observatory
 * A project sponsored by FONDEF (D11I1060)
 * Copyright (C) 2015 
 *      Universidad Tecnica Federico Santa Maria Mauricio Solar
 *                                               Marcelo Mendoza
 *      Universidad de Chile                     Diego Mardones
 *      Pontificia Universidad Catolica          Karim Pichara
 *      Universidad de Concepcion                Ricardo Contreras
 *      Universidad de Santiago                  Victor Parada
 *
 * This program is free software; you can redistribute it and/or modify 
 * it under the terms of the GNU General Public License as published by 
 * the Free Software Foundation; either version 2 of the License, or 
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 
 * 02110-1301, USA or visit <http://www.gnu.org/licenses/>.
*/


	// @param evt the source event for Firefox (but not IE--IE uses window.event)
	function _getEventSource(evt) {
		if (window.event) {
			evt = window.event; // For IE
			return evt.srcElement;
		} else {
			return evt.target; // For Firefox
		}
	}

	/** Capture the onmousemove so that we can see if a row from the current
	 *  table if any is being dragged.
	 * @param ev the event (for Firefox and Safari, otherwise we use window.event for IE)
	 */
	document.onmousemove = function(ev){
		if (_currenttable && _currenttable.dragObject) {
			ev   = ev || window.event;
			var mousePos = _currenttable.mouseCoords(ev);
			var y = mousePos.y - _currenttable.mouseOffset.y;
			if (y != _currenttable.oldY) {
				// work out if we're going up or down...
				var movingDown = y > _currenttable.oldY;
				// update the old value
				_currenttable.oldY = y;
				// update the style to show we're dragging
				if (_currenttable.dragObject.className) {
					_currenttable.dragObject.className += " dragging";
				} else {
					_currenttable.dragObject.className = "dragging";
				}
				// If we're over a row then move the dragged row to there so that the user sees the
				// effect dynamically
				var currentRow = _currenttable.findDropTargetRow(y);
				if (currentRow) {
					if (movingDown && _currenttable.dragObject != currentRow) {
						_currenttable.dragObject.parentNode.insertBefore(_currenttable.dragObject, currentRow.nextSibling);
					} else if (! movingDown && _currenttable.dragObject != currentRow) {
						_currenttable.dragObject.parentNode.insertBefore(_currenttable.dragObject, currentRow);
					}
				}
			}

			return false;
		}
	};

	// Similarly for the mouseup
	document.onmouseup   = function(ev){
		if (_currenttable && _currenttable.dragObject) {
			var droppedRow = _currenttable.dragObject;
			// If we have a dragObject, then we need to release it,
			// The row will already have been moved to the right place so we just reset stuff
			//droppedRow.className = removeSubstring(droppedRow.className, "dragging");
			droppedRow.className = droppedRow.className.replace(/ *dragging */g, " ")
			_currenttable.dragObject   = null;
			// And then call the onDrop method in case anyone wants to do any post processing
			_currenttable.onDrop(_currenttable.table, droppedRow);
			_currenttable = null; // let go of the table too
		}
	};

	//
	// Public properties
	//

	/**
	 * Encapsulate table Drag and Drop in a class.  Create one of these for each table
	 */
	TableDnD.TableDnD = function() {
		/** Keep hold of the current drag object if any */
		this.dragObject = null;
		/** The current mouse offset */
		this.mouseOffset = null;
		/** The current table */
		this.table = null;
		/** Remember the old value of Y so that we don't do too much processing */
		this.oldY = 0;

		/** Initialise the drag and drop by capturing mouse move events */
		this.init = function(table) {
			this.table = table;
			var rows = table.tBodies[0].rows; //getElementsByTagName("tr")
			for (var i=0; i<rows.length; i++) {
				// John Tarr: added to ignore rows that I've added the NoDnD attribute to (Category and Header rows)
				var nodrag = rows[i].getAttribute("NoDrag");
				if (nodrag == null || nodrag == "undefined") { //There is no NoDnD attribute on rows I want to drag
					this.makeDraggable(rows[i]);
				}
			}
		};

		/** This function is called when you drop a row, so redefine it in your code
			to do whatever you want, for example use Ajax to update the server */
		this.onDrop = function(table, droppedRow) {
			// Do nothing for now
		};

		/** Get the position of an element by going up the DOM tree and adding up all the offsets */
		this.getPosition = function(e){
			var left = 0;
			var top  = 0;
			/** Safari fix -- thanks to Luis Chato for this! */
			if (e.offsetHeight == 0) {
				/** Safari 2 doesn't correctly grab the offsetTop of a table row
					this is detailed here:
					http://jacob.peargrove.com/blog/2006/technical/table-row-offsettop-bug-in-safari/
					the solution is likewise noted there, grab the offset of a table cell in the row - the firstChild.
					note that firefox will return a text node as a first child, so designing a more thorough
					solution may need to take that into account, for now this seems to work in firefox, safari, ie */
				e = e.firstChild; // a table cell
			}

			while (e.offsetParent){
				left += e.offsetLeft;
				top  += e.offsetTop;
				e     = e.offsetParent;
			}

			left += e.offsetLeft;
			top  += e.offsetTop;

			return {x:left, y:top};
		};

		/** Get the mouse coordinates from the event (allowing for browser differences) */
		this.mouseCoords = function(ev){
			if(ev.pageX || ev.pageY){
				return {x:ev.pageX, y:ev.pageY};
			}
			return {
				x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
				y:ev.clientY + document.body.scrollTop  - document.body.clientTop
			};
		};

		/** Given a target element and a mouse event, get the mouse offset from that element.
			To do this we need the element's position and the mouse position */
		this.getMouseOffset = function(target, ev){
			ev = ev || window.event;

			var docPos    = this.getPosition(target);
			var mousePos  = this.mouseCoords(ev);
			return {x:mousePos.x - docPos.x, y:mousePos.y - docPos.y};
		};

		/** Take an item and add an onmousedown method so that we can make it draggable */
		this.makeDraggable = function(item) {
			if(!item) return;
			var self = this; // Keep the context of the TableDnD inside the function
			item.onmousedown = function(ev) {
				// Need to check to see if we are an input or not, if we are an input, then
				// return true to allow normal processing
				var target = _getEventSource(ev);
				if (target.tagName == 'INPUT' || target.tagName == 'SELECT') return true;
				_currenttable = self;
				self.dragObject  = this;
				self.mouseOffset = self.getMouseOffset(this, ev);
				return false;
			};
			if (item.className) {
				item.className += " draggable";
			} else {
				item.className = "draggable";
			}
		};

		/** We're only worried about the y position really, because we can only move rows up and down */
		this.findDropTargetRow = function(y) {
			var rows = this.table.tBodies[0].rows;
			for (var i=0; i<rows.length; i++) {
				var row = rows[i];
				// John Tarr added to ignore rows that I've added the NoDnD attribute to (Header rows)
				var nodrop = row.getAttribute("NoDrop");
				if (nodrop == null || nodrop == "undefined") {  //There is no NoDnD attribute on rows I want to drag
					var rowY    = this.getPosition(row).y;
					var rowHeight = parseInt(row.offsetHeight,10)/2;
					if (row.offsetHeight == 0) {
						rowY = this.getPosition(row.firstChild).y;
						rowHeight = parseInt(row.firstChild.offsetHeight,10)/2;
					}
					// Because we always have to insert before, we need to offset the height a bit
					if ((y > rowY - rowHeight) && (y < (rowY + rowHeight))) {
						// that's the row we're over
						return row;
					}
				}
			}
			return null;
		};
	};
})();
