// [디자인 1단계] 라이트 모드 / 다크 모드
// - <head> 안에서 바로 실행해서, 화면이 그려지기 전에 모드를 정한다 (하얀 화면이 번쩍이지 않게).
// - 고른 모드는 브라우저(localStorage)에 기억한다. 고른 적이 없으면 컴퓨터 · 휴대폰 설정을 따른다.
(function () {
    const KEY = 'theme';
    const root = document.documentElement;

    function saved() {
        try { return localStorage.getItem(KEY); } catch (e) { return null; } // 사생활 보호 모드 등에서는 저장이 막힐 수 있다
    }
    function system() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    function apply(mode) {
        root.setAttribute('data-theme', mode);
        const btn = document.getElementById('theme-toggle');
        if (btn) {
            // 지금 다크 모드면 "해"(라이트로 바꾸기), 라이트 모드면 "달"(다크로 바꾸기)
            btn.innerHTML = mode === 'dark' ? '<i class="bi-sun"></i>' : '<i class="bi-moon-stars"></i>';
            btn.title = mode === 'dark' ? '라이트 모드로 바꾸기' : '다크 모드로 바꾸기';
            btn.setAttribute('aria-label', btn.title);
        }
    }

    apply(saved() || system()); // ① 바로 적용

    // ② 화면이 다 만들어지면 왼쪽 아래에 모드 바꾸기 버튼을 넣는다
    document.addEventListener('DOMContentLoaded', function () {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'theme-toggle';
        btn.className = 'theme-toggle';
        btn.addEventListener('click', function () {
            const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            try { localStorage.setItem(KEY, next); } catch (e) { /* 저장이 안 돼도 이번 화면에서는 바뀐다 */ }
            apply(next);
        });
        document.body.appendChild(btn);
        apply(root.getAttribute('data-theme'));
    });

    // ③ 직접 고른 적이 없으면, 컴퓨터 설정이 바뀔 때 함께 바뀐다
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            if (!saved()) apply(e.matches ? 'dark' : 'light');
        });
    }
})();
