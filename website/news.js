export function fetchNewsArticles() {
    const newsSection = document.getElementById('news-articles');
    const articles = [
        {
            title: 'Aioli Prices Soar Amid Olive Oil Shortage',
            content: 'The recent shortage of olive oil has caused a significant increase in aioli prices...'
        },
        {
            title: 'New Garlic Harvest Expected to Stabilize Aioli Prices',
            content: 'Farmers are optimistic about the upcoming garlic harvest, which is expected to stabilize aioli prices...'
        },
        {
            title: 'Energy Costs Impacting Aioli Production',
            content: 'Rising energy costs are having a direct impact on the production costs of aioli...'
        }
    ];

    articles.forEach(article => {
        const articleDiv = document.createElement('div');
        articleDiv.classList.add('news-article');
        articleDiv.innerHTML = `
            <h3>${article.title}</h3>
            <p>${article.content}</p>
        `;
        newsSection.appendChild(articleDiv);
    });
}
