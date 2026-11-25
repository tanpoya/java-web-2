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
        // document.body.appendChild(btn);
        window.hzDock('left').appendChild(btn);   // [여백 활용 ⑤-3] 왼쪽 아래 버튼 모음으로
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
        // document.body.appendChild(box);
        window.hzDock('right').appendChild(box);  // [여백 활용 ⑤-3] 오른쪽 아래 버튼 모음으로

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

// [여백 활용 ⑥] 로그인 정보 공용 함수 : 왼쪽 메뉴 · 오른쪽 위젯이 둘 다 쓰므로 /api/me 를 한 번만 부르고 결과를 함께 쓴다
// 200 → { username, name, role } , 401(로그인 안 함) → null
window.hzMe = function () {
    if (!window.hzMePromise) {
        window.hzMePromise = fetch('/api/me', { headers: { 'Accept': 'application/json' } })
            .then(function (res) { return res.ok ? res.json() : null; })
            .catch(function () { return null; });
    }
    return window.hzMePromise;
};

// [여백 활용 ⑤-3] 화면 구석 버튼 모음(dock) : 왼쪽 아래 · 오른쪽 아래에 버튼을 차례로 쌓는다
// - 버튼마다 bottom 값을 따로 정하면, 어떤 버튼이 숨거나 생길 때 서로 겹친다 → 한 상자(flex)에 넣으면 알아서 쌓인다
// - 쌓는 순서는 CSS order 로 고정 (버튼이 만들어지는 시점이 달라도 순서가 같게)
window.hzDock = function (side) {                  // side = 'left' | 'right'
    let d = document.querySelector('.hz-dock-' + side);
    if (!d) {
        d = document.createElement('div');
        d.className = 'hz-dock hz-dock-' + side;
        document.body.appendChild(d);
    }
    return d;
};

