import { Injectable } from '@angular/core';
import { TextToSpeech } from 'ionic-native';
import { Platform } from 'ionic-angular';
import 'rxjs/add/operator/map';
import { SpeechExecService } from '../providers/speech-exec-service';
import { SpeechCommandService } from '../providers/speech-command-service';
import 'rxjs/Rx';

interface IWindow extends Window {
  webkitSpeechRecognition: any;
}

declare var SpeechRecognition: any;
@Injectable()
export class SpeechService {
  speechRecognition: any;
  private define: boolean = false;
  private active: boolean = false;
  private waitingResponse: boolean = false;
  private functionToCall: any = new Object();
  private thisSaid: string = '';
  private serviceName: any = ['média', 'media'];
  private returnFunction: string = '';
  private principalRoom: any = new Object();
  private urlSpeech: string = '';
  private discussion: any = [];

  commandToRegExp: any;
  commands: any;
  commandsFunction: any;
  reverseCommands: any;
  idCommands: any;
  keywordCommands: any;
  messageCommands: any;
  needResponseCommands: any;
  textCommands: any;
  commandsAndFunctions: any;
  regexCommands: any;

  constructor(public speechExecService: SpeechExecService,
              public speechCommandService: SpeechCommandService, public platform: Platform) {
    this.initSpeechEngine();
    this.initCommandEngine();
    let apiUrl = 'http://api.voicerss.org/?';
    let apiKey = 'key=bc78cb6969be49f3ae523e1497a5d6da';
    let language = '&hl=fr-fr';
    let quality = '&f=44khz_16bit_stereo';
    let rate = '&r=2';
    this.urlSpeech = apiUrl+apiKey+language+quality+rate+'&src=';
    this.functionToCall['set'] = false;
    this.functionToCall['args'] = new Array();
  }

  initSpeechEngine() {
    if (this.platform.is('cordova')) {
      this.speechRecognition = new SpeechRecognition();
    } else {
      const { webkitSpeechRecognition }: IWindow = <IWindow>window;
      this.speechRecognition = new webkitSpeechRecognition();
    }
    this.speechRecognition.continuous = true;
    //this.speechRecognition.interimResults = true;
    this.speechRecognition.lang = 'fr';
    this.speechRecognition.maxAlternatives = 1;
    this.speechRecognition.onnomatch = (event => {
      this.talk("Désolé ! J'ai un problème de compréhension !");
      console.log('No match found.' + JSON.stringify(event));
    });
    this.speechRecognition.onerror = (event => {
      this.talk("Désolé ! Je ne parviens pas à initialiser la reconnaissance vocale !");
      console.log('Error happens.' + JSON.stringify(event));
    });
  }

  initCommandEngine() {
    this.commands = new Object();
    this.commandsFunction = new Object();
    this.reverseCommands = new Object();
    this.textCommands = [];
    this.idCommands = new Object();
    this.keywordCommands = new Object();
    this.messageCommands = new Object();
    this.needResponseCommands = new Object();
    this.commandsAndFunctions = [];
    this.regexCommands = [];

    let optionalParam = /\s*\((.*?)\)\s*/g;
    let optionalRegex = /(\(\?:[^)]+\))\?/g;
    let namedParam    = /(\(\?)?:\w+/g;
    let splatParam    = /\*\w+/g;
    let escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#]/g;
    this.commandToRegExp = function(command) {
      command = command.replace(escapeRegExp, '\\$&')
          .replace(optionalParam, '(?:$1)?')
          .replace(namedParam, function(match, optional) {
            return optional ? match : '([^\\s]+)';
          })
          .replace(splatParam, '(.*?)')
          .replace(optionalRegex, '\\s*$1?\\s*');
      return new RegExp('^' + command + '$', 'i');
    };
  }

  isActive() {
    return this.active;
  }

  isDefine() {
    return this.define;
  }

  setDefine(value) {
    this.define = value;
  }

  addCommand(commandToAdd){
    this.commands[commandToAdd.command] = eval('this.speechCommandService.' + commandToAdd.function);
    this.commandsFunction[commandToAdd.command] = commandToAdd.function;
    this.reverseCommands[commandToAdd.function] = commandToAdd.command;
    this.idCommands[commandToAdd.command] = commandToAdd.id;
    this.keywordCommands[commandToAdd.command] = commandToAdd.keyword;
    this.messageCommands[commandToAdd.command] = commandToAdd.message;
    this.needResponseCommands[commandToAdd.command] = commandToAdd.need_response;
    this.commandsAndFunctions.push({"command": commandToAdd.command, "function": commandToAdd.function});
    this.textCommands.push(commandToAdd.command);
    this.regexCommands.push(this.commandToRegExp(commandToAdd.command));
  }

