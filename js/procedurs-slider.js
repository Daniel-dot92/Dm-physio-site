document.addEventListener('DOMContentLoaded', () => {
    // РљР»Р°СЃ Р·Р° СѓРїСЂР°РІР»РµРЅРёРµ РЅР° РІСЃРµРєРё СЃР»Р°Р№РґРµСЂ
    class KinesitherapySlider {
        constructor(container) {
            this.container = container;
            this.sliderTrack = container.querySelector('.kinesitherapy-slider-track');
            this.buttons = Array.from(this.sliderTrack.querySelectorAll('.kinesitherapy-button'));
            this.totalButtons = this.buttons.length;
            this.prevArrow = container.querySelector('.prev-arrow');
            this.nextArrow = container.querySelector('.next-arrow');

            this.currentIndex = 0;
            this.itemsPerSlide = 4; // Default for larger screens
            this.slideIntervalTime = 2000; // 6 seconds
            this.autoSlideInterval = null;

            this.init();
        }

        init() {
            this.updateItemsPerSlide(); // Set initial items per slide and button widths
            this.startAutoSlide(); // Start the automatic slider
            this.toggleArrowsVisibility(); // Set initial arrow visibility

            // Event Listeners for arrows (bound to THIS instance)
            this.prevArrow.addEventListener('click', () => {
                this.moveSlider(-1); // Move to previous
                this.resetAutoSlide(); // Reset auto slide after manual interaction
            });

            this.nextArrow.addEventListener('click', () => {
                this.moveSlider(1); // Move to next
                this.resetAutoSlide(); // Reset auto slide after manual interaction
            });

            // Add resize listener to this instance's context (handled globally below)
            // It's better to have one global resize listener that calls an update method on all instances
        }

        updateItemsPerSlide() {
            if (window.innerWidth <= 480) {
                this.itemsPerSlide = 1;
            } else if (window.innerWidth <= 768) {
                this.itemsPerSlide = 2;
            } else if (window.innerWidth <= 1024) {
                this.itemsPerSlide = 3;
            } else {
                this.itemsPerSlide = 4; // Default for screens > 1024px, now includes larger screens
            }
            this.updateButtonWidths();
            this.toggleArrowsVisibility();
            // Reset current index to avoid showing partial slides after resize
            this.currentIndex = Math.min(this.currentIndex, Math.max(0, this.totalButtons - this.itemsPerSlide));
            this.updateSliderPosition();
            this.resetAutoSlide(); // Reset auto slide on resize
        }

        updateButtonWidths() {
            if (this.buttons.length === 0) return;

            // РР·С‡РёСЃР»СЏРІР°РјРµ РїСЂР°РІРёР»РЅРёСЏ РіР°Рї, РєР°С‚Рѕ РІР·РµРјРµРј РїСЂРµРґРІРёРґ РјР°СЂРґР¶РёРЅРёС‚Рµ.
            // РўСЉР№ РєР°С‚Рѕ РІ CSS РёР·РїРѕР»Р·РІР°РјРµ `margin: 0 10px;`, РѕР±С‰РёСЏС‚ С…РѕСЂРёР·РѕРЅС‚Р°Р»РµРЅ РјР°СЂРґР¶РёРЅ Рµ 20px.
            const gapPerButton = 20; 
            const buttonWidth = `calc(${100 / this.itemsPerSlide}% - ${gapPerButton}px)`;
            
            this.buttons.forEach(button => {
                button.style.flexBasis = buttonWidth;
                button.style.maxWidth = buttonWidth;
            });
            // Update slider position after button widths are set
            this.updateSliderPosition(); 
        }

        moveSlider(direction = 1) { // direction: 1 for next, -1 for prev
            if (this.totalButtons <= this.itemsPerSlide) {
                return; // No need to slide if not enough items
            }

            this.currentIndex += direction;

            if (this.currentIndex < 0) {
                // Wrap around to the end
                this.currentIndex = Math.max(0, this.totalButtons - this.itemsPerSlide);
            } else if (this.currentIndex > this.totalButtons - this.itemsPerSlide) {
                // Wrap around to the beginning
                this.currentIndex = 0;
            }
            
            this.updateSliderPosition();
        }

        updateSliderPosition() {
            if (this.buttons.length === 0) return;

            // РџСЂРµРёР·С‡РёСЃР»СЏРІР°РјРµ РѕС„СЃРµС‚Р° РЅР° Р±Р°Р·Р°С‚Р° РЅР° С‚РµРєСѓС‰Р°С‚Р° С€РёСЂРѕС‡РёРЅР° РЅР° Р±СѓС‚РѕРЅР°
            // Рё Р·Р°РґР°РґРµРЅРёСЏ РјР°СЂРґР¶РёРЅ.
            const firstButton = this.buttons[0];
            const buttonCalculatedWidth = firstButton.offsetWidth; // РџРѕР»СѓС‡Р°РІР°РјРµ СЂРµР°Р»РЅР°С‚Р° РёР·С‡РёСЃР»РµРЅР° С€РёСЂРёРЅР° РЅР° Р±СѓС‚РѕРЅР°
            const totalItemWidth = buttonCalculatedWidth + 20; // Р±СѓС‚РѕРЅ + 10px Р»СЏРІ + 10px РґРµСЃРµРЅ РјР°СЂРґР¶РёРЅ

            const offset = -this.currentIndex * totalItemWidth;
            this.sliderTrack.style.transform = `translateX(${offset}px)`;
        }

        startAutoSlide() {
            clearInterval(this.autoSlideInterval); 
            if (this.totalButtons > this.itemsPerSlide) { // Only auto slide if there's content to slide
                this.autoSlideInterval = setInterval(() => this.moveSlider(1), this.slideIntervalTime);
            }
        }

        resetAutoSlide() {
            clearInterval(this.autoSlideInterval);
            this.startAutoSlide();
        }

        toggleArrowsVisibility() {
            if (this.totalButtons <= this.itemsPerSlide) {
                this.prevArrow.style.display = 'none';
                this.nextArrow.style.display = 'none';
            } else {
                this.prevArrow.style.display = 'block'; 
                this.nextArrow.style.display = 'block'; 
            }
        }
    }

    // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ РЅР° Р’РЎРР§РљР СЃР»Р°Р№РґРµСЂРё
    const sliderInstances = [];
    const sliderContainers = document.querySelectorAll('.kinesitherapy-slider-container');
    sliderContainers.forEach(container => {
        sliderInstances.push(new KinesitherapySlider(container));
    });

    // Р•Р”РРќ Р“Р›РћР‘РђР›Р•Рќ resize listener Р·Р° РІСЃРёС‡РєРё СЃР»Р°Р№РґРµСЂРё
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            sliderInstances.forEach(instance => {
                instance.updateItemsPerSlide(); // Р’СЃРµРєРё РёРЅСЃС‚Р°РЅСЃ СЃРµ РѕР±РЅРѕРІСЏРІР°
            });
        }, 250); // РР·С‡Р°РєР°Р№ 250ms СЃР»РµРґ СЃРїРёСЂР°РЅРµ РЅР° СЂРµСЃР°Р№Р·Р°
    });
});