// [여백 활용 ⑤-3] 동그란 버튼 + 누르면 버튼 위로 열리는 카드 (빛 조절 버튼과 같은 방식)
// opts = { cls, icon, label } → { panel, setOpen } 을 돌려준다
window.hzDockPanel = function (side, opts) {
    const wrap = document.createElement('div');
    wrap.className = 'hz-pop ' + opts.cls;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hz-pop-btn';
    btn.title = opts.label;
    btn.setAttribute('aria-label', opts.label);
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<i class="' + opts.icon + '"></i>';   // 고정된 아이콘이라 innerHTML 사용
    const panel = document.createElement('div');
    panel.className = 'hz-pop-panel';
    panel.id = opts.cls + '-panel';
    btn.setAttribute('aria-controls', panel.id);
    wrap.appendChild(panel);
    wrap.appendChild(btn);

    function setOpen(open) {
        wrap.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', String(open));
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!wrap.classList.contains('open')); });
    document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) setOpen(false); });   // 바깥을 누르면 닫기
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });       // Esc 로 닫기
    window.hzDock(side).appendChild(wrap);
    return { panel: panel, setOpen: setOpen };
};

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
        // document.body.appendChild(box);
        return card;                              // [여백 활용 ⑤-2] 카드만 돌려주고, 어디에 둘지는 place() 가 정한다
    }

    // function init() {
    //     if (document.querySelector('.side-menu')) return;
    //     window.hzMe().then(build);
    // }
    // document.addEventListener('DOMContentLoaded', function () {
    //     if (!window.matchMedia) return;
    //     const mq = window.matchMedia(WIDE);
    //     if (mq.matches) init();
    //     mq.addEventListener('change', function (e) { if (e.matches) init(); });
    // });

    // [여백 활용 ⑤-2 → ⑤-3] 여백이 없을 때(1860px 미만) : "메뉴" 버튼 → 누르면 같은 카드가 펼쳐진다
    // 카드는 하나만 만들고, 화면 폭이 바뀌면 왼쪽 여백 ↔ 펼침 상자 사이로 "옮긴다"
    let card = null, wideBox = null, drop = null;

    // [여백 활용 ⑤-3] 이전 : 화면마다 머리 부분 · 메뉴 줄 · 오른쪽 위를 찾아 버튼을 넣었다 → 빛 조절 버튼처럼 왼쪽 아래 고정 버튼으로 바꿈
    // function makeDrop() {
    //     const wrap = el('div', 'qm');
    //     const btn = el('button', 'qm-btn');
    //     btn.type = 'button';
    //     btn.setAttribute('aria-expanded', 'false');
    //     btn.setAttribute('aria-controls', 'qm-panel');
    //     btn.setAttribute('aria-label', '빠른 메뉴 열기');
    //     btn.innerHTML = '<i class="bi-list"></i><span>메뉴</span>';   // 고정된 아이콘 · 글자라 innerHTML 사용
    //     const panel = el('div', 'qm-panel');
    //     panel.id = 'qm-panel';
    //     wrap.appendChild(btn);
    //     wrap.appendChild(panel);

    //     function setOpen(open) {
    //         wrap.classList.toggle('open', open);
    //         btn.setAttribute('aria-expanded', String(open));
    //     }
    //     btn.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!wrap.classList.contains('open')); });
    //     document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) setOpen(false); });   // 바깥을 누르면 닫기
    //     document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });       // Esc 로 닫기

    //     // 버튼 자리 : 화면마다 들어갈 곳이 다르다
    //     const head = document.querySelector('.board-header .container > div:first-child, .admin-header .container > div:first-child');
    //     const nav = document.querySelector('.navbar .container');
    //     if (head) {                                // 게시판 · 바구니 · 관리자 : 머리 부분 맨 앞 ("메인으로" 링크 앞)
    //         wrap.classList.add('qm-inline');
    //         head.insertBefore(wrap, head.firstChild);
    //     } else if (nav) {                          // 메인 : 메뉴 줄의 "First" 로고 앞 (휴대폰은 메인 메뉴 햄버거가 있어서 CSS 로 숨김)
    //         wrap.classList.add('qm-inline', 'qm-nav');
    //         nav.insertBefore(wrap, nav.querySelector('.navbar-brand'));
    //     } else {                                   // 로그인 · 회원가입 · 내 정보 · 에러 · testdb : 머리 부분이 없으니 화면 오른쪽 위
    //         wrap.classList.add('qm-fixed');
    //         document.body.appendChild(wrap);
    //     }
    //     return { panel: panel, setOpen: setOpen };
    // }

    function makeDrop() {                         // 왼쪽 아래 동그란 버튼, 누르면 버튼 위로 카드가 열린다
        return window.hzDockPanel('left', { cls: 'qm', icon: 'bi-list', label: '빠른 메뉴' });
    }

    function place(wide) {
        if (!card) return;
        if (wide) {                                // 넓은 화면 : 왼쪽 여백 (기존 빠른 메뉴)
            if (!wideBox) {
                wideBox = el('aside', 'side-menu');
                wideBox.setAttribute('aria-label', '빠른 메뉴');
                document.body.appendChild(wideBox);
            }
            if (drop) drop.setOpen(false);
            wideBox.appendChild(card);
        } else {                                   // 좁은 화면 : 펼침 상자 안으로
            if (!drop) drop = makeDrop();
            drop.panel.appendChild(card);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        window.hzMe().then(function (me) {         // 이제 모든 화면 폭에서 로그인 정보가 필요하다
            card = build(me);
            const mq = window.matchMedia ? window.matchMedia(WIDE) : { matches: false, addEventListener: function () { } };
            place(mq.matches);
            mq.addEventListener('change', function (e) { place(e.matches); });   // 창 크기를 바꾸면 카드를 옮긴다
        });
    });
})();

