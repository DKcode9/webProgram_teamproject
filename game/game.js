//난이도 전역 변수로 저장
let currentDifficulty = '';

//스테이지 전역 변수로 저장
// 예시 : stage1, stage2, stage3
let currentStage = '';

// 점수판
let currentScore = 0;

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
    gameCollapse();
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

function changeBallColor(color) {
  hitBallColor = color;
}

function changeBgmVolume(volume) {
  document.getElementById('bgm-volume-value').textContent = parseFloat(volume).toFixed(2);
  const bgm = document.getElementById('main-bgm');
  if (bgm) {
      bgm.volume = volume;
  }
}

function changeBgm(src) {
  const bgm = document.getElementById('main-bgm');
  if (bgm) {
      const isPlaying = !bgm.paused;
      bgm.pause();
      bgm.src = src;
      bgm.load();
      if (isPlaying) {
          bgm.play();
      }
  }
}

function startGame(stage) {
    currentStage = stage;
    hideAllScreens();

    // stage 진입 효과음 재생
    playStageSound();

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
    // 게임 시작
    startGameInterval();
}

let canvas;
let ctx;

let fruits = [];  
let fruitImages = [];  

function initializeCanvas() {
    fruits = [];  // 초기화
    fruitImages = [];  // 초기화
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
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

    const gameOverDiv = document.getElementById('game-over');
    gameOverDiv.style.display = 'none';

    const gameClearDiv = document.getElementById('game-clear');
    gameClearDiv.style.display = 'none';
  
      
      
    // 게임 세팅
    setStage();

    const stageDiv = document.getElementById('current-stage');
    const difficultyDiv = document.getElementById('current-difficulty');

    stageDiv.innerHTML = `STAGE ${currentStage.slice(-1)}`;
    difficultyDiv.innerHTML = `<span style="color:${difficultyColor}; font-weight:bold;">${difficultyLabel}</span>`;

    // 기본 과일과 공 정의
    
    canvas.addEventListener("click", handleCanvasClick);

}


// drawFruits
function drawFruits() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    fruits.forEach(fruit => {
        ctx.drawImage(fruit.img, fruit.x, fruit.y, fruit.size, fruit.size);
    });
}


// handleClick
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
        const fruitIndex = fruitImages.indexOf(clickedFruit.img) + 1;
        const counter = document.getElementById(`f${fruitIndex}`);
        if (counter) {
            const currentCount = parseInt(counter.textContent) || 0;
            counter.textContent = currentCount + 1;
        }
    }

    drawFruits();
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

function playStageSound() {
  const se = document.getElementById('stage-sound');
  if (se) {
      se.currentTime = 0;
      se.play();
  }
}

function lowerBgmVolume(tempVolume = 0.1) {
  const bgm = document.getElementById('main-bgm');
  if (bgm && !bgm.paused) {
      bgm.volumeBeforeDuck = bgm.volume;  // 이전 볼륨 저장
      bgm.volume = tempVolume;
  }
}

function restoreBgmVolume() {
  const bgm = document.getElementById('main-bgm');
  if (bgm && !bgm.paused && bgm.volumeBeforeDuck !== undefined) {
      bgm.volume = bgm.volumeBeforeDuck;
  }
}

function playGameOverSound() {
  const se = document.getElementById('gameover-sound');
  if (se) {
      lowerBgmVolume();  // 먼저 BGM 줄이기
      se.currentTime = 0;
      se.play();

      // 효과음 길이만큼 지난 후 BGM 복원
      se.onended = () => {
          restoreBgmVolume();
      };
  }
}

function playGameClearSound() {
  const se = document.getElementById('gameclear-sound');
  if (se) {
      lowerBgmVolume();  // BGM 줄이기
      se.currentTime = 0;
      se.play();

      // 효과음 끝난 후 복원
      se.onended = () => {
          restoreBgmVolume();
      };
  }
}

function playWallHitSound() {
  const se = document.getElementById('wall-hit-sound');
  if (se) {
      se.currentTime = 0;
      se.play();
  }
}

function playFruitHitSound() {
  const se = document.getElementById('fruit-hit-sound');
  if (se) {
      se.currentTime = 0;
      se.play();
  }
}

