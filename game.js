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
	// 게임 강제 종료
	gameCollapse();
}

function showDifficultyScreen() {
    hideAllScreens();
    $('#difficulty-screen').addClass('active');
	// 게임 강제 종료
	gameCollapse();
}

function showStageScreen(difficulty) {
    // 난이도가 전달되면 업데이트, 그렇지 않으면 기존 값 유지
    if (difficulty) {
        currentDifficulty = difficulty;
    }
    hideAllScreens();
    $('#stage-screen').addClass('active');
	// 게임 강제 종료
	gameCollapse();
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


	//canvas.width = 400;
    //canvas.height = 600;
	startGameInterval();
	

    /* 기존 내용        
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
	*/
}








//--------------------------------//[STARTLINE] Ball//--------------------------------//
// 과일 / paddle / 공(hitBall) 으로 나눕니다.

/* 

  [!] 공(과일) 구현 개요
    게임 내 크게 2 가지 공이 존재합니다. (1) tarBall (2) hitBall (tarBall 은 과일에 해당하는 공을 의미합니다.)
    [1] tarBall
      a. tarBall 은 class tarBall 에 의해 생성되며, balls[] 에 의해 통제됩니다.
      b. 각 class 에 해당하는 공들은 클래스 생성자를 통해 기본값이 설정된 상태에서 '공'객체가 생성됩니다.
      c. 각 공의 BreakCount 는 임시로 색상에 따른 index로 설정했습니다. index 순서를 바꾸거나 직접 할당하는 방향으로 수정 가능합니다.
      [*] 구현 핵심 
        - 공에 대한 중력 작용 및 공 간 피격 시 발생하는 '떨림' 문제 : 
            공들이 서로 부딪힐 때마다 반동 계수로 왔다갔다하는 상황 -> 최저 속도 (VELOCITY_THRESHOLD)로 조절.
        - 공에 대한 중력 & 공 간 충돌 처리
          공은 중력에 영향을 받는 상황에서 대각 방향으로 부딪힌 서로 다른 두 개의 공이 존재할 때,
          상대적으로 아래쪽에 있는 공은 위쪽 공을 타고 자연스럽게 중력의 영향을 받아야합니다.
          
          => '공 중심 간 거리로 계산한 거리 & 두 공의 반지름 합에 대한 거리'를 이용하여
            overlap 상황에 대해 더 이상 속도 계수가 증가하는 현상을 막고 ... (1)
            bounce 계수로 속도 손실을 일으켜 자연스럽게 공이 충돌 반대로 향하게 하고 ... (2)
            그 와중에 (2) 에 대한 효과가 미미하고 중력의 효과가 강하다면 타고 넘어가는 그림까지 구현할 수 있습니다.(3)
        - 충돌 상황의 기본적인 알고리즘
          1. 방향 전환(대상 간의 벡터 각도를 구하고, 길이만큼 더해서 속도 제어(당연히 hitball 속도의 크기는 고정))
          2. 위치 보정(관통/오버랩 상황 제어)
      d. 사진 일부가 잘리는 문제
        지금 상황에선 포도의 머리 부분만 잘리는데 shrink 변수를 통해 스케일 작게해서 적용합니다.
    [2] hitBall  
      tarBall 과 비슷합니다.
      a. 구렁텅이로 빠져버리는 오류 또는 예기치 못한 오류 처리 ( 전체 경계 검사 로직 추가)
  [!] paddle 구현
    추가 구현 지점 : 연못빠진 경우



[고민]
  1. 과일 삐죽삐죽 튀어나온 것은 어떻게 할까...(테두리를 그릴까?)
  2. 회전을 지금처럼 살짝 넣는게 맞을까?(살짝 어색)

*/



const gravity = -0.25; // 모든 공의 기본 중력 값