// [여백 활용 ⑥] 오른쪽 위젯 : ① 모집 중인 글 (남은 자리 실시간) ② 최근 알림
// ① GET /api/posts/recruiting 으로 받는다. 각 줄에 data-seat-post · data-field 를 붙여 두면
//    12주차 realtime.js 가 남은 자리 메시지를 받을 때 위젯 숫자 · 막대도 같이 바꾼다 (게시판 · 바구니 화면)
// ② realtime.js 가 알림을 띄울 때 보내는 'hz:notification' 이벤트를 받아 쌓는다
//    sessionStorage 에 최근 5개를 보관 → 다른 화면으로 가도 브라우저를 닫기 전까지 남는다
(function () {
    const WIDE = '(min-width: 1860px)';
    const NOTI_KEY = 'hzNotis', NOTI_MAX = 5;

    function el(tag, cls, text) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text != null) e.textContent = text;   // 제목 · 알림 글은 글자로만 (XSS 방지)
        return e;
    }
    function icon(cls) { return el('i', cls); }

    function loadNotis() {
        try { return JSON.parse(sessionStorage.getItem(NOTI_KEY)) || []; } catch (e) { return []; }
    }
    function saveNotis(list) {
        try { sessionStorage.setItem(NOTI_KEY, JSON.stringify(list.slice(0, NOTI_MAX))); } catch (e) { }
    }
    function timeText(ms) {                        // "방금" · "3분 전" · "14:05"
        const diff = Math.floor((Date.now() - ms) / 60000);
        if (diff < 1) return '방금';
        if (diff < 60) return diff + '분 전';
        const d = new Date(ms);
        return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }

    // ① 모집 중 카드
    function recruitCard(list) {
        const card = el('section', 'side-card');
        const h = el('div', 'side-title');
        h.appendChild(icon('bi-people me-1'));
        h.appendChild(document.createTextNode('모집 중'));
        card.appendChild(h);
        if (!list.length) {
            card.appendChild(el('p', 'side-empty', '지금 모집 중인 글이 없습니다.'));
            return card;
        }
        const ul = el('ul', 'side-recruit');
        list.forEach(function (p) {
            const li = el('li');
            li.setAttribute('data-seat-post', p.postId);          // realtime.js 가 이 글 번호로 찾는다
            const a = el('a', 'side-recruit-title', p.title);
            a.href = '/board/' + p.postId;
            li.appendChild(a);
            const meta = el('div', 'side-recruit-meta');
            const badge = el('span', 'recruit-badge', '모집 ' + p.appliedCount + '/' + p.capacity);
            badge.setAttribute('data-field', 'badge-list');      // 모집 a/c ↔ 마감
            meta.appendChild(badge);
            const rem = el('span', 'side-remaining');
            rem.appendChild(document.createTextNode('남은 자리 '));
            const num = el('strong', null, String(p.remaining));
            num.setAttribute('data-field', 'remaining');         // 남은 자리 숫자
            rem.appendChild(num);
            meta.appendChild(rem);
            li.appendChild(meta);
            const bar = el('div', 'side-bar');
            const fill = el('div', 'side-bar-fill');
            fill.setAttribute('data-field', 'bar');               // 신청 비율 막대
            fill.style.width = (p.appliedCount * 100 / p.capacity) + '%';
            bar.appendChild(fill);
            li.appendChild(bar);
            ul.appendChild(li);
        });
        card.appendChild(ul);
        const more = el('a', 'side-more', '게시판에서 더 보기');
        more.href = '/board';
        card.appendChild(more);
        return card;
    }

    // ② 최근 알림 카드 (로그인한 사람만)
    function notiCard() {
        const card = el('section', 'side-card');
        const h = el('div', 'side-title');
        h.appendChild(icon('bi-bell me-1'));
        h.appendChild(document.createTextNode('최근 알림'));
        const clear = el('button', 'side-clear', '지우기');
        clear.type = 'button';
        h.appendChild(clear);
        card.appendChild(h);
        const ul = el('ul', 'side-noti');
        card.appendChild(ul);

        function render() {
            const list = loadNotis();
            ul.innerHTML = '';
            clear.hidden = !list.length;
            if (!list.length) {
                ul.appendChild(el('li', 'side-empty', '새 알림이 없습니다. 내 글에 신청 · 취소 · 댓글이 생기면 여기에 쌓입니다.'));
                return;
            }
            list.forEach(function (n) {
                const li = el('li');
                const a = el('a', null, n.text);
                a.href = '/board/' + n.postId;
                li.appendChild(a);
                li.appendChild(el('span', 'side-time', timeText(n.at)));
                ul.appendChild(li);
            });
        }
        clear.addEventListener('click', function () { saveNotis([]); render(); });
        document.addEventListener('hz:notification', function (e) {     // realtime.js 가 보낸 알림
            const n = e.detail || {};
            saveNotis([{ text: n.text, postId: n.postId, at: Date.now() }].concat(loadNotis()));
            render();
        });
        render();
        setInterval(render, 60000);                // "3분 전" 같은 시간 글자를 1분마다 새로
        return card;
    }

    // [여백 활용 ⑥-2] 이전 : 넓은 화면에서만 만들었다
    // function init() {
    //     if (document.querySelector('.side-widget')) return;
    //     const box = el('aside', 'side-widget');
    //     box.setAttribute('aria-label', '모집 중 · 최근 알림');
    //     document.body.appendChild(box);

    //     fetch('/api/posts/recruiting', { headers: { 'Accept': 'application/json' } })
    //         .then(function (res) { return res.ok ? res.json() : []; })
    //         .catch(function () { return []; })
    //         .then(function (list) { box.insertBefore(recruitCard(list), box.firstChild); });

    //     window.hzMe().then(function (me) { if (me) box.appendChild(notiCard()); });
    // }

    // document.addEventListener('DOMContentLoaded', function () {
    //     if (!window.matchMedia) return;
    //     const mq = window.matchMedia(WIDE);
    //     if (mq.matches) init();
    //     mq.addEventListener('change', function (e) { if (e.matches) init(); });
    // });

    // [여백 활용 ⑥-2] 왼쪽 메뉴와 같은 방식 : 내용(inner)은 하나만 만들고
    // 넓은 화면(1860px 이상)은 오른쪽 여백, 좁은 화면은 오른쪽 아래 동그란 버튼(🔔) → 누르면 버튼 위로 열린다
    let inner = null, wideBox = null, drop = null;

    function buildInner() {
        inner = el('div', 'side-widget-inner');
        fetch('/api/posts/recruiting', { headers: { 'Accept': 'application/json' } })
            .then(function (res) { return res.ok ? res.json() : []; })
            .catch(function () { return []; })
            .then(function (list) { inner.insertBefore(recruitCard(list), inner.firstChild); });
        window.hzMe().then(function (me) { if (me) inner.appendChild(notiCard()); });
    }

    function place(wide) {
        if (wide) {
            if (!wideBox) {
                wideBox = el('aside', 'side-widget');
                wideBox.setAttribute('aria-label', '모집 중 · 최근 알림');
                document.body.appendChild(wideBox);
            }
            if (drop) drop.setOpen(false);
            wideBox.appendChild(inner);
        } else {
            if (!drop) drop = window.hzDockPanel('right', { cls: 'qw', icon: 'bi-bell', label: '모집 중 · 최근 알림' });
            drop.panel.appendChild(inner);
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        buildInner();
        const mq = window.matchMedia ? window.matchMedia(WIDE) : { matches: false, addEventListener: function () { } };
        place(mq.matches);
        mq.addEventListener('change', function (e) { place(e.matches); });   // 창 크기를 바꾸면 내용을 옮긴다
    });
})();

