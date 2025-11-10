import { NGXLoggerMonitor, NGXLogInterface } from 'ngx-logger';
export class MyLoggerMonitor implements NGXLoggerMonitor {
    onLog(log: NGXLogInterface) {
        let messageClass = log.message.indexOf('Error') !== -1 ? 'log-error' : 'log-debug';
        let logStr = log.message.toString();
        log.additional.forEach(element => {
            logStr += ', ' + element.toString();
        });
        var errorDiv = document.createElement('div');
        errorDiv.classList.add(messageClass);
        errorDiv.innerHTML = logStr.toString();
        document.getElementById('screen-log').appendChild(errorDiv);
    }
}