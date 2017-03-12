import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';


@Injectable()
export class SpeechCommandService {
    constructor() {
    }

    activateFemale(param) : any {
        return param['speechExecService'].setGallyHistory(param['commandVocalId']).then(dataService => {
            let messageSuccess = param['method']['randomMessage'](param['message']['success']);
            let returnData = {
                "message": messageSuccess
            };
            if ( param['needResponse'] ) {
                return {
                    "typeRetour": 'waitingResponse',
                    "data": returnData
                };
            } else {
                return {
                    "typeRetour": 'set',
                    "data": returnData
                };
            }
        });
    }

    activateMale(param) : any {
        console.log('activateMale');
        return { "typeRetour": null, "data": null };
    }

    confirmActivate(param) : any {
        if ( param['waitingResponse'] ) {
            return param['speechExecService'].getGallyHistoryCommandDay(param['commandVocalId']).then(dataService => {
                let repeatResponse = false;
                if (dataService['statut']) {
                    if (dataService['data']['data']['history'] > 0) {
                        repeatResponse = true;
                    }
                }
                return param['speechExecService'].setGallyHistory(param['commandVocalId']).then(dataService => {
                    let messageSuccess = param['method']['randomMessage'](param['message']['success'], repeatResponse);
                    let returnData = {
                        "active": true,
                        "message": messageSuccess
                    };
                    if ( param['motorActive'] ) {
                        returnData['message'] = "Je suis déjà active !";
                    }
                    return {
                        "typeRetour": 'set',
                        "data": returnData
                    };
                });
            });
        } else {
            return {"typeRetour": 'nothing'};
        }
    }

    desactivate(param) : any {
        if ( param['motorActive'] ) {
            return param['speechExecService'].setGallyHistory(param['commandVocalId']).then(dataService => {
                let messageSuccess = param['method']['randomMessage'](param['message']['success']);
                let returnData = {
                    "active": false,
                    "message": messageSuccess
                };
                return {
                    "typeRetour": 'set',
                    "data": returnData
                };
            });
        } else {
            return {"typeRetour": 'nothing'};
        }
    }

    confirmAction(param) : any {
        if ( param['motorActive'] ) {
            return { "typeRetour": 'confirm', "data": null };
        } else {
            return { "typeRetour": 'desactivate' };
        }
    }

    selectAction(param) : any {
        console.log('selectAction');
        return { "typeRetour": null, "data": null };
    }

    cancelAction(param) : any {
        if ( param['motorActive'] ) {
            return { "typeRetour": 'cancel', "data": null };
        } else {
            return { "typeRetour": 'desactivate' };
        }
    }

    whoAmI(param) : any {
        if ( param['motorActive'] ) {
            return param['speechExecService'].getGallyHistoryCommandDay(param['commandVocalId']).then(dataService => {
                let repeatResponse = false;
                if (dataService['statut']) {
                    if (dataService['data']['data']['history'] > 0) {
                        repeatResponse = true;
                    }
                }
                return param['speechExecService'].setGallyHistory(param['commandVocalId']).then(dataService => {
                    return param['speechExecService'].getParam().then(dataParam => {
                        let messageReturn = '';
                        if (dataParam['statut']) {
                            let paramGally = dataParam['data']['data']['param'];
                            if (paramGally['sexe'] != undefined && paramGally['name'] != undefined
                                && paramGally['birth_timestamp'] != undefined && paramGally['birth_cp'] != undefined
                                && paramGally['birth_city'] != undefined && paramGally['current_cp'] != undefined
                                && paramGally['current_city'] != undefined) {
                                let messageSuccess = param['method']['randomMessage'](param['message']['success'], repeatResponse);
                                let birthDateToFormat = new Date(paramGally['birth_timestamp']*1000);
                                let options = {year: "numeric", month: "long", day: "numeric"};
                                messageReturn = messageSuccess.replace("__NAME__", paramGally['name'])
                                    .replace("__BIRTH_DATE__", birthDateToFormat.toLocaleDateString("fr-FR", options))
                                    .replace("__BIRTH_CITY__", paramGally['birth_city'])
                                    .replace("__CURRENT_CITY__", paramGally['current_city']);
                            } else {
                                messageReturn = param['method']['randomMessage'](param['message']['error']);
                            }
                        } else {
                            messageReturn = param['method']['randomMessage'](param['message']['error']);
                        }
                        return {
                            "typeRetour": 'message',
                            "data": messageReturn
                        };
                    });
                });
            });
        } else {
            return {
                "typeRetour": 'waitingResponse',
                "data": param['method']['motorUndefined'](param)
            };
        }
    }

