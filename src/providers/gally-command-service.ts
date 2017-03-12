import { Injectable } from '@angular/core';
import { CommonService } from '../providers/common-service';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class GallyCommandService {
    private routeVocalCommands: string = 'gally/api/get/vocal/command/';
    private routeGetCitySearch: string = 'meteo/api/get/cities/';
    private routeGetCityCoordinates: string = 'meteo/api/get/coordinates/city/';
    private routeGetPrevisions: string =  'meteo/api/prevision/';
    private routeSetGallyParam: string =  'gally/api/set/param/';
    private routeGetGallyParam: string =  'gally/api/get/param/';
    private routeGetGallyMessages: string =  'gally/api/get/ia/messages/';
    private routeSearchGallyMessage: string =  'gally/api/get/ia/search/message/';
    private routeGetGallyCommands: string =  'gally/api/get/ia/commands/';
    private routeSearchGallyCommand: string =  'gally/api/get/ia/search/command/';
    private routeSaveGallyCommandMessage: string =  'gally/api/save/ia/command/message/';

    constructor(public http: Http, public commonService: CommonService) {
    }

    getVocalCommands() {
        return this.commonService.getDataApi(this.routeVocalCommands).then(data => {
            return data;
        });
    }

    getIaMessages() {
        return this.commonService.getDataApi(this.routeGetGallyMessages).then(data => {
            return data;
        });
    }

    getIaMessagesByName(word) {
        return this.commonService.getDataApi(this.routeSearchGallyMessage, '/' + word).then(data => {
            return data;
        });
    }

    getIaCommands() {
        return this.commonService.getDataApi(this.routeGetGallyCommands).then(data => {
            return data;
        });
    }

    getIaCommandsByName(word) {
        return this.commonService.getDataApi(this.routeSearchGallyCommand, '/' + word).then(data => {
            return data;
        });
    }

    saveIaCommandMessage(commandId, messageId, success, repeat) {
        return this.commonService.getDataApi(this.routeSaveGallyCommandMessage, '/' + commandId + '/' + messageId + '/' + success + '/' + repeat).then(data => {
            return data;
        });
    }

    getCities(value) {
        let valueFormat = value.replace('saint', 'st');
        return this.commonService.getDataApi(this.routeGetCitySearch, '/' + valueFormat).then(data => {
            return data;
        });
    }

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

    getParam() {
        return this.commonService.getDataApi(this.routeGetGallyParam).then(data => {
            return data;
        });
    }

    saveParam(sexe, gallyName, birthTimestamp, birthNameCity, birthCp, currentNameCity, currentCp) {
        return this.commonService.getDataApi(this.routeSetGallyParam, '/' + sexe + '/' + gallyName + '/' + birthTimestamp+ '/' + birthNameCity + '/' + birthCp + '/' + currentNameCity + '/' + currentCp).then(data => {
            return data;
        });
    }
}
