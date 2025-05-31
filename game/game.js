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

    // 각 스테이지에 해당하는 스토리 화면 보여주기
    if (stage === 'stage1') {
        $('#stage1-story-screen').addClass('active');
    } else if (stage === 'stage2') {
        $('#stage2-story-screen').addClass('active');
    } else if (stage === 'stage3') {
        $('#stage3-story-screen').addClass('active');
    }
}

function proceedToGame() {
    hideAllScreens();
    $('#game-screen').addClass('active');
    initializeCanvas();
}



let fruits = [];  
let fruitImages = [];  

function initializeCanvas() {
    fruits = [];  // 초기화
    fruitImages = [];  // 초기화
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    canvas.addEventListener("click", handleClick);
    

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

    // 📝 추가: #current-stage에 표시
    const panalDiv = document.getElementById('stage-panal');
    let difficultyColor = '#000';  // 기본 검정색
    let difficultyLabel = '';

    switch (currentDifficulty.toLowerCase()) {
        case 'easy':
            difficultyColor = '#2F9D27';
            difficultyLabel = 'EASY';
            break;
        case 'normal':
            difficultyColor = 'blue';
            difficultyLabel = 'NORMAL';
            break;
        case 'hard':
            difficultyColor = 'red';
            difficultyLabel = 'HARD';
            break;
    }
      
      
    // 게임 세팅
    setStage();

    const stageDiv = document.getElementById('current-stage');
    const difficultyDiv = document.getElementById('current-difficulty');

    stageDiv.innerHTML = `STAGE ${currentStage.slice(-1)}`;
    difficultyDiv.innerHTML = `<span style="color:${difficultyColor}; font-weight:bold;">${difficultyLabel}</span>`;

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

    function handleClick(event) {
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        let clickedFruit = null;
        for (let i = 0; i < fruits.length; i++) {
            const fruit = fruits[i];
            if (
                clickX >= fruit.x &&
                clickX <= fruit.x + fruit.size &&
                clickY >= fruit.y &&
                clickY <= fruit.y + fruit.size
            ) {
                clickedFruit = fruit;
                fruits.splice(i, 1);  // 과일 삭제
                break;
            }
        }

        if (clickedFruit) {
            // 카운터 증가
            const fruitIndex = fruitImages.indexOf(clickedFruit.img) + 1;
            const counter = document.getElementById(`f${fruitIndex}`);
            if (counter) {
                const currentCount = parseInt(counter.textContent) || 0;
                counter.textContent = currentCount + 1;
            }
        }

        // 과일이 하나라도 사라졌을 때만 다시 그리기
        drawFruits();
    }
}









/**
 * 게임 부분 추가
 * 
 */

function setStage(){

    // 카운터 리셋
    for (let i = 1; i <= 8; i++) {
        const counter = document.getElementById(`f${i}`);
        if (counter) {
            counter.textContent = "0";
        }
    }


    // 난이도, 스테이지별로 손님 세팅
    applyGuestBorders(currentStage, currentDifficulty);


    // 난이도, 스테이지별로 레시피 세팅
}

function resetGame() {
   
}



function startGameWithBgm() {
    const bgm = document.getElementById('main-bgm');
    if (bgm.paused) {
        bgm.volume = 0.5;
        bgm.play();
    }

    showDifficultyScreen();
}

function startSettingsWithBgm() {
    const bgm = document.getElementById('main-bgm');
    if (bgm.paused) {
        bgm.volume = 0.5;
        bgm.play();
    }

    showSettingsScreen();
}

function playButtonSound() {
    const se = document.getElementById('button-sound');
    se.currentTime = 0;
    se.play();
}




