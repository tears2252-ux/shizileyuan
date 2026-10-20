/**
 * 识字乐园 - 写字页
 */
function renderWrite(root, params) {
  var levelId = params.levelId || 1;
  var charIndex = params.charIndex || 0;

  var chars = getCharsByLevel(levelId);
  if (chars.length === 0) { App.navigateTo('home'); return; }
  if (charIndex < 0) charIndex = 0;
  if (charIndex >= chars.length) { App.navigateTo('home'); return; }

  var charData = chars[charIndex];

  var html = '<div class="page active page-write">';
  html += '<div class="top-bar">';
  html += '<button class="back-btn" onclick="App.navigateTo(\'learn/' + levelId + '/' + charIndex + '\')">←</button>';
  html += '<span class="title">写一写</span>';
  html += '<span class="progress-dot">' + (charIndex + 1) + '/' + chars.length + '</span>';
  html += '</div>';

  html += '<div class="write-layout">';

  // 左侧：笔画演示
  html += '<div class="write-demo">';
  html += '<div class="card">';
  html += '<h4 style="font-family:var(--font-cartoon);margin-bottom:10px">✍️ 看看怎么写</h4>';
  html += '<div id="write-demo-area" style="width:200px;height:200px;margin:0 auto"></div>';
  html += '<div style="text-align:center;margin-top:10px">';
  html += '<button class="btn-cartoon small" onclick="if(window._writeObj){window._writeObj.cancelAnimation();window._writeObj.animateCharacter();}">▶️ 播放</button>';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  // 右侧：田字格手写
  html += '<div class="write-trace">';
  html += '<div class="card">';
  html += '<h4 style="font-family:var(--font-cartoon);margin-bottom:10px">🖊️ 自己写一写</h4>';
  html += '<div style="text-align:center">';
  html += '<canvas id="write-canvas" width="280" height="280" style="border:3px solid #E74C3C;border-radius:12px;background:#FFFEF9;touch-action:none"></canvas>';
  html += '</div>';
  html += '<div style="text-align:center;margin-top:10px">';
  html += '<button class="btn-cartoon small orange" onclick="if(window._clearWrite)window._clearWrite()">🔄 清除</button>';
  html += '<button class="btn-cartoon green" onclick="if(window._checkWrite)window._checkWrite()">✅ 检查</button>';
  html += '</div>';
  html += '<div id="write-msg" style="text-align:center;margin-top:8px;min-height:24px;font-weight:700"></div>';
  html += '</div>';
  html += '</div>';

  html += '</div>';

  // 底部操作
  html += '<div style="text-align:center;margin:16px 0">';
  html += '<button class="btn-cartoon orange" onclick="App.navigateTo(\'learn/' + levelId + '/' + (charIndex + 1) + '/0\')">下一个字 →</button>';
  html += '</div>';

  html += '</div>';

  root.innerHTML = html;

  // 初始化笔画演示
  try {
    window._writeObj = HanziWriter.create('write-demo-area', charData.char, {
      width: 200, height: 200, padding: 5,
      strokeAnimationSpeed: 1.2, delayBetweenStrokes: 300,
      strokeColor: '#4A90D9', radicalColor: '#FF8C42',
      outlineColor: '#E0E0E0', showOutline: true, showCharacter: true
    });
    window._writeObj.animateCharacter();
  } catch(e) {
    var demo = document.getElementById('write-demo-area');
    if (demo) demo.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:90px;font-weight:900;color:#DDD">' + charData.char + '</div>';
  }

  // 田字格手写
  var cv = document.getElementById('write-canvas');
  var ctx = cv.getContext('2d');

  function drawGrid() {
    ctx.clearRect(0, 0, 280, 280);
    ctx.fillStyle = '#FFFEF9';
    ctx.fillRect(0, 0, 280, 280);

    // 外框
    ctx.strokeStyle = '#E74C3C'; ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 260, 260);

    // 十字虚线
    ctx.setLineDash([5, 5]); ctx.strokeStyle = '#CCC'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(140, 10); ctx.lineTo(140, 270); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(10, 140); ctx.lineTo(270, 140); ctx.stroke();
    ctx.setLineDash([4, 6]); ctx.strokeStyle = '#DDD'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(10, 10); ctx.lineTo(270, 270); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(270, 10); ctx.lineTo(10, 270); ctx.stroke();
    ctx.setLineDash([]);

    // 浅色示例字
    ctx.font = '150px "PingFang SC","Heiti SC","STHeiti",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillText(charData.char, 140, 140);
  }

  drawGrid();

  var drawing = false, hasDrawn = false;

  cv.onpointerdown = function(e) {
    drawing = true; hasDrawn = true;
    var r = cv.getBoundingClientRect();
    var sx = cv.width / r.width, sy = cv.height / r.height;
    ctx.beginPath();
    ctx.moveTo((e.clientX - r.left) * sx, (e.clientY - r.top) * sy);
    e.preventDefault();
  };

  cv.onpointermove = function(e) {
    if (!drawing) return;
    var r = cv.getBoundingClientRect();
    var sx = cv.width / r.width, sy = cv.height / r.height;
    ctx.lineTo((e.clientX - r.left) * sx, (e.clientY - r.top) * sy);
    ctx.strokeStyle = '#4A90D9'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke();
    e.preventDefault();
  };

  cv.onpointerup = function() { drawing = false; };
  cv.onpointerleave = function() { drawing = false; };

  window._clearWrite = function() {
    drawGrid();
    hasDrawn = false;
    var msg = document.getElementById('write-msg');
    if (msg) msg.textContent = '';
  };

  window._checkWrite = function() {
    if (!hasDrawn) {
      var msg = document.getElementById('write-msg');
      if (msg) { msg.textContent = '先写一写再检查哦～'; msg.style.color = '#E880A0'; }
      return;
    }
    var msg = document.getElementById('write-msg');
    if (msg) { msg.textContent = '写得真棒！👏'; msg.style.color = '#2ECC71'; }
    updateCharProgress(charData.id, 'written', true);
    App.playSound('correct');
    App.showStarAnimation(2);
  };
}
