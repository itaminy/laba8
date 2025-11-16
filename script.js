/**
 * Форма обратной связи
 * Полностью соответствует требованиям валидации
 */

// Strict mode для лучшей проверки ошибок
'use strict';

// Основной модуль приложения
const FeedbackForm = (function () {
    // Приватные переменные
    let elements = {};
    const STORAGE_KEY = 'feedbackFormData';
    const FORM_URL = 'https://formcarry.com/s/XXXXXXXXXXXX'; // Замените на ваш ID

    // Инициализация приложения
    function init() {
        cacheElements();
        bindEvents();
        checkInitialState();
    }

    // Кэширование DOM элементов
    function cacheElements() {
        elements = {
            openBtn: document.getElementById('openBtn'),
            modalOverlay: document.getElementById('modalOverlay'),
            closeBtn: document.getElementById('closeBtn'),
            feedbackForm: document.getElementById('feedbackForm'),
            successMessage: document.getElementById('successMessage'),
            errorMessage: document.getElementById('errorMessage'),
            submitBtn: document.getElementById('submitBtn'),
            btnText: document.querySelector('.btn-text'),
            btnLoading: document.querySelector('.btn-loading')
        };
    }

    // Привязка событий
    function bindEvents() {
        // Открытие модального окна
        elements.openBtn.addEventListener('click', openModal);

        // Закрытие модального окна
        elements.closeBtn.addEventListener('click', closeModal);

        // Закрытие по клику на overlay
        elements.modalOverlay.addEventListener('click', function (event) {
            if (event.target === elements.modalOverlay) {
                closeModal();
            }
        });

        // Закрытие по ESC
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && elements.modalOverlay.classList.contains('active')) {
                closeModal();
            }
        });

        // Обработка нажатия кнопки "Назад"
        window.addEventListener('popstate', handlePopState);

        // Сохранение данных формы
        elements.feedbackForm.addEventListener('input', debounce(saveFormData, 300));
        elements.feedbackForm.addEventListener('change', saveFormData);

        // Отправка формы
        elements.feedbackForm.addEventListener('submit', handleFormSubmit);
    }

    // Проверка начального состояния
    function checkInitialState() {
        if (window.location.hash === '#feedback') {
            openModal();
        }
    }

    // Открытие модального окна
    function openModal() {
        elements.modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // History API - изменение URL
        history.pushState({ modalOpen: true }, '', '#feedback');

        // Восстановление данных
        restoreFormData();

        // Фокус на первом поле
        const firstInput = elements.feedbackForm.querySelector('input, textarea');
        if (firstInput) {
            firstInput.focus();
        }
    }

    // Закрытие модального окна
    function closeModal() {
        elements.modalOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';

        // History API - возврат к предыдущему URL
        if (history.state && history.state.modalOpen) {
            history.back();
        }
    }

    // Обработчик popstate (кнопка "Назад")
    function handlePopState() {
        if (elements.modalOverlay.classList.contains('active')) {
            closeModal();
        }
    }

    // Сохранение данных в LocalStorage
    function saveFormData() {
        const formData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            organization: document.getElementById('organization').value,
            message: document.getElementById('message').value,
            agree: document.getElementById('agree').checked
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        } catch (error) {
            console.warn('Не удалось сохранить данные:', error);
        }
    }

    // Восстановление данных из LocalStorage
    function restoreFormData() {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);

            if (savedData) {
                const formData = JSON.parse(savedData);

                document.getElementById('fullName').value = formData.fullName || '';
                document.getElementById('email').value = formData.email || '';
                document.getElementById('phone').value = formData.phone || '';
                document.getElementById('organization').value = formData.organization || '';
                document.getElementById('message').value = formData.message || '';
                document.getElementById('agree').checked = Boolean(formData.agree);
            }
        } catch (error) {
            console.warn('Не удалось восстановить данные:', error);
        }
    }

    // Очистка данных формы
    function clearFormData() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            elements.feedbackForm.reset();
            clearErrors();
        } catch (error) {
            console.warn('Не удалось очистить данные:', error);
        }
    }

    // Очистка ошибок валидации
    function clearErrors() {
        const errorElements = document.querySelectorAll('.error-text');
        const errorFields = document.querySelectorAll('.error-field');

        errorElements.forEach(function (element) {
            element.textContent = '';
        });

        errorFields.forEach(function (field) {
            field.classList.remove('error-field');
        });
    }

    // Показать ошибку поля
    function showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(fieldId + 'Error');

        if (field && errorElement) {
            field.classList.add('error-field');
            errorElement.textContent = message;
        }
    }

    // Валидация формы
    function validateForm() {
        let isValid = true;
        clearErrors();

        // Валидация ФИО
        const fullName = document.getElementById('fullName').value.trim();
        if (fullName.length === 0) {
            showFieldError('fullName', 'Поле ФИО обязательно для заполнения');
            isValid = false;
        } else if (fullName.length < 2) {
            showFieldError('fullName', 'ФИО должно содержать минимум 2 символа');
            isValid = false;
        }

        // Валидация Email
        const email = document.getElementById('email').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email.length === 0) {
            showFieldError('email', 'Поле Email обязательно для заполнения');
            isValid = false;
        } else if (!emailRegex.test(email)) {
            showFieldError('email', 'Введите корректный email адрес');
            isValid = false;
        }

        // Валидация телефона (опционально)
        const phone = document.getElementById('phone').value.trim();
        if (phone.length > 0) {
            const phoneRegex = /^[\d\s\-\+\(\)]+$/;
            if (!phoneRegex.test(phone)) {
                showFieldError('phone', 'Введите корректный номер телефона');
                isValid = false;
            }
        }

        // Валидация сообщения
        const message = document.getElementById('message').value.trim();
        if (message.length === 0) {
            showFieldError('message', 'Поле сообщения обязательно для заполнения');
            isValid = false;
        } else if (message.length < 10) {
            showFieldError('message', 'Сообщение должно содержать минимум 10 символов');
            isValid = false;
        }

        // Валидация чекбокса
        const agree = document.getElementById('agree').checked;
        if (!agree) {
            showFieldError('agree', 'Необходимо согласие с политикой обработки данных');
            isValid = false;
        }

        return isValid;
    }

    // Установка состояния загрузки
    function setLoadingState(loading) {
        if (loading) {
            elements.submitBtn.disabled = true;
            elements.btnText.style.display = 'none';
            elements.btnLoading.style.display = 'block';
        } else {
            elements.submitBtn.disabled = false;
            elements.btnText.style.display = 'block';
            elements.btnLoading.style.display = 'none';
        }
    }

    // Показать сообщение
    function showMessage(type) {
        // Скрыть все сообщения
        elements.successMessage.style.display = 'none';
        elements.errorMessage.style.display = 'none';

        // Показать нужное сообщение
        if (type === 'success') {
            elements.successMessage.style.display = 'flex';
        } else if (type === 'error') {
            elements.errorMessage.style.display = 'flex';
        }

        // Автоскрытие через 5 секунд
        setTimeout(function () {
            elements.successMessage.style.display = 'none';
            elements.errorMessage.style.display = 'none';
        }, 5000);
    }

    // Отправка формы
    async function submitForm(formData) {
        setLoadingState(true);

        try {
            const response = await fetch(FORM_URL, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(Object.fromEntries(formData))
            });

            if (response.ok) {
                showMessage('success');
                clearFormData();
                setTimeout(closeModal, 2000);
            } else {
                throw new Error('HTTP error ' + response.status);
            }
        } catch (error) {
            console.error('Ошибка отправки формы:', error);
            showMessage('error');
        } finally {
            setLoadingState(false);
        }
    }

    // Обработчик отправки формы
    function handleFormSubmit(event) {
        event.preventDefault();

        if (validateForm()) {
            const formData = new FormData(elements.feedbackForm);
            submitForm(formData);
        }
    }

    // Debounce для оптимизации
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Публичные методы
    return {
        init: init
    };
})();

// Инициализация при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', FeedbackForm.init);
} else {
    FeedbackForm.init();
}