    defineRoom(param) : any {
        if ( param['motorActive'] ) {
            return param['speechExecService'].setGallyHistory(param['commandVocalId']).then(dataHistory => {
                let room = param[1];
                return param['speechExecService'].checkDevice(room).then(dataService => {
                    let messageReturn = '';
                    let returnData = {};
                    if ( dataService['statut'] ) {
                        if ( param[0]['principalRoom']['id'] ==  dataService.data.data.device.id) {
                            messageReturn = param['method']['randomMessage'](param['message']['roomDefined']);
                            returnData = {
                                "typeRetour": 'message',
                                "data": messageReturn
                            };
                        } else {
                            let messageSuccess = param['method']['randomMessage'](param['message']['success']);
                            messageReturn = messageSuccess.replace("__ROOM__", room);
                            let principalRoom = new Object();
                            principalRoom['id'] = dataService.data.data.device.id;
                            principalRoom['name'] = dataService.data.data.device.name;
                            principalRoom['speechName'] = room;
                            returnData = {
                                "typeRetour": 'set',
                                "data": {
                                    "principalRoom": principalRoom,
                                    "message": messageReturn
                                }
                            };
                        }
                    } else {
                        let messageError = param['method']['randomMessage'](param['message']['error']);
                        messageReturn = messageError.replace("__ROOM__", room);
                        returnData = {
                            "typeRetour": 'message',
                            "data": messageReturn
                        };
                    }
                    return returnData;
                });
            });
        } else {
            return {
                "typeRetour": 'waitingResponse',
                "data": param['method']['motorUndefined'](param)
            };
        }
    }

    getPrevisionMeteo(param) : any {
        if ( param['motorActive'] ) {
            return param['speechExecService'].setGallyHistory(param['commandVocalId']).then(dataHistory => {
                return param['speechExecService'].getParam().then(dataParam => {
                    let messageReturn = '';
                    if (dataParam['statut']) {
                        let paramGally = dataParam['data']['data']['param'];
                        if (paramGally['sexe'] != undefined && paramGally['name'] != undefined
                            && paramGally['birth_timestamp'] != undefined && paramGally['birth_cp'] != undefined
                            && paramGally['birth_city'] != undefined && paramGally['current_cp'] != undefined
                            && paramGally['current_city'] != undefined) {
                            let date = new Date();
                            let bigTimestamp = date.getTime();
                            let hour = Math.round(bigTimestamp / 1000);
                            return param['speechExecService'].getCityCoordinates(paramGally['current_city'], paramGally['current_cp']).then(dataCoordinates => {
                                if (dataCoordinates['statut']) {
                                    let longitude = dataCoordinates['data']['coordinates'][0];
                                    let latitude = dataCoordinates['data']['coordinates'][1];
                                    return param['speechExecService'].getPrevisions(latitude, longitude, hour).then(dataPrevisions => {
                                        if (dataPrevisions['statut']) {
                                            let messageSuccess = param['method']['randomMessage'](param['message']['success']);
                                            messageReturn = messageSuccess.replace("__TEMPERATURE__", dataPrevisions['data']['prevision']['current']['t_degre'])
                                                .replace("__HUMIDITE__", dataPrevisions['data']['prevision']['current']['humidite'])
                                                .replace("__VENT_MOYEN__", dataPrevisions['data']['prevision']['current']['vent']['moyen'])
                                                .replace("__VENT_RAFALE__", dataPrevisions['data']['prevision']['current']['vent']['rafale']);
                                        }
                                        return {
                                            "typeRetour": 'message',
                                            "data": messageReturn
                                        };
                                    });
                                } else {
                                    return {
                                        "typeRetour": 'message',
                                        "data": param['method']['randomMessage'](param['message']['error'])
                                    };
                                }
                            });
                        } else {
                            messageReturn = param['method']['randomMessage'](param['message']['error']);
                        }
                    } else {
                        messageReturn = param['method']['randomMessage'](param['message']['error']);
                    }
                    return {
                        "typeRetour": 'message',
                        "data": messageReturn
                    };
                });
            });
        } else {
            return {
                "typeRetour": 'waitingResponse',
                "data": param['method']['motorUndefined'](param)
            };
        }
    }