const specialRecipes = [
  {
    name: "특수레시피1",
    stages: [1, 2, 3],
    juiceName: "체리 딸기 주스",
    ingredients: [
      { fruit: "체리", count: 1 },
      { fruit: "딸기", count: 1 }
    ]
  },
  {
    name: "특수레시피2",
    stages: [1, 2, 3],
    juiceName: "포도 한라봉 주스",
    ingredients: [
      { fruit: "포도", count: 1 },
      { fruit: "한라봉", count: 1 }
    ]
  },
  {
    name: "특수레시피3",
    stages: [2, 3],
    juiceName: "사과 복숭아 주스",
    ingredients: [
      { fruit: "사과", count: 1 },
      { fruit: "복숭아", count: 1 }
    ]
  },
  {
    name: "특수레시피4",
    stages: [2, 3],
    juiceName: "파인애플 수박 주스",
    ingredients: [
      { fruit: "파인애플", count: 1 },
      { fruit: "수박", count: 1 }
    ]
  },
  {
    name: "특수레시피5",
    stages: [3],
    juiceName: "궁극의 과일 주스",
    ingredients: [
      { fruit: "딸기", count: 1 },
      { fruit: "체리", count: 1 },
      { fruit: "포도", count: 1 },
      { fruit: "한라봉", count: 1 },
      { fruit: "사과", count: 1 },
      { fruit: "복숭아", count: 1 },
      { fruit: "파인애플", count: 1 },
      { fruit: "수박", count: 1 }
    ]
  }
];




const normalRecipes = [
  // Count 1
  {
    name: "과일1주스-1개",
    stages: [1, 2, 3],
    juiceName: "체리 주스",
    ingredients: [
      { fruit: "체리", count: 1 }
    ]
  },
  {
    name: "과일2주스-1개",
    stages: [1, 2, 3],
    juiceName: "딸기 주스",
    ingredients: [
      { fruit: "딸기", count: 1 }
    ]
  },
  {
    name: "과일3주스-1개",
    stages: [1, 2, 3],
    juiceName: "포도 주스",
    ingredients: [
      { fruit: "포도", count: 1 }
    ]
  },
  {
    name: "과일4주스-1개",
    stages: [1, 2, 3],
    juiceName: "한라봉 주스",
    ingredients: [
      { fruit: "한라봉", count: 1 }
    ]
  },
  {
    name: "과일5주스-1개",
    stages: [2, 3],
    juiceName: "사과 주스",
    ingredients: [
      { fruit: "사과", count: 1 }
    ]
  },
  {
    name: "과일6주스-1개",
    stages: [2, 3],
    juiceName: "복숭아 주스",
    ingredients: [
      { fruit: "복숭아", count: 1 }
    ]
  },
  {
    name: "과일7주스-1개",
    stages: [3],
    juiceName: "파인애플 주스",
    ingredients: [
      { fruit: "파인애플", count: 1 }
    ]
  },
  {
    name: "과일8주스-1개",
    stages: [3],
    juiceName: "수박 주스",
    ingredients: [
      { fruit: "수박", count: 1 }
    ]
  },

  // Count 2
  {
    name: "과일1주스-2개",
    stages: [1, 2, 3],
    juiceName: "체리 주스 (2개)",
    ingredients: [
      { fruit: "체리", count: 2 }
    ]
  },
  {
    name: "과일2주스-2개",
    stages: [1, 2, 3],
    juiceName: "딸기 주스 (2개)",
    ingredients: [
      { fruit: "딸기", count: 2 }
    ]
  },
  {
    name: "과일3주스-2개",
    stages: [1, 2, 3],
    juiceName: "포도 주스 (2개)",
    ingredients: [
      { fruit: "포도", count: 2 }
    ]
  },
  {
    name: "과일4주스-2개",
    stages: [1, 2, 3],
    juiceName: "한라봉 주스 (2개)",
    ingredients: [
      { fruit: "한라봉", count: 2 }
    ]
  },
  {
    name: "과일5주스-2개",
    stages: [2, 3],
    juiceName: "사과 주스 (2개)",
    ingredients: [
      { fruit: "사과", count: 2 }
    ]
  },
  {
    name: "과일6주스-2개",
    stages: [2, 3],
    juiceName: "복숭아 주스 (2개)",
    ingredients: [
      { fruit: "복숭아", count: 2 }
    ]
  },
  {
    name: "과일7주스-2개",
    stages: [3],
    juiceName: "파인애플 주스 (2개)",
    ingredients: [
      { fruit: "파인애플", count: 2 }
    ]
  },
  {
    name: "과일8주스-2개",
    stages: [3],
    juiceName: "수박 주스 (2개)",
    ingredients: [
      { fruit: "수박", count: 2 }
    ]
  }
];



