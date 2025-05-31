//난이도 전역 변수로 저장
let currentDifficulty = '';
//스테이지 전역 변수로 저장
let currentStage = '';

$(document).ready(function() {
    // 페이지가 로드되면 메인 화면 표시
    showMainScreen();

});

function hideAllScreens() {
    $('.screen').removeClass('active');
}

function showMainScreen() {
    hideAllScreens();
    $('#main-screen').addClass('active');
}

function showDifficultyScreen() {
    hideAllScreens();
    $('#difficulty-screen').addClass('active');
}

function showRuleScreen(){
    hideAllScreens();
    $('#rule-screen').addClass('active');
}

function showStoryScreen(){
    hideAllScreens();
    $('#story-screen').addClass('active');
}

/**
 * 게임 시작시 : 난이도 선택 후 스토리 0을 보여주고 게임룰을 설명해준다. 그 후에 게임 스테이지 선택 화면으로 이동한다.
 * @param {*} difficulty 
 */

function showStageScreen(difficulty) {
    if (difficulty) {
        currentDifficulty = difficulty;
    }
    hideAllScreens();
    $('#story-screen').addClass('active');
}

function proceedToRuleScreen() {
    hideAllScreens();
    $('#rule-screen').addClass('active');
}

function proceedToStageScreen() {
    hideAllScreens();
    $('#stage-screen').addClass('active');
}

function showSettingsScreen() {
    hideAllScreens();
    $('#settings-screen').addClass('active');
}

function startGame(stage) {
    currentStage = stage;
    hideAllScreens();
    $('#game-screen').addClass('active');
    
    initializeCanvas();
}





function initializeCanvas() {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = 400;
    canvas.height = 600;

    // 캔버스 초기화 - 단순한 배경색으로 설정
    ctx.fillStyle = '#f0f8ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 중앙에 게임 정보 표시
    ctx.fillStyle = '#333';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('게임 영역', canvas.width / 2, canvas.height / 2 - 40);
    ctx.fillText(`현재 난이도: ${currentDifficulty.toUpperCase()}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText(`현재 스테이지: ${currentStage.toUpperCase()}`, canvas.width / 2, canvas.height / 2 + 30);

    ctx.font = '16px Arial';
    ctx.fillText('게임이 곧 시작됩니다...', canvas.width / 2, canvas.height / 2 + 70);

    // 기본 과일과 공 정의
    
    class Ball {

    }

    class Fruit {
        constructor(x, y, size, img) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.img = img;
        }
    }

    // 🍎 이미지 랜덤 배치
    const fruitCount = 8;
    const fruits = [];
    const fruitImages = [];
    const fruitSizes = [];

    for (let i = 0; i < fruitCount; i++) {
        fruitSizes.push(30 + i * 10);
    }

    for (let i = 1; i <= fruitCount; i++) {
        const img = new Image();
        img.src = `designs/fruit${i}.png`;
        fruitImages.push(img);
    }

    Promise.all(fruitImages.map(img => {
        return new Promise(resolve => {
            img.onload = resolve;
        });
    })).then(() => {
        for (let i = 0; i < fruitCount; i++) {
            const size = fruitSizes[i];
            let x, y;
            let attempts = 0;
            let overlap = false;

            do {
                overlap = false;
                x = Math.random() * (canvas.width - size);
                y = Math.random() * (canvas.height - size);

                for (let j = 0; j < fruits.length; j++) {
                    const other = fruits[j];
                    const dx = (x + size / 2) - (other.x + other.size / 2);
                    const dy = (y + size / 2) - (other.y + other.size / 2);
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const minDistance = (size / 2) + (other.size / 2);

                    if (distance < minDistance) {
                        overlap = true;
                        break;
                    }
                }

                attempts++;
                // 무한 루프 방지: 100회 시도 후 강제로 배치
                if (attempts > 100) {
                    console.warn("과일 배치 충돌 해결 실패 (강제 배치)");
                    break;
                }
            } while (overlap);

            fruits.push(new Fruit(x, y, size, fruitImages[i]));
        }

        drawFruits();
    });

    function drawFruits() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        fruits.forEach(fruit => {
            ctx.drawImage(fruit.img, fruit.x, fruit.y, fruit.size, fruit.size);
        });
    }
}




/**
 * 게임 부분 추가
 * 
 */
