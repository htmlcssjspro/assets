'use strict';

import {newFetch, fetchForm} from './Fetch';
import scrollSmooth from './scroll/scrollSmooth';

export default function clickHandler(data = {}) {
    document.body.addEventListener('focusin', focusinHandler, false);
    document.body.addEventListener('submit', formHandler, false);
    document.body.addEventListener('click', event => {
        event.preventDefault();
        const t = event.target;

        if (t.closest('a')) {
            const activeLink = $a => {
                const $nav = $a.closest('nav');
                const $active = $nav && $nav.querySelector('.active');
                $active && $active.classList.remove('active');
                $a.classList.add('active');
            };

            const $a = t.closest('a[href^="/"]:not([target=_blank])');
            if ($a) {
                const href = $a.href;
                // const href = a.getAttribute('href');
                activeLink($a);
                history.pushState(href, '', href);
                newFetch(href);
            }

            const $anchor = t.closest('a[href^="#"]');
            // $anchor && scrollSmooth($anchor.hash);
            if ($anchor) {
                activeLink($anchor);
                scrollSmooth($anchor.hash);
            }

            const $tel = t.closest('a[href^=tel]');
            $tel && (window.location = $tel.href);

            const $email = t.closest('a[href^=mailto]');
            $email && (window.location = $email.href);

            const $newTabLink = t.closest('a[target=_blank]');
            $newTabLink && window.open($newTabLink.href);
        }

        if (t.closest('button')) {
            const $button = t.closest('button[type=button]');
            if ($button) {
                const popup = $button.dataset.popup;
                popup && popupHandler(popup);

                const dhref = $button.dataset.href;
                dhref && newFetch(dhref);

                let cb = $button.dataset.cb;
                cb &&= data[$button.dataset.cb];
                cb && setTimeout(() => cb(t), 100);
            }

            const $reset = t.closest('button[type=reset]');
            $reset && $reset.closest('form').reset();

            const $submit = t.closest('button[type=submit]');
            $submit && formHandler(event);
        }

        const $toggle = t.closest('.dropdown>.dropdown__toggle');
        if ($toggle) {
            const $dropdown = $toggle.closest('.dropdown');
            const $content = $dropdown.querySelector('.dropdown__content');
            $content && $content.classList.toggle('dn');
        }

    }, false);
}

function formHandler(event) {
    event.preventDefault();
    const $form = event.target.closest('form');
    validation($form) && fetchForm($form);
}
function validation($form) {
    const inputs = $form.querySelectorAll('input:not([type=hidden])');
    return Array.from(inputs).every($input => {
        inputCheck($input);
        return $input.dataset.validation === 'valid';
    });
}

function focusinHandler(event) {
    const t = event.target;

    const $input = t.closest('input');
    if ($input) {
        const inputHandler = event => {
            if ($input.type === 'tel' || $input.name === 'tel' || $input.name === 'phone') {

                telMaskHandler($input, event);
            }
            inputCheck($input);
        };
        const changeHandler = event => {
            // Code
        };
        $input.addEventListener('input', inputHandler, false);
        $input.addEventListener('change', changeHandler, false);
        $input.addEventListener('focusout', () => {
            $input.removeEventListener('input', inputHandler, false);
            $input.removeEventListener('change', changeHandler, false);
        }, {once: true});

        inputHandler(event);
        changeHandler(event);
    }
}

function telMaskHandler($input, event) {

    const telMaskInput = () => {
        setTimeout(() => {
            const mask = /(\d{0,1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})/;
            const x = $input.value.replace(/\D/g, '').match(mask);
            const pos = $input.selectionStart;
            let tel = '+7 ';
            tel += x[2] ? '(' + x[2] + ') ' : '';
            tel += x[3] ? x[3] : '';
            tel += x[4] ? '-' + x[4] : '';
            tel += x[5] ? '-' + x[5] : '';
            $input.value = tel;
            const end = $input.selectionStart === $input.selectionEnd && $input.selectionEnd;
            let posNew = 0;
            if (pos !== end) {
                posNew = pos;
                if (event.inputType === 'insertText') {
                    if (pos > 3 && pos < 9) {
                        posNew = x && x[2] && x[2].length === 3 ? 9 : 4 + x[2].length;
                    }
                    pos === 13 && posNew++;
                    pos === 16 && posNew++;
                }
                if (pos === 12 && end === 18) {
                    posNew = 18;
                }
            }
            if (event.inputType === 'insertFromPaste') {
                posNew = 0;
            }
            posNew && $input.setSelectionRange(posNew, posNew);
        }, 0);
    };

    const focusinHandler = () => {
        const keypressHandler = event => {
            // console.log('keypressHandler event.key: ', event.key);
            !/\d/.test(event.key) && event.preventDefault();
            $input.value.replace(/\D/g, '').length === 11 && event.preventDefault();
        };
        const keydownHandler = event => {
            console.log('keydownHandler event.key: ', event.key);

            if (event.key === 'Backspace') {
                $input.selectionEnd <= 3 && event.preventDefault();
                $input.selectionStart === 9 && $input.setSelectionRange(7, 7);
            }
            if (event.key === 'Delete') {
                $input.selectionEnd <= 3 && event.preventDefault();
            }
            if (event.key === 'ArrowLeft') {
                $input.selectionStart <= 3 && event.preventDefault();
                $input.selectionStart === 9 && $input.setSelectionRange(8, 8);
            }
            if (event.key === 'ArrowRight') {
                $input.selectionStart === 7 && $input.setSelectionRange(8, 8);
            }
        };
        const keyupHandler = event => {
            // console.log('keyupHandler event: ', event);
        };
        const clickHandler = event => {
            // console.log('clickHandler event: ', event);
            if ($input.selectionStart === $input.selectionEnd) {
                $input.selectionStart < 3 && ($input.selectionStart = 3);
            }
        };
        {
            $input.addEventListener('all', event => console.log('ALL Events', event));
        }
        $input.addEventListener('keypress', keypressHandler, false);
        $input.addEventListener('keydown', keydownHandler, false);
        $input.addEventListener('keyup', keyupHandler, false);
        $input.addEventListener('click', clickHandler, false);
        $input.addEventListener('focusout', () => {
            $input.removeEventListener('keypress', keypressHandler, false);
            $input.removeEventListener('keydown', keydownHandler, false);
            $input.removeEventListener('keyup', keyupHandler, false);
            $input.removeEventListener('click', clickHandler, false);
        }, {once: true});
        telMaskInput();
    };

    if (event.type === 'input') {
        telMaskInput();
    }
    if (event.type === 'focusin') {
        focusinHandler();
    }
}

