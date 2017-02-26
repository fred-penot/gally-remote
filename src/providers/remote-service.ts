import { Injectable } from '@angular/core';
import { CommonService } from '../providers/common-service';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class RemoteService {
    private routeSaveAction: string = 'remote/api/save/action/';

    constructor(public http: Http, public commonService: CommonService) {
    }

    saveAction(action) {
        return this.commonService.getDataApi(this.routeSaveAction, '/' + action).then(data => {
            return data;
        });
    }

}