    freeMemory(param) : any {
        console.log('freeMemory');
        return { "typeRetour": null, "data": null };
    }

    startService(param) : any {
        console.log('startService');
        return { "typeRetour": null, "data": null };
    }

    stopService(param) : any {
        console.log('stopService');
        return { "typeRetour": null, "data": null };
    }

    putOnLight(param) : any {
        if ( param['motorActive'] ) {
            let roomToDefine = false;
            let find = false;
            let room = '';
            let name = '';
            let keywordsToCheck = {'statut': false, 'data': []};
            if (param[1] != undefined) {
                room = param[1];
                keywordsToCheck = param['speechExecService'].checkKeywords(param['keywords'], [param[1]]);
                find = keywordsToCheck.statut;
                name = keywordsToCheck.data[0];
            } else {
                if (param[0]['principalRoom']['name'] != undefined) {
                    room = param[0]['principalRoom']['name'];
                    for (var i = 0; i < param['keywords'].length; i++) {
                        if (param['keywords'][i].key == room) {
                            name = param['keywords'][i].value;
                            find = true;
                        }
                    }
                } else {
                    roomToDefine = true;
                }
            }
            if (find) {
                return param['speechExecService'].setGallyHistory(param['commandVocalId']).then(dataHistory => {
                    return param['speechExecService'].putActionDevice(true, name).then(dataService => {
                        let messageReturn = '';
                        if ( dataService['statut'] ) {
                            let messageSuccess = param['method']['randomMessage'](param['message']['success']);
                            messageReturn = messageSuccess.replace("__ROOM__", room);
                        } else {
                            let messageError = param['method']['randomMessage'](param['message']['error']);
                            messageReturn = messageError.replace("__ROOM__", room);
                        }
                        return {
                            "typeRetour": 'message',
                            "data": messageReturn
                        };
                    });
                });
            } else {
                let messageReturn = '';
                if (roomToDefine) {
                    messageReturn = "Tu dois d'abord définir une pièce !";
                } else {
                    let messageError = param['method']['randomMessage'](param['message']['error']);
                    messageReturn = messageError.replace("__ROOM__", room);
                }
                return {
                    "typeRetour": 'message',
                    "data": messageReturn
                };
            }
        } else {
            return {
                "typeRetour": 'waitingResponse',
                "data": param['method']['motorUndefined'](param)
            };
        }
    }

    putOffLight(param) : any {
        if ( param['motorActive'] ) {
            let roomToDefine = false;
            let find = false;
            let room = '';
            let name = '';
            let keywordsToCheck = {'statut': false, 'data': []};
            if (param[1] != undefined) {
                room = param[1];
                keywordsToCheck = param['speechExecService'].checkKeywords(param['keywords'], [param[1]]);
                find = keywordsToCheck.statut;
                name = keywordsToCheck.data[0];
            } else {
                if (param[0]['principalRoom']['name'] != undefined) {
                    room = param[0]['principalRoom']['name'];
                    for (var i = 0; i < param['keywords'].length; i++) {
                        if (param['keywords'][i].key == room) {
                            name = param['keywords'][i].value;
                            find = true;
                        }
                    }
                } else {
                    roomToDefine = true;
                }
            }
            if (find) {
                return param['speechExecService'].setGallyHistory(param['commandVocalId']).then(dataHistory => {
                    return param['speechExecService'].putActionDevice(false, name).then(dataService => {
                        let messageReturn = '';
                        if ( dataService['statut'] ) {
                            let messageSuccess = param['method']['randomMessage'](param['message']['success']);
                            messageReturn = messageSuccess.replace("__ROOM__", room);
                        } else {
                            let messageError = param['method']['randomMessage'](param['message']['error']);
                            messageReturn = messageError.replace("__ROOM__", room);
                        }
                        return {
                            "typeRetour": 'message',
                            "data": messageReturn
                        };
                    });
                });
            } else {
                let messageReturn = '';
                if (roomToDefine) {
                    messageReturn = "Tu dois d'abord définir une pièce !";
                } else {
                    let messageError = param['method']['randomMessage'](param['message']['error']);
                    messageReturn = messageError.replace("__ROOM__", room);
                }
                return {
                    "typeRetour": 'message',
                    "data": messageReturn
                };
            }
        } else {
            return {
                "typeRetour": 'waitingResponse',
                "data": param['method']['motorUndefined'](param)
            };
        }
    }