  clearCommand() {
    this.commands = new Object();
    this.commandsFunction = new Object();
    this.reverseCommands = new Object();
    this.textCommands = [];
    this.idCommands = new Object();
    this.keywordCommands = new Object();
    this.messageCommands = new Object();
    this.needResponseCommands = new Object();
    this.commandsAndFunctions = [];
    this.regexCommands = [];
  }

  getCountCommand() {
    console.log(this.textCommands.length);
  }

  getDiscussion() {
    return this.discussion;
  }

  record() {
    this.speechRecognition.onresult = speech => {
      let term: string = "";
      if (speech.results) {
        let result = speech.results[speech.resultIndex];
        let transcript = result[0].transcript;
        if (result.isFinal) {
          if (result[0].confidence < 0.3) {
            this.talk("Articule ! J'ai rien compris !");
          }
          else {
            term = transcript.trim();
            this.discussion.push({'user': 'Moi', 'icon': 'ios-person', 'sentence': term});
            let commandCheck = this.checkCommand(term);
            if ( commandCheck.statut ) {
              if ( this.textCommands.indexOf(commandCheck.name) >= 0 ) {
                this.launchCommand(commandCheck);
              } else {
                this.talk("Désolé ! Aucune action ne correspond à votre demande !");
                console.log(term);
              }
            } else {
              if ( this.waitingResponse ) {
                this.talk("Je n'ai pas bien compris ta réponse !");
              } else {
                this.talk("Désolé ! Aucune action ne correspond à votre demande !");
                console.log(term);
              }
            }
          }
        }
      }
    };
    this.speechRecognition.start();
  }

  launchCommand(commandCheck) {
    let parameters = commandCheck.parameters;
    parameters['motorActive'] = this.active;
    parameters['speechExecService'] = this.speechExecService;
    parameters['commandVocalId'] = this.idCommands[commandCheck.name];
    parameters['keywords'] = this.keywordCommands[commandCheck.name];
    parameters['message'] = this.messageCommands[commandCheck.name];
    parameters['method'] = this.getCommandServiceMethod();
    parameters['needResponse'] = this.needResponseCommands[commandCheck.name];
    parameters['waitingResponse'] = this.waitingResponse;
    parameters['functionToCall'] = this.functionToCall;
    parameters['functionName'] = this.commandsFunction[commandCheck.name];
    let retourCommand = this.commands[commandCheck.name](parameters);
    let currentService = this;
    try {
      if ( retourCommand.typeRetour ) {
        currentService.checkRetourCommand(retourCommand);
      } else {
        retourCommand.then(function (data) {
          currentService.checkRetourCommand(data);
        });
      }
    } catch (ex) {
      retourCommand.then(function (data) {
        currentService.checkRetourCommand(data);
      });
    }
  }

  checkCommand(textRecognized) {
    let gallyParameters = {
      "serviceName": this.serviceName,
      "waitingResponse": this.waitingResponse,
      "functionToCall": this.functionToCall,
      "returnFunction": this.returnFunction,
      "principalRoom": this.principalRoom
    };
    let parameters = [];
    let commandChecked = {"statut": false, "name": '', "parameters": []};
    if ( this.commands[textRecognized] ) {
      commandChecked.statut = true;
      commandChecked.name = textRecognized;
      parameters.push(gallyParameters);
      commandChecked.parameters = parameters;
    } else {
      let find = false;
      let commandName = '';
      let countCommands = this.regexCommands.length;
      for (let i = 0; i < countCommands; i++) {
        let commandMatch = textRecognized.match(this.regexCommands[i]);
        if (commandMatch ) {
          commandName = this.textCommands[i];
          let matchExtract = String(commandMatch);
          let parametersString = matchExtract.replace(textRecognized+',', '');
          parameters = parametersString.split(',');
          find = true;
        }
      }
      if ( find ) {
        commandChecked.statut = true;
        commandChecked.name = commandName;
        parameters.unshift(gallyParameters);
        commandChecked.parameters = parameters;
      }
    }
    return commandChecked;
  }

