// Функцията toggleReadMore, която вече е изнесена в отделен файл
function toggleReadMore(element) {
    const collapsibleDiv = element.closest('.collapsible-text');
    if (!collapsibleDiv) return;

    const shortTextElement = collapsibleDiv.querySelector('.short-text');
    const fullTextElement = collapsibleDiv.querySelector('.full-text');
    const readMoreButton = collapsibleDiv.querySelector('.read-more-btn');

    if (fullTextElement.style.display === "none" || fullTextElement.style.display === "") {
        shortTextElement.style.display = "none";
        fullTextElement.style.display = "block";
        readMoreButton.textContent = "Скрий";
    } else {
        shortTextElement.style.display = "block";
        fullTextElement.style.display = "none";
        readMoreButton.textContent = "Научи повече";
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация на "Научи повече" функционалността за секцията "Как лекуваме тялото"
    document.querySelectorAll('.physiology-section .collapsible-text').forEach(collapsibleDiv => {
        const fullTextElement = collapsibleDiv.querySelector('.full-text');
        const shortTextElement = collapsibleDiv.querySelector('.short-text');
        const readMoreButton = collapsibleDiv.querySelector('.read-more-btn');

        if (fullTextElement && shortTextElement && readMoreButton) {
            const fullText = fullTextElement.textContent.trim();
            const words = fullText.split(/\s+/);
            
            if (words.length > 35) { // Можете да регулирате броя на думите
                const shortVersion = words.slice(0, 35).join(' ') + '...';
                shortTextElement.textContent = shortVersion;
                shortTextElement.style.display = 'block';
                fullTextElement.style.display = 'none';
                readMoreButton.style.display = 'inline-block';
            } else {
                shortTextElement.textContent = fullText;
                shortTextElement.style.display = 'block';
                fullTextElement.style.display = 'none';
                readMoreButton.style.display = 'none';
            }
        }
    });

    // Ако имате read-more функционалност и за "procedure-card" елементи,
    // трябва да я добавите и тук, ако не е вече в друг глобален JS файл.
    // Пример (ако е необходимо):
    // document.querySelectorAll('.procedure-card .collapsible-text').forEach(collapsibleDiv => {
    //     const fullTextElement = collapsibleDiv.querySelector('.full-text');
    //     const shortTextElement = collapsibleDiv.querySelector('.short-text');
    //     const readMoreButton = collapsibleDiv.querySelector('.read-more-btn');
    //
    //     if (fullTextElement && shortTextElement && readMoreButton) {
    //         const fullText = fullTextElement.textContent.trim();
    //         const words = fullText.split(/\s+/);
    //         
    //         if (words.length > 35) {
    //             const shortVersion = words.slice(0, 35).join(' ') + '...';
    //             shortTextElement.textContent = shortVersion;
    //             shortTextElement.style.display = 'block';
    //             fullTextElement.style.display = 'none';
    //             readMoreButton.style.display = 'inline-block';
    //         } else {
    //             shortTextElement.textContent = fullText;
    //             shortTextElement.style.display = 'block';
    //             fullTextElement.style.display = 'none';
    //             readMoreButton.style.display = 'none';
    //         }
    //     }
    // });
});