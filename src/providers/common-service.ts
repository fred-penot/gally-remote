import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import { App, NavController, Platform, LoadingController, ToastController } from 'ionic-angular';
import { Toast, SpinnerDialog } from 'ionic-native';
import 'rxjs/add/operator/map';

@Injectable()
export class CommonService {
  private login: string = 'gally-remote';
  private urlApi: string = 'http://192.168.1.17:9595/domoapi/web/index.php/';
  //private urlApi: string = 'http://88.190.12.151:9595/domoapi/web/index.php/';
  private loader: any = null;

  constructor(public app: App, public navCtrl: NavController, public http: Http, public storage: Storage, public platform: Platform,
              public loadingCtrl: LoadingController, public toastCtrl: ToastController) {

  }

  getLogin() {
    return this.login;
  }

  getUrlApi() {
    return this.urlApi;
  }

  getDataApi(route, param='', autodisconnect=true) {
    return new Promise(resolve => {
      this.getToken().then(token => {
        this.http.get(this.getUrlApi() + route + token + param)
            .map(res => res.json())
            .subscribe(
                data => {
                  resolve(this.checkApiReturn(data, autodisconnect));
                },
                err => {
                  resolve(this.errorApiReturn());
                }
            );
      });
    });
  }
  
  checkApiReturn(data, autodisconnect=true) {
    let apiReturn = {statut: false, message: null, data: null};
    if (data.statut) {
      let token = '';
      if ( data.data.token != undefined ) {
        token = data.data.token;
      } else {
        token = data.data;
      }
      this.storage.set('token', token);
      apiReturn.statut = true;
      apiReturn.data = data.data;
    } else {
      apiReturn.statut = false;
      if (data.data == '' || data.data == undefined) {
        apiReturn.message = 'Vous êtes déconnecté.';
        if (autodisconnect) {
          this.toastShow(apiReturn.message);
          const root = this.app.getRootNav();
          root.popToRoot();
        }
      } else {
        this.storage.set('token', data.data);
      }
    }
    return apiReturn;
  }

  errorApiReturn() {
    let errorApiReturn = {statut: false, message: 'Erreur : Impossible de se connecter au serveur.'};
    return errorApiReturn;
  }

  setToken(token) {
    this.storage.set('token', token);
  }

  getToken() {
    return Promise.resolve(this.storage.get('token'));
  }

  setProfil(profil) {
    this.storage.set('profil', profil);
  }

  getProfil() {
    return Promise.resolve(this.storage.get('profil'));
  }

  loadingShow(message) {
    if (this.platform.is('cordova')) {
      SpinnerDialog.show(null, message);
    } else {
      let loading = this.loadingCtrl.create({
        content: message
      });
      this.loader = loading;
      this.loader.present();
    }
  }

  loadingHide() {
    if (this.platform.is('cordova')) {
      SpinnerDialog.hide();
    } else {
      this.loader.dismiss();
    }
  }

  toastShow(message) {
    if (this.platform.is('cordova')) {
      Toast.show(message, "short", "bottom").subscribe(
          toast => {
            console.log(toast);
          }
      );
    } else {
      let toast = this.toastCtrl.create({
        message: message,
        duration: 3000,
        position: 'bottom'
      });
      toast.present();
    }
  }

  getCurrentPosition() {
    navigator.geolocation.getCurrentPosition(function(position) {
      console.log('latitude => ' + position.coords.latitude);
      console.log('longitude => ' + position.coords.longitude);
    });
  }

  getTimestamp() {
    let date = new Date();
    let bigTimestamp = date.getTime();
    let timestamp = Math.round(bigTimestamp / 1000);
    return timestamp;
  }
}
