/* 给 Chroma 代码块加复制按钮（适配 Jane 主题 table 行号结构） */
(function () {
  function copyText(text, btn) {
    function done(ok) {
      btn.textContent = ok ? '✔' : '✘';
      setTimeout(function () { btn.textContent = '⧉'; }, 1500);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
    } else {
      // 兼容非 HTTPS 环境
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { done(document.execCommand('copy')); } catch (e) { done(false); }
      document.body.removeChild(ta);
    }
  }

  document.querySelectorAll('div.highlight').forEach(function (block) {
    if (block.querySelector('.copy-btn')) return;
    // Chroma table 行号结构：取第二个 td（代码列），排除行号列
    var codeEl = block.querySelector('td.lntd:last-child code') || block.querySelector('code');
    if (!codeEl) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-btn';
    btn.textContent = '⧉';
    btn.addEventListener('click', function () {
      copyText(codeEl.innerText, btn);
    });
    block.appendChild(btn);
  });
})();
