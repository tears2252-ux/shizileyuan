/**
 * 识字乐园 - 巩固练习页（游戏化）
 */
function renderPractice(root, params) {
  var levelId = params.levelId || 1;
  var charIndex = params.charIndex || 0;
  var mode = params.mode || 'quiz'; // quiz | pick | pair

  var chars = getCharsByLevel(levelId);
  if (chars.length === 0) { App.navigateTo('home'); return; }
  if (charIndex < 0) charIndex = 0;
  if (charIndex >= chars.length) { App.navigateTo('home'); return; }

  var charData = chars[charIndex];
  var progress = getCharProgress(charData.id);
  var score = 0, total = 0;

  var html = '<div class="page active page-practice">';
  html += '<div class="top-bar">';
  html += '<button class="back-btn" onclick="App.navigateTo(\'learn/' + levelId + '/' + charIndex + '\')">←</button>';
  html += '<span class="title">巩固练习</span>';
  html += '<span class="progress-dot">⭐ <span id="p-score">0</span></span>';
  html += '</div>';

  html += '<div id="quiz-box" style="padding:16px"></div>';
  html += '</div>';

  root.innerHTML = html;

  function renderQuestion() {
    var box = document.getElementById('quiz-box');
    if (!box) return;

    // 生成4个选项：目标字 + 3个干扰字
    var allChars = [];
    var all = getAllChars();
    all.forEach(function(c){ if (c.char !== charData.char) allChars.push(c.char); });
    shuffleArray(allChars);
    var options = [charData.char].concat(allChars.slice(0, 3));
    shuffleArray(options);

    total++;
    var qType = total % 3; // 轮换题型
    var qHtml = '';

    if (qType === 0) {
      // 看字选拼音
      qHtml = '<div class="quiz-q">这个字怎么读？</div>';
      qHtml += '<div class="quiz-char">' + charData.char + '</div>';
      var pyOptions = [charData.pinyin].concat(shuffleArray(charData.words.map(function(w){ return w.pinyin; })).slice(0, 3));
      shuffleArray(pyOptions);
      qHtml += '<div class="quiz-options">';
      pyOptions.forEach(function(py){
        qHtml += '<button class="quiz-opt" data-answer="' + (py === charData.pinyin ? '1' : '0') + '">' + py + '</button>';
      });
      qHtml += '</div>';
    } else if (qType === 1) {
      // 看拼音选字
      qHtml = '<div class="quiz-q">找到这个字：' + charData.pinyin + '</div>';
      qHtml += '<div class="quiz-options big">';
      options.forEach(function(c){
        qHtml += '<button class="quiz-opt" data-answer="' + (c === charData.char ? '1' : '0') + '">' + c + '</button>';
      });
      qHtml += '</div>';
    } else {
      // 组词选择
      var word = charData.words[0];
      qHtml = '<div class="quiz-q">哪个词里有「' + charData.char + '」？</div>';
      var wOptions = [word.word];
      var otherWords = [];
      all.forEach(function(c){ if (c.char !== charData.char && c.words && c.words[0]) otherWords.push(c.words[0].word); });
      shuffleArray(otherWords);
      wOptions = wOptions.concat(otherWords.slice(0, 3));
      shuffleArray(wOptions);
      qHtml += '<div class="quiz-options">';
      wOptions.forEach(function(w){
        qHtml += '<button class="quiz-opt" data-answer="' + (w === word.word ? '1' : '0') + '">' + w + '</button>';
      });
      qHtml += '</div>';
    }

    qHtml += '<div class="quiz-feedback" id="quiz-fb"></div>';
    box.innerHTML = qHtml;

    // 绑定选项
    var opts = box.querySelectorAll('.quiz-opt');
    opts.forEach(function(opt){
      opt.addEventListener('click', function(){
        if (this.disabled) return;
        opts.forEach(function(o){ o.disabled = true; });
        var isRight = this.getAttribute('data-answer') === '1';
        var fb = document.getElementById('quiz-fb');
        if (isRight) {
          score++;
          this.classList.add('correct');
          var scoreEl = document.getElementById('p-score');
          if (scoreEl) scoreEl.textContent = score;
          App.playSound('correct');
          if (fb) fb.innerHTML = '✅ 答对啦！';
        } else {
          this.classList.add('wrong');
          App.playSound('wrong');
          if (fb) fb.innerHTML = '❌ 再想想～';
        }

        if (total >= 5) {
          setTimeout(finishQuiz, 800);
        } else {
          setTimeout(renderQuestion, 900);
        }
      });
    });
  }

  function finishQuiz() {
    var box = document.getElementById('quiz-box');
    if (!box) return;
    updateCharProgress(charData.id, 'practiceScore', score);

    var stars = score >= 4 ? 3 : score >= 3 ? 2 : 1;
    App.playSound('complete'); App.showStarAnimation(stars);
    App.showDialog('练习完成！🎉',
      score >= 4 ? '⭐⭐⭐' : score >= 3 ? '⭐⭐' : '⭐',
      '答对 ' + score + ' / ' + total + ' 题！',
      '继续', function(){ App.navigateTo('learn/' + levelId + '/' + (charIndex + 1) + '/0'); });
  }

  renderQuestion();
}
