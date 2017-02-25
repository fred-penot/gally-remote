import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { CommonService } from '../../providers/common-service';
import { SecurityService } from '../../providers/security-service';
import { NavController } from 'ionic-angular';
import { TabsPage } from '../../pages/tabs/tabs';

@Component({
  selector: 'page-login',
  templateUrl: 'index.html',
  providers: [Storage, CommonService, SecurityService]
})
export class LoginPage {
    private password: string;

    constructor(public navCtrl: NavController, public commonService: CommonService,
                public securityService: SecurityService) {
        this.init();
    }

    init() {
        this.password = '';
        this.commonService.loadingShow('Please wait...');
        this.securityService.checkAuth().then(data => {
            if ( data['statut'] ) {
                this.commonService.getProfil().then(profil => {
                    if (profil=='user') {
                        this.navCtrl.push(TabsPage);
                    }
                });
            } else {
                this.commonService.toastShow(data['message']);
            }
            this.commonService.loadingHide();
        });
    }

    checkLogin(value) {
        this.password += value;
        if ( this.password.length == 4 ) {
            this.connect ();
        }
    }

    connect() {
        this.commonService.loadingShow('Please wait...');
        this.securityService.auth(this.commonService.getLogin(), this.password).then(data => {
            this.password = '';
            if ( data['statut'] ) {
                this.securityService.checkAuth().then(data => {
                    if ( data['statut'] ) {
                        this.commonService.getProfil().then(profil => {
                            if (profil=='user') {
                                this.navCtrl.push(TabsPage);
                            }
                        });
                    } else {
                        this.commonService.toastShow(data['message']);
                    }
                    this.commonService.loadingHide();
                });
            } else {
                this.commonService.toastShow(data['message']);
                this.commonService.loadingHide();
            }
        });
    }

}