    searchManga(param) : any {
        console.log('searchManga');
        return { "typeRetour": null, "data": null };
    }

    findManga(param) : any {
        console.log('findManga');
        return { "typeRetour": null, "data": null };
    }

    checkDownloadMangaTome(param) : any {
        console.log('checkDownloadMangaTome');
        return { "typeRetour": null, "data": null };
    }

    playPhoto(param) : any {
        console.log('playPhoto');
        return { "typeRetour": null, "data": null };
    }

    playAlbumPhoto(param) : any {
        console.log('playAlbumPhoto');
        return { "typeRetour": null, "data": null };
    }

    playNextMedia(param) : any {
        console.log('playNextMedia');
        return { "typeRetour": null, "data": null };
    }

    playLastMedia(param) : any {
        console.log('playLastMedia');
        return { "typeRetour": null, "data": null };
    }

    emptyPlaylist(param) : any {
        console.log('emptyPlaylist');
        return { "typeRetour": null, "data": null };
    }

    stopMedia(param) : any {
        if ( param['motorActive'] ) {
            if (param[0]['principalRoom']['name'] != undefined) {
                let room = param[0]['principalRoom']['name'];
                return param['speechExecService'].setGallyHistory(param['commandVocalId']).then(dataHistory => {
                    return param['speechExecService'].stopMedia(room).then(dataMedia => {
                        let messageReturn = '';
                        if (dataMedia['statut']) {
                            messageReturn = param['method']['randomMessage'](param['message']['success']);
                        } else {
                            messageReturn = param['method']['randomMessage'](param['message']['error']);
                        }
                        return {
                            "typeRetour": 'message',
                            "data": messageReturn
                        };
                    });
                });
            } else {
                return {
                    "typeRetour": 'message',
                    "data": "Tu dois d'abord définir une pièce !"
                };
            }
        } else {
            return {
                "typeRetour": 'waitingResponse',
                "data": param['method']['motorUndefined'](param)
            };
        }
    }

    playMusic(param) : any {
        if ( param['motorActive'] ) {
            if (param[0]['principalRoom']['name'] != undefined) {
                let room = param[0]['principalRoom']['name'];
                let title = param[1];
                return param['speechExecService'].setGallyHistory(param['commandVocalId']).then(dataHistory => {
                    return param['speechExecService'].playMedia('audio', title, room).then(dataMedia => {
                        let messageReturn = '';
                        if (dataMedia['statut']) {
                            messageReturn = param['method']['randomMessage'](param['message']['success']);
                        } else {
                            messageReturn = param['method']['randomMessage'](param['message']['error']);
                        }
                        return {
                            "typeRetour": 'message',
                            "data": messageReturn
                        };
                    });
                });
            } else {
                return {
                    "typeRetour": 'message',
                    "data": "Tu dois d'abord définir une pièce !"
                };
            }
        } else {
            return {
                "typeRetour": 'waitingResponse',
                "data": param['method']['motorUndefined'](param)
            };
        }
    }

    playAlbumMusic(param) : any {
        console.log('playAlbumMusic');
        return { "typeRetour": null, "data": null };
    }

    playVideo(param) : any {
        console.log('playVideo');
        return { "typeRetour": null, "data": null };
    }

    playAlbumVideo(param) : any {
        console.log('playAlbumVideo');
        return { "typeRetour": null, "data": null };
    }

    helloSomebody(param) : any {
        console.log('helloSomebody');
        return { "typeRetour": null, "data": null };
    }

    helloSomeone(param) : any {
        console.log('helloSomeone');
        return { "typeRetour": null, "data": null };
    }

    byeSomeone(param) : any {
        console.log('byeSomeone');
        return { "typeRetour": null, "data": null };
    }

    pauseMedia(param) : any {
        console.log('pauseMedia');
        return { "typeRetour": null, "data": null };
    }