const guestData = {
  stage1: {
    easy: [
      // 착한손님 2명
      { type: 'good', recipe: specialRecipes.find(r => r.name === '특수레시피1') },
      { type: 'good', recipe: specialRecipes.find(r => r.name === '특수레시피2') },
      // 일반손님 5명
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일1주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일2주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일3주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일4주스-2개') },
      { type: 'normal', recipe: specialRecipes.find(r => r.name === '특수레시피1') }
    ],
    normal: [
      // 착한손님 1명
      { type: 'good', recipe: specialRecipes.find(r => r.name === '특수레시피2') },
      // 일반손님 5명
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일1주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일2주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일3주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일4주스-2개') },
      { type: 'normal', recipe: specialRecipes.find(r => r.name === '특수레시피1') },
      // 진상손님 1명
      { type: 'bad', recipe: specialRecipes.find(r => r.name === '특수레시피1') }
    ],
    hard: [
      // 일반손님 5명
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일1주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일2주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일3주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일4주스-2개') },
      { type: 'normal', recipe: specialRecipes.find(r => r.name === '특수레시피1') },
      // 진상손님 2명
      { type: 'bad', recipe: specialRecipes.find(r => r.name === '특수레시피1') },
      { type: 'bad', recipe: specialRecipes.find(r => r.name === '특수레시피2') }
    ]
  },

  stage2: {
    easy: [
      { type: 'good', recipe: specialRecipes.find(r => r.name === '특수레시피3') },
      { type: 'good', recipe: specialRecipes.find(r => r.name === '특수레시피4') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일1주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일3주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일5주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일6주스-2개') },
      { type: 'normal', recipe: specialRecipes.find(r => r.name === '특수레시피1') }
    ],
    normal: [
      { type: 'good', recipe: specialRecipes.find(r => r.name === '특수레시피1') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일1주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일3주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일5주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일6주스-2개') },
      { type: 'normal', recipe: specialRecipes.find(r => r.name === '특수레시피3') },
      { type: 'bad', recipe: specialRecipes.find(r => r.name === '특수레시피4') }
    ],
    hard: [
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일1주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일2주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일3주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일4주스-2개') },
      { type: 'normal', recipe: specialRecipes.find(r => r.name === '특수레시피1') },
      { type: 'bad', recipe: specialRecipes.find(r => r.name === '특수레시피4') },
      { type: 'bad', recipe: specialRecipes.find(r => r.name === '특수레시피3') }
    ]
  },

  stage3: {
    easy: [
      { type: 'good', recipe: specialRecipes.find(r => r.name === '특수레시피3') },
      { type: 'good', recipe: specialRecipes.find(r => r.name === '특수레시피4') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일1주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일3주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일5주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일6주스-2개') },
      { type: 'normal', recipe: specialRecipes.find(r => r.name === '특수레시피2') }
    ],
    normal: [
      { type: 'good', recipe: specialRecipes.find(r => r.name === '특수레시피4') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일1주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일3주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일5주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일6주스-2개') },
      { type: 'normal', recipe: specialRecipes.find(r => r.name === '특수레시피2') },
      { type: 'bad', recipe: specialRecipes.find(r => r.name === '특수레시피3') }
    ],
    hard: [
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일1주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일2주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일3주스-2개') },
      { type: 'normal', recipe: normalRecipes.find(r => r.name === '과일4주스-2개') },
      { type: 'normal', recipe: specialRecipes.find(r => r.name === '특수레시피4') },
      { type: 'bad', recipe: specialRecipes.find(r => r.name === '특수레시피3') },
      { type: 'bad', recipe: specialRecipes.find(r => r.name === '특수레시피2') }
    ]
  }
};



function applyGuestBorders(stage, difficulty) {
  const cards = document.querySelectorAll('.card');
  const recipeContainer = document.querySelector('.recipe');
  recipeContainer.innerHTML = ''; // 기존 레시피 초기화

  cards.forEach(card => {
    card.style.border = '2px solid #ccc';
    const textDiv = card.querySelector('.card-text');
    if (textDiv) {
      textDiv.textContent = '';
    }
  });

  const stageKey = `stage${stage.slice(-1)}`;
  const guestList = guestData[stageKey]?.[difficulty.toLowerCase()];

  if (!guestList) {
    console.warn(`손님 데이터가 존재하지 않습니다: stage=${stage}, difficulty=${difficulty}`);
    return;
  }

  guestList.forEach((guest, index) => {
    if (index >= cards.length) return;
    let borderColor = 'blue';
    let guestLabel = '일반 손님';

    if (guest.type === 'good') {
      borderColor = 'green';
      guestLabel = '착한 손님';
    } else if (guest.type === 'bad') {
      borderColor = 'red';
      guestLabel = '진상 손님';
    }

    cards[index].style.border = `3px solid ${borderColor}`;
    const textDiv = cards[index].querySelector('.card-text');
    if (textDiv) {
      textDiv.textContent = `${guestLabel} (${guest.recipe.juiceName})`;
    }

    // 주문 정보 HTML 생성
    const recipeDiv = document.createElement('div');
    recipeDiv.classList.add('recipe');

    const headerDiv = document.createElement('div');
    headerDiv.classList.add('recipe-header');

    // 이미지 처리
    const recipeImg = document.createElement('img');
    recipeImg.classList.add('recipe-image');

    // 이미지 구분
    let imgSrc = '';
    if (guest.recipe.name.startsWith('특수레시피')) {
      // 특수 레시피: designs/recipeX.png
      const recipeIndex = getRecipeImageIndex(guest.recipe.name);
      imgSrc = `designs/recipe${recipeIndex}.png`;
    } else {
      // 일반 레시피: designs/fruitX.png
      const fruitNumber = extractFruitNumber(guest.recipe.name);
      imgSrc = `designs/fruit${fruitNumber}.png`;
    }

    recipeImg.src = imgSrc;
    recipeImg.alt = guest.recipe.juiceName;

    const infoDiv = document.createElement('div');

    const recipeNameDiv = document.createElement('div');
    recipeNameDiv.classList.add('recipe-name');
    recipeNameDiv.textContent = guest.recipe.juiceName;

    const ingredientList = document.createElement('ul');
    ingredientList.classList.add('ingredient-list');

    guest.recipe.ingredients.forEach(ing => {
      const li = document.createElement('li');
      li.textContent = `${ing.fruit} X ${ing.count}`;
      ingredientList.appendChild(li);
    });

    infoDiv.appendChild(recipeNameDiv);
    infoDiv.appendChild(ingredientList);

    headerDiv.appendChild(recipeImg);
    headerDiv.appendChild(infoDiv);

    recipeDiv.appendChild(headerDiv);

    recipeContainer.appendChild(recipeDiv);
  });
}

// 🔥 추가 유틸 함수
function extractFruitNumber(recipeName) {
  // 예: "과일1주스-1개" → 1
  const match = recipeName.match(/과일(\d+)/);
  return match ? match[1] : '1'; // 기본 1
}


/**
 * 레시피 이름에서 recipeX 이미지 번호 추출
 * 예: 특수레시피1 → 1
 */
function getRecipeImageIndex(recipeName) {
  // 예: "특수레시피1", "과일1주스-2개" 등
  const match = recipeName.match(/\d+/);
  return match ? match[0] : 'default';
}



