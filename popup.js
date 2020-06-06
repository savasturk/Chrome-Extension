

function runSnakeGame(){

    window.onload  = function(){
		var url = window.location.href;
		console.log(url);
		
	}

	function createElement(type, id, leftTop, ...css) {
        const elem = document.createElement(type);
        id && (elem.id = id);
        leftTop && Object.assign(elem.style, leftTop);
        elem.classList.add(...css);
        return elem;
    }

	var snakeBody = jQuery('<div class="snakeBody">');

	const snake = {
        size: JSON.parse(localStorage.getItem('snakesize')) || 5,
        width: 15,
        height: 15,
        body: snakeBody,
	}
	let applePosition;
    let activeDirection = {};
    let tailRule = false;
    let frameRule = false;
	var positionList = JSON.parse(localStorage.getItem('positionList') || "[]");

	var direction = JSON.parse(localStorage.getItem('direction')) || {
		//horizontal: 1,
		horizontal: snake.width,
		vertical: 0
	};
	let score = JSON.parse(localStorage.getItem('score')) || 0;

	function restart() {
        document.getElementById('score-area').classList.add('hide');
        const appleDOM = document.getElementsByClassName('apple');

        for (let i = appleDOM.length; 0 < i;)
            appleDOM[--i].remove();

        snake.size = 5;
        positionList = Array(snake.size).fill({ left: 0, top: 0 });
        direction = { horizontal: snake.width, vertical: 0 };
        score = 0;
        //drawSnake();
        loop();
    }

	var getNextPosition = function(elem, tailRule = false, frameRule = false){
		const { windowH, windowW } = calibrateWindow();
        let left = elem.offsetLeft + direction.horizontal;
        let top = elem.offsetTop + direction.vertical;
        let gameOver = false;

        if (frameRule && (left > windowW || left < 0 || top > windowH || top < 0))
            return { left: elem.offsetLeft, top: elem.offsetTop, gameOver: true };

        if (tailRule
            && positionList.slice(0, positionList.length - 2).filter(x => x.left === left && x.top === top).length > 0)
            return { left: elem.offsetLeft, top: elem.offsetTop, gameOver: true };

        left > windowW && (left = 0) || left < 0 && (left = windowW);
        top > windowH && (top = 0) || top < 0 && (top = windowH);

        activeDirection = { ...direction };
        return { left, top, gameOver };
	};
	function calibrateWindow() {
        const windowH = Math.floor(window.innerHeight / snake.height) * snake.height;
        const windowW = Math.floor(window.innerWidth / snake.width) * snake.width;
        return { windowH, windowW };
    }


	var getElement = function(){
		var targetArea = {
			top: Number(jQuery('.snakeBody:first').css('top').replace('px','')) + (direction.vertical && direction.vertical * 15),
			left: Number(jQuery('.snakeBody:first').css('left').replace('px','')) + (direction.horizontal && direction.horizontal * 15)
		};
		return jQuery(document.elementFromPoint(targetArea.left, targetArea.top));
	};

	var saveGameData = function(){
		localStorage.setItem('positionList', JSON.stringify(positionList));
		localStorage.setItem('direction', JSON.stringify(direction));
		localStorage.setItem('score', JSON.stringify(score));
        localStorage.setItem('snakesize', JSON.stringify(snake.size));
	};
	//Spin animation class is added to the global-score element every time the score changes, after the animation runs
    // With the help of setTimeout, it is deleted back to the spin class.
	function scoreSystem() {
        const scoreSystemDOM = document.getElementById('global-score');
        scoreSystemDOM.innerText ='SCORE ' + score;
        this.autoUp = () => {
            window.snakeScore = setInterval(() => {
                scoreSystemDOM.innerText = 'SCORE ' + ++score;
                scoreSystemDOM.classList.add('spin');
                window.spinAnimate = setTimeout(() => scoreSystemDOM.classList.remove('spin'), 210);
            }, 10000);
        }
        this.up = () => {
            scoreSystemDOM.innerText = 'SCORE ' + (score +=2);
            scoreSystemDOM.classList.add('spin');
            window.spinAnimate2 = setTimeout(() => scoreSystemDOM.classList.remove('spin'), 210);
        };
        this.stop = () => { clearInterval(window.snakeScore); clearTimeout(window.spinAnimate); clearTimeout(window.spinAnimate2); };

        return this;
	}
	function addApple() {
        const { windowH, windowW } = calibrateWindow();
        let left, top;

        while (true) {
            left = Math.floor(Math.random() * (windowW / snake.width)) * snake.width;
            top = Math.floor(Math.random() * (windowH / snake.height)) * snake.height;
            if (positionList.filter(x => x.left === left && x.top === top).length === 0)
                break;
        }
        applePosition = { left, top };
        const apple = createElement('div', null, { left: left + 'px', top: top + 'px' }, 'apple')
        document.body.append(apple);
    }
	//function addEvents() {
	jQuery(document).keydown(function(e){


		if (![32, 37, 38, 39, 40, 81, 87, 69].includes(e.keyCode)) return;
            e.preventDefault();

            const { horizontal, vertical } = activeDirection;
            let h = horizontal;
            let v = vertical;
            switch (e.keyCode) {
                case 32: saveGameData(); break; //space
                case 37: h !== snake.width && (h = -snake.width) && (v = 0); break; //left
                case 38: v !== snake.height && (v = -snake.height) && (h = 0); break; //up
                case 39: h !== -snake.width && (h = snake.width) && (v = 0); break; //right
                case 40: v !== -snake.height && (v = snake.height) && (h = 0); break; //down
                case 81: tailRule = !tailRule; break; //q
                case 87: frameRule = !frameRule; break; //w
                case 69: localStorage.clear(); break; //e
            }
            direction = { horizontal: h, vertical: v };
			const btnRestartDOM = document.getElementById('btn-restart');
			btnRestartDOM.addEventListener('click', restart);
	});
	
//}
function drawScore() {
	const globalScore = createElement('div', 'global-score');
	const scoreArea = createElement('div', 'score-area', {}, 'hide');
	const scoreText = createElement('div', 'score-text', {});
	const btnRestart = createElement('button', 'btn-restart', {});

	btnRestart.innerText = 'restart';
	document.body.append(globalScore, scoreArea);
	scoreArea.append(scoreText, btnRestart);
}


	function loop() {
        scoreSystem().autoUp();
        const scoreTextDOM = document.getElementById('score-text');
        const scoreAreaDOM = document.getElementById('score-area');

        window.snakeInterval = setInterval(() => {
            const snakeDOM = document.getElementsByClassName('snakeBody');

            if (document.getElementsByClassName('apple').length === 0)
                addApple();

            Object.values(snakeDOM).some((elem, i) => {
                positionList[i] = { top: elem.offsetTop, left: elem.offsetLeft };

                if (i == 0) {
                    const { left, top, gameOver } = getNextPosition(elem, tailRule, frameRule);

                    if (gameOver) {
                        clearInterval(window.snakeInterval);
                        scoreSystem().stop();
                        scoreTextDOM.innerText = 'SCORE :' + score;
                        scoreAreaDOM.classList.remove('hide')
                        return true;
                    }

                    Object.assign(elem.style, { left: left + 'px', top: top + 'px' });

                    if (applePosition.left === left && applePosition.top === top) {
                        const apple = document.getElementsByClassName('apple');
                        apple[0].classList.add('snakeBody');
                        apple[0].classList.remove('apple');
                        positionList.push({ left, top });
                        scoreSystem().up();
                        snake.size++;
                    }
                }
                else {
                    const { left, top } = positionList[i - 1];
                    Object.assign(elem.style, { left: left + 'px', top: top + 'px' });
                }
            });

        }, 200);
    }



	jQuery('body').append('<style>.snakeBody { z-index:99999999; width: 15px; height: 15px; position: fixed; top: 0; left:0; background: black;} .snakeBody:first-child {background: red;}</style>');

	var i=0;
	while(i<20){
		jQuery('body').append(snakeBody.clone().css(positionList[i] || {}));
		i++;
	}
	jQuery('.snakeBody:first').css('background','red');

	function setCSS() {
        const CSS = `
        .apple,
        .snakeBody {
            background: #1e1e1e;
            border-radius: 3px;
            height: ${snake.height}px;
            left:0;
            position: fixed;
            top: 0;
            width: ${snake.width}px;
            z-index: 999;
        }
        .apple {
            background: green;
        }
        .snakeBody:first-child {
            background: red;
        }
        #global-score {
            background: #1e1e1eaa;
            color: cyan;
            font-size: 25px;
            left: 0;
            position: fixed;
            top: 0;
            z-index: 9999999;
        }
        .spin {
            animation: spin .1s linear;
        }
        @keyframes spin {
            100% {
                -webkit-transform: rotate(360deg);
                transform: rotate(360deg);
            }
        }
        #score-area {
            align-items: center;
            background: #1e1e1e;
            bottom: 0;
            color: cyan;
            display: flex;
            flex-direction: column;
            height: 150px;
            justify-content: space-around;
            left: 0;
            margin: auto;
            position: fixed;
            right: 0;
            top: 0;
            width: 250px;
            z-index: 9999999;
        }
        #btn-restart {
            height: 30px;
            padding: 0 15px;
        }
        #btn-restart:hover {
            background: cyan;
        }
        .hide {
            display: none !important;
        }
        `;

        const snakeCSS = document.createElement('style');
        snakeCSS.innerHTML = CSS;
        document.head.append(snakeCSS);
    }
	setCSS();
    drawScore();
    //addEvents();
    loop();
}




document.addEventListener('DOMContentLoaded', function(){
    document.querySelector('button').addEventListener('click',
    onclick, false)
    function onclick(){
       /* var script =  document.createElement('script');
        script.src = 'snake.js';
        document.head.appendChild(script);*/
        runSnakeGame();
        
        
    }
}, false)
