import { Component } from '@angular/core';
import { CommonService } from '../../providers/common-service';
import { RemoteService } from '../../providers/remote-service';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-remote',
  templateUrl: 'remote.html',
  providers: [CommonService, RemoteService]
})
export class RemotePage {
  constructor(public navCtrl: NavController, public commonService: CommonService,
              public remoteService: RemoteService) {
  }

  doAction(value) {
    this.remoteService.saveAction(value).then(data => {
      if (data['statut']) {
        console.log('ok doAction');
      }
    });
  }
}
