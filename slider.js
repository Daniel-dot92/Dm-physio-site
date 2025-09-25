// ======================================
// Основен слайдер за горните големи снимки
// ======================================
document.addEventListener('DOMContentLoaded', () => {
    const mainSlides = document.querySelectorAll('.slider img');
    const mainCaption = document.querySelector('.slide-caption');
    const mainCaptions = [
        "Сухи игли",
        "Онлайн процедури",
        "Масажи",
        "Корекционни упражнения",
        "Иглотерапия",
        "Домашно лечение"
    ];

    let currentMainSlide = 0;
    let mainCaptionTimeout;
    let mainSliderInterval;

    /**
     * Показва избрания слайд и актуализира надписа.
     * @param {number} index Индексът на слайда за показване.
     */
    function showMainSlide(index) {
        // Скрива всички слайдове и показва текущия
        mainSlides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });

        // Актуализира и показва надписа
        mainCaption.textContent = mainCaptions[index] || "";
        mainCaption.style.opacity = '1';

        // Изчиства предишния таймаут и задава нов за скриване на надписа
        if (mainCaptionTimeout) {
            clearTimeout(mainCaptionTimeout);
        }
        mainCaptionTimeout = setTimeout(() => {
            mainCaption.style.opacity = '0';
        }, 3000); // Надписът изчезва след 3 секунди
    }

    /**
     * Преминава към следващия слайд.
     */
    function nextMainSlide() {
        currentMainSlide = (currentMainSlide + 1) % mainSlides.length;
        showMainSlide(currentMainSlide);
    }

    // Инициализация на основния слайдер
    // Проверява дали изобщо има слайдове, за да избегне грешки на страници без слайдер
    if (mainSlides.length > 0) {
        showMainSlide(currentMainSlide);
        mainSliderInterval = setInterval(nextMainSlide, 2000); // Сменя слайда на всеки 4 секунди
    } else {
        // Ако няма слайдове (напр. на подстраници със static-header), скрива надписа.
        // Или може да се добави друга логика, ако е необходимо
        if (mainCaption) {
            mainCaption.style.opacity = '0'; // Скрива надписа, ако няма слайдер
        }
    }
});

// =========================================================================================
// * Няма JavaScript код за слайдера за ревюта, тъй като беше поискано да бъде премахнат. *
// =========================================================================================

// =========================================================================================
// Проверка за бутоните най-отгоре (навигационните връзки в хедъра)
// =========================================================================================
document.addEventListener('DOMContentLoaded', () => {
    // В този JS файл няма код, който да управлява функционалността на навигационните
    // бутони (линкa) в `<header>` или `<div class="slider-header">`.
    //
    // Тяхната "работа" се определя от HTML атрибута `href`.
    // Например:
    // `<a href="index.html">Начало</a>` ще зареди index.html
    // `<a href="#services">Услуги</a>` ще прескочи до елемент с id="services" на същата страница.
    // `<a href="#">Нищо не прави освен да добави # към URL-а (ако няма JS handler)</a>`
    //
    // За да "работят", те трябва да имат правилен `href` атрибут, сочещ към:
    // 1. Съществуващ URL (друга страница).
    // 2. ID на елемент на текущата страница (за smooth scrolling, например, което изисква допълнителен JS или просто `#id`).
    //
    // Ако бутоните ви не работят, моля, проверете следните неща в **HTML кода** на `<header>` и `nav`:
    // 1. Дали `href` атрибутите са правилни и сочат към съществуващи дестинации.
    // 2. Дали няма друг JavaScript код (отделно от този файл), който да пречи или да трябва да им дава функционалност.
    //
    // Този JavaScript код НЕ е причината навигационните връзки да не работят,
    // тъй като той не се занимава с тяхната логика.
});

// =========================================================================================
// Допълнителен код за booking секцията (както беше в предишния отговор, но не е свързан с горните бутони)
// =========================================================================================
document.addEventListener('DOMContentLoaded', () => {
    const bookAppointmentBtn = document.getElementById('bookAppointmentBtn');
    const timeSlotsContainer = document.querySelector('.time-slots-container');
    const procedureSelect = document.getElementById('procedureSelect');
    const calendarDays = document.querySelectorAll('.calendar-day');

    let selectedProcedure = null;
    let selectedDate = null;
    let selectedTime = null;

    if (procedureSelect) {
        procedureSelect.addEventListener('change', (event) => {
            selectedProcedure = event.target.value;
            updateBookingState();
        });
    }

    calendarDays.forEach(day => {
        day.addEventListener('click', () => {
            // Check if the day is disabled
            if (day.classList.contains('disabled') || day.classList.contains('other-month')) {
                return; // Do nothing if the day is disabled or from another month
            }

            calendarDays.forEach(d => d.classList.remove('selected'));
            day.classList.add('selected');
            selectedDate = day.dataset.date;
            if (timeSlotsContainer) {
                timeSlotsContainer.style.display = 'block';
            }
            updateBookingState();
            // TODO: Тук трябва да заредите и покажете реалните свободни часове за избраната дата
            // Може да се направи AJAX заявка към сървър за свободни часове
            // В момента просто ще покаже съществуващите time-slots
        });
    });

    // Делегиране на събития за time-slots, тъй като те могат да се зареждат динамично
    if (timeSlotsContainer) {
        timeSlotsContainer.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('time-slot') && !target.classList.contains('booked')) {
                document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                target.classList.add('selected');
                selectedTime = target.textContent.trim(); // Извлича текста на времевия слот
                updateBookingState();
            }
        });
    }


    function updateBookingState() {
        // Условията за активиране на бутона може да са по-сложни, в зависимост от вашата логика
        // Например: да има избрана процедура, дата И час.
        if (selectedProcedure && selectedDate && selectedTime) {
            bookAppointmentBtn.disabled = false;
        } else {
            bookAppointmentBtn.disabled = true;
        }
    }


    if (bookAppointmentBtn) {
        bookAppointmentBtn.addEventListener('click', () => {
            if (bookAppointmentBtn.disabled) {
                alert('Моля, изберете процедура, дата и час преди да запазите.');
                return;
            }

            const patientName = document.getElementById('patientNameInput') ? document.getElementById('patientNameInput').value : '';
            const patientPhone = document.getElementById('patientPhoneInput') ? document.getElementById('patientPhoneInput').value : '';
            const patientEmail = document.getElementById('patientEmailInput') ? document.getElementById('patientEmailInput').value : '';
            const patientNotes = document.getElementById('patientNotesInput') ? document.getElementById('patientNotesInput').value : '';


            console.log('Данни за запазване на час:', {
                procedure: selectedProcedure,
                date: selectedDate,
                time: selectedTime,
                name: patientName,
                phone: patientPhone,
                email: patientEmail,
                notes: patientNotes
            });
            alert(`Успешно запазен час за ${selectedProcedure} на ${selectedDate} в ${selectedTime} за ${patientName}!`);
            // В реално приложение тук бихте изпратили тези данни към сървър (Fetch API, XMLHttpRequest)
            // и обработили отговора.
        });
    }

    updateBookingState(); // Инициализира състоянието на бутона при зареждане на страницата
});
