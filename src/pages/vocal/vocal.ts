import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-vocal',
  templateUrl: 'vocal.html'
})
export class VocalPage {

  constructor(public navCtrl: NavController) {

  }

  test() {
    console.log('ok');
  }

}