/* 
  [공들의 충돌 계수 -> 모든 충돌의 loss 를 구현할 수 있습니다!]
    이 부분은 공 간 충돌로 인한 에너지 손실 상황을 가정해서 조절할 수 있습니다.
    bounce 값이 작아질수록 고체충돌에 가깝게 -> 충돌로 인한 튕김 현상을 완화할 수 있습니다.
    bounce 값이 클수록 탄성충돌에 가깝게 -> 충돌로 인한 튕김 현상을 증폭할 수 있습니다.
    이 값이 작을수록 충돌로 인한 안정화 돌입이 빠르게 되는 것을 확인할 수 있었습니다.
*/
let hitball_speed = 5; // hitBall 속도 
const bounce = 0.6;  // 기본 바운스 계수 공이 퉁퉁.... 거릴 때 사용하는 계수임
const bounce_byhit = 0.7; // hitBall 에 의한 tarBall 의 반발계수
const strength_byhit = hitball_speed*0.4 // hitBall 에 의한 tarBall 의 증폭계수

const VELOCITY_THRESHOLD = 0.2; // 최저 속도 설정 (공 떨림 완화)
//const ballCount = Math.floor(Math.random() * 6) + 14; // 생성되는 공 숫자
const ballCount = 13; // 공 갯수 지정
let balls = []; // tarBall 객체
const colors = ['red', 'blue', 'yellow', 'pink', 'black', 'orange', 'green', 'purple'];
const ballImages = {};

let paddle = null; // paddle 객체
let hitball = null; // hitball 객체

let shrink = 0.98; // 사진이 잘릴 경우 보정하는 용도입니다. 1보다 작게 할 생각만 했는데, 이렇게 하면 테두리 같은 것을 만들어야 어색하지 않고
// 그러면 ui 가 좀 괴상해진다. -> 오히려 늘린다! shrink 라 쓰고 accrete 로 사용! 을 하면 더 짤린다.
// 그냥 잘리는 과일에 대해서만 (포도 등) 원을 조금 더 크게 만들어주면 될 것 같다...

let rotate_threshold_speed = 0.8 // 회전하기 위한 최소 속도 기준
let angular_scale = 0.1 // 속도 -> 각속도 변환시 곱해주는 상수
let max_angular_velocity = 0.005// 최대 각속도 제한


/*
  [게임 운영]
    gameOver : 게임 진행 상태가 아닌 경우 true 로 설정합니다.

*/
let gameOver = false;

let hitballtimer = null; // 2초 뒤에 hitball 등장~
let aniHandle = null; // animation sequence 를 중간에 중단시키기 위한 전역변수.
let canvas, ctx;

// 페이지 로드가 완료되면 DOM 트리에서 canvas를 찾기!
$(document).ready(function() {
    canvas = document.getElementById("game-canvas");
    ctx= canvas.getContext('2d');
});




// 색에 맞는 과일 이미지 지정
function mapImgs() {
  for (let i = 0; i < colors.length; i=i+1) {
    const img = new Image();
    img.src = `./src/balls/ball${i+1}.jpg`;
    ballImages[colors[i]] = img;
  }
}

class tarBall {
  constructor(x, y, radius, color, breakCount=1) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.vy = Math.random() * -2; // 랜덤 초기 속도(y)
    this.vx = (Math.random() - 0.5) * 2; // 랜덤 초기 속도(x - 좌우 방향이므로 -0.5)
    this.image = ballImages[color];
    this.breakCount = breakCount+1; // index 0 -> 1, index 1 -> 2 ... 로 설정

