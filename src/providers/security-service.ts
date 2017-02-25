import { Injectable } from '@angular/core';
import { CommonService } from '../providers/common-service';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class SecurityService {
    private routeAuth: any = 'security/api/auth/';
    private routeCheckAuth: any = 'security/api/check/auth/';

    constructor(public http: Http, public commonService: CommonService) {
        
    }

    auth(login, password) {
        return new Promise(resolve => {
            this.http.get(this.commonService.getUrlApi()+this.routeAuth+login+'/'+password)
                .map(res => res.json())
                .subscribe(
                    data => {
                        if (data.statut) {
                            this.commonService.setToken(data.data.token);
                            this.commonService.setProfil(data.data.profil);
                            resolve({statut: true});
                        } else {
                            resolve({statut: false, message: 'Erreur : Mot de passe erroné.'});
                        }
                    },
                    err => {
                        resolve(this.commonService.errorApiReturn());
                    }
                );
        });
    }

    checkAuth() {
        return this.commonService.getDataApi(this.routeCheckAuth, '', false).then(data => {
            return data;
        });
    }
}
