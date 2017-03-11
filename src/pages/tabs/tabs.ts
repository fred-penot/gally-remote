import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { RemotePage } from '../remote/remote';
import { VocalPage } from '../vocal/vocal';
import { SettingPage } from '../setting/setting';
import { CommonService } from '../../providers/common-service';
import { RemoteService } from '../../providers/remote-service';

@Component({
  templateUrl: 'tabs.html',
  providers: [Storage, CommonService, RemoteService]
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = RemotePage;
  tab2Root: any = VocalPage;
  tab3Root: any = SettingPage;

  constructor(public remoteService: RemoteService) {

  }

  selectTab(tab) {
    this.remoteService.saveAction(tab).then(data => {
      if (data['statut']) {
        console.log('ok');
      }
    });
  }
}