// [여백 활용 ⑦] 맨 위로 버튼 + 페이지 위치 고리 (모든 화면 크기)
// - 300px 넘게 내려오면 나타난다
// - 버튼 둘레 고리가 지금 위치만큼(0 ~ 100%) 채워진다 → CSS 변수 --p 를 바꾸면 conic-gradient 가 다시 그려진다
// - 스크롤할 때마다 바로 계산하지 않고 requestAnimationFrame 으로 화면 그릴 때 한 번만 (가볍게)
(function () {
    document.addEventListener('DOMContentLoaded', function () {
        const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'to-top';
        btn.title = '맨 위로';
        btn.setAttribute('aria-label', '맨 위로');
        btn.innerHTML = '<span><i class="bi-arrow-up"></i></span>';
        // document.body.appendChild(btn);
        window.hzDock('left').appendChild(btn);   // [여백 활용 ⑤-3] 왼쪽 아래 버튼 모음으로 (모드 · 메뉴 버튼 위)

        let ticking = false;
        function update() {
            const doc = document.documentElement;
            const max = doc.scrollHeight - window.innerHeight;           // 끝까지 내렸을 때의 위치
            const y = window.scrollY || doc.scrollTop;
            const pct = max > 0 ? Math.min(100, Math.round(y / max * 100)) : 0;
            btn.style.setProperty('--p', pct + '%');
            btn.classList.toggle('show', y > 300);
            btn.title = '맨 위로 (' + pct + '%)';
            ticking = false;
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });                                             // passive : 스크롤을 막지 않는다고 알려 줘서 부드럽게
        window.addEventListener('resize', update);

        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });   // 동작 줄이기면 바로 이동
        });
        update();
    });
})();
