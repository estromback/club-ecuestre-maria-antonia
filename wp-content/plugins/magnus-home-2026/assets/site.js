(() => {
	/* Slider infinito: avance automático (por pasos o continuo), flechas, arrastre con mouse/dedo y trackpad/rueda. */
	function infinite(root, track, opt) {
		const items = [...track.children];
		const N = items.length;
		if (N < 2) return;
		const clone = (c) => {
			const k = c.cloneNode(true);
			k.setAttribute('aria-hidden', 'true');
			k.setAttribute('tabindex', '-1');
			k.querySelectorAll('a,button').forEach((a) => a.setAttribute('tabindex', '-1'));
			return k;
		};
		let sets = 1;
		const addSet = () => { items.forEach((c) => track.appendChild(clone(c))); sets++; };
		/* En modo centrado se antepone una copia para que nunca quede un hueco a la izquierda. */
		if (opt.center) { [...items].reverse().forEach((c) => track.insertBefore(clone(c), track.firstChild)); sets++; }
		let W = 0, step = 0, cw = 0, x = 0, target = null, dragging = false, hover = false, moved = false;
		const measure = () => {
			if (sets < (opt.center ? 3 : 2)) addSet();
			const ch = track.children, b = opt.center ? N : 0;
			W = ch[b + N].offsetLeft - ch[b].offsetLeft;
			step = ch[b + 1].offsetLeft - ch[b].offsetLeft;
			cw = ch[b].offsetWidth;
			while (W > 0 && (sets - (opt.center ? 1 : 0)) * W < root.clientWidth + W) addSet();
		};
		measure();
		const snap = (v) => Math.round(v / step) * step;
		const render = () => {
			const m = ((x % W) + W) % W;
			const off = opt.center ? W - (root.clientWidth - cw) / 2 : 0;
			track.style.transform = 'translate3d(' + -(m + off) + 'px,0,0)';
			const idx = Math.round(m / step) % N;
			if (opt.progress) opt.progress.forEach((p, k) => p.classList.toggle('on', k === idx));
			if (opt.center) [...track.children].forEach((c, k) => c.classList.toggle('is-on', k % N === idx));
		};
		let last = performance.now();
		const frame = (t) => {
			const dt = Math.min(64, t - last);
			last = t;
			if (!dragging) {
				if (target !== null) {
					x += (target - x) * (1 - Math.exp(-dt / 140));
					if (Math.abs(target - x) < 0.5) { x = target; target = null; }
				} else if (opt.speed && !hover && !document.hidden && !window.mh26Pause) {
					x += (opt.speed * dt) / 1000;
				}
			}
			render();
			requestAnimationFrame(frame);
		};
		requestAnimationFrame(frame);

		const go = (dir) => { target = (target !== null ? target : (opt.speed ? x : snap(x))) + dir * step; };
		if (opt.next) opt.next.addEventListener('click', () => go(1));
		if (opt.prev) opt.prev.addEventListener('click', () => go(-1));
		let idle = 0;
		if (opt.auto) setInterval(() => { if (!hover && !dragging && target === null && !document.hidden && !window.mh26Pause && Date.now() > idle) go(1); }, opt.auto);

		let sx = 0, sp = 0, pid = null;
		root.addEventListener('mousedown', (e) => { if (e.button === 1) e.preventDefault(); });
		root.addEventListener('pointerdown', (e) => {
			if (e.button > 1) return;
			dragging = true; moved = false; sx = e.clientX; sp = x; target = null; pid = e.pointerId;
		});
		root.addEventListener('pointermove', (e) => {
			if (!dragging || e.pointerId !== pid) return;
			const dx = e.clientX - sx;
			if (!moved && Math.abs(dx) > 6) {
				moved = true;
				root.classList.add('drag');
				try { root.setPointerCapture(pid); } catch (err) {}
			}
			if (moved) x = sp - dx;
		});
		const end = (e) => {
			if (!dragging || (e && e.pointerId !== pid)) return;
			dragging = false;
			root.classList.remove('drag');
			idle = Date.now() + 2500;
			if (moved && !opt.speed) {
				const dx = x - sp;
				target = Math.abs(dx) > step * 0.12 ? (dx > 0 ? Math.ceil(x / step) : Math.floor(x / step)) * step : snap(x);
			}
		};
		root.addEventListener('pointerup', end);
		root.addEventListener('pointercancel', end);
		root.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
		root.addEventListener('dragstart', (e) => e.preventDefault());

		let wt;
		root.addEventListener('wheel', (e) => {
			const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : (e.shiftKey ? e.deltaY : 0);
			if (!d) return;
			e.preventDefault();
			x += d; target = null; idle = Date.now() + 2500;
			clearTimeout(wt);
			wt = setTimeout(() => { if (!opt.speed) target = snap(x); }, 160);
		}, { passive: false });

		root.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hover = true; });
		root.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') hover = false; });

		new ResizeObserver(() => {
			const idx = step ? x / step : 0;
			measure();
			x = idx * step;
			if (target !== null) target = snap(x);
		}).observe(root);
	}

	const cv = document.getElementById('cview');
	if (cv) {
		infinite(cv, document.getElementById('track'), {
			auto: 1800,
			next: document.getElementById('cnext'),
			prev: document.getElementById('cprev'),
			progress: [...document.querySelectorAll('#cprog i')],
		});
	}
	const belt = document.getElementById('belt');
	if (belt) {
		infinite(belt, belt.firstElementChild, {
			auto: 4000,
			center: true,
			next: document.getElementById('tnext'),
			prev: document.getElementById('tprev'),
		});
	}
	const pv = document.getElementById('pview');
	if (pv && innerWidth <= 760) {
		infinite(pv, document.getElementById('ptrack'), { speed: 16 });
	}

	/* Ventana flotante de clases y programas */
	const cm = document.getElementById('cmodal');
	if (cm && cv) {
		let lastFocus = null;
		const open = (card) => {
			lastFocus = card;
			const imgs = card.querySelectorAll('img');
			const pic = imgs[1] && parseFloat(getComputedStyle(imgs[1]).opacity) > 0.5 ? imgs[1] : imgs[0];
			document.getElementById('cm-img').src = pic.currentSrc || pic.src;
			document.getElementById('cm-img').style.objectPosition = pic.style.objectPosition || '';
			document.getElementById('cm-title').textContent = card.querySelector('h3').textContent;
			document.getElementById('cm-text').textContent = card.querySelector('p').textContent;
			const plan = card.dataset.cta === 'plan';
			document.getElementById('cm-plan').hidden = !plan;
			const w = card.querySelector('.card-wa');
			if (w) document.getElementById('cm-wa').href = w.href;
			cm.hidden = false;
			document.body.classList.add('cm-open');
			window.mh26Pause = true;
			requestAnimationFrame(() => cm.classList.add('open'));
			document.getElementById('cm-x').focus();
		};
		const close = () => {
			if (cm.hidden) return;
			cm.classList.remove('open');
			document.body.classList.remove('cm-open');
			window.mh26Pause = false;
			setTimeout(() => { cm.hidden = true; }, 280);
			if (lastFocus) lastFocus.focus({ preventScroll: true });
		};
		cv.addEventListener('click', (e) => { if (e.target.closest('.card-wa')) return; const c = e.target.closest('.card'); if (c) open(c); });
		cv.addEventListener('keydown', (e) => { const c = e.target.closest('.card'); if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); open(c); } });
		document.getElementById('cm-x').addEventListener('click', close);
		cm.addEventListener('click', (e) => { if (e.target === cm) close(); });
		document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
	}

	/* Misión / Visión en pestañas (celular) */
	document.querySelectorAll('.mvtabs button').forEach((b) => b.addEventListener('click', () => {
		const t = b.dataset.t;
		document.querySelectorAll('.mvtabs button').forEach((x) => x.setAttribute('aria-selected', x === b));
		document.querySelectorAll('.mv article').forEach((a) => a.classList.toggle('show', a.classList.contains(t)));
	}));

	/* Menú celular */
	const menu = document.getElementById('mmenu');
	let warmed = false;
	const warm = () => {
		/* Al abrir el menú, se preparan por completo las páginas del menú. */
		if (warmed || !menu || !HTMLScriptElement.supports || !HTMLScriptElement.supports('speculationrules')) return;
		warmed = true;
		const urls = [...menu.querySelectorAll('a[href]')].map((a) => a.href).filter((h) => h.startsWith(location.origin) && !h.includes('#') && h !== location.href);
		const sc = document.createElement('script');
		sc.type = 'speculationrules';
		sc.textContent = JSON.stringify({ prerender: [{ source: 'list', urls: urls.slice(0, 6), eagerness: 'immediate' }] });
		document.head.appendChild(sc);
	};
	const setMenu = (o) => { if (!menu) return; if (o) warm(); menu.classList.toggle('open', o); document.body.style.overflow = o ? 'hidden' : ''; };
	if (menu) {
		document.getElementById('burger').addEventListener('click', () => setMenu(true));
		document.getElementById('burger').addEventListener('pointerdown', warm, { passive: true });
		document.getElementById('menux').addEventListener('click', () => setMenu(false));
		menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
	}

	/* Botón flotante: se abre un momento al cargar y luego se cierra */
	const fab = document.getElementById('fab');
	const main = document.getElementById('fabmain');
	const setFab = (o) => { if (!fab) return; fab.classList.toggle('open', o); main.setAttribute('aria-expanded', o); };
	if (fab) {
		main.addEventListener('click', (e) => { e.stopPropagation(); setFab(!fab.classList.contains('open')); });
		document.addEventListener('click', (e) => { if (!fab.contains(e.target)) setFab(false); });
		setTimeout(() => setFab(true), 600);
		setTimeout(() => { if (!fab.matches(':hover')) setFab(false); }, 2100);
	}

	/* Ampliar imagen de los planes */
	const lb = document.getElementById('lightbox');
	const closeLb = () => lb && lb.classList.remove('open');
	if (lb) {
		document.querySelectorAll('.zoomable').forEach((im) => im.addEventListener('click', () => { lb.querySelector('img').src = im.dataset.full || im.src; lb.classList.add('open'); }));
		lb.addEventListener('click', closeLb);
	}
	document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setFab(false); setMenu(false); closeLb(); } });

	/* Analytics: clics de contacto como oportunidades */
	document.addEventListener('click', (e) => {
		const a = e.target.closest && e.target.closest('a[href]');
		if (!a || typeof window.gtag !== 'function') return;
		const h = a.getAttribute('href');
		const m = /wa\.me|whatsapp/.test(h) ? 'whatsapp' : /instagram\.com/.test(h) ? 'instagram' : /^tel:/.test(h) ? 'telefono' : /^mailto:/.test(h) ? 'correo' : /google\.com\/maps/.test(h) ? 'como_llegar' : '';
		if (m) window.gtag('event', 'generate_lead', { method: m, link_url: h });
	}, true);

	/* Mapa: se carga solo cuando se acerca a la pantalla */
	const el = document.getElementById('mapa');
	if (el) {
		const load = () => {
			const css = document.createElement('link');
			css.rel = 'stylesheet';
			css.href = el.dataset.css;
			document.head.appendChild(css);
			const s = document.createElement('script');
			s.src = el.dataset.js;
			s.onload = () => {
				const lat = +el.dataset.lat, lng = +el.dataset.lng, mob = innerWidth <= 760;
				/* Mapa decorativo e inclinado: sin arrastre ni zoom (el botón «Cómo llegar» abre Google Maps). */
				const map = L.map(el, { zoomControl: false, attributionControl: false, scrollWheelZoom: false, dragging: false, touchZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false, tap: false, zoomSnap: 0.25 }).setView([lat, lng], mob ? 13 : 13.5);
				L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
					attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>', maxZoom: 19,
				}).addTo(map);
				L.marker([lat, lng], {
					icon: L.divIcon({ className: '', iconSize: [0, 0], html: '<span class="pin"><span class="lab">Club Ecuestre María Antonia</span><span class="dot"><img src="' + el.dataset.pin + '" alt=""></span><span class="ring"></span></span>' }),
					keyboard: false,
				}).addTo(map);
				map.panBy([-el.clientWidth * (mob ? 0.12 : 0.16), mob ? 30 : 10], { animate: false });
			};
			document.body.appendChild(s);
		};
		if ('IntersectionObserver' in window) {
			const io = new IntersectionObserver((en) => { if (en.some((x) => x.isIntersecting)) { io.disconnect(); load(); } }, { rootMargin: '500px' });
			io.observe(el);
		} else load();
	}
})();
