import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { CommonService } from '../../providers/common-service';
import { SpeechExecService } from '../../providers/speech-exec-service';
import { GallyCommandService } from '../../providers/gally-command-service';
import { SpeechCommandService } from '../../providers/speech-command-service';
import { SpeechService } from '../../providers/speech-service';

@Component({
  selector: 'page-vocal',
  templateUrl: 'vocal.html',
  providers: [CommonService, SpeechExecService, GallyCommandService, SpeechCommandService, SpeechService]
})
export class VocalPage {
  private mic: string;
  private micSelect: any = {'on': 'mic', 'off': 'mic-off'};
  private gally: any;


  constructor(public navCtrl: NavController, public platform: Platform, public commonService: CommonService,
              private gallyCommandService: GallyCommandService, public speechService: SpeechService) {
    this.mic = this.micSelect.off;
    this.gally = this.speechService;
  }

  ionViewDidEnter() {
    this.commonService.loadingShow('Please wait...');
    this.checkParam().then(dataParam => {
      if (dataParam) {
        this.gallyCommandService.getVocalCommands().then(dataCommand => {
          if ( dataCommand['statut'] ) {
            var countCommands = dataCommand['data']['data']['command'].length;
            for (var i = 0; i < countCommands; i++) {
              this.gally.addCommand(dataCommand['data']['data']['command'][i]);
            }
            this.gally.getCountCommand();
          } else {
            this.commonService.toastShow(dataCommand['message']);
          }
          this.commonService.loadingHide();
        });
      } else {
        this.commonService.toastShow('Veuillez remplir les paramètres avant toute utilisation.');
        this.navCtrl.parent.select(2);
        this.commonService.loadingHide();
      }
    });
  }

  ionViewWillLeave() {
    this.mic = this.micSelect.off;
    this.gally.stop();
    this.gally.clearCommand();
  }

  checkParam() {
    return this.gallyCommandService.getParam().then(dataParam => {
      if (dataParam['statut']) {
        let param = dataParam['data']['data']['param'];
        if (param['sexe'] != undefined && param['name'] != undefined
            && param['birth_timestamp'] != undefined && param['birth_cp'] != undefined
            && param['birth_city'] != undefined && param['current_cp'] != undefined
            && param['current_city'] != undefined) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    });
  }

  activate() {
    this.checkParam().then(dataParam => {
      if (dataParam) {
        this.platform.ready().then(() => {
          if ( this.gally.isDefine() ) {
            this.mic = this.micSelect.off;
            this.gally.stop();
          } else {
            this.gally.setDefine(true);
            this.mic = this.micSelect.on;
            this.gally.record();
          }
        });
      } else {
        this.commonService.toastShow('Veuillez remplir les paramètres avant toute utilisation.');
        this.navCtrl.parent.select(2);
      }
    });
  }
}
