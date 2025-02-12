const log = console.log;

class Action{
  timer = null;
  callback = null;
  timeout = null;

  constructor(callback, timeout){
    this.callback = callback;
    this.timeout = timeout;
    this.start();
  }

  start(){
    this.timer = setTimeout(async ()=>{
      if(await this.callback()) {
        this.timer = null;
        return;
      }
      this.start();
    }, this.timeout);
  }

  stop(){
    if(this.timer == null) return;
    clearTimeout(this.timer);
    this.timer = null;
  }

  isActive(){
    return this.timer != null;
  }
}

module.exports = Action;