    resumeMedia(param) : any {
        console.log('resumeMedia');
        return { "typeRetour": null, "data": null };
    }

    addAlbumMusic(param) : any {
        console.log('addAlbumMusic');
        return { "typeRetour": null, "data": null };
    }

    launchPlaylist(param) : any {
        console.log('launchPlaylist');
        return { "typeRetour": null, "data": null };
    }

    addAlbumVideo(param) : any {
        console.log('addAlbumVideo');
        return { "typeRetour": null, "data": null };
    }

    addVideo(param) : any {
        console.log('addVideo');
        return { "typeRetour": null, "data": null };
    }

    addMusic(param) : any {
        console.log('addMusic');
        return { "typeRetour": null, "data": null };
    }

    startScenario(param) : any {
        if ( param['motorActive'] ) {
            let messageReturn = '';
            let keywordsToCheck = {'statut': false, 'data': []};
            if (param[1] != undefined && param[2] != undefined) {
                keywordsToCheck = param['speechExecService'].checkKeywords(param['keywords'], [param[1], param[2]]);
            }
            if (keywordsToCheck.statut) {
                return param['speechExecService'].setGallyHistory(param['commandVocalId']).then(dataHistory => {
                    return param['speechExecService'].getScenarioByTypeAndName(keywordsToCheck.data[0], keywordsToCheck.data[1]).then(dataScenario => {
                        if (dataScenario['statut']) {
                            return param['speechExecService'].launchScenario(dataScenario['data']['data']['scenario']['id'], true).then(dataLaunch => {
                                if ( dataLaunch['statut'] ) {
                                    let messageSuccess = param['method']['randomMessage'](param['message']['success']);
                                    messageReturn = messageSuccess.replace("__TYPE__", param[1])
                                        .replace("__NAME__", param[2]);
                                } else {
                                    let messageError = param['method']['randomMessage'](param['message']['error']);
                                    messageReturn = messageError.replace("__TYPE__", param[1])
                                        .replace("__NAME__", param[2]);
                                }
                                return {
                                    "typeRetour": 'message',
                                    "data": messageReturn
                                };
                            });
                        } else {
                            let messageError = param['method']['randomMessage'](param['message']['error']);
                            messageReturn = messageError.replace("__TYPE__", param[1])
                                .replace("__NAME__", param[2]);
                        }
                        return {
                            "typeRetour": 'message',
                            "data": messageReturn
                        };
                    });
                });
            } else {
                let messageError = param['method']['randomMessage'](param['message']['error']);
                messageReturn = messageError.replace("__TYPE__", param[1])
                    .replace("__NAME__", param[2]);
            }
            return {
                "typeRetour": 'message',
                "data": messageReturn
            };
        } else {
            return {
                "typeRetour": 'waitingResponse',
                "data": param['method']['motorUndefined'](param)
            };
        }
    }

    stopScenario(param) : any {
        if ( param['motorActive'] ) {
            let messageReturn = '';
            let keywordsToCheck = {'statut': false, 'data': []};
            if (param[1] != undefined && param[2] != undefined) {
                keywordsToCheck = param['speechExecService'].checkKeywords(param['keywords'], [param[1], param[2]]);
            }
            if (keywordsToCheck.statut) {
                return param['speechExecService'].setGallyHistory(param['commandVocalId']).then(dataHistory => {
                    return param['speechExecService'].getScenarioByTypeAndName(keywordsToCheck.data[0], keywordsToCheck.data[1]).then(dataScenario => {
                        if (dataScenario['statut']) {
                            return param['speechExecService'].launchScenario(dataScenario['data']['data']['scenario']['id'], false).then(dataLaunch => {
                                let messageReturn = '';
                                if ( dataLaunch['statut'] ) {
                                    let messageSuccess = param['method']['randomMessage'](param['message']['success']);
                                    messageReturn = messageSuccess.replace("__TYPE__", param[1])
                                        .replace("__NAME__", param[2]);
                                } else {
                                    let messageError = param['method']['randomMessage'](param['message']['error']);
                                    messageReturn = messageError.replace("__TYPE__", param[1])
                                        .replace("__NAME__", param[2]);
                                }
                                return {
                                    "typeRetour": 'message',
                                    "data": messageReturn
                                };
                            });
                        } else {
                            let messageError = param['method']['randomMessage'](param['message']['error']);
                            messageReturn = messageError.replace("__TYPE__", param[1])
                                .replace("__NAME__", param[2]);
                        }
                        return {
                            "typeRetour": 'message',
                            "data": messageReturn
                        };
                    });
                });
            } else {
                let messageError = param['method']['randomMessage'](param['message']['error']);
                messageReturn = messageError.replace("__TYPE__", param[1])
                    .replace("__NAME__", param[2]);
            }
            return {
                "typeRetour": 'message',
                "data": messageReturn
            };
        } else {
            return {
                "typeRetour": 'waitingResponse',
                "data": param['method']['motorUndefined'](param)
            };
        }
    }

