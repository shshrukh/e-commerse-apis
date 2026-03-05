import { EventEmitter } from "events";


class EventBus extends EventEmitter{
    emit(evnet, payload){
        console.log(`[event]: ${evnet}`);
        return super.emit(evnet, payload);
    }
}


const eventBus = new EventBus({
    captureRejections: true
});


export{eventBus};