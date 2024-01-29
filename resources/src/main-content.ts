import { BossContent } from './boss-content.js';
import { Content, ContentManager } from './content.js';
import { Boss, BossList, BossType, Difficulty } from './data.js';
import { SummaryContent } from './summary-content.js';

export class MainContent extends Content {
    getHtml(): string | Promise<string> | HTMLElement {
        let mainContent = document.createElement('div');
        mainContent.id = 'main-content';
        let bossTable = document.createElement('table');
        bossTable.id = 'boss-list';
        mainContent.appendChild(bossTable);
        
        let bossId: BossType
        for (bossId in BossList) {
            let boss: Boss = BossList[bossId];
            let bossRow = document.createElement('tr');

            let bossImageContainer = document.createElement('td');
            bossImageContainer.classList.add('boss-name');
            let bossImage = document.createElement('img');
            bossImage.src = 'assets/boss/' + bossId + '.png';
            bossImageContainer.appendChild(bossImage);
            let bossName = document.createElement('span');
            bossName.appendChild(document.createTextNode(boss.name));
            bossImageContainer.appendChild(bossName);
            bossRow.appendChild(bossImageContainer);

            let bossDifficultyContainer = document.createElement('td');
            let difficulty: Difficulty;
            for (difficulty in boss.loots) {
                let difficultyButton = document.createElement('button');
                difficultyButton.type = 'button';
                difficultyButton.classList.add('difficulty');
                difficultyButton.classList.add(difficulty);
                difficultyButton.appendChild(document.createTextNode(difficulty.toUpperCase()));
                difficultyButton.onclick = this.makeGoToContent(bossId, difficulty);
                bossDifficultyContainer.appendChild(difficultyButton);
            }
            bossRow.appendChild(bossDifficultyContainer);

            bossTable.appendChild(bossRow);
        }

        return mainContent;
    }

    getFooter(): string | Promise<string> | HTMLElement {
        return ContentManager.readHtml('main-content-footer.html');
    }

    init(): void | Promise<void> {
        (document.querySelector('.summary-button') as HTMLElement).onclick = () => {
            ContentManager.changeContent(new SummaryContent());
        }
    }

    makeGoToContent(bossId: BossType, difficulty: Difficulty): () => Promise<void> {
        return () => ContentManager.changeContent(new BossContent(bossId, difficulty));
    }
}
