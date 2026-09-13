document.addEventListener('DOMContentLoaded', () => {

    // Scroll to top if URL has hash (prevent auto-jump)
    if (window.location.hash) {
        history.replaceState(null, null, window.location.pathname);
        window.scrollTo(0, 0);
    }

    // ===== NAVBAR =====
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    mobileToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileToggle.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileToggle.classList.remove('active');
        });
    });

    // Active nav on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if (scrollY >= top) current = section.getAttribute('id');
        });
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
        });
    });

    // ===== HERO SLIDER =====
    const slides = document.querySelectorAll('.hero-slide');
    const prevBtn = document.querySelector('.hero-prev');
    const nextBtn = document.querySelector('.hero-next');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
    }

    function startSlider() {
        slideInterval = setInterval(() => showSlide(currentSlide + 1), 5000);
    }

    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            showSlide(currentSlide - 1);
            startSlider();
        });
        nextBtn.addEventListener('click', () => {
            clearInterval(slideInterval);
            showSlide(currentSlide + 1);
            startSlider();
        });
        startSlider();
    }

    // ===== COUNTERS =====
    const counters = document.querySelectorAll('.counter-number');
    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated) return;
        countersAnimated = true;
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.target);
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, 16);
        });
    }

    // ===== SCROLL ANIMATIONS =====
    const animateElements = document.querySelectorAll('[data-animate]');
    const counterSection = document.querySelector('.counters');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animateElements.forEach(el => observer.observe(el));

    // Counter animation observer
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounters();
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    if (counterSection) counterObserver.observe(counterSection);

    // ===== PORTFOLIO FILTER =====
    const filterBtns = document.querySelectorAll('.filter-btn');
    const portfolioCards = document.querySelectorAll('.portfolio-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            portfolioCards.forEach(card => {
                const match = filter === 'all' || card.dataset.category === filter;
                card.style.display = match ? 'block' : 'none';
                if (match) {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                }
            });
        });
    });

    // ===== FORM =====
    const form = document.getElementById('projectForm');
    const submitBtn = document.getElementById('submitBtn');
    const formError = document.getElementById('formError');
    const formTimer = document.getElementById('formTimer');
    const COOLDOWN = 60; // seconds
    let lastSubmit = localStorage.getItem('lastFormSubmit') || 0;

    // Check cooldown on load
    function checkCooldown() {
        const now = Math.floor(Date.now() / 1000);
        const diff = COOLDOWN - (now - lastSubmit);
        if (diff > 0) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `ПОДОЖДИТЕ ${diff}с`;
            formTimer.textContent = `Можно отправить через ${diff}с`;
            formTimer.style.display = 'block';
            setTimeout(checkCooldown, 1000);
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'ОТПРАВИТЬ ЗАЯВКУ <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
            formTimer.style.display = 'none';
        }
    }
    checkCooldown();

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            formError.style.display = 'none';

            const name = form.querySelector('input[name="entry.195708288"]').value.trim();
            const phone = form.querySelector('input[name="entry.837627139"]').value.trim();
            const message = form.querySelector('textarea').value.trim();

            // Validation
            if (name.length < 2) {
                formError.textContent = 'Введите имя (минимум 2 символа)';
                formError.style.display = 'block';
                return;
            }
            if (phone.replace(/\D/g, '').length < 11) {
                formError.textContent = 'Введите корректный номер телефона';
                formError.style.display = 'block';
                return;
            }
            if (message.length > 0 && message.length < 10) {
                formError.textContent = 'Опишите проект подробнее (минимум 10 символов)';
                formError.style.display = 'block';
                return;
            }

            // Cooldown check
            const now = Math.floor(Date.now() / 1000);
            if (now - lastSubmit < COOLDOWN) {
                formError.textContent = 'Подождите перед следующей отправкой';
                formError.style.display = 'block';
                return;
            }

            // Submit
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'ОТПРАВКА...';

            const formData = new FormData(form);
            const params = new URLSearchParams();
            for (const [key, value] of formData.entries()) {
                params.append(key, value);
            }

            fetch('https://docs.google.com/forms/d/e/1FAIpQLSeVzYxYJ2IjClD4zQKDhQ1l9uGq8gtqYa3HYIG6WxlZxBuO4A/formResponse', {
                method: 'POST',
                body: params,
                mode: 'no-cors'
            }).then(() => {
                localStorage.setItem('lastFormSubmit', Math.floor(Date.now() / 1000));
                lastSubmit = Math.floor(Date.now() / 1000);
                form.innerHTML = '<div class="form-success"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f5a623" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg><h3>ЗАЯВКА ОТПРАВЛЕНА!</h3><p>Мы свяжемся с вами в ближайшее время</p></div>';
            }).catch(() => {
                formError.textContent = 'Ошибка отправки. Попробуйте позже';
                formError.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'ОТПРАВИТЬ ЗАЯВКУ <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
            });
        });
    }

    // Phone mask
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                if (value[0] === '7' || value[0] === '8') value = value.substring(1);
                let formatted = '+7';
                if (value.length > 0) formatted += ' (' + value.substring(0, 3);
                if (value.length >= 3) formatted += ') ' + value.substring(3, 6);
                if (value.length >= 6) formatted += '-' + value.substring(6, 8);
                if (value.length >= 8) formatted += '-' + value.substring(8, 10);
                e.target.value = formatted;
            }
        });
    }

    // ===== BACK TO TOP =====
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 500);
    });
    if (backToTop) {
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ===== LEAFLET MAP =====
    const mapContainer = document.getElementById('map');
    if (mapContainer && typeof L !== 'undefined') {
        // Almaty, Kazakhstan coordinates
        const lat = 43.238949;
        const lng = 76.945465;

        const map = L.map('map', {
            scrollWheelZoom: false
        }).setView([lat, lng], 14);

        // CartoDB tiles (free, no blocks)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        // Custom orange marker
        const icon = L.divIcon({
            className: 'custom-marker',
            html: '<div class="marker-pin"><div class="marker-pulse"></div></div>',
            iconSize: [30, 42],
            iconAnchor: [15, 42]
        });

        L.marker([lat, lng], { icon }).addTo(map)
            .bindPopup('<strong>MAGAS ENGINEERING</strong><br>г. Алматы, пр. Достык, 56')
            .openPopup();

        // Fix map rendering
        setTimeout(() => map.invalidateSize(), 200);
    }

});