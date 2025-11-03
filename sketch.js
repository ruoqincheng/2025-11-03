let questions = [];
let currentQuestions = [];
let currentQuestion = 0;
let score = 0;
let gameState = 'start'; // start, quiz, result
let table;
let selectedAnswer = '';
let feedback = '';
let canvas;

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function preload() {
    table = loadTable('questions.csv', 'csv', 'header');
}

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.style('display', 'block'); // 移除預設的 margin
    textAlign(CENTER, CENTER);
    // 載入所有題目
    for (let i = 0; i < table.getRowCount(); i++) {
        let row = table.getRow(i);
        questions.push({
            question: row.getString('題目'),
            options: [
                row.getString('選項A'),
                row.getString('選項B'),
                row.getString('選項C'),
                row.getString('選項D')
            ],
            correct: row.getString('正確答案')
        });
    }
}

function draw() {
    drawAnimatedBackground();
    if (gameState === 'start') {
        drawStartScreen();
    } else if (gameState === 'quiz') {
        drawQuizScreen();
    } else if (gameState === 'result') {
        drawResultScreen();
    }
}

function drawAnimatedBackground() {
    background(230);
    noStroke();
    let t = millis() * 0.001;
    let gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
            let d = dist(x, y, width/2, height/2);
            let r = 10 + 8 * sin(t + d * 0.04);
            fill(180 + 40 * sin(t + x * 0.01), 200 + 30 * cos(t + y * 0.01), 255, 180);
            ellipse(x, y, r, r);
        }
    }
}

function drawStartScreen() {
    fill(0);
    textSize(40);
    text('歡迎參加測驗', width/2, height/3);
    
    // 繪製開始按鈕
    drawButton('開始測驗', width/2, height/2);
}

function drawQuizScreen() {
    let q = currentQuestions[currentQuestion];
    
    // 顯示題目編號和題目
    fill(0);
    textSize(20);
    text(`題目 ${currentQuestion + 1}/4`, width/2, 50);
    textSize(24);
    text(q.question, width/2, 120);
    
    // 顯示選項
    let optionLetters = ['A', 'B', 'C', 'D'];
    for (let i = 0; i < 4; i++) {
        let y = height * 0.3 + i * (height * 0.1);
        if (selectedAnswer === optionLetters[i]) {
            if (selectedAnswer === q.correct) {
                fill(180, 255, 180); // 正確綠色
            } else {
                fill(255, 180, 180); // 錯誤紅色
            }
        } else {
            fill(255);
        }
        rect(width * 0.2, y - 25, width * 0.6, 50, 10);
        fill(0);
        text(optionLetters[i] + '. ' + q.options[i], width/2, y);
    }
    // 顯示即時回饋
    if (selectedAnswer !== '') {
        textSize(24);
        if (selectedAnswer === q.correct) {
            fill('green');
            text('答對了！', width/2, height * 0.75);
        } else {
            fill('red');
            text('答錯了！', width/2, height * 0.75);
            fill(0);
            textSize(20);
            let idx = ['A','B','C','D'].indexOf(q.correct);
            text('正確答案：' + q.correct + '. ' + q.options[idx], width/2, height * 0.80);
        }
        drawButton('下一題', width/2, height - 70);
    }
}

function drawResultScreen() {
    fill(0);
    textSize(40);
    text('測驗完成！', width/2, 100);
    
    textSize(30);
    text(`得分：${score}/4`, width/2, 200);
    
    textSize(24);
    text(getFeedback(), width/2, 300);
    
    drawButton('重新開始', width/2, height - 100);
}

function drawButton(label, x, y) {
    fill(100, 150, 255);
    rect(x - 100, y - 25, 200, 50, 10);
    fill(255);
    textSize(20);
    text(label, x, y);
}

function mousePressed() {
    if (gameState === 'start') {
        if (mouseX > width/2 - 100 && mouseX < width/2 + 100 &&
            mouseY > height/2 - 25 && mouseY < height/2 + 25) {
            startQuiz();
        }
    } else if (gameState === 'quiz') {
        // 檢查選項點擊
        if (selectedAnswer === '') {
            for (let i = 0; i < 4; i++) {
                let y = height * 0.3 + i * (height * 0.1);
                if (mouseX > width * 0.2 && mouseX < width * 0.8 &&
                    mouseY > y - 25 && mouseY < y + 25) {
                    selectedAnswer = ['A', 'B', 'C', 'D'][i];
                }
            }
        } else {
            // 點擊「下一題」
            if (mouseX > width/2 - 100 && mouseX < width/2 + 100 &&
                mouseY > height - 95 && mouseY < height - 45) {
                submitAnswer();
            }
        }
    } else if (gameState === 'result') {
        if (mouseX > width/2 - 100 && mouseX < width/2 + 100 &&
            mouseY > height - 125 && mouseY < height - 75) {
            gameState = 'start';
        }
    }
}

function startQuiz() {
    // 重設遊戲狀態
    score = 0;
    currentQuestion = 0;
    selectedAnswer = '';
    
    // 隨機選擇4題
    currentQuestions = [];
    let tempQuestions = [...questions];
    for (let i = 0; i < 4; i++) {
        let index = floor(random(tempQuestions.length));
        currentQuestions.push(tempQuestions[index]);
        tempQuestions.splice(index, 1);
    }
    
    gameState = 'quiz';
}

function submitAnswer() {
    let correct = currentQuestions[currentQuestion].correct;
    if (selectedAnswer === correct) {
        score++;
    }
    if (currentQuestion < 3) {
        currentQuestion++;
        selectedAnswer = '';
    } else {
        gameState = 'result';
    }
}

function getFeedback() {
    if (score === 4) {
        return '太棒了！你完全掌握了所有概念！';
    } else if (score === 3) {
        return '表現很好！還有一點小細節可以改進。';
    } else if (score === 2) {
        return '繼續加油！你已經理解了一半的內容。';
    } else if (score === 1) {
        return '需要更多練習，但別灰心！';
    } else {
        return '沒關係，失敗為成功之母，再試一次吧！';
    }
}
