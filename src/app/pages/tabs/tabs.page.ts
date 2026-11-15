import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs, MenuController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { airplane, home, person, time } from 'ionicons/icons';

// Contenedor de las 4 pestañas principales
@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  constructor(private menuController: MenuController) {
    addIcons({ home, airplane, time, person });
  }

  ionViewWillEnter(): void {
    // al entrar a la app activamos de nuevo el menu lateral
    this.menuController.enable(true);
  }
}
