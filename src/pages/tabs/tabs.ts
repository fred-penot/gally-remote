import { Component, ViewChild } from '@angular/core';
import { Tabs } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { RemotePage } from '../remote/remote';
import { VocalPage } from '../vocal/vocal';
import { SettingPage } from '../setting/setting';
import { CommonService } from '../../providers/common-service';
import { GallyCommandService } from '../../providers/gally-command-service';
import { RemoteService } from '../../providers/remote-service';

@Component({
  templateUrl: 'tabs.html',
  providers: [Storage, CommonService, RemoteService, GallyCommandService]
})
export class TabsPage {
  @ViewChild('myTabs') tabRef: Tabs;

  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = RemotePage;
  tab2Root: any = VocalPage;
  tab3Root: any = SettingPage;

  constructor(public remoteService: RemoteService, public commonService: CommonService,
              public gallyCommandService: GallyCommandService) {

  }

  ionViewDidEnter() {
    this.gallyCommandService.getParam().then(dataParam => {
      if (dataParam['statut']) {
        let param = dataParam['data']['data']['param'];
        if (param['sexe'] == undefined && param['name'] == undefined
            && param['birth_timestamp'] == undefined && param['birth_cp'] == undefined
            && param['birth_city'] == undefined && param['current_cp'] == undefined
            && param['current_city'] == undefined) {
          this.commonService.toastShow('Veuillez remplir les paramètres avant toute utilisation.');
          this.tabRef.select(2);
        }
      } else {
        this.commonService.toastShow('Veuillez remplir les paramètres avant toute utilisation.');
        this.tabRef.select(2);
      }
    });
  }

  selectTab(tab) {
    this.remoteService.saveAction(tab).then(data => {
      if (data['statut']) {
        console.log('ok');
      }
    });
  }
}
