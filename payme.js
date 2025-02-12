const Action = require('./action');

const log = console.log;
const baseUrl = 'https://checkout.test.paycom.uz/api';
const xAuth = '5e730e8e0b852a417aa49ceb:ZPDODSiTYKuX0jyO7Kl2to4rQbNwG08jbghj';
const DEBUG = {
  maxAttempts: 4,
  attempt: 0
};

class Payme {
  _id = '';
  /** @type {Action} */
  action = null;
  isActive = () => this.action && this.action.isActive();

  async request(params){
    const method = params.body.method.toUpperCase(); 
    params.body.id = 1; // random
    params.body = JSON.stringify(params.body);
    const response = await fetch(baseUrl, {
      headers: {
        'X-Auth': xAuth
      },
      method: 'post',
      ...params
    });
    if(response.status >= 500){
      console.error(`Payme:${method} error:`, response.status);
      throw new Error(`Payme:${method} error: ${await response.text()}`);
    }

    const result = await response.json();
    if(result.error){
      throw new Error(`Payme:${method} error: ${result.error.message}:${result.error.code}`);
    }
    // log(`Payme:${method}`, result.result);
    return result['result'];
  }

  async cancel(){
    if(!this.isActive()) throw new Error('Payme:CANCEL not yet created');

    const result = await this.request({
      body: {
        method: "receipts.cancel",
        params: {
          id: this._id
        }
      }
    });

    if(DEBUG){
      DEBUG.attempt = 0;
      log(`Payme:CANCEL attempt=${DEBUG.attempt}`);
    }

    log(`Payme:CANCEL state=${result.receipt.state}`);
    this._id = '';
    this.action.stop();
    return result['receipt']['state'];
  }

  async check(){
    if(!this.isActive()) throw new Error('Payme:CHECK not yet created');

    const result = await this.request({
      body: {
        method: "receipts.check",
        params: {
          id: this._id
        }
      }
    });

    if(DEBUG){
      log(`Payme:CHECK attempt=${DEBUG.attempt}`);
      if(++DEBUG.attempt >= DEBUG.maxAttempts){
        DEBUG.attempt = 0;
        log(`Payme:CHECK attempt=${DEBUG.attempt}`);  

        this._id = '';
        this.action.stop();
        return true;
      }
      return {attempt:DEBUG.attempt};
    }

    log(`Payme:CHECK state=${result.state}`);
    if(result['state'] == 4){
      this._id = '';
      this.action.stop();
      return true;
    }
    
    return false;
  }

  async create({item,onCheck}){
    if(this._id) throw new Error('Payme:CREATE already created');

    const result = await this.request({
      body: {
        method: "receipts.create",
        params: {
          amount: item.price * 100,
          account: {
            order_id: 1 // random
          },
          // "detail": {
          //   "receipt_type": 0,
          //   "items": [{
          //     "title": "Наименование услуги или товара",
          //     "price": 250000,// цена ЕДИНИЦУ
          //     "count": 2,// количество
          //     "code": "02001001005034001", // ИКПУ (код услуги или продукта)
          //     "vat_percent": 12, // 0 либо 12
          //     "package_code": "1397132" // в tasnif.soliq.uz Условная единица вашего ИКПУ
          //   }]
          // }
        }
      }
    });
    this._id = result['receipt']['_id'];
    log(`Payme:CREATE id=${this._id}`);
    
    // constructor
    this.action = new Action(async()=>{
      try{
        if(onCheck && await onCheck(await this.check())){
          // no need to cancel check if it was paid
          return true;
        };
      }
      catch(error){
        console.error(`Payme:CHECK error: `, error);
      }
    }, 2000);
    
    return result['receipt']['state'];
  }
  
}

module.exports = Payme;