    startScenarii(param) : any {
        if ( param['motorActive'] ) {
            let messageReturn = '';
            let keywordsToCheck = {'statut': false, 'data': []};
            if (param[1] != undefined && param[2] != undefined && param[3] != undefined && param[4] != undefined) {
                keywordsToCheck = param['speechExecService'].checkKeywords(param['keywords'], [param[1], param[2], param[3], param[4]]);
            }
            if (keywordsToCheck.statut) {
                return param['speechExecService'].setGallyHistory(param['commandVocalId']).then(dataHistory => {
                    return param['speechExecService'].getScenarioByTypeAndName(keywordsToCheck.data[0], keywordsToCheck.data[1]).then(dataScenario1 => {
                        if (dataScenario1['statut']) {
                            return param['speechExecService'].launchScenario(dataScenario1['data']['data']['scenario']['id'], true).then(dataLaunch1 => {
                                if ( dataLaunch1['statut'] ) {
                                    return param['speechExecService'].getScenarioByTypeAndName(keywordsToCheck.data[2], keywordsToCheck.data[3]).then(dataScenario2 => {
                                        if (dataScenario2['statut']) {
                                            return param['speechExecService'].launchScenario(dataScenario2['data']['data']['scenario']['id'], true).then(dataLaunch2 => {
                                                if ( dataLaunch2['statut'] ) {
                                                    let messageSuccess = param['method']['randomMessage'](param['message']['success']);
                                                    messageReturn = messageSuccess.replace("__TYPE1__", param[1])
                                                        .replace("__NAME1__", param[2])
                                                        .replace("__TYPE2__", param[3])
                                                        .replace("__NAME2__", param[4]);
                                                } else {
                                                    let messageError = param['method']['randomMessage'](param['message']['error']);
                                                    messageReturn = messageError.replace("__TYPE1__", param[1])
                                                        .replace("__NAME1__", param[2])
                                                        .replace("__TYPE2__", param[3])
                                                        .replace("__NAME2__", param[4]);
                                                }
                                                return {
                                                    "typeRetour": 'message',
                                                    "data": messageReturn
                                                };
                                            });
                                        } else {
                                            let messageError = param['method']['randomMessage'](param['message']['error']);
                                            messageReturn = messageError.replace("__TYPE1__", param[1])
                                                .replace("__NAME1__", param[2])
                                                .replace("__TYPE2__", param[3])
                                                .replace("__NAME2__", param[4]);
                                        }
                                        return {
                                            "typeRetour": 'message',
                                            "data": messageReturn
                                        };
                                    });
                                } else {
                                    let messageError = param['method']['randomMessage'](param['message']['error']);
                                    messageReturn = messageError.replace("__TYPE1__", param[1])
                                        .replace("__NAME1__", param[2])
                                        .replace("__TYPE2__", param[3])
                                        .replace("__NAME2__", param[4]);
                                }
                                return {
                                    "typeRetour": 'message',
                                    "data": messageReturn
                                };
                            });
                        } else {
                            let messageError = param['method']['randomMessage'](param['message']['error']);
                            messageReturn = messageError.replace("__TYPE1__", param[1])
                                .replace("__NAME1__", param[2])
                                .replace("__TYPE2__", param[3])
                                .replace("__NAME2__", param[4]);
                        }
                        return {
                            "typeRetour": 'message',
                            "data": messageReturn
                        };
                    });
                });
            } else {
                let messageError = param['method']['randomMessage'](param['message']['error']);
                messageReturn = messageError.replace("__TYPE1__", param[1])
                    .replace("__NAME1__", param[2])
                    .replace("__TYPE2__", param[3])
                    .replace("__NAME2__", param[4]);
            }
            return {
                "typeRetour": 'message',
                "data": messageReturn
            };
        } else {
            return {
                "typeRetour": 'waitingResponse',
                "data": param['method']['motorUndefined'](param)
            };
        }
    }

