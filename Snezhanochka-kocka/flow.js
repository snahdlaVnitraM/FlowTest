App = function ()
{
    var gameState;
    var colors = ['', 'green', 'red', 'blue', 'yellow', 'orange', 'purple'];

    this.init = function ()
    {
        this.createMainMenu();
    };

    this.createMainMenu = function ()
    {
        gameState = 'mainMenu';

        var screenWidth = wade.getScreenWidth();
        var screenHeight = wade.getScreenHeight();
        var backSprite = new Sprite();
        backSprite.setSize(screenWidth, screenHeight);
        backSprite.setDrawFunction(wade.drawFunctions.gradientFill_({ x: 0, y: 1 }, ['#444', '#000']));
        var backObject = new SceneObject(backSprite);
        wade.addSceneObject(backObject);

        this.onResize = function ()
        {
            if (gameState == 'mainMenu') {
                wade.clearScene();
                this.createMainMenu();
            }
        };

        var gridSize = 3;
        var buttonSize = Math.min(screenWidth, screenHeight) / 5;
        var cellSize = buttonSize * 1.2;
        for (var i = 0; i < gridSize; i++) {
            for (var j = 0; j < gridSize; j++) {
                // create a sprite for the border of the button
                var buttonSprite = new Sprite();
                buttonSprite.setSize(buttonSize, buttonSize);
                var x = (i - gridSize / 2 + 0.5) * cellSize;
                var y = (j - gridSize / 2 + 0.5) * cellSize;
                buttonSprite.setDrawFunction(wade.drawFunctions.drawRect_('white', 3));

                // create a scene object for the button
                var button = new SceneObject(buttonSprite, 0, x, y);
                wade.addSceneObject(button);

                // add text to show which level the button is for
                button.levelId = j * gridSize + i + 1;
                var levelText = new TextSprite(button.levelId, (buttonSize / 2) + 'px Arial', 'blue', 'center');
                button.addSprite(levelText, { x: 0, y: buttonSize / 6 });

                // tell the player what to do
                var textSprite = new TextSprite('Select a level', (screenHeight / 10) + 'px Arial', '#88f', 'center');
                wade.addSceneObject(new SceneObject(textSprite, 0, 0, -screenHeight / 2 + screenHeight / 10));

                // make buttons clickable
                button.onMouseUp = function () {
                    wade.app.loadLevel(this.levelId);
                };
                wade.addEventListener(button, 'onMouseUp');
            }
        }

        this.loadLevel = function (levelId) {
            gameState = 'loading';
            wade.clearScene();
            var screenWidth = wade.getScreenWidth();
            var screenHeight = wade.getScreenHeight();

            // create background gradient
            var backSprite = new Sprite(null, 5);
            backSprite.setSize(screenWidth, screenHeight);
            backSprite.setDrawFunction(wade.drawFunctions.gradientFill_({ x: 0, y: 1 }, ['#444', '#000']));
            var backObject = new SceneObject(backSprite);
            wade.addSceneObject(backObject);

            // create loading text
            var loadingText = new TextSprite('Loading level...', (Math.min(screenWidth, screenHeight) / 10) + 'px Arial', '#88f', 'center');
            var loading = new SceneObject(loadingText);
            wade.addSceneObject(loading);

            backObject.onResize = function (eventData) {
                this.getSprite().setSize(eventData.width, eventData.height);
            };
            wade.addEventListener(backObject, 'onResize');

            loading.onResize = function (eventData) {
                this.getSprite().setFont((Math.min(screenWidth, screenHeight) / 10) + 'px Arial');
            };
            wade.addEventListener(loading, 'onResize');

            var levelFile = 'levels/' + levelId + '.json';
            var level = {};
            wade.preloadJson(levelFile, level, function () {
                wade.removeSceneObject(loading);
                wade.app.startLevel(level.data);              
            });
            
        };

        this.startLevel = function (levelData) {
            this.levelData = levelData;
            gameState = 'playing';
            var numCells = levelData.length;
            var minSize = Math.min(wade.getScreenWidth(), wade.getScreenHeight());
            var cellSize = minSize / numCells;
            var gridSprite = new Sprite();
            gridSprite.setSize(minSize, minSize);
            gridSprite.setDrawFunction(wade.drawFunctions.grid_(numCells, numCells, 'white', 3));
            var grid = new SceneObject(gridSprite);
            grid.numCells = numCells;
            grid.setName('grid');
            wade.addSceneObject(grid);
            // add dots
            for (var i = 0; i < numCells; i++) {
                for (var j = 0; j < numCells; j++) {
                    var colorId = levelData[j][i];
                    if (colorId) {
                        var dotSprite = new Sprite();
                        var dotSize = cellSize * 0.9;
                        var dotPosition = this.gridToWorld(j, i);
                        dotSprite.setSize(dotSize, dotSize);
                        dotSprite.color = colors[colorId];
                        wade.addSceneObject(new SceneObject(dotSprite, 0, dotPosition.x, dotPosition.y));
                    }
                }
            }
            dotSprite.setDrawFunction(function (context) {
                var pos = this.getPosition();
                var size = this.getSize();
                var fillStyle = context.fillStyle;
                context.fillStyle = this.color;
                context.beginPath();
                context.moveTo(pos.x, pos.y);
                context.arc(pos.x, pos.y, size.x / 2, 0, Math.PI * 2, false);
                context.fill();
                context.fillStyle = fillStyle;
            });
        };

        this.worldToGrid = function (x, y) {
            var grid = wade.getSceneObject('grid');
            var pos = grid.getPosition();
            var size = grid.getSprite().getSize();
            var gridX = Math.floor((x - (pos.x - size.x / 2)) / (size.x / grid.numCells));
            var gridY = Math.floor((y - (pos.y - size.y / 2)) / (size.y / grid.numCells));
            return { x: gridX, y: gridY, valid: (gridX >= 0 && gridY >= 0 && gridX < grid.numCells && gridY < grid.numCells) };
        };

        this.gridToWorld = function (x, y) {
            var grid = wade.getSceneObject('grid');
            var pos = grid.getPosition();
            var size = grid.getSprite().getSize();
            var worldX = (x + 0.5) * size.x / grid.numCells + pos.x - size.x / 2;
            var worldY = (y + 0.5) * size.y / grid.numCells + pos.y - size.y / 2;
            return { x: worldX, y: worldY };
        };
    };
};