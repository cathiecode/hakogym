export default class Queue {
    queue;
    constructor(queue = []) {
        this.queue = queue;
    }
    enqueue(value) {
        return this.queue.push(value);
    }
    dequeue() {
        return this.queue.shift();
    }
    length() {
        return this.queue.length;
    }
    removeOne(condition) {
        const itemIndex = this.queue.findIndex(condition);
        if (itemIndex === -1) {
            return undefined;
        }
        return this.queue.splice(itemIndex, 1)[0];
    }
    array() {
        return this.queue;
    }
}