  checkRetourCommand(retourCommand){
    if ( retourCommand.typeRetour == 'confirm' ) {
      this.confirm();
      //this.active = false;
    } else if ( retourCommand.typeRetour == 'cancel' ) {
      if ( this.waitingResponse ) {
        this.waitingResponse = false;
        this.functionToCall = new Object();
        this.thisSaid = "Action annulée !";
        this.talk("Action annulée !");
        //this.active = false;
      } else {
        this.thisSaid = "Non à quoi ?";
        this.talk("Non à quoi ?");
        //this.active = false;
      }
    } else if ( retourCommand.typeRetour == 'set' ) {
      let ignore = false;
      for(let key in retourCommand.data) {
        if ( key == 'active' ) {
          this.active = retourCommand.data[key];
          if (this.functionToCall['set']) {
            this.functionToCall['set'] = false;
            ignore = true;
            let gallyParameters = {
              "serviceName": this.serviceName,
              "waitingResponse": this.waitingResponse,
              "functionToCall": this.functionToCall,
              "returnFunction": this.returnFunction,
              "principalRoom": this.principalRoom
            };
            let parameters = [];
            let commandChecked = {"statut": true, "name": '', "parameters": []};
            commandChecked.name = this.reverseCommands[this.functionToCall['name']];
            parameters.push(gallyParameters);
            for(let key in this.functionToCall['args']) {
              parameters.push(this.functionToCall['args'][key]);
            }
            commandChecked.parameters = parameters;
            this.launchCommand(commandChecked);
          }
        }
        if (!ignore) {
          if ( key == 'principalRoom' ) {
            this.principalRoom = retourCommand.data[key];
          }
          if ( key == 'message') {
            this.talk(retourCommand.data[key]);
          }
          /*if ( key == 'waitingResponse' ) {
           this.waitingResponse = retourCommand.data[key];
           } else if ( key == 'principalRoom' ) {
           this.principalRoom = retourCommand.data[key];
           } else if ( key == 'functionToCall' ) {
           this.functionToCall = retourCommand.data[key];
           } else if ( key == 'message' ) {
           this.thisSaid = retourCommand.data[key];
           this.talk(retourCommand.data[key]);
           }*/
        }
      }
      //this.active = false;
    } else if ( retourCommand.typeRetour == 'action' ) {

    } else if ( retourCommand.typeRetour == 'desactivate' ) {
      console.log("desactivate");
    } else if ( retourCommand.typeRetour == 'message' ) {
      this.talk(retourCommand.data);
    } else if ( retourCommand.typeRetour == 'waitingResponse' ) {
      this.waitingResponse = true;
      /*if (retourCommand.data.functionToCall['set']) {
        this.functionToCall = retourCommand.data.functionToCall
      }*/
      this.talk(retourCommand.data.message);
    } else if ( retourCommand.typeRetour == 'nothing' ) {
      // todo
    }
    if ( retourCommand.typeRetour != 'waitingResponse' ) {
      this.waitingResponse = false;
    }
  }

  confirm() {
    if ( this.waitingResponse ) {
      console.log('speech confirm');
    } else {
      this.talk("Oui à quoi ?")
    }
  }

  talk(message) {
    if (message != '') {
      this.discussion.push({'user': 'Gally', 'icon': 'logo-android', 'sentence': message});
      if (this.platform.is('cordova')) {
        TextToSpeech.speak({
          text: message,
          locale: 'fr-FR',
          rate: 1
        })
            .then(() => console.log('talk : ' + message))
            .catch((reason: any) => console.log(reason));
      } else {
        let audio = new Audio();
        audio.src = this.urlSpeech+message;
        audio.load();
        audio.play();
      }
    }
  }

  stop() {
    this.active = false;
    this.define = false;
    this.speechRecognition.stop();
  }

  getCommandServiceMethod(){
    let randomMessage = function(messages, repeat=false, countRepeat=0) {
      let messagesSelect = []
      for(let key in messages) {
        if (messages[key]['is_repeat']==1 && repeat) {
          messagesSelect.push(messages[key]['message']);
        } else if (messages[key]['is_repeat']==0 && !repeat) {
          messagesSelect.push(messages[key]['message']);
        } else if (!repeat) {
          messagesSelect.push(messages[key]['message']);
        }
      }
      let message = messagesSelect[Math.floor(Math.random() * messagesSelect.length)];
      return message;
    };
    let motorUndefined = function(param) {
      let functionToCall = new Object();
      functionToCall['set'] = true;
      functionToCall['name'] = param['functionName'];
      let args = new Array();
      for (let i=0; i<param.length; i++) {
        if (i>0) {
          args.push(param[i]);
        }
      }
      functionToCall['args'] = args;
      let messageReturn = param['method']['randomMessage'](param['message']['inactive']);
      return {
        "functionToCall": functionToCall,
        "active": false,
        "message": messageReturn
      };
    };
    let methods = new Object();
    methods['randomMessage'] = randomMessage;
    methods['motorUndefined'] = motorUndefined;
    return methods;
  }
}
