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

// [여백 꾸미기 ⑤] 오른쪽 아래 : 배경 빛의 세기 · 속도 조절
// - 세기 : CSS 변수 --hz-glow-strength 를 바꾼다 (theme.css 의 빛 색 투명도에 곱해진다)
// - 속도 : 빛 애니메이션(hz-drift-a, hz-drift-b)의 재생 속도(playbackRate)를 바꾼다
//          → 애니메이션 시간(duration)을 바꾸면 빛이 다른 위치로 "툭" 튀지만, 재생 속도는 지금 자리에서 빨라지거나 느려진다
// - 고른 값은 localStorage 에 기억해서 다른 화면 · 다음 접속에도 그대로
(function () {
    const KEY_S = 'glowStrength', KEY_V = 'glowSpeed';
    const DEF_S = 100, DEF_V = 1;                  // 기본값 : 세기 100%, 속도 1배
    const root = document.documentElement;

    function load(key, def) {
        try { const v = parseFloat(localStorage.getItem(key)); return isNaN(v) ? def : v; } catch (e) { return def; }
    }
    function store(key, v) {
        try { localStorage.setItem(key, v); } catch (e) { /* 저장이 막혀도 이번 화면에서는 적용된다 */ }
    }
    function applyStrength(pct) {                  // 100% → 1, 0% → 0, 300% → 3
        root.style.setProperty('--hz-glow-strength', pct / 100);
    }
    function glowAnimations() {                    // 빛 애니메이션 2개만 골라낸다 (다른 애니메이션은 건드리지 않게)
        return document.getAnimations ? document.getAnimations().filter(function (a) {
            return a.animationName && a.animationName.indexOf('hz-drift') === 0;
        }) : [];
    }
    function applySpeed(rate) {                    // 0 = 멈춤
        glowAnimations().forEach(function (a) {
            if (a.updatePlaybackRate) a.updatePlaybackRate(rate); else a.playbackRate = rate;
        });
    }

    applyStrength(load(KEY_S, DEF_S));             // ① 세기는 화면이 그려지기 전에 바로 (빛이 번쩍 바뀌지 않게)

    document.addEventListener('DOMContentLoaded', function () {
        let s = load(KEY_S, DEF_S), v = load(KEY_V, DEF_V);
        const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // ② 조절 상자 만들기 : 동그란 버튼 + 버튼을 누르면 열리는 작은 카드
        const box = document.createElement('div');
        box.className = 'glow-ctrl';
        box.innerHTML =
            '<div class="glow-ctrl-panel" id="glow-ctrl-panel" hidden>' +
            '  <div class="glow-ctrl-title"><i class="bi-stars me-1"></i>배경 빛</div>' +
            '  <label class="glow-ctrl-row">세기 <span id="glow-s-val"></span>' +
            '    <input type="range" id="glow-s" min="0" max="300" step="10"></label>' +
            '  <label class="glow-ctrl-row">속도 <span id="glow-v-val"></span>' +
            '    <input type="range" id="glow-v" min="0" max="4" step="0.25"></label>' +
            (reduced ? '  <p class="glow-ctrl-note">"동작 줄이기" 설정이 켜져 있어 빛이 움직이지 않습니다.</p>' : '') +
            '  <button type="button" class="glow-ctrl-reset" id="glow-reset"><i class="bi-arrow-counterclockwise me-1"></i>기본값</button>' +
            '</div>' +
            '<button type="button" class="glow-ctrl-btn" id="glow-ctrl-btn" aria-expanded="false" aria-controls="glow-ctrl-panel"' +
            ' title="배경 빛 세기 · 속도 조절" aria-label="배경 빛 세기 · 속도 조절"><i class="bi-sliders"></i></button>';
        document.body.appendChild(box);

        const panel = box.querySelector('#glow-ctrl-panel');
        const btn = box.querySelector('#glow-ctrl-btn');
        const sIn = box.querySelector('#glow-s'), vIn = box.querySelector('#glow-v');
        const sVal = box.querySelector('#glow-s-val'), vVal = box.querySelector('#glow-v-val');

        function show() {                          // 입력 상자 · 숫자 표시를 현재 값으로
            sIn.value = s; vIn.value = v;
            sVal.textContent = s + '%';
            vVal.textContent = v === 0 ? '멈춤' : v + '배';
        }

        // ③ 슬라이더를 움직이는 동안 바로 적용 (input 이벤트) + 기억
        sIn.addEventListener('input', function () { s = Number(sIn.value); applyStrength(s); store(KEY_S, s); show(); });
        vIn.addEventListener('input', function () { v = Number(vIn.value); applySpeed(v); store(KEY_V, v); show(); });
        box.querySelector('#glow-reset').addEventListener('click', function () {
            s = DEF_S; v = DEF_V; applyStrength(s); applySpeed(v); store(KEY_S, s); store(KEY_V, v); show();
        });

        // ④ 버튼으로 열고 닫기, 바깥을 누르거나 Esc 를 누르면 닫기
        function setOpen(open) { panel.hidden = !open; btn.setAttribute('aria-expanded', String(open)); }
        btn.addEventListener('click', function (e) { e.stopPropagation(); setOpen(panel.hidden); });
        document.addEventListener('click', function (e) { if (!box.contains(e.target)) setOpen(false); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });

        show();
        applySpeed(v);                             // ⑤ 저장된 속도 적용 (애니메이션은 화면이 만들어진 뒤에 생긴다)
    });
})();

