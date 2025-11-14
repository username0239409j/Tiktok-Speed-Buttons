// ==UserScript==
// @name         TikTok Speed Buttons
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Add speed control buttons to TikTok videos
// @author       Grok
// @match        https://www.tiktok.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let currentSpeed = 1;

    // Set initial speed for existing videos
    document.querySelectorAll('video').forEach(function(v) { v.playbackRate = currentSpeed; });

    // Add custom styles
    const style = document.createElement('style');
    style.textContent = `
.speed-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin-top: -10px;
  margin-bottom: 42px;
}
.speed-button {
  background: rgba(255,255,255,0.1);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
}
.speed-button:hover {
  background: rgba(255,255,255,0.2);
}
.speed-button.active {
  background: rgba(255,255,255,0.3);
}
@media screen and (max-width: 768px) {
  .speed-button {
    width: 32px;
    height: 32px;
    font-size: 10px;
  }
}
`;
    document.head.appendChild(style);

    // Function to add speed buttons to an action bar
    function addSpeedButtons(actionBar) {
        if (actionBar.querySelector('.speed-buttons')) return; // Already added
        const speeds = [0.75, 1, 1.25, 1.5, 2];
        const container = document.createElement('div');
        container.className = 'speed-buttons';
        speeds.forEach(function(speed) {
            const btn = document.createElement('button');
            btn.className = 'speed-button';
            btn.textContent = `${speed}x`;
            if (speed === currentSpeed) btn.classList.add('active');
            btn.onclick = function() {
                currentSpeed = speed;
                // Update all active buttons globally
                document.querySelectorAll('.speed-button').forEach(function(b) {
                    const bSpeed = parseFloat(b.textContent.replace('x', ''));
                    if (bSpeed === currentSpeed) {
                        b.classList.add('active');
                    } else {
                        b.classList.remove('active');
                    }
                });
                // Set speed for all videos
                document.querySelectorAll('video').forEach(function(v) { v.playbackRate = currentSpeed; });
            };
            container.appendChild(btn);
        });
        // Insert above profile picture (first child)
        actionBar.insertBefore(container, actionBar.firstChild);
    }

    // Add to existing action bars
    document.querySelectorAll('[class*="--SectionActionBarContainer"]').forEach(addSpeedButtons);

    // Observe for new action bars
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) {
                    const actionBars = node.querySelectorAll('[class*="--SectionActionBarContainer"]');
                    actionBars.forEach(addSpeedButtons);
                    if (node.classList && node.className.includes('--SectionActionBarContainer')) {
                        addSpeedButtons(node);
                    }
                }
            });
        });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Observe for new videos to set speed
    const videoObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === 1) {
                    const videos = node.querySelectorAll ? node.querySelectorAll('video') : [];
                    videos.forEach(function(v) { v.playbackRate = currentSpeed; });
                    if (node.tagName === 'VIDEO') {
                        node.playbackRate = currentSpeed;
                    }
                }
            });
        });
    });
    videoObserver.observe(document.body, { childList: true, subtree: true });
})();
