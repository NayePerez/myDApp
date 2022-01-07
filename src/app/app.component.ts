import { FormControl, FormGroup } from '@angular/forms';
import { Component, AfterViewInit, ElementRef, ViewChild,ViewChildren,QueryList} from '@angular/core';
import { Web3Service } from './services/web3.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  @ViewChild('scrollframe',{static:false}) private scrollFrame!: ElementRef;
  @ViewChildren('item') itemElements!: QueryList<any>;

  private scrollContainer: any;

  qcganados = 0;
  deshabilitado = true; /****habilitar mi boton */
  deshabilitadoRB = false;
  title = 'QualiCoin';
  msgEstado = 'No Conectado';
  estado = false;
  count = 0;
  resultado = '';
  points = 0;
  totalRewardPoints = 0;

  blockHash = '';
  blockNumber = '';
  from = '';
  transactionHash = '';
  totalBalance = '';
  amount = '';
  rewardPoints = '';
  exchangedRewardPoints = '';

  balanceOf = '';
  tokensAprovados = '';
  resultTransferencia='';
  resultPago='';
  resultTransferenciaAprobada='';
  resultAprove='';


  elementos: any = [];  
  elementosClient: any = [];  

  cabeceras = ['Transaction Hash', 'Block Number','Amount','Sended Reward Points','Total Reward Points','To'];
  cabecerasClient = ['Transaction Hash', 'Block Number','Total Reward Points','Exchanged Reward Points','From'];

   constructor(public web3s: Web3Service){}

  sendPointsForm = new FormGroup({
    accountAddress: new FormControl(''),
    sellAmount: new FormControl('')
  });

  exchangedPointsForm = new FormGroup({
    exchangePoints: new FormControl('')
  });

  //---------------------
  respondeEncuestaForm = new FormGroup({
    1: new FormControl(''),
    2: new FormControl(''),
    3: new FormControl(''),
    4: new FormControl(''),
    5: new FormControl('')
  });
  //---------------------
  consultaSaldoForm = new FormGroup({
    addressConsultaSaldo: new FormControl(''),
    addressRecibirRecompensa: new FormControl(''),
    recompensa: new FormControl(''),
    addressDestino: new FormControl(''),
    cantidadTokens: new FormControl('')
  });

  consultaAprobacionExternaForm = new FormGroup({
    addressPropietario: new FormControl(''),
    addressAprovada: new FormControl('')
  });

  transferirForm = new FormGroup({
    addressDestino: new FormControl(''),
    cantidadTokens: new FormControl('')
  });

  transferirFromForm = new FormGroup({
    addressRemitenteFrom: new FormControl(''),
    addressDestinoFrom: new FormControl(''),
    cantidadTokensFrom: new FormControl('')
  });

  aprovarForm = new FormGroup({
    addressAprobar: new FormControl(''),
    cantidadTokens: new FormControl('')
  });

  ngAfterViewInit(): void {
    this.conectar();
    this.scrollContainer = this.scrollFrame.nativeElement;      
    //this.elementos.changes.subscribe(() => this.onElementosChanged());   
  }

  private onElementosChanged(): void {
    this.scrollToBottom();
  }

  conectar():void {
    this.web3s.connectAccount().then((r)=>{ 
      this.msgEstado = "Conectado.";
      this.estado = true;
      this.subscribeToEvents();
      this.checarBalance();
    });
  }

  //-----------------------Nueva---------------------//
    //obtiene el balance de la billetera que ejecuta la simulacion de intercambio de puntos
  getBalance(): void {
    this.web3s.contrato.methods.balanceOf(this.web3s.accounts[0])
    .call()
    .then((response: any) => {
      this.balanceOf = response;
    });
  }
  async getBalanceByAccount(accountAddress: any): Promise<any> {
    return await this.web3s.contrato.methods.balanceOf(accountAddress).call()/10000000000;
  }
  async getAllowance(accountPropietario: any, accountAprovada: any): Promise<any> {
    return await this.web3s.contrato.methods.allowance(accountPropietario, accountAprovada).call();
  }

  async checarBalance(): Promise<void> {
    const addressDapp =  this.web3s.accounts[0];
    console.log(addressDapp);
    const accountBalance = await this.getBalanceByAccount(addressDapp);
    console.log(`accountBalance => ${accountBalance}`);
    this.balanceOf = accountBalance;
  }

  async transferirTokens(): Promise<void> {
    const addressDestino = this.transferirForm.get('addressDestino')?.value;
    const tokensEnviados =(this.transferirForm.get('cantidadTokens')?.value)*10000000000;

    this.web3s.contrato.methods.transfer(addressDestino,tokensEnviados).send({from: this.web3s.accounts[0]})
    .then((response:any) => {
      this.resultTransferencia = "Transacción realizada!";
      this.blockHash = response.blockHash;
      this.blockNumber = response.blockNumber;
      this.from = response.from;
      this.transactionHash = response.transactionHash;
      this.getBalance();
   })
   .catch((error: any) => {
      console.log(error);
      this.resultTransferencia = "Error en la transacción!";
   });
  }

  async cobrarTokens(): Promise<void> {
    const addressDestino = this.consultaSaldoForm.get('addressRecibirRecompensa')?.value;
/*     const tokensEnviados =(this.transferirForm.get('cantidadTokens')?.value)*10000000000; */
    const tokensEnviados = this.qcganados * 10000000000 ;
    
    this.web3s.contrato.methods.transfer(addressDestino,tokensEnviados).send({from: this.web3s.accounts[0]})
    .then((response:any) => {
      this.resultPago = "Tu pago ha sido realizado!";
      this.blockHash = response.blockHash;
      this.blockNumber = response.blockNumber;
      this.from = response.from;
      this.transactionHash = response.transactionHash;
      this.getBalance();
   })
   .catch((error: any) => {
      console.log(error);
      this.resultPago = "Error en la transacción!";
   });
  }
   /****UNA VEZ RESPONDIDO, SE HABILITA EL BOTON PARA ENVIAR LA RESPUESTA */
   async habilitarBoton(): Promise<void> {
    const addressDestino = this.consultaSaldoForm.get('addressRecibirRecompensa')?.value;
/*     const tokensEnviados =(this.transferirForm.get('cantidadTokens')?.value)*10000000000; */
   this.deshabilitado = false;
   this.deshabilitadoRB = true;
   
  }

  habilitarRB(){
    this.deshabilitadoRB = false;
  }
 /****UNA VEZ ENVIADA LA RESPUESTA, SE SUMA QC  y se desabilita el boton para que no se sumen maás QC */
  async validarRespondido(): Promise<void> {
    const addressDestino = this.consultaSaldoForm.get('addressRecibirRecompensa')?.value;
/*     const tokensEnviados =(this.transferirForm.get('cantidadTokens')?.value)*10000000000; */
   this.qcganados = this.qcganados+1;
   this.deshabilitado = true;
   
  }

  borrar(): void {
    this.resultado = "";
    this.blockHash = "";
    this.blockNumber = "";
    this.from = "";
    this.transactionHash = "";
  }
  
  subscribeToEvents() {
    // Subscribe to pending transactions
    const self = this;
    this.web3s.contrato.events.Transfer({
                                              fromBlock: 0
                                            },
                                            (error: any, event: any) => {
                                              if (!error){
                                                // setInterval(() => {

                                                  const abiDecoder = require('abi-decoder'); // NodeJS
                                                  abiDecoder.addABI(this.web3s.abi);
                                                  
                                                  this.web3s.web3js.eth.getTransaction(event.transactionHash).then(async (data: any) => {

                                                    const decodedData = abiDecoder.decodeMethod(data.input);

                                                    if(decodedData != undefined) {

                                                      //recuperando datos registrados al enviar puntos
                                                      //datos recuperados: amount, rewardPoints
                                                      if(decodedData.name == 'sendPoints') {
                                                        this.amount = decodedData.params[1].value
                                                        this.rewardPoints = decodedData.params[2].value;
                                                        this.exchangedRewardPoints = '0';
                                                        this.totalRewardPoints = decodedData.params[3].value;

                                                        this.elementos.push(
                                                          { blockHash: event.blockHash,
                                                            transactionHash: event.transactionHash,
                                                            blockNumber:event.blockNumber,                                            
                                                            amount: this.amount,
                                                            rewardPoints: this.rewardPoints,
                                                            totalRewardPoints: this.totalRewardPoints,
                                                            accountAddress: event.returnValues.to
                                                          }
                                                        );
  
                                                        this.elementos = this.elementos.sort((a: any, b: any) => parseInt(a.blockNumber) - parseInt(b.blockNumber));

                                                      //recuperando data de los puntos intercambiados
                                                      //datos recuperados: exchangedRewardPoints
                                                      }else if(decodedData.name == 'exchangePoints') {
                                                        this.exchangedRewardPoints = decodedData.params[1].value;
                                                        this.totalRewardPoints = decodedData.params[2].value;

                                                        this.elementosClient.push(
                                                          { blockHash: event.blockHash,
                                                            transactionHash: event.transactionHash,
                                                            blockNumber:event.blockNumber,                                            
                                                            exchangedRewardPoints: this.exchangedRewardPoints,
                                                            totalRewardPoints: this.totalRewardPoints,
                                                            accountAddress: event.returnValues.from
                                                          }
                                                        );
  
                                                        this.elementosClient = this.elementosClient.sort((a: any, b: any) => parseInt(a.blockNumber) - parseInt(b.blockNumber));

                                                      }else {

                                                      }
                                                      
                                                    }

                                                  });
                                                  
                                                // }, 500);                                                                                                
                                              }                                              
                                            });
  }

  scrollToBottom() {
    this.scrollContainer.scroll({
      top: this.scrollContainer.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }
}
