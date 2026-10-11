'use strict';

document.addEventListener('DOMContentLoaded', () => {
  document.documentElement.classList.add('js');
  const menu = document.getElementById('navLinks');
  const toggle = document.getElementById('mobileToggle');
  const header = document.querySelector('.site-header');
  const links = Array.from(menu.querySelectorAll('a'));
  const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const topButton = document.getElementById('backToTop');

  function closeMenu(returnFocus = false) {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Открыть меню');
    if (returnFocus) toggle.focus();
  }
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  links.forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.classList.contains('open')) closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) closeMenu();
  });
  const desktop = window.matchMedia('(min-width: 1025px)');
  desktop.addEventListener('change', () => closeMenu());

  let scheduled = false;
  function updateNavigation() {
    const boundary = header.getBoundingClientRect().height + 48;
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= boundary) active = section;
    }
    links.forEach(link => {
      const current = link.hash === '#' + active.id;
      link.classList.toggle('active', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    topButton.classList.toggle('visible', window.scrollY > 700);
    scheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(updateNavigation);
    }
  }, { passive: true });
  updateNavigation();
  topButton.addEventListener('click', () => {
    document.getElementById('home').scrollIntoView();
    document.querySelector('.navbar .brand-wordmark').focus({ preventScroll: true });
  });

  // Native POST opens Google's confirmation page. Never infer success from an opaque fetch.
  const form = document.getElementById('projectForm');
  const name = document.getElementById('name');
  const phone = document.getElementById('phone');
  const error = document.getElementById('formError');
  function validateContact() {
    name.setCustomValidity(name.value && name.value.trim().length < 2 ? 'Введите имя: минимум два символа.' : '');
    const digits = phone.value.replace(/\D/g, '');
    phone.setCustomValidity(phone.value && (!/^[+\d\s()\-]+$/.test(phone.value) || digits.length < 10 || digits.length > 15)
      ? 'Укажите телефон: от 10 до 15 цифр, например +7 (705) 123-45-67.' : '');
  }
  [name, phone].forEach(input => input.addEventListener('input', () => {
    validateContact();
    error.textContent = '';
  }));
  form.addEventListener('invalid', () => {
    error.textContent = 'Проверьте выделенные поля и согласие на обработку данных.';
  }, true);
  form.addEventListener('submit', event => {
    name.value = name.value.trim();
    validateContact();
    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
    } else {
      error.textContent = '';
    }
  });
});
