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

function showStageScreen(difficulty) {
    // 난이도가 전달되면 업데이트, 그렇지 않으면 기존 값 유지
    if (difficulty) {
        currentDifficulty = difficulty;
    }
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
    ctx.fillText('게임 영역', canvas.width/2, canvas.height/2 - 40);
    ctx.fillText(`현재 난이도: ${currentDifficulty.toUpperCase()}`, canvas.width/2, canvas.height/2);
    ctx.fillText(`현재 스테이지: ${currentStage.toUpperCase()}`, canvas.width/2, canvas.height/2 + 30);
    
    ctx.font = '16px Arial';
    ctx.fillText('게임이 곧 시작됩니다...', canvas.width/2, canvas.height/2 + 70);
}