'use strict';

//* ClassNames

const slider              = 'mslider';
const mainClass           = `${slider}__main`;
const controlClass        = `${slider}__control`;
const controlWrapperClass = `${slider}__control-wrapper`;
const imgWrapperClass     = `${slider}__img-wrapper`;
const slideClass          = `${slider}__slide`;

const arrowsClass  = `${slider}__arrows`;
const prevClass    = `${slider}__arrow_prev`;
const nextClass    = `${slider}__arrow_next`;
const prevBtnClass = `${slider}__arrow-btn_prev`;
const nextBtnClass = `${slider}__arrow-btn_next`;

const dotsClass = `${slider}__dots`;
const dotClass  = `${slider}__dot`;

const activeClass = 'active';

export default class MiliterSlider
{
    constructor(options) {
        this.main           = document.querySelector(`.${options.main}`);
        this.control        = this.main.querySelector(`.${options.main}__control`);
        this.controlWrapper = this.control.querySelector(`.${options.main}__control-wrapper`);
        this.imgWrapper     = this.control.querySelector(`.${options.main}__img-wrapper`);
        this.slides         = this.imgWrapper.children;
        this.slidesQuantity = this.slides.length;

        this.arrowBtns = options.arrowBtns === false ? false : true;
        this.prevBtn = options.prevBtn;
        this.nextBtn = options.nextBtn;
        this.dots = options.dots === false ? false : true;
        this.infinity = options.infinity === false ? false : true;
        this.auto = options.auto === false ? false : true;
        this.autoInterval = options.autoInterval ? options.autoInterval * 1000 : 5000;
        this.slidesToShow = options.slidesToShow ? options.slidesToShow : 1;

        this.positionMin = 0;
        this.positionMax = this.slidesQuantity - this.slidesToShow;
        this.position = options.startPosition ? options.startPosition : 0;
        this.transform = 0;
        this.step = 100 / this.slidesToShow;

        this.touch = {
            start: 0,
            end  : 0
        };

        this.addMiliterClass();
        this.sliderControl();
        this.touchInit();
        this.autoSwipe();
    }

    addMiliterClass() {
        this.main.classList.add(mainClass);
        this.control.classList.add(controlClass);
        this.controlWrapper.classList.add(controlWrapperClass);
        this.imgWrapper.classList.add(imgWrapperClass);
        for (const slide of this.slides) {
            slide.classList.add(slideClass);
            slide.style.flex = `0 0 ${this.step}%`;
        }
    }
    sliderControl() {

        const $prev = document.createElement('button');
        $prev.classList.add(prevClass);
        const $next = document.createElement('button');
        $next.classList.add(nextClass);

        this.controlWrapper.append($prev, $next);
        this.prev = this.controlWrapper.querySelector(`.${prevClass}`);
        this.next = this.controlWrapper.querySelector(`.${nextClass}`);
        this.prev.addEventListener('click', () => this.swipe('prev'));
        this.next.addEventListener('click', () => this.swipe('next'));

        if (this.dots) {
            const $dots = document.createElement('div');
            $dots.classList.add(dotsClass);
            for (let i = 0; i < this.slidesQuantity; i++) {
                const $dot = document.createElement('span');
                $dot.classList.add(dotClass);
                $dots.append($dot);
            }
            $dots.children[this.position].classList.add(activeClass);
            this.control.append($dots);

            this.dots = this.control.querySelector(`.${dotsClass}`);
            this.dots.querySelectorAll(`.${dotClass}`).forEach((element, index) => {
                element.addEventListener('click', () => this.swipe(index));
            });
        }

        if (this.arrowBtns) {
            if (!this.prevBtn || !this.nextBtn) {
                const $arrows = document.createElement('div');
                $arrows.classList.add(arrowsClass);

                if (!this.prevBtn) {
                    const $prevBtn = document.createElement('button');
                    $prevBtn.classList.add(prevBtnClass);
                    $prevBtn.append(document.createElement('span'));
                    $arrows.append($prevBtn);
                }

                if (!this.nextBtn) {
                    const $nextBtn = document.createElement('button');
                    $nextBtn.classList.add(nextBtnClass);
                    $nextBtn.append(document.createElement('span'));
                    $arrows.append($nextBtn);
                }

                this.control.append($arrows);
            }

            this.prevBtn = this.control.querySelector(`.${prevBtnClass}`);
            this.nextBtn = this.control.querySelector(`.${nextBtnClass}`);
            this.prevBtn.addEventListener('click', () => this.swipe('prev'));
            this.nextBtn.addEventListener('click', () => this.swipe('next'));
        }
    }

    autoSwipe() {
        if (this.auto) {
            let direction = 'next';
            setInterval(() => {
                if (this.position === this.positionMax) {
                    direction = 'prev';
                }
                if (this.position === this.positionMin) {
                    direction = 'next';
                }
                this.swipe(direction);
            }, this.autoInterval);
        }
    }

    swipe(position) {

        if (position === 'next' && this.position < this.positionMax) {
            this.transform -= this.step;
            ++this.position;
        }

        if (position === 'prev' && this.position > this.positionMin) {
            this.transform += this.step;
            --this.position;
        }

        if (position !== 'prev' && position !== 'next') {
            this.transform += this.step * (this.position - position);
            this.position = position;
        }

        if (this.dots) {
            this.dots.querySelector(`.${activeClass}`).classList.remove(activeClass);
            this.dots.children[this.position].classList.add(activeClass);
        }

        this.imgWrapper.style.transform = `translateX(${this.transform}%)`;
    }

    touchInit() {
        if (typeof window.ontouchstart !== 'undefined') {
            this.control.addEventListener('touchstart', event => {
                this.touch.start = event.touches[0].clientX;
            }, { passive: true });
            this.control.addEventListener('touchend', event => {
                this.touch.end = event.changedTouches[0].clientX;
                const next = this.touch.start > this.touch.end; //* bool
                // const prev = this.touch.start < this.touch.end; //* bool
                const rd = Math.abs(this.touch.start - this.touch.end) > 50; //* bool

                if (next && rd) {
                    this.swipe('next');
                }
                if (!next && rd) {
                    this.swipe('prev');
                }
            });
        }
    }
}

/*
new Slider({
    main         : 'slider',
    arrowBtns    : false, // default true
    prev         : '',
    next         : '',
    dots         : true, // default true
    infinity     : true, // default true
    auto         : true, // default true
    autoInterval : 5, // default 5
    slidesToShow : 1, // default 1
    startPosition: 0, // default 0
});
 */
