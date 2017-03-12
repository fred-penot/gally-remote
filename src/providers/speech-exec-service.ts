import { Injectable } from '@angular/core';
import { CommonService } from '../providers/common-service';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class SpeechExecService {
    private routeDomoticPutActionDevice: string = 'light/api/put/';
    private routeSetGallyHistory: string =  'gally/api/set/history/';
    private routeGetGallyHistoryCommandDay: string =  'gally/api/get/history/command/day/';
    private routeGetGallyParam: string =  'gally/api/get/param/';
    private routeGetGallyScenarioTypeName: string = 'gally/api/get/ia/scenario/type/name/';
    private routeGetGallyLaunchScenario: string = 'gally/api/launch/ia/scenario/';
    private routeGetCityCoordinates: string = 'meteo/api/get/coordinates/city/';
    private routeGetPrevisions: string =  'meteo/api/prevision/';
    private routeFreeboxCheckDeviceDevice: string = 'freebox/api/check/device/room/';
    private routeFreeboxPlayMedia: string = 'freebox/api/play/airmedia/name/room/';
    private routeFreeboxStopMedia: string = 'freebox/api/stop/airmedia/room/';
    private routeFreeboxAddMediaList: string = 'freebox/api/add/media/folder/room/';
    private routeFreeboxLaunchPlaylist: string = 'freebox/api/launch/playlist/room/';

    constructor(public http: Http, public commonService: CommonService) {
    }

    /************ COMMON ********************/

    checkKeywords(keywordsToFind, keywordsToCheck) {
        let check = false;
        let data = [];
        for (let i=0; i<keywordsToCheck.length; i++) {
            for (let j=0; j<keywordsToFind.length; j++) {
                if (keywordsToFind[j].key == keywordsToCheck[i]) {
                    data[i] = keywordsToFind[j].value;
                }

            }
        }
        if (keywordsToCheck.length == data.length) {
            check = true
        }
        return {
            'statut': check,
            'data': data
        }
    }

    /************ IA ********************/

    setGallyHistory(commandeVocaleId) {
        return this.commonService.getDataApi(this.routeSetGallyHistory, '/'+commandeVocaleId+'/'+this.commonService.getTimestamp()).then(data => {
            return data;
        });
    }

    getGallyHistoryCommandDay(commandeVocaleId) {
        return this.commonService.getDataApi(this.routeGetGallyHistoryCommandDay, '/'+commandeVocaleId+'/'+this.commonService.getTimestamp()).then(data => {
            return data;
        });
    }

    getParam() {
        return this.commonService.getDataApi(this.routeGetGallyParam).then(data => {
            return data;
        });
    }

    getScenarioByTypeAndName(type, name) {
        return this.commonService.getDataApi(this.routeGetGallyScenarioTypeName, '/'+type+'/'+name).then(data => {
            return data;
        });
    }

    launchScenario(id, action) {
        return this.commonService.getDataApi(this.routeGetGallyLaunchScenario, '/'+id+'/'+action).then(data => {
            return data;
        });
    }

    /************ DOMOTIC ********************/

    putActionDevice(activate, room) {
        return this.commonService.getDataApi(this.routeDomoticPutActionDevice, '/'+activate+'/'+room).then(data => {
            return data;
        });
    }

    /************ FREEBOX ********************/

    checkDevice(room) {
        return this.commonService.getDataApi(this.routeFreeboxCheckDeviceDevice, '/'+room).then(data => {
            return data;
        });
    }

    playMedia(type, title, room) {
        return this.commonService.getDataApi(this.routeFreeboxPlayMedia, '/'+type+'/'+title+'/'+room).then(data => {
            return data;
        });
    }

    stopMedia(room) {
        return this.commonService.getDataApi(this.routeFreeboxStopMedia, '/'+room).then(data => {
            return data;
        });
    }

    addMediaList(type, title, room) {
        return this.commonService.getDataApi(this.routeFreeboxAddMediaList, "/"+type+"/"+title+"/"+room).then(data => {
            return data;
        });
    }

    launchPlaylist(room) {
        return this.commonService.getDataApi(this.routeFreeboxLaunchPlaylist, '/'+room).then(data => {
            return data;
        });
    }


    /************ METEO ********************/

    getCityCoordinates(name, cp) {
        return this.commonService.getDataApi(this.routeGetCityCoordinates, '/' + name + '/' + cp).then(data => {
            return data;
        });
    }

    getPrevisions(latitude, longitude, hour) {
        return this.commonService.getDataApi(this.routeGetPrevisions, '/' + latitude + '/' + longitude + '/' + hour).then(data => {
            return data;
        });
    }
}
