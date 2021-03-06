import { Component, ViewChild } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { CommonService } from '../../providers/common-service';
import { SpeechExecService } from '../../providers/speech-exec-service';
import { GallyCommandService } from '../../providers/gally-command-service';
import { SpeechCommandService } from '../../providers/speech-command-service';
import { SpeechService } from '../../providers/speech-service';
import { RemoteService } from '../../providers/remote-service';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'page-vocal',
  templateUrl: 'vocal.html',
  providers: [CommonService, SpeechExecService, GallyCommandService,
    SpeechCommandService, SpeechService, RemoteService]
})
export class VocalPage {
  @ViewChild('content') content;

  private mic: string;
  private micSelect: any = {'on': 'mic', 'off': 'mic-off'};
  private gally: any;
  private discussion: any = [];
  private currentDiscussion: number = 0;
  private interval: any;

  constructor(public navCtrl: NavController, public platform: Platform, public commonService: CommonService,
              private gallyCommandService: GallyCommandService, public speechService: SpeechService,
              public remoteService: RemoteService) {
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
    this.stopWatchDiscussion();
  }

  startWatchDiscussion() {
    let interval = Observable.interval(1000);
    this.interval = interval.subscribe(() => {
      let sentenceElement = this.gally.getDiscussion(this.currentDiscussion);
      if (sentenceElement != undefined) {
        this.addDiscussion(sentenceElement);
        this.currentDiscussion++;
      }
      this.content.scrollToBottom(300);
    });
  }

  addDiscussion(sentenceElement) {
    this.discussion.push(sentenceElement);
    let elementToSave = JSON.stringify(sentenceElement);
    this.remoteService.saveAction(elementToSave.replace('?', '£')).then(data => {
      if (data['statut']) {
        console.log('ok addDiscussion');
      }
    });
  }

  stopWatchDiscussion() {
    this.interval.unsubscribe();
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

  micAction() {
    this.checkParam().then(dataParam => {
      if (dataParam) {
        this.platform.ready().then(() => {
          if ( this.gally.isDefine() ) {
            this.mic = this.micSelect.off;
            this.gally.stop();
            this.stopWatchDiscussion();
          } else {
            this.gally.setDefine(true);
            this.mic = this.micSelect.on;
            this.gally.record();
            this.startWatchDiscussion();
          }
        });
      } else {
        this.commonService.toastShow('Veuillez remplir les paramètres avant toute utilisation.');
        this.navCtrl.parent.select(2);
      }
    });
  }
}
