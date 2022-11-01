export default class Queue<T> {
  constructor(private queue: T[] = []) {}

  enqueue(value: T) {
    return this.queue.push(value);
  }

  dequeue(): T | undefined {
    return this.queue.shift();
  }

  length(): number {
    return this.queue.length;
  }

  removeOne(condition: (item: T) => boolean): T | undefined {
    const itemIndex = this.queue.findIndex(condition);
    if (itemIndex === -1) {
      return undefined;
    }
    return this.queue.splice(itemIndex,1)[0];
  }

  array() {
    return this.queue;
  }
}
