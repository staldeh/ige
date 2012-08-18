ToolBarPanel = IgeClass.extend({
	init: function () {
		var self = this;

		// Load our menu
		$.ajax({
			url: "panels/ToolBar/index.html",
			success: function (data) {
				$('#leftBar').append(data);

				// Activate the click events
				$('.tool').click(function () {
					self.toolClicked(this);
				});

				// Add required components
				ige.children().each(function (viewport) {
					viewport.addComponent(igeFrame.IgeMousePanComponent);
					viewport.addComponent(igeFrame.IgeMouseZoomComponent);

					// Disable mouse panning by default
					viewport.mousePan.enabled(false);

					// Disable mouse zooming by default
					viewport.mouseZoom.enabled(false);
				});

				// Select the selectTool tool initially
				$('#leftBar #selectTool').click();

				// Listen for mouse events
				editor.on('igeMouseDown', function (event) { self._igeMouseDown(event); });
				editor.on('igeMouseMove', function (event) { self._igeMouseMove(event); });
				editor.on('igeMouseUp', function (event) { self._igeMouseUp(event); });
			},
			dataType: 'html'
		});

		this._fullScreen = false;

		// Register with the toolbar object
		editor.toolBar = this;
	},

	toolClicked: function (tool) {
		// Special case for the full screen tool
		if (tool.id === 'toolFullScreen') {
			this.toggleFullScreen();
			$("#vertical").data("kendoSplitter").autoResize();
		} else {
			// Record the current tool
			var selectedObject = editor.panel('sceneGraph')._selectedObject;
			this._currentTool = tool.id;

			// Set the correct icon as selected
			$('#leftBar .tool').removeClass('selected');
			$('#leftBar #' + tool.id).addClass('selected');

			// Stop mouse-panning/zooming on the viewport by default
			ige.children().each(function (viewport) {
				// Disable mouse panning
				viewport.mousePan.enabled(false);

				// Disable mouse zooming
				viewport.mouseZoom.enabled(false);
			});

			// Turn off draw mouse by default
			if (selectedObject) {
				switch (selectedObject.classId()) {
					case 'IgeTileMap2d':
					case 'IgeTextureMap':
						selectedObject.drawMouse(false);
						break;
				}
			}

			switch (tool.id) {
				case 'toolPaint':
					if (selectedObject) {
						switch (selectedObject.classId()) {
							case 'IgeTileMap2d':
							case 'IgeTextureMap':
								// Set the map to show mouse tile position
								selectedObject.drawMouse(true);
								break;
						}
					}
					break;

				case 'toolUnPaint':
					if (selectedObject) {
						switch (selectedObject.classId()) {
							case 'IgeTileMap2d':
							case 'IgeTextureMap':
								// Set the map to show mouse tile position
								selectedObject.drawMouse(true);
								break;
						}
					}
					break;

				case 'toolPan':
					// Enable panning on viewports
					ige.children().each(function (viewport) {
						// Enable mouse panning
						viewport.mousePan.enabled(true);
					});
					break;

				case 'toolZoom':
					// Enable zooming on viewports
					ige.children().each(function (viewport) {
						// Enable mouse zooming
						viewport.mouseZoom.enabled(true);
					});
					break;
			}
		}
	},

	toggleFullScreen: function () {
		if (!this._fullScreen) {
			$("#vertical").data("kendoSplitter").collapse('#menuBar');
			$("#vertical").data("kendoSplitter").collapse('#leftBar');
			$("#vertical").data("kendoSplitter").collapse('#rightBar');
			$("#vertical").data("kendoSplitter").collapse('#statusBar');
			this._fullScreen = true;
		} else {
			$("#vertical").data("kendoSplitter").expand('#menuBar');
			$("#vertical").data("kendoSplitter").expand('#leftBar');
			$("#vertical").data("kendoSplitter").expand('#rightBar');
			$("#vertical").data("kendoSplitter").expand('#statusBar');
			this._fullScreen = false;
		}
	},

	resetZoom: function () {

	},

	_igeMouseDown: function (event) {
		switch (this._currentTool) {
			case 'toolPaint':
				this._mouseIsDown = true;
				this._paintTile();
				break;

			case 'toolUnPaint':
				this._mouseIsDown = true;
				this._unPaintTile();
				break;
		}
	},

	_igeMouseMove: function (event) {
		switch (this._currentTool) {
			case 'toolPaint':
				if (this._mouseIsDown) {
					this._paintTile();
				}
				break;

			case 'toolUnPaint':
				if (this._mouseIsDown) {
					this._unPaintTile();
				}
				break;
		}
	},

	_igeMouseUp: function (event) {
		this._mouseIsDown = false;
	},

	_paintTile: function () {
		// Is the selected object a texture map?
		var selectedObject = editor.panel('sceneGraph')._selectedObject,
			textureIndex, textureCell = editor._currentTextureCell > 0 ? editor._currentTextureCell : 1, tilePos;

		switch (selectedObject.classId()) {
			case 'IgeTextureMap':
				// Is there a selected texture?
				if (editor._currentTexture) {
					// Is this texture present in the texture map's texture list?
					textureIndex = selectedObject._textureList.indexOf(editor._currentTexture);
					if (textureIndex === -1) {
						// The texture does not currently exist so add it
						textureIndex = selectedObject.addTexture(editor._currentTexture);
					}

					// Get the current tile co-ordinates
					tilePos = selectedObject._mouseTilePos;

					// Paint the tile
					selectedObject.paintTile(tilePos.x, tilePos.y, textureIndex, textureCell);
				}
				break;
		}
	},

	_unPaintTile: function () {
		// Is the selected object a texture map?
		var selectedObject = editor.panel('sceneGraph')._selectedObject,
			textureIndex, textureCell = editor._currentTextureCell > 0 ? editor._currentTextureCell : 1, tilePos;

		switch (selectedObject.classId()) {
			case 'IgeTextureMap':
				// Get the current tile co-ordinates
				tilePos = selectedObject._mouseTilePos;

				// Clear the tile
				selectedObject.clearTile(tilePos.x, tilePos.y);
				break;
		}
	}
});

editor.panel('toolBar', ToolBarPanel);