    /*공 회전을 위한 변수*/
    this.angle = 0; // 각도(라디안)
    this.angularVelocity =  this.vx / this.radius; // 회전 속도 -> 수평 속도 비례 version
    // (Math.random() - 0.5) * 0.2 ; // 회전 속도 random version
  }

  draw() {
    /* 회전 넣기 전 version */
    // ctx.save(); // 다른 객체에 영향을 주지 않기 위해 사용함.
    // ctx.beginPath();
    // if (2 == colors.indexOf(this.color)) { // 포도만 차별대우
    //   ctx.arc(this.x, this.y, this.radius+1, 0, Math.PI * 2); // 이게 사진 보이게 하는 정답이었다! & 회전시 회전 좌표계(0,0)를 기준으로 그려야함.

    // } else {
    //   ctx.arc(this.x, this.y, this.radius+1, 0, Math.PI * 2);

    // }
    // ctx.clip(); 

    // if (this.image.complete) {
    //   ctx.drawImage( this.image, this.x - this.radius*shrink, this.y - this.radius*shrink, this.radius * 2*shrink, this.radius * 2*shrink);
    // } else {  // 이미지가 없는 경우(가 없겠지만)...
    //   ctx.fillStyle = this.color;
    //   ctx.fill();
    // }
    // ctx.restore();


    // ctx.fillStyle = 'white';
    // ctx.font = `${this.radius * 0.7}px Arial`;
    // ctx.textAlign = 'center';
    // ctx.textBaseline = 'middle';
    // ctx.fillText(this.breakCount, this.x, this.y);

    /* 회전 넣은 version*/
    ctx.save();

    //공 중심으로 이동 -> 공의 angle 만큼 회전
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    
    ctx.beginPath();

    if (colors.indexOf(this.color) === 2) {
      // 포도의 경우에만 +1~
      ctx.arc(0, 0, this.radius + 1, 0, Math.PI * 2);
    } else {
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    }
    ctx.clip();

    if (this.image.complete) {
      if (colors.indexOf(this.color) === 2) {
        ctx.drawImage( this.image,-(this.radius + 1) * shrink,-(this.radius + 1) * shrink,(this.radius + 1) * 2 * shrink,(this.radius + 1) * 2 * shrink);
      } else {
        ctx.drawImage(this.image, -this.radius * shrink,-this.radius * shrink,this.radius * 2 * shrink,this.radius * 2 * shrink);
      }
    } else {
      ctx.fillStyle = this.color;
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

    //테두리 넣을지 고민중입니다.
    // ctx.beginPath();
    // ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    // ctx.lineWidth = 2;
    // ctx.strokeStyle = 'black';
    // ctx.stroke();


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
      this.y = canvas.height - this.radius;
      this.vy *= -bounce;
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


function tarBall_handleCollisions() {
  if(!tarBall || gameOver) return;
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
    this.radius = 10;
    this.x = canvas.width / 2;
    this.y = canvas.height - 30; // 시작 위치
    this.vx = 0;     // 초기 속도(dx)
    this.vy = -hitball_speed;    // 초기 속도(dy)
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
  }

  update() {
    // 남는 tarBall 이 없는 경우
    if (0 == balls.length){
      alert("YOUWIN!");
      restartGame();
      return;
    }
    this.x += this.vx;
    this.y += this.vy;
    
    /* 
      특이 case 에 대한 오류 처리
        직접 구현하다보니 좌측 하단에서 paddle 이랑 벽이랑 무한으로 튕기다가 우주로 공이 넘어가버리는 현상이 있었다.
        어차피 Frame 은 반복되고 ...(1)
        x,y 값에 따라 사진은 보일 것이며 ...(2)
        (1)(2)을 이용해 x,y 값이 캔버스를 넘어가는 상황을 처리한다.
     */
    if (this.x < -2 || this.x > canvas.width + 2 || this.y < -2 || this.y > canvas.height + 2){
      alert("공이 연못에 빠졌어요~");
      restartGame();
      return;
    }

    // 좌측 벽 충돌 처리
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx *= -1; 
    }

    // 우측 벽 충돌 처리
    if (this.x + this.radius > canvas.width) {
      this.x = canvas.width - this.radius;
      this.vx *= -1;
    }

    // 상단 벽 충돌
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy *= -1;
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

      if (dist < this.radius) { // 충돌!
        
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

    // 하단 벽 충돌
    if (this.y + this.radius > canvas.height) {
      gameOver = true;
      alert("Game Over"); 
      restartGame();
    }
  }
}
function clamp(v, min, max){ 
  // 원래 정의되어 있다고 하는데... 없다고 뜨네요.
  // (1) min v 랑 비교할 땐, 그나마 더 큰 값을 반환해야함(0,0 좌표)
  // (2) max 랑 (2) 결과랑 비교할 땐 더 작은 값을 반환해야함.
  // (1)과(2) 를 통해 min <-> max 안에 있는 v 값 또는 최소/최대값을 반환할 수 있습니다.
  return Math.min(max,Math.max(min,v));

}

function hitBall_handleCollisions(){
  if(!hitball || gameOver) return;

  // 모든 공(tarball)들에 대한 for 문을 돌며 충돌 검사 수행 ~!
  for (let i = balls.length - 1; i >= 0; i--){
    const b = balls[i];
    const dx = hitball.x - b.x;
    const dy = hitball.y - b.y;
    const dist = Math.hypot(dx,dy);

    if (dist < hitball.radius + b.radius){ // hitball 과 tarball 간 충돌
      const angle = Math.atan2(dy,dx); // 아까 tarball 간 충돌과 비슷함. arctan 로 각도 구하고 단위 벡터 * 길이 곱해서 더하기!
      
      // 속도 크기는 5로 고정
      hitball.vx = Math.cos(angle) * hitball_speed;
      hitball.vy = Math.sin(angle) * hitball_speed;

      // 파고든 만큼 다시 분리(보정)
      const pushDist = hitball.radius + b.radius - dist + 1;
      hitball.x += Math.cos(angle) * pushDist;
      hitball.y += Math.sin(angle) * pushDist;
      
      // tarball 과의 충돌 처리
      // b.vx = b.vx * -bounce_byhit + Math.cos(angle) * strength_byhit; // x 방향
      // b.vy = b.vy * -bounce_byhit + Math.sin(angle) * strength_byhit; // y방향 


      // 과일 박살~!
      b.breakCount -= 1;
      if (b.breakCount <= 0){
        balls.splice(i, 1); // i-th ball 을 1개 제거
      }

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

  let attempts = 0;
  mapImgs(); 
  while (balls.length < ballCount && attempts < 1000) {
    /* 
      1. 공 크기 설정 (10px <= X < 50px)
      2. 공 생성 위치 아이디어
        [a] 공을 상자(랜덤지름x랜덤지름)으로 생각
        [b] 원점(0,0)이 좌측 상단임을 고려하면, '캔버스 - 상자'를 한 값에서 랜덤 값(0<=x<1)을 곱하면 적어도 상자 크기만큼의 공간 이상이 확보된다.
        [c] b 를 통해 남은 공간에 상자의 반지름 만큼의 공간을 이동시키면 벽에 오버랩되는 공 없이 랜덤 좌표를 결정할 수 있다.
    */
    const radius = Math.random() * 17 + 25;
    const x = Math.random() * (canvas.width - 2 * radius) + radius;
    const y = Math.random() * (canvas.height - 2 * radius) + radius;
    const rand_color = Math.floor(Math.random() * colors.length);
    const color = colors[rand_color];
    const bc = colors.indexOf(color); 
    // 인스턴스 생성
    const newBall = new tarBall(x, y, radius, color, bc);

    // 오버랩 검사에 통과한 newball에 한해서만 balls 전역 배열에 push 됩니다. 
    if (!isOverlapping(newBall, balls)) {
      balls.push(newBall);
    }
    attempts++;
  }
  // 공이 다 생성되면 2초 뒤에 공 투입 ~
  hitballtimer = setTimeout( function() {
    if(!gameOver){
      hitball = new hitBall();
    }} ,2000);

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


  if(hitball && paddle){
    hitball.update();
    // 드디어 해결... hitball 이 바닥 면에 닿을 때 죽고 restartGame() 에 의해 객체가 소멸되는데 draw() 메서드를 쓸 수 없기 때문에 이에 대한 처리를 추가한다.
    if (hitball && paddle){
      hitball.draw();
      hitBall_handleCollisions();
      paddle.update();
      paddle.draw();
    }
  }
  aniHandle = null; // UAF 공격 방지
  aniHandle = requestAnimationFrame(animate);

}
function cutAnimationSequence(){
  if (aniHandle != null) {
    cancelAnimationFrame(aniHandle);
    aniHandle = null;
  }
}
// 게임 붕괴~
function gameCollapse(){
  if(hitballtimer != null){
    clearTimeout(hitballtimer);
    hitballtimer = null;
  }
  
  // 모든 전역 변수 초기화
  balls = [];
  paddle = null;
  hitball = null;
  gameOver = true;
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



//--------------------------------//[ENDLINE] Ball//--------------------------------//