// [여백 활용 ⑤] 왼쪽 빠른 메뉴 : 로그인 정보 + 바로가기 (참고 디자인 왼쪽의 프로필 상자처럼)
// - 누가 로그인했는지는 7주차에 만든 GET /api/me 로 묻는다 → 화면(HTML)마다 코드를 넣지 않아도 된다
//   200 이면 { username, name, role } , 로그인 안 했으면 401
// - 여백이 넉넉한 넓은 화면(1860px 이상)에서만 만든다 (좁은 화면에서는 /api/me 도 부르지 않는다)
(function () {
    const WIDE = '(min-width: 1860px)';

    // 메뉴 목록 : [주소, 아이콘, 이름, 보이는 조건]
    const LINKS = [
        ['/', 'bi-house', '메인', 'all'],
        ['/board', 'bi-chat-square-text', '게시판', 'all'],
        ['/board/my', 'bi-person-lines-fill', '내가 쓴 글', 'login'],
        ['/cart', 'bi-basket', '신청 바구니', 'login'],
        ['/mypage', 'bi-person-badge', '내 정보', 'login'],   // bi-person-vcard 는 로컬 아이콘 파일(예전 버전)에 없다
        ['/admin/members', 'bi-shield-lock', '관리자', 'ADMIN']
    ];

    function isActive(href) {                       // 지금 보고 있는 화면의 메뉴에 표시
        const p = location.pathname;
        if (href === '/') return p === '/';
        if (href === '/board') return p === '/board' || /^\/board\/\d+/.test(p) || p === '/board/write';
        return p === href || p.indexOf(href + '/') === 0;
    }

    function el(tag, cls, text) {                   // 요소 만들기 : 글자는 textContent 로 (이름에 <태그>가 있어도 그대로 글자로 보이게)
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text != null) e.textContent = text;
        return e;
    }

    function build(me) {                            // me = 로그인 정보 (없으면 null)
        const box = el('aside', 'side-menu');
        box.setAttribute('aria-label', '빠른 메뉴');
        const card = el('div', 'side-card');
        box.appendChild(card);

        // ① 프로필 : 로그인했으면 이름 첫 글자 동그라미 + 이름 + 아이디 + 권한, 아니면 로그인 · 회원가입 버튼
        const prof = el('div', 'side-profile');
        if (me) {
            prof.appendChild(el('div', 'side-avatar', (me.name || me.username || '?').charAt(0)));
            prof.appendChild(el('div', 'side-name', me.name + '님'));
            prof.appendChild(el('div', 'side-id', '@' + me.username));
            prof.appendChild(el('span', 'side-role ' + me.role, me.role));
        } else {
            const av = el('div', 'side-avatar');
            av.innerHTML = '<i class="bi-person"></i>';           // 고정된 아이콘이라 innerHTML 사용
            prof.appendChild(av);
            prof.appendChild(el('div', 'side-guest', '로그인하고 글쓰기 · 신청을 해 보세요'));
            const btns = el('div', 'side-btns');
            const a1 = el('a', 'primary', '로그인'); a1.href = '/login';
            const a2 = el('a', null, '회원가입'); a2.href = '/signup';
            btns.appendChild(a1); btns.appendChild(a2);
            prof.appendChild(btns);
        }
        card.appendChild(prof);

        // ② 바로가기 : 조건에 맞는 메뉴만 (login = 로그인한 사람, ADMIN = 관리자)
        const ul = el('ul', 'side-nav');
        LINKS.forEach(function (l) {
            if (l[3] === 'login' && !me) return;
            if (l[3] === 'ADMIN' && !(me && me.role === 'ADMIN')) return;
            const a = el('a', (isActive(l[0]) ? 'active' : '') + (l[3] === 'ADMIN' ? ' admin' : ''));
            a.href = l[0];
            const i = el('i', l[1]);
            a.appendChild(i);
            a.appendChild(document.createTextNode(l[2]));
            if (isActive(l[0])) a.setAttribute('aria-current', 'page');
            const li = el('li');
            li.appendChild(a);
            ul.appendChild(li);
        });
        card.appendChild(ul);
        document.body.appendChild(box);
    }

    function init() {
        if (document.querySelector('.side-menu')) return;      // 한 번만
        fetch('/api/me', { headers: { 'Accept': 'application/json' } })
            .then(function (res) { return res.ok ? res.json() : null; })   // 401(로그인 안 함) → null
            .catch(function () { return null; })
            .then(build);
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (!window.matchMedia) return;
        const mq = window.matchMedia(WIDE);
        if (mq.matches) init();
        mq.addEventListener('change', function (e) { if (e.matches) init(); });   // 창을 넓히면 그때 만든다
    });
})();