function inputCheck($input) {
    let error = '';
    const emailRegexp = /^(?:[A-Za-z0-9](?:[_.-])?)+[A-Za-z0-9]@(?:[A-Za-z0-9](?:[_-])?)+[A-Za-z0-9][.][A-Za-z]{2,5}$/is;
    const urlRegexp = /[A-Za-z0-9.:/_#?&-]+/is;
    const passwordRegexp = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%&?*()]).{8,}$/s;
    const telRegexp = /\+7\s\(\d{3}\)\s\d{3}-\d{2}-\d{2}/;

    // lengthCheck
    if ($input.dataset.required === 'required'
        && $input.value.trim().length === 0) {
        error = 'Поле обязательно к заполнению';
    }
    // if ($input.dataset.required === 'required' && $input.value.trim().length < 2) {
    //     error = 'Поле обязательно к заполнению и должно содержать минимум <strong>2</strong> символа';
    // }

    // emailCheck
    if (($input.type === 'email' || $input.name === 'email')
        && !emailRegexp.test($input.value)) {
        error = 'Введите корректный Email';
    }

    // urlCheck
    if (($input.type === 'url' || $input.name === 'url')
        && !urlRegexp.test($input.value)) {
        error = 'Введите корректный Url';
    }

    // passwordCheck
    if (($input.type === 'password' || $input.type === 'text')
        && ($input.name === 'new_password' || $input.name === 'confirm_new_password')
    ) {
        if ($input.value.trim().length && !passwordRegexp.test($input.value)) {
            error = 'Пароль должен содержать не менее <strong>8</strong> символов: буквы латинского алфавита в обоих регистрах, цифры, специальные символы <strong>! @ # $ % & ? * ( )</strong>';
        }

        // confirmPasswordCheck
        if ($input.name === 'confirm_new_password') {
            const confirm = $input.value;
            const password = $input.closest('form').querySelector('input[name=new_password]').value;
            confirm !== password && (error = 'Пароли не совпадают');
        }
    }

    // telCheck
    if (($input.type === 'tel' || $input.name === 'tel' || $input.name === 'phone')
        // && !telRegexp.test($input.value)) {
        && !($input.value.replace(/\D/g, '').length === 11)) {
        error = 'Введите корректный номер телефона';
    }

    $input.dataset.validation = error ? 'invalid' : 'valid';
    inputError($input, error);
}

function inputError($input, error) {
    let $error;
    const $label = $input.closest('label');
    const $next = $label && $label.nextElementSibling;
    // if ($next && $next.tagName === 'SPAN' && $next.classList.contains('error_input')) {
    if ($next && $next.tagName === 'SPAN' && $next.className === 'error_input') {
        $error = $next;
    } else {
        $error = document.createElement('span');
        $error.className = 'error_input';
        $label.after($error);
    }
    $error.innerHTML = error;
}


function popupHandler(popup) {

    const handlerWrapper = $popup => {
        const handler = event => {
            if (event.target === event.currentTarget
                || event.key === 'Escape'
                || event.key === 'Esc') {
                $popup.classList.add('dn');
                $popup.removeEventListener('click', handler, false);
                document.removeEventListener('keydown', handler, false);
            }
        };
        $popup.addEventListener('click', handler, false);
        document.addEventListener('keydown', handler, false);
        $popup.classList.remove('dn');
    };

    const fetchPopup = popup => {
        const apiPath = window.location.pathname.startsWith('/admin') ? '/admin/api' : '/api';
        const url = `${apiPath}/popup/${popup}`;
        newFetch(url, {
            cb: response => {
                response.popup && document.body.insertAdjacentHTML('beforeend', response.popup);
                const $popup = document.body.querySelector(`section.popup.${popup}`);
                $popup && handlerWrapper($popup);
            }
        });
    };

    const $popup = typeof popup === 'string' ? document.body.querySelector(`section.popup.${popup}`) : popup;
    $popup ? handlerWrapper($popup) : fetchPopup(popup);
}


export {clickHandler, popupHandler, inputError};