    stopScenarii(param) : any {
        if ( param['motorActive'] ) {
            let messageReturn = '';
            let keywordsToCheck = {'statut': false, 'data': []};
            if (param[1] != undefined && param[2] != undefined && param[3] != undefined && param[4] != undefined) {
                keywordsToCheck = param['speechExecService'].checkKeywords(param['keywords'], [param[1], param[2], param[3], param[4]]);
            }
            if (keywordsToCheck.statut) {
                return param['speechExecService'].setGallyHistory(param['commandVocalId']).then(dataHistory => {
                    return param['speechExecService'].getScenarioByTypeAndName(keywordsToCheck.data[0], keywordsToCheck.data[1]).then(dataScenario1 => {
                        if (dataScenario1['statut']) {
                            return param['speechExecService'].launchScenario(dataScenario1['data']['data']['scenario']['id'], false).then(dataLaunch1 => {
                                if ( dataLaunch1['statut'] ) {
                                    return param['speechExecService'].getScenarioByTypeAndName(keywordsToCheck.data[2], keywordsToCheck.data[3]).then(dataScenario2 => {
                                        if (dataScenario2['statut']) {
                                            return param['speechExecService'].launchScenario(dataScenario2['data']['data']['scenario']['id'], false).then(dataLaunch2 => {
                                                if ( dataLaunch2['statut'] ) {
                                                    let messageSuccess = param['method']['randomMessage'](param['message']['success']);
                                                    messageReturn = messageSuccess.replace("__TYPE1__", param[1])
                                                        .replace("__NAME1__", param[2])
                                                        .replace("__TYPE2__", param[3])
                                                        .replace("__NAME2__", param[4]);
                                                } else {
                                                    let messageError = param['method']['randomMessage'](param['message']['error']);
                                                    messageReturn = messageError.replace("__TYPE1__", param[1])
                                                        .replace("__NAME1__", param[2])
                                                        .replace("__TYPE2__", param[3])
                                                        .replace("__NAME2__", param[4]);
                                                }
                                                return {
                                                    "typeRetour": 'message',
                                                    "data": messageReturn
                                                };
                                            });
                                        } else {
                                            let messageError = param['method']['randomMessage'](param['message']['error']);
                                            messageReturn = messageError.replace("__TYPE1__", param[1])
                                                .replace("__NAME1__", param[2])
                                                .replace("__TYPE2__", param[3])
                                                .replace("__NAME2__", param[4]);
                                        }
                                        return {
                                            "typeRetour": 'message',
                                            "data": messageReturn
                                        };
                                    });
                                } else {
                                    let messageError = param['method']['randomMessage'](param['message']['error']);
                                    messageReturn = messageError.replace("__TYPE1__", param[1])
                                        .replace("__NAME1__", param[2])
                                        .replace("__TYPE2__", param[3])
                                        .replace("__NAME2__", param[4]);
                                }
                                return {
                                    "typeRetour": 'message',
                                    "data": messageReturn
                                };
                            });
                        } else {
                            let messageError = param['method']['randomMessage'](param['message']['error']);
                            messageReturn = messageError.replace("__TYPE1__", param[1])
                                .replace("__NAME1__", param[2])
                                .replace("__TYPE2__", param[3])
                                .replace("__NAME2__", param[4]);
                        }
                        return {
                            "typeRetour": 'message',
                            "data": messageReturn
                        };
                    });
                });
            } else {
                let messageError = param['method']['randomMessage'](param['message']['error']);
                messageReturn = messageError.replace("__TYPE1__", param[1])
                    .replace("__NAME1__", param[2])
                    .replace("__TYPE2__", param[3])
                    .replace("__NAME2__", param[4]);
            }
            return {
                "typeRetour": 'message',
                "data": messageReturn
            };
        } else {
            return {
                "typeRetour": 'waitingResponse',
                "data": param['method']['motorUndefined'](param)
            };
        }
    }
}
