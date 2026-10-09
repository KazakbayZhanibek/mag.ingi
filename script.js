document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ===== NAVBAR =====
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    const closeMobileMenu = (restoreFocus = false) => {
        navLinks?.classList.remove('active');
        mobileToggle?.classList.remove('active');
        mobileToggle?.setAttribute('aria-expanded', 'false');
        mobileToggle?.setAttribute('aria-label', 'Открыть меню');
        if (restoreFocus) mobileToggle?.focus();
    };

    window.addEventListener('scroll', () => {
        navbar?.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    mobileToggle?.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('active');
        mobileToggle.classList.toggle('active', isOpen);
        mobileToggle.setAttribute('aria-expanded', String(isOpen));
        mobileToggle.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => closeMobileMenu());
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && navLinks?.classList.contains('active')) {
            closeMobileMenu(true);
        }
    });

    // Active nav on scroll
    const sections = document.querySelectorAll('section[id]');
    const updateActiveNav = () => {
        let current = 'home';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if (window.scrollY >= top) current = section.id;
        });
        document.querySelectorAll('.nav-links a').forEach(link => {
            const isCurrent = link.getAttribute('href') === `#${current}`;
            link.classList.toggle('active', isCurrent);
            if (isCurrent) link.setAttribute('aria-current', 'page');
            else link.removeAttribute('aria-current');
        });
    };
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    // ===== HERO SLIDER =====
    const slides = [...document.querySelectorAll('.hero-slide')];
    const prevBtn = document.querySelector('.hero-prev');
    const nextBtn = document.querySelector('.hero-next');
    const pauseBtn = document.getElementById('heroPause');
    let currentSlide = 0;
    let slideInterval = null;
    let isPaused = reduceMotion;

    const loadSlide = index => {
        const slide = slides[index];
        if (slide?.dataset.bg && !slide.dataset.loaded) {
            slide.style.backgroundImage = `url('${slide.dataset.bg}')`;
            slide.dataset.loaded = 'true';
        }
    };

    const showSlide = index => {
        currentSlide = (index + slides.length) % slides.length;
        loadSlide(currentSlide);
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });
        window.setTimeout(() => loadSlide((currentSlide + 1) % slides.length), 400);
    };

    const stopSlider = () => {
        if (slideInterval) window.clearInterval(slideInterval);
        slideInterval = null;
    };

    const startSlider = () => {
        stopSlider();
        if (!isPaused && slides.length > 1 && !document.hidden) {
            slideInterval = window.setInterval(() => showSlide(currentSlide + 1), 5000);
        }
    };

    const updatePauseButton = () => {
        if (!pauseBtn) return;
        pauseBtn.setAttribute('aria-pressed', String(isPaused));
        pauseBtn.setAttribute('aria-label', isPaused ? 'Запустить слайдер' : 'Остановить слайдер');
        pauseBtn.classList.toggle('is-paused', isPaused);
        pauseBtn.innerHTML = isPaused
            ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M8 5l11 7-11 7V5z"/></svg>'
            : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 5v14M15 5v14"/></svg>';
    };

    if (slides.length) {
        showSlide(0);
        updatePauseButton();
        startSlider();
    }

    prevBtn?.addEventListener('click', () => {
        showSlide(currentSlide - 1);
        startSlider();
    });
    nextBtn?.addEventListener('click', () => {
        showSlide(currentSlide + 1);
        startSlider();
    });
    pauseBtn?.addEventListener('click', () => {
        isPaused = !isPaused;
        updatePauseButton();
        startSlider();
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) stopSlider();
        else startSlider();
    });

    // ===== COUNTERS =====
    const counters = document.querySelectorAll('.counter-number');
    let countersAnimated = false;

    const animateCounters = () => {
        if (countersAnimated) return;
        countersAnimated = true;
        counters.forEach(counter => {
            const target = Number.parseInt(counter.dataset.target, 10);
            if (reduceMotion) {
                counter.textContent = String(target);
                return;
            }
            const step = target / (2000 / 16);
            let current = 0;
            const timer = window.setInterval(() => {
                current += step;
                if (current >= target) {
                    counter.textContent = String(target);
                    window.clearInterval(timer);
                } else {
                    counter.textContent = String(Math.floor(current));
                }
            }, 16);
        });
    };

    // ===== SCROLL ANIMATIONS =====
    const animateElements = document.querySelectorAll('[data-animate]');
    const counterSection = document.querySelector('.counters');

    if (reduceMotion || !('IntersectionObserver' in window)) {
        animateElements.forEach(element => element.classList.add('animated'));
        animateCounters();
    } else {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = Number.parseInt(entry.target.dataset.delay || '0', 10);
                    window.setTimeout(() => entry.target.classList.add('animated'), delay);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        animateElements.forEach(element => observer.observe(element));

        const counterObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        if (counterSection) counterObserver.observe(counterSection);
    }

    // ===== FORM =====
    const form = document.getElementById('projectForm');
    const submitBtn = document.getElementById('submitBtn');
    const formError = document.getElementById('formError');
    const formTimer = document.getElementById('formTimer');
    const cooldownSeconds = 60;
    let lastSubmit = Number.parseInt(localStorage.getItem('lastFormSubmit') || '0', 10);
    const submitButtonContent = 'ОТПРАВИТЬ ЗАЯВКУ <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';

    const showFormError = message => {
        formError.textContent = message;
        formError.style.display = 'block';
        formError.setAttribute('tabindex', '-1');
        formError.focus({ preventScroll: true });
    };

    const checkCooldown = () => {
        if (!submitBtn?.isConnected) return;
        const now = Math.floor(Date.now() / 1000);
        const remaining = cooldownSeconds - (now - lastSubmit);
        if (remaining > 0) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `ПОДОЖДИТЕ ${remaining}с`;
            formTimer.textContent = `Повторную заявку можно отправить через ${remaining}с`;
            formTimer.style.display = 'block';
            window.setTimeout(checkCooldown, 1000);
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitButtonContent;
            submitBtn.removeAttribute('aria-busy');
            formTimer.style.display = 'none';
        }
    };
    checkCooldown();

    form?.addEventListener('submit', async event => {
        event.preventDefault();
        formError.style.display = 'none';

        if (!form.checkValidity()) {
            form.reportValidity();
            showFormError('Заполните обязательные поля и подтвердите согласие на обработку данных.');
            return;
        }

        const name = form.querySelector('input[name="entry.195708288"]').value.trim();
        const phone = form.querySelector('input[name="entry.837627139"]').value.trim();
        const message = form.querySelector('textarea').value.trim();

        if (name.length < 2) {
            showFormError('Введите имя — не менее двух символов.');
            return;
        }
        if (phone.replace(/\D/g, '').length < 11) {
            showFormError('Введите полный номер телефона в формате +7 (___) ___-__-__.');
            return;
        }
        if (message.length > 0 && message.length < 10) {
            showFormError('Опишите проект чуть подробнее — не менее десяти символов.');
            return;
        }

        const now = Math.floor(Date.now() / 1000);
        if (now - lastSubmit < cooldownSeconds) {
            showFormError('Повторная отправка пока недоступна. Дождитесь окончания таймера.');
            return;
        }

        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.textContent = 'ПЕРЕДАЁМ ДАННЫЕ…';

        const formData = new FormData(form);
        const params = new URLSearchParams();
        for (const [key, value] of formData.entries()) params.append(key, value);
        const controller = new AbortController();
        const timeout = window.setTimeout(() => controller.abort(), 12000);

        try {
            await fetch('https://docs.google.com/forms/d/e/1FAIpQLSeVzYxYJ2IjClD4zQKDhQ1l9uGq8gtqYa3HYIG6WxlZxBuO4A/formResponse', {
                method: 'POST',
                body: params,
                mode: 'no-cors',
                signal: controller.signal
            });
            const submittedAt = Math.floor(Date.now() / 1000);
            localStorage.setItem('lastFormSubmit', String(submittedAt));
            lastSubmit = submittedAt;
            form.innerHTML = '<div class="form-success" role="status" aria-live="polite" tabindex="-1"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f5a623" stroke-width="2" aria-hidden="true"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg><h3>ЗАПРОС ОТПРАВЛЕН</h3><p>Сайт передал запрос в Google Forms. Если мы не свяжемся в течение рабочего дня, напишите нам в WhatsApp.</p><a class="form-success-link" href="https://wa.me/77052181645" target="_blank" rel="noopener">Открыть WhatsApp</a></div>';
            form.querySelector('.form-success')?.focus();
        } catch (error) {
            showFormError('Не удалось передать данные. Проверьте подключение или напишите нам в WhatsApp.');
            submitBtn.disabled = false;
            submitBtn.removeAttribute('aria-busy');
            submitBtn.innerHTML = submitButtonContent;
        } finally {
            window.clearTimeout(timeout);
        }
    });

    // Phone mask
    const phoneInput = document.getElementById('phone');
    phoneInput?.addEventListener('input', event => {
        let value = event.target.value.replace(/\D/g, '');
        if (!value.length) return;
        if (value[0] === '7' || value[0] === '8') value = value.substring(1);
        let formatted = '+7';
        if (value.length > 0) formatted += ` (${value.substring(0, 3)}`;
        if (value.length >= 3) formatted += `) ${value.substring(3, 6)}`;
        if (value.length >= 6) formatted += `-${value.substring(6, 8)}`;
        if (value.length >= 8) formatted += `-${value.substring(8, 10)}`;
        event.target.value = formatted;
    });

    // ===== BACK TO TOP =====
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        backToTop?.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
    backToTop?.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
});