function playCardClickSound() {
  const se = document.getElementById('card-click-sound');
  if (se) {
      se.currentTime = 0;
      se.play();
  }
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
  const cardContainer = document.querySelector('.card-container');
  cardContainer.innerHTML = ''; // 기존 카드 모두 제거

  const recipeContainer = document.querySelector('.recipe');
  recipeContainer.innerHTML = ''; // 기존 레시피 초기화

  const stageKey = `stage${stage.slice(-1)}`;
  const guestList = guestData[stageKey]?.[difficulty.toLowerCase()];
  if (!guestList) return;

  // type별 카운터 초기화
  let typeCounters = {
    good: 0,
    normal: 0,
    bad: 0
  };

  guestList.forEach((guest, index) => {
    // ─────────────────────────────────────────────
    // 카드 요소 생성
    // ─────────────────────────────────────────────
    const card = document.createElement('div');
    card.classList.add('card');
    const cardContent = document.createElement('div');
    cardContent.classList.add('card-content');
    const cardImageContainer = document.createElement('div');
    cardImageContainer.classList.add('card-image-container');
    const cardImage = document.createElement('div');
    cardImage.classList.add('card-image');

    const img = document.createElement('img');
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';

    // 이미지 소스 설정
    let typePrefix = '';
    let typeKey = '';
    if (guest.type === 'good') {
      typePrefix = 'good_customer';
      typeKey = 'good';
    } else if (guest.type === 'normal') {
      typePrefix = 'customer';
      typeKey = 'normal';
    } else if (guest.type === 'bad') {
      typePrefix = 'bad_customer';
      typeKey = 'bad';
    }

    typeCounters[typeKey]++;
    const typeIndex = typeCounters[typeKey];
    const stageNumber = currentStage.slice(-1);
    const imageFileName = `designs/stage${stageNumber}_${typePrefix}${typeIndex}.png`;
    img.src = imageFileName;
    img.alt = `${guest.type} customer`;

    // 카드 이미지에 이미지 삽입
    cardImage.appendChild(img);

    // card-image-container에 카드 이미지 삽입
    cardImageContainer.appendChild(cardImage);

    // 카드 텍스트 생성
    const cardText = document.createElement('div');
    cardText.classList.add('card-text');
    let guestLabel = '일반 손님';
    let borderColor = 'blue';
    if (guest.type === 'good') {
      borderColor = 'green';
      guestLabel = '착한 손님';
    } else if (guest.type === 'bad') {
      borderColor = 'red';
      guestLabel = '진상 손님';
    }
    card.style.border = `3px solid ${borderColor}`;
    card.dataset.recipeName = guest.recipe.name;
    cardText.innerHTML = `${guestLabel}<br>${guest.recipe.juiceName}`;

    // card-content에 이미지 컨테이너와 카드 텍스트 추가
    cardContent.appendChild(cardImageContainer);
    cardContent.appendChild(cardText);

    // card에 card-content 추가
    card.appendChild(cardContent);

    /**
     * 게이지는 good, bad 손님에게만 적용됩니다
     */

    if (guest.type === 'good' || guest.type === 'bad') {
      // gauge-container 생성
      const gaugeContainer = document.createElement('div');
      gaugeContainer.classList.add('gauge-container');
      gaugeContainer.style.height = '3px';

      const gaugeFill = document.createElement('div');
      gaugeFill.classList.add('gauge-fill');

      // 착한(good) 손님은 게이지 40초, 진상(bad) 손님은 게이지 100초 (나중에 보이는 것도 고려)
      // 착한 손님은 게이지 초록색, 진상 손님은 게이지 빨간색
      const durationSeconds = guest.type === 'good' ? 40 : 100;
      gaugeFill.style.backgroundColor = guest.type === 'good' ? 'green' : 'red';

      gaugeFill.style.transition = `width ${durationSeconds}s linear`;
      gaugeContainer.appendChild(gaugeFill);

      card.appendChild(gaugeContainer);

      // 게이지 애니메이션 시작 (다음 tick에 width를 0%로)
      setTimeout(() => {
        gaugeFill.style.width = '0%';
      }, 0);

      // durationSeconds 후에 게이지 컨테이너 제거
      setTimeout(() => {
        gaugeContainer.remove();
      }, durationSeconds * 1000);
    }


     /**
       * 마우스 클릭으로 .card를 제거할 수도 있습니다
       * 단, 밑에 키보드 콜백을 사용하는 부분을 추가했습니다
      */

    
    card.onclick = () => {
      if (card.style.backgroundColor !== 'yellow') return;
      const recipeName = card.dataset.recipeName;
      if (!recipeName) return;
      const recipe = [...specialRecipes, ...normalRecipes].find(r => r.name === recipeName);
      if (!recipe) return;
      recipe.ingredients.forEach(ing => {
        const idx = fruitIndexMap[ing.fruit];
        if (idx == null) return;
        const counterEl = document.getElementById(`f${idx+1}`);
        if (!counterEl) return;
        const haveCount = parseInt(counterEl.textContent, 10) || 0;
        counterEl.textContent = Math.max(0, haveCount - ing.count);
      });
      playCardClickSound();
      card.remove();
      checkRecipes();
    };

    cardContainer.appendChild(card);
  });

 

  guestList.forEach(guest => {
    const recipeDiv = document.createElement('div');
    recipeDiv.classList.add('recipe');
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('recipe-header');
    const recipeImg = document.createElement('img');
    recipeImg.classList.add('recipe-image');

    let imgSrc = '';
    if (guest.recipe.name.startsWith('특수레시피')) {
      const recipeIndex = getRecipeImageIndex(guest.recipe.name);
      imgSrc = `designs/recipe${recipeIndex}.png`;
    } else {
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


  // 카드 배경 초기화
  checkRecipes();

  /**
   * 키보드 이벤트 리스너 추가
   * 
   * 상위 1-4 번째 카드에 대해서 키보드 1-4를 누르면 해당 카드가 제거됩니다. 
   * 단, 바구니에 과일이 모여 노란색일 경우에만 가능합니다다
   */

  document.addEventListener('keydown', function onKeyDelete(e) {
    // 숫자키 '1'~'4'를 눌렀을 때만 동작
    if (!['1','2','3','4'].includes(e.key)) return;

    const idx = parseInt(e.key, 10) - 1;               
    const cards = cardContainer.querySelectorAll('.card'); // 현재 렌더링링된 카드 리스트
    const targetCard = cards[idx];                        

    if (!targetCard) return;                            

    if (targetCard.style.backgroundColor === 'yellow') {
      targetCard.onclick();
    }
  }, { once: false });


}





// 추가 유틸 함수
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

/**
 * 현재 DOM에 표시된 카드(.card) 각각에 대해
 * data-recipe-name으로 읽어온 레시피 객체를 찾아,
 * 요구 과일 개수를 카운터(#f1~#f8)에서 확인해 조건 만족 시 배경 노란색 처리
 */
function checkRecipes() {
  // 모든 레시피를 이름 기준으로 한 lookup 테이블 생성
  const allRecipes = {};
  specialRecipes.concat(normalRecipes).forEach(r => {
    allRecipes[r.name] = r;
  });

  // 카드 요소들을 순회하며 검사
  document.querySelectorAll('.card').forEach(card => {
    const recipeName = card.dataset.recipeName;
    if (!recipeName) return;

    const recipe = allRecipes[recipeName];
    if (!recipe) return;

    // 이 레시피가 요구하는 모든 과일(count) 개수가 충족되는지 검사
    let fulfilled = true;
    for (const ing of recipe.ingredients) {
      // ing.fruit → 예: "체리", "딸기" 등
      // ing.count → 요구 개수(정수)
      const idx = fruitIndexMap[ing.fruit]; // 0~7
      if (idx == null) { fulfilled = false; break; }
      const counterEl = document.getElementById(`f${idx+1}`);
      const haveCount = (counterEl ? parseInt(counterEl.textContent, 10) : 0) || 0;
      if (haveCount < ing.count) {
        fulfilled = false;
        break;
      }
    }

    if (fulfilled) {
      card.style.backgroundColor = 'yellow';
    } else {
      card.style.backgroundColor = '';
    }
  });
}




//--------------------------------//[STARTLINE] Ball//--------------------------------//
// 

/* 
  [!] 공 구현 개요
    객체 종류 : 과일(tarBall) / paddle / 바운스 볼(hitBall)
    [1] tarBall & hitBall & 시스템 로직
      [*] 구현 핵심 
        - 공에 대한 중력 작용 및 공 간 피격 시 발생하는 '떨림' 문제 : 
          공들이 서로 부딪힐 때마다 반동 계수로 왔다갔다하는 상황 -> 최저 속도 (VELOCITY_THRESHOLD)로 조절.
        - 공에 대한 중력 & 공 간 충돌 처리
          공은 중력에 영향을 받는 상황에서 대각 방향으로 부딪힌 서로 다른 두 개의 공이 존재할 때,
          상대적으로 아래쪽에 있는 공은 위쪽 공을 타고 자연스럽게 중력의 영향을 받아야합니다.
            => '공 중심 간 거리로 계산한 거리 & 두 공의 반지름 합에 대한 거리'를 이용하여
              overlap 상황에 대해 더 이상 속도 계수가 증가하는 현상을 막고 ... (1)
              bounce 계수로 속도 손실을 일으키고 자연스럽게 공이 반대로 향하게 합니다 ... (2)
              (1) 과 (2) 를 종합해 타고 넘어가는 느낌도 나타낼 수 있습니다.
        - 충돌 상황의 기본적인 알고리즘
          1. 방향 전환(대상 간의 벡터 각도를 구하고, 길이만큼 더해서 속도 제어(당연히 hitball 속도의 크기는 고정))
          2. 위치 보정(관통/오버랩 상황 제어)
        - 사진 일부가 잘리는 문제
          지금 상황에선 포도/체리의 머리 부분이 잘리는데, shrink 변수를 통해 사진 스케일 작게하거나 공 그림만 더 크게 해서 보정할 순 있습니다.
        - 일부 버그로 hitBall 이 우주로 날아가버리는 상황
          => paddle 및 hitBall 객체를 초기화합니다. (과일들은 그대로 둔 상태로)
        - 모든 과일을 다 깨더라도 아무런 이벤트 발생 X
        - 자연스러운 바운스 구현(loss 를 이용한 비탄성 충돌)
          bounce 값이 작아질수록 고체충돌에 가깝게 -> 충돌로 인한 튕김 현상을 완화할 수 있습니다.
          bounce 값이 클수록 탄성충돌에 가깝게 -> 충돌로 인한 튕김 현상을 증폭할 수 있습니다.
        - 만약 사진을 할당받지 못한 과일은 "red" 색상을 부여받은 공으로 스폰됩니다.
  [!] 함수/변수 조작 (개발자 분들께선 이 부분을 읽어주시면 됩니다!)
    시스템 변수도 필요하다면 추가 조작을 해서 자연스러운 튕김 현상을 구현할 수 있습니다.
    [변수]
        hitball_speed : hitBall 초기속도 조절
        ballCnt_* : 스테이지 별 공 갯수
          각 열의 의미 -> (1체리,2딸기,3포도,4오렌지,5사과,6복숭아,7파인,8수박)
        hitBallColor : hitBall 색깔 (null 이면 검정색)      
        tbreakCount : tarBall(과일) 별 카운터
    [헬퍼]
        setSizehitBall(size) : 반지름(size)로 설정한다. (return 값은 이전 size / hitBall 이 없으면 -1 반환)
        addhitball() : hitball 1개 추가한다.
        setSpeedhitBall(speed) : speed 만큼 속도를 정한다. (return : 기존 속도)
        setpaddlescale(sz) : sz 만큼 paddle 크기를 정한다. (return : 기존 paddle 크기)
*/



// 과일명 → 인덱스 매핑 (ballCnt 배열용)
const fruitIndexMap = {
  '체리': 0,
  '딸기': 1,
  '포도': 2,
  '한라봉': 3,
  '사과': 4,
  '복숭아': 5,
  '파인애플': 6,
  '수박': 7
};

const fruitScoreMap = {
  '체리': 50,
  '딸기': 100,
  '포도': 150,
  '한라봉': 200,
  '사과': 250,
  '복숭아': 300,
  '파인애플': 350,
  '수박': 400
};

const radius_global = [27,29,40,33,35,39,42,47];

function addScore(fruitName) {
  const scoreToAdd = fruitScoreMap[fruitName] || 0;
  currentScore += scoreToAdd;

  const scoreDiv = document.getElementById('current-score');
  if (scoreDiv) {
    scoreDiv.textContent = `Score: ${currentScore}`;
  }
}

function getFruitNameByIdent(ident) {
  for (const [name, index] of Object.entries(fruitIndexMap)) {
    if (index === ident) {
      return name;
    }
  }
  return '';
}


function calculateFruitCounts(stage, difficulty) {
  const stageKey = `stage${stage}`;
  const guestList = guestData[stageKey]?.[difficulty];
  
  // 초기화
  const fruitCounts = Array(8).fill(0);
  
  if (!guestList) {
    console.warn(`손님 데이터가 없습니다: stage=${stage}, difficulty=${difficulty}`);
    return fruitCounts;
  }

  guestList.forEach(guest => {
    guest.recipe.ingredients.forEach(ingredient => {
      const idx = fruitIndexMap[ingredient.fruit];
      if (idx !== undefined) {
        fruitCounts[idx] += ingredient.count;
      }
    });
  });

  return fruitCounts;
}

// 사용 예시
// 스테이지 및 난이도 별 과일 갯수 설정

const ballCnt_easy = [
  calculateFruitCounts(1, 'easy'),
  calculateFruitCounts(2, 'easy'),
  calculateFruitCounts(3, 'easy')
];

const ballCnt_normal = [
  calculateFruitCounts(1, 'normal'),
  calculateFruitCounts(2, 'normal'),
  calculateFruitCounts(3, 'normal')
];

const ballCnt_hard = [
  calculateFruitCounts(1, 'hard'),
  calculateFruitCounts(2, 'hard'),
  calculateFruitCounts(3, 'hard')
];






// 수정 가능 변수
let hitBallColor = null; // null 이면 black 으로 설정 (hitball)

let tbreakCount = [1,2,3,4,5,6,7,8] // tarBall breakCount

// hitBall 의 크기를 임의로 조절한다.
function setSizehitBall(newsz){
  if ( 0 == hitballs.length)
    return -1;
  let retV = null;
  for (let hitball of hitballs) {
    retV = hitball.radius;
    hitball.radius = newsz;
  }
  return retV;
}

// hitball의 속도를 spd 로 설정.
function setSpeedhitBall(spd){
  if ( 0 == hitballs.length)
    return -1;
  let retV = hitball_speed;
  hitball_speed = spd;
  return retV;
}
// hitball 추가
function addhitBall(){
  if (gameOver) return;
  const newhitBall = new hitBall();
  hitballs.push(newhitBall);
}
// paddle 크기 설정
function setpaddlescale(sz) {
    let retV = null;
    if (paddle){
      retV = paddle.width;
      paddle.width = sz;
    }
    return retV;
}




// 시스템 변수
// hitball_speed 왜 hitball_size 를 수정하는대신 제공된 헬퍼함수를 사용하시면 편합니다.
// 만약 여기서 수정할 경우엔 맨 하단의 gameCollision() 함수 부분의 초기화 리터럴도 수정해주시기 바랍니다.
let hitball_speed = 7; // hitBall 초기속도 (dx & dy)
let hitball_size = 10; // hitball 초기 크기(반지름)
const gravity = -0.25; // 모든 공의 기본 중력 계수
const bounce = 0.6;  // 기본 충돌 계수
const bounce_byhit = 0.7; // hitBall 에 의한 tarBall -> 반발계수
const strength_byhit = hitball_speed*0.4 // hitBall 에 의한 tarBall 의 증폭계수
const VELOCITY_THRESHOLD = 0.2; // 최저 속도 설정 -> 무한 떨림 방지
let balls = []; // tarBall 객체 모음 (접근 가능)
let paddle = null; // paddle 객체
let hitballs = []; // hitball 객체
let shrink = 0.98; // tarBall 객체의 이미지가 잘릴 경우 보정하는 용도.
let rotate_threshold_speed = 0.8 // 회전하기 위한 최소 속도 기준
let angular_scale = 0.1 // 속도 -> 각속도 변환시 곱해주는 상수
let max_angular_velocity = 0.005// 최대 각속도 제한
const ballImages = {};

/*
  [게임 운영]
    gameOver : 게임 진행 상태가 아닌 경우 true 로 설정합니다.

*/
let gameOver = false;

let hitballtimer = []; // 2초 뒤에 hitball 등장~
let aniHandle = null; // animation sequence 를 중간에 중단시키기 위한 전역변수.
// let canvas, ctx; // 위에 선언되어 있습니다

// 페이지 로드가 완료되면 DOM 트리에서 canvas를 찾기!
$(document).ready(function() {
    canvas = document.getElementById("game-canvas");
    ctx= canvas.getContext('2d');
});




// 색에 맞는 과일 이미지 지정 
function mapImgs() {
  for (let i = 0; i < ballCnt_easy[0].length; i=i+1) {
    const img = new Image();
    img.src = `./designs/fruit${i+1}.png`;
    ballImages[i] = img;
  }
}

class tarBall {
  constructor(x, y, radius, ident, breakCount=1) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.ident = ident;
    this.vy = Math.random() * -2; // 랜덤 초기 속도(y)
    this.vx = (Math.random() - 0.5) * 2; // 랜덤 초기 속도(x - 좌우 방향이므로 -0.5)
    this.image = ballImages[ident]; // 체리의 ident = 0, 이미지 이름으론 fruit1
    this.breakCount = breakCount; // index 0 -> 1, index 1 -> 2 ... 로 해석
    /*공 회전을 위한 변수*/
    this.angle = 0; // 각도(라디안)
    this.angularVelocity =  this.vx / this.radius; // 회전 속도 -> 수평 속도 비례 버전
  }

  draw() {
    /* 회전 넣은 version*/
    ctx.save();

    //공 중심으로 이동 -> 공의 angle 만큼 회전
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    
    ctx.beginPath();

    if (this.ident === 0) {
      // 체리의 경우에만 +1 ~
      ctx.arc(0, 0, this.radius + 1, 0, Math.PI * 2);
    } else {
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    }
    ctx.clip();

    if (null != this.image) {
      if (this.ident === 0) {
        ctx.drawImage( this.image,-(this.radius + 1) * shrink,-(this.radius + 1) * shrink,(this.radius + 1) * 2 * shrink,(this.radius + 1) * 2 * shrink);
      } else {
        ctx.drawImage(this.image, -this.radius * shrink,-this.radius * shrink,this.radius * 2 * shrink,this.radius * 2 * shrink);
      }
    } else {
      // 이미지가 없는 경우 빨간색
      ctx.fillStyle = "red";
      ctx.fill();
    }

    // 텍스트도 같은 회전 상태 안에서 그리기
    ctx.fillStyle = 'white';
    ctx.font = `${this.radius * 0.7}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.breakCount, 0, 0);

    // 회전 상태 복원 ~~~! 이 시점이 중요했다.
    ctx.restore();

  }
  update() {
    /* 
      랜덤 vy 에 임의로 정한 중력 가속도를 매번 중첩해서 좌표 (x,y) 를 갱신합니다.
      공 간 충돌은 충돌 계수인 bounce 로 구현합니다.
     */
    this.vy += gravity;
    this.y += this.vy;
    this.x += this.vx;

    /* 
      [*] 윗면 충돌
    */
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy *= -bounce;
    }

    /* 
      [*] 바닥면 충돌
    */
    
    if (this.y + this.radius > canvas.height) {
      const idxh = hitballs.indexOf(this);
      if (idxh >= 0){
        hitballs.splice(idxh, 1);   
      }
      if (hitballs.length <= 0 && !gameOver){
        gameOver = true;
        gameCollapse();
        endGame();
      }      
      return;
    }


    /* 
      [*] 좌측 벽 충돌
    */
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx *= -bounce;
    }

    /* 
      [*] 우측 벽 충돌
    */
    if (this.x + this.radius > canvas.width) {
      this.x = canvas.width - this.radius;
      this.vx *= -bounce;
    }

    /*
      공 떨림 방지
    */
    if (Math.abs(this.vx) < VELOCITY_THRESHOLD) this.vx = 0;
    if (Math.abs(this.vy) < VELOCITY_THRESHOLD) this.vy = 0;

    // 회전 part 
    // 1. 속도 계산
    const speed = Math.hypot(this.vx, this.vy);
    // 속도에 비례한 각속도 계산
    let targetW = null;
    if (speed < rotate_threshold_speed){
      // 속력이 임계 값보다 작다면? -> 회전을 하지 않는다. 회전하기엔 너무 느린 상황.
      this.angularVelocity = 0;

    } else {
      targetW = speed * angular_scale; // 0.1 계수 곱하기 
      if ( targetW > max_angular_velocity ) 
        targetW = max_angular_velocity; // 최대 각속도 조절
        this.angularVelocity = targetW * 0.8 + this.angularVelocity*0.2; 
    }
    // 이번에 계산한 targetW(weighted value) + 이전 프레임에 남아있는 각속도에 90% weight 
    

    this.angle += this.angularVelocity;
  }
}

function isOverlapping(ball, others) {
  /* 
    생성된 모든 공들은 겹쳐지만 안됩니다.
    좌표 x,y 값에 대하여 거리 공식에 의해 두 공의 거리를 측정하고,
    해당 값이 두 원 반지름의 합보다 작다면 -> overlap!
  */
  for (const other of others) {
    const dx = ball.x - other.x;
    const dy = ball.y - other.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < ball.radius + other.radius) {
      // Overlap!
      return true;
    }
  }
  return false;
}


/* 
  tarBall 은 과일입니다. 
  각 과일끼리의 충돌을 처리하는 함수입니다.
*/
function tarBall_handleCollisions() {
  if(balls.length <= 1 || gameOver) return;
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const b1 = balls[i];
      const b2 = balls[j];
      const dx = b2.x - b1.x;
      const dy = b2.y - b1.y;
      const dist = Math.sqrt(dx * dx + dy * dy); // 실제 거리
      const minDist = b1.radius + b2.radius; // 공 간 최소 유지 거리
      /* 
        [*] 두 공의 중심 좌표로 계산한 거리가 최소 유지 거리보다 더 작다면 -> '공 충돌 상황'!
          공들이 overlap 되는 순간, 두 공들의 중심을 기점으로 서로 밀어야 자연스러운 공 충돌을 구현할 수 있습니다.
          이때 atan2() 함수는 보통 밀어낼 방향 각도를 구하는 상황에 사용한다고 합니다. (즉, b1(기준 공)을 두고 상대측 공에 대한 각도를 측정할 때 inv(tan(x)) 를 사용합니다.)
          이 각도를 angle 변수에 저장하면 cos()-> x , sin() -> y 를 얻을 수 있습니다.
          거기에 overlap 만큼 곱하면 '밀어낼 단위 벡터 * 겹친 정도'를 할 수 있습니다.
      */
      if (dist < minDist) {
        const angle = Math.atan2(dy, dx);
        const overlap = (minDist - dist) / 2; 
        const moveX = Math.cos(angle) * overlap;
        const moveY = Math.sin(angle) * overlap;


        /* [1. Overlap 방지] 서로 겹치지 않을 정도만 이동시킵니다.*/
        b1.x -= moveX; 
        b1.y -= moveY;
        b2.x += moveX;
        b2.y += moveY;

        /* [2. 충돌 구현 ] bounce 로 기존의 속도에 loss 를 유발합니다. */
        const tempVX = b1.vx;
        const tempVY = b1.vy;
        b1.vx = b2.vx * bounce;
        b1.vy = b2.vy * bounce;
        b2.vx = tempVX * bounce;
        b2.vy = tempVY * bounce;

        // 떨림 현상 완화
        if (Math.abs(b1.vx) < VELOCITY_THRESHOLD) b1.vx = 0;
        if (Math.abs(b1.vy) < VELOCITY_THRESHOLD) b1.vy = 0;
        if (Math.abs(b2.vx) < VELOCITY_THRESHOLD) b2.vx = 0;
        if (Math.abs(b2.vy) < VELOCITY_THRESHOLD) b2.vy = 0;
      }
    }
  }
}



class hitBall {
  constructor() {
    this.radius = hitball_size;
    this.x = canvas.width / 2;
    this.y = canvas.height - 30; // 시작 위치
    this.vx = 0;     // 초기 속도(dx)
    this.vy = -hitball_speed;    // 초기 속도(dy)
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = (null != hitBallColor) ? hitBallColor : "black";
    ctx.fill();
    ctx.closePath();
  }

  update() {
    // 남는 tarBall 이 없는 경우
    if (0 == balls.length){
      // 그대로 두기
    }
    if (0 == hitballs.length){
      return;
    }
    this.x += this.vx;
    this.y += this.vy;

    // 하단 벽 충돌
    if (this.y + this.radius > canvas.height) {
      const idxh = hitballs.indexOf(this);
      if (idxh >= 0){
        hitballs.splice(idxh, 1);   
      }
      if (hitballs.length <= 0){
        gameOver = true;
        gameCollapse();
        endGame();
        //showStageScreen();      
      }      
      return;
    }    


    // 좌측 벽 충돌 처리
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx *= -1; 
      playWallHitSound();
    }

    // 우측 벽 충돌 처리
    if (this.x + this.radius > canvas.width) {
      this.x = canvas.width - this.radius;
      this.vx *= -1;
      playWallHitSound();
    }

    // 상단 벽 충돌
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy *= -1;
      playWallHitSound();
    }

    // 패들과 충돌 검사
    if (paddle && !gameOver) {
      // 패들 사각형 내부에서 원 중심과 가장 가까운 점을 찾아서 충돌 검사
      /*
        clamp(기준값, 최소값, 최대값) : 기준값을 return 하지만 최소값, 최대값을 넘어가지 않게 함.
        hypot() - 직각삼각형 빗변 계산
        즉, 여기서 dist 는 (paddle 의 특정 지점 중 가장 원과 가까운 지점) ~ (원 중심) 거리를 의미한다.

        그리고 그런 dist 가 원의 중심보다 작다면 -> 충돌!
      */
      const closestX = clamp(this.x, paddle.x, paddle.x + paddle.width);
      const closestY = clamp(this.y, paddle.y, paddle.y + paddle.height);
      const dx = this.x - closestX;
      const dy = this.y - closestY;
      const dist = Math.hypot(dx, dy);
      // ( 너무 빠른 공은 dist = 0 으로 바뀌며 dividedByZero 버그 발생!)

      // 충돌 상황입니다. 공의 반지름보다 공 중심과 패들로부터 가장 가까운 부분까지의 거리가 더 작으면 파고든 상태입니다.
      if (dist < this.radius) { 
        
        // 꼭짓점 부분에 닿았는지 확인하는 변수!
        const isVertexL = 
          (this.y + this.radius >= paddle.y )&&
          (this.y < paddle.y) &&
          (this.x + this.radius >= paddle.x) &&
          (this.x <= paddle.x);
        const isVertexR = 
          (this.y + this.radius >= paddle.y )&&
          (this.y < paddle.y) &&
          (this.x - this.radius <= paddle.x + paddle.width) &&
          (this.x >= paddle.x + paddle.width);

        if (!(isVertexL||isVertexR)) {
            // 그냥 paddle 윗면입니다.
            this.vy *= -1;
            this.y = paddle.y - this.radius - 1;
        } else {
          const leftp = (closestX === paddle.x) && (closestY === paddle.y);
          const rightp = (closestX === paddle.x + paddle.width) && (closestY === paddle.y);
        
          if (leftp || rightp){

            const oldSpeed = Math.hypot(this.vx, this.vy) || hitball_speed;
            

            const cornerX = leftp ? paddle.x : (paddle.x + paddle.width);
            const cornerY = paddle.y;
            // 공~꼭짓점 까지의 각도 구하기
            const vx_center = this.x - cornerX;
            const vy_center = this.y - cornerY;
            const angle_center = Math.atan2(vy_center, vx_center);

            // 기존 꼭짓점의 45도 vector
            const angle_45 = leftp ? ( - Math.PI + Math.PI / 4 )  // -135도= -3ㅠ/4
              : ( - Math.PI / 4 ); // -45도 = -ㅠ/4

            // 이제 두 개의 각도를 구했고, 그 두 사이의 각이 반사각이 된다.
            let a = angle_center;
            let b = angle_45;

            let diff = b-a;
            if (diff > Math.PI) diff -= 2 * Math.PI; // 각 차이를 180도 내로 정규화
            if (diff < -Math.PI) diff += 2 * Math.PI;

            // 중요: 중간 각도 구하기!
            const midAngle = a + diff / 2;
            // 공 반사!
            this.vx = Math.cos(midAngle) * oldSpeed;
            this.vy = Math.sin(midAngle) * oldSpeed;
            // 파고든만큼 밀어내고 +1 만큼 더 밀어내기
            const overlap = this.radius - dist + 1;
            this.x += Math.cos(midAngle) * overlap;
            this.y += Math.sin(midAngle) * overlap;
 
          } else {

            // 단위 벡터 구하기... 인데 아까 원이랑 비슷함
            // 예를들어 x 방향으로 관통하는 상황에선 x가 음수가 나올테니(물론 좌표 기준으로 생각하면 양수가 되겠지만) 나중에 그냥 + 로 더하면 될듯?
            const nx = dx / dist; // 걍 cos 값임
            const ny = dy / dist; // 걍 sin 값임

        
            const dot = this.vx*nx + this.vy*ny;

            this.vx = this.vx - 2 * dot * nx; // 반영된 vx
            this.vy = this.vy - 2 * dot * ny; // 반영된 vy

            // paddle 에 파고든 만큼 다시 분리
            const pushDist = this.radius - dist + 1;
            this.x += nx * pushDist; // 단위벡터 * 길이 반영
            this.y += ny * pushDist; // 단위벡터 * 길이 반영
          }
        }
      }
    }


    // 예외 처리
    if (this.x - this.radius < 0 ||
         this.x + this.radius > canvas.width ||
          this.y - this.radius < 0 || 
          this.y + this.radius > canvas.height){

      let hbi = hitballs.indexOf(this);
      hitballs.splice(hbi, 1);
      paddle = null;
      initPaddle();
      hitballtimer.push(setTimeout( function() {
      if(!gameOver){
        hitballs.push(new hitBall());
      }} ,2000));      
      return;
      
    }

  }
}


function hitBall_handleCollisions() {
  if (hitballs.length <= 0 || balls.length <= 0 || gameOver) return;

  for (let i = 0; i < balls.length; i++) {
    const b = balls[i];
    for (let hitball of hitballs) {
      const dx = hitball.x - b.x;
      const dy = hitball.y - b.y;
      const dist = Math.hypot(dx, dy);

      if (dist < hitball.radius + b.radius) { 
        const angle = Math.atan2(dy, dx);

        hitball.vx = Math.cos(angle) * hitball_speed;
        hitball.vy = Math.sin(angle) * hitball_speed;

        const pushDist = hitball.radius + b.radius - dist + 1;
        hitball.x += Math.cos(angle) * pushDist;
        hitball.y += Math.sin(angle) * pushDist;

        if (b.breakCount <= 1) {
          // 과일이 완전히 깨어질 때
          const fruitName = getFruitNameByIdent(b.ident);
          addScore(fruitName);

          const fruitIndex = b.ident + 1;
          const counterElement = document.getElementById(`f${fruitIndex}`);
          if (counterElement) {
            const currentCount = parseInt(counterElement.textContent) || 0;
            counterElement.textContent = currentCount + 1;
          }
          balls.splice(i, 1);
          i--; // 인덱스 보정
        } else {
          b.breakCount -= 1;
        }

        playFruitHitSound();

        // 바구니(카운터) 상태가 바뀌었으므로 레시피 카드 갱신
        checkRecipes();
      }
    }
  }
}

function handleCanvasClick(event) {
    if (gameOver) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // balls 배열 순회하며 클릭한 tarBall이 있는지 확인
    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];
        const dx = clickX - ball.x;
        const dy = clickY - ball.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= ball.radius) {
            // breakCount 감소
            if (ball.breakCount > 1) {
                ball.breakCount -= 1;
            } else {
                // 점수 추가
                addScore(getFruitNameByIdent(ball.ident));

                // breakCount가 0이하라면 공 삭제
                // → 바구니 카운터 증가
                const fruitIndex = ball.ident + 1; // ident는 0-based
                const counterElement = document.getElementById(`f${fruitIndex}`);
                if (counterElement) {
                    const currentCount = parseInt(counterElement.textContent) || 0;
                    counterElement.textContent = currentCount + 1;
                }

                balls.splice(i, 1);
                i--; // 배열에서 제거했으니 인덱스 보정
            }

            // 클릭한 공만 처리하고 break
            // 바구니(카운터) 상태가 바뀌었으므로 레시피 카드 갱신
            // 과일 카운터가 바뀌었으니 레시피 카드 갱신
            checkRecipes();
            break;
        }
    }
}



class Paddle {
  constructor(){
    this.width = 60;
    this.height = 10;

    // 기준 위치는 좌측 모서리!
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - 20;
    this.speed = 5; // paddle 조작 속도
    this.moveLeft = false;
    this.moveRight = false;
  } 
  draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  update() {
    if (this.moveLeft) this.x -= this.speed;
    if (this.moveRight) this.x += this.speed;
    
    /* 
      경계 검사
        우측 : (0,0) 을 기준으로한 x 좌표에 paddle width 를 더한 값이 캔버스 width 보다 작아야합니다.
        좌측 : just 좌표 검사만(그게 끝이니깐!)
    */
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > canvas.width) {
      this.x = canvas.width - this.width;
    }
  }
}


document.addEventListener('keydown', handle => {
  if (!paddle || gameOver) return;
  if (handle.key === 'ArrowLeft') paddle.moveLeft = true;
  if (handle.key === 'ArrowRight') paddle.moveRight = true;
});

// 키에서 떼면 이동 플래그 해제
document.addEventListener('keyup', handle => {
  if (!paddle || gameOver) return;
  if (handle.key === 'ArrowLeft') paddle.moveLeft = false;
  if (handle.key === 'ArrowRight') paddle.moveRight = false;
});


function initPaddle(){
  paddle = new Paddle();
}

function initBalls() { // tarBall & hitBall
  /* 
    최대한 랜덤 생성 결과에 대한 중복을 피하되 원하는 갯수의 공을 생성하기 위해 
    공의 생성 마지막에 오버랩 검사가 있습니다. 따라서 attemps 로 가능한 최대 반복 횟수를 제한했습니다.
  */
  mapImgs();
  let attempts = 0;

  let spawnBalls = []; // 각 난이도 및 스테이지가 결정되면, 스폰할 tarBall 들의 갯수 해당 변수에 들어갑니다. 
  switch (currentDifficulty.toLowerCase()) {
      case 'easy':
        switch (currentStage.toLowerCase()) {
          case 'stage1':
            spawnBalls = ballCnt_easy[0].slice();
            break;
          case 'stage2':
            spawnBalls = ballCnt_easy[1].slice();
            break;
          case 'stage3':
            spawnBalls = ballCnt_easy[2].slice();
            break;
        }
        break;
      case 'normal':
        switch (currentStage.toLowerCase()) {
          case 'stage1':
            spawnBalls = ballCnt_normal[0].slice();
            break;
          case 'stage2':
            spawnBalls = ballCnt_normal[1].slice();
            break;
          case 'stage3':
            spawnBalls = ballCnt_normal[2].slice();
            break;
        }
        break;
      case 'hard':
        switch (currentStage.toLowerCase()) {
          case 'stage1':
            spawnBalls = ballCnt_hard[0].slice();
            break;
          case 'stage2':
            spawnBalls = ballCnt_hard[1].slice();
            break;
          case 'stage3':
            spawnBalls = ballCnt_hard[2].slice();
            break;
        }
        break;
  }
  // 잘못된 스테이지 설정 또는 환경 설정 오류 (과일을 하나도 생성하지 않도록 설정한 경우)
  if (spawnBalls.length <= 0){
    gameOver = true;
    gameCollapse();
    showStageScreen();
    return;
  }

  /*
  공 크기 설정 
    fruit1 : 체리 - 27
    fruit2 : 딸기 - 29
    fruit3 : 포도 - 40
    fruit4 : 오렌지 - 33
    fruit5 : 사과 - 35
    fruit6 : 복숭아 - 39
    fruit7 : 파인애플 - 42
    fruit8 : 수박 - 47

  */
  let radius = radius_global;
  let ident = 0; // 여기서 반복자는 배열 index 를 의미하며, 조회하는 spawnBalls 의 각 index 는 과일을 의미합니다.
  while(spawnBalls.length > ident && attempts < 2000) {

    
    //const radius = Math.random() * 17 + 25; // 공 크기 설정
    /* 
      초기 공 생성 로직
        [a] 공을 상자(랜덤지름x랜덤지름)으로 생각
        [b] 원점(0,0)이 좌측 상단임을 고려하면, '캔버스 - 상자'를 한 값에서 랜덤 값(0<=x<1)을 곱하면 적어도 상자 크기만큼의 공간 이상이 확보된다.
        [c] b 를 통해 남은 공간에 상자의 반지름 만큼의 공간을 이동시키면 벽에 오버랩되는 공 없이 랜덤 좌표를 결정할 수 있다.
    */
    // 공 크기 설정

    // 랜덤 위치 결정
    const x = Math.random() * (canvas.width - 2 * radius[ident]) + radius[ident];
    const y = Math.random() * (canvas.height - 2 * radius[ident]) + radius[ident];
    
    // 인스턴스 생성
    const newBall = new tarBall(x, y, radius[ident], ident, tbreakCount[ident]);

    // 오버랩 검사에 통과한 newball에 한하여 balls 전역 배열에 push 됩니다. 
    if (!isOverlapping(newBall, balls)) {
      if (spawnBalls[ident] <= 0) {
        ident++; // 한 가지 과일을 전부 스폰한 경우
      } else {
        balls.push(newBall);
        spawnBalls[ident]--; // 한 가지 과일을 모두 스폰하지 못한 경우
      }
    }
    // 오버랩된 경우 (continue)
    attempts++;
  }
  // 공이 다 생성되면 2초 뒤에 공 투입 ~
  hitballtimer.push(setTimeout( function() {
  if(!gameOver){
    hitballs.push(new hitBall());
  }} ,2000));

}
function animate() {
  /* 
    setInterval() 대신, requestAnimationFrame() 을 이용하여 콜백 함수가 
    끝나자마자 연속으로 실행할 수 있습니다.
  */

  if (true == gameOver){  
    return;
  }


  // 매번 화면을 초기화합니다.
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  /* tarball 업데이트(벽쿵 -> 충돌 처리 -> 그리기)*/
  for (const ball of balls) {
    ball.update();
  }
  tarBall_handleCollisions();
  for (const ball of balls) {
    ball.draw();
  }

  for (const hb of hitballs){
    hb.draw();
    hitBall_handleCollisions();
    hb.update();
  }
  if (paddle){
    paddle.update();
    paddle.draw();
  }
  // 게임 오버 처리 
  if (document.querySelectorAll('.card').length === 0) {
  gameOver = true;
  gameCollapse();
  clearGame();
  return;
}

  aniHandle = requestAnimationFrame(animate);
}
function updateAllhitBalls(){
  for (const hb of hitballs){
    hb.update();
  }
}
function drawAllhitBalls(){
  for (const hb of hitballs){
    hb.draw();
  }
}

function clamp(v, min, max){ 
  // 원래 정의되어 있다고 하는데... 없다고 뜨네요.
  // (1) min v 랑 비교할 땐, 그나마 더 큰 값을 반환해야함(0,0 좌표)
  // (2) max 랑 (2) 결과랑 비교할 땐 더 작은 값을 반환해야함.
  // (1)과(2) 를 통해 min <-> max 안에 있는 v 값 또는 최소/최대값을 반환할 수 있습니다.
  return Math.min(max,Math.max(min,v));
}


function endGame() {
  gameOver = true;
  cutAnimationSequence();  // 애니메이션 중단

  // hitBallTimer도 멈춤
  for (let t of hitballtimer) {
    clearTimeout(t);
  }
  hitballtimer = [];

  // 효과음 재생!
  playGameOverSound();

  // #game-over 표시
  const gameOverDiv = document.getElementById('game-over');
  if (gameOverDiv) {
    gameOverDiv.style.display = 'flex';
  }

  console.log("게임 오버! 모든 tarBall이 제거되었습니다.");
}

function clearGame() {
  gameOver = true;
  cutAnimationSequence();  // 애니메이션 중단

  

  // hitBallTimer도 멈춤
  for (let t of hitballtimer) {
    clearTimeout(t);
  }
  hitballtimer = [];

  // 효과음 재생!
  playGameClearSound();

  // "클리어" 메시지 표시
  const gameClearDiv = document.getElementById('game-clear');
  if (gameClearDiv) {
    gameClearDiv.style.display = 'flex';
  }

  // 카드 초기화 
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.style.border = '2px solid #ccc';
    card.style.backgroundColor = '';
    card.removeAttribute('data-recipe-name');
    const textDiv = card.querySelector('.card-text');
    if (textDiv) textDiv.textContent = '';
  });
  
}

// currentStage가 'stage1'이면 'stage2' 스토리 화면을 띄우고,
// 'stage2'이면 'stage3' 스토리 화면을 띄우도록 한다.
function nextStage() {
  if (currentStage === 'stage1') {
    startGame('stage2');  // 자동으로 currentStage='stage2'가 됩니다.
  } else if (currentStage === 'stage2') {
    startGame('stage3');  // 자동으로 currentStage='stage3'가 됩니다.
  } else {
    // 예: stage3도 클리어했다면 메인 화면으로 돌아가거나, 원하는 다른 화면으로…
    showMainScreen();
  }
}

// ===================== 게임 멈추기/일시정지 처리 =====================
// ESC 키 누르면 게임 멈추기
// 전역 변수로 일시정지 상태 관리
let isPaused = false;

// ESC 키 누를 때마다 pause ↔ resume 토글
document.addEventListener('keydown', event => {
  if (event.key === "Escape") {
    if (isPaused) {
      resumeGame();
    } else {
      pauseGame();
    }
    isPaused = !isPaused;
  }
});

function pauseGame() {
  // 애니메이션 중단
  gameOver = true;
  cutAnimationSequence();

  // 남아 있는 hitBall 생성 타이머들 모두 정리
  for (let t of hitballtimer) {
    clearTimeout(t);
  }
  hitballtimer = [];

  // 배경음악도 일시정지
  const bgm = document.getElementById('main-bgm');
  if (bgm && !bgm.paused) {
    bgm.pause();
  }

  console.log("게임이 일시정지되었습니다.");
}

function resumeGame() {
  // 애니메이션 재시작
  gameOver = false;

  // 배경음악 다시 재생
  const bgm = document.getElementById('main-bgm');
  if (bgm && bgm.paused) {
    bgm.play();
  }

  // 단순히 animate()를 다시 호출해서 루프를 재개
  // (게임 상태는 pause 직전 그대로 유지됩니다)
  animate();

  console.log("게임이 재개되었습니다.");
}


function cutAnimationSequence(){
  if (aniHandle != null) {
    cancelAnimationFrame(aniHandle);
    aniHandle = null;
  }
}
// 게임 붕괴~
function gameCollapse(){
  if(hitballtimer.length >= 1){
    for (let v = 0; v > hitballtimer.length; v++){
      clearTimeout(hitballtimer[v]);
      hitballtimer.splice(v,1);
    }   
  }
  
  // 모든 전역 변수 초기화
  balls = [];
  paddle = null;
  hitballs = [];
  gameOver = true;
  hitball_speed = 7;
  hitball_size = 10;
  cutAnimationSequence();
}


function restartGame(){
  gameCollapse();
  gameOver = false;
  setTimeout(function(){
    initGame();
  },2000);
}


function initGame() {
  initPaddle();
  initBalls(); 


}

function startGameInterval(){
  
  gameOver = false;
  initGame();

  animate();  
}




//--------------------------------//DEBUG//--------------------------------//

document.addEventListener('keyup', handle => {
  if (!paddle || gameOver) return;
  if (handle.key === 'c') setSizehitBall(20); // 공크기 2배
  if (handle.key === 'b') setSizehitBall(10); // 원상복구
  if (handle.key === 'a') addhitBall();  // hitBall 추가하기
  if (handle.key === 'd') setSpeedhitBall(15);
  if (handle.key === 'e') setpaddlescale(400);
});
//--------------------------------//[ENDLINE] Ball//--------------------------